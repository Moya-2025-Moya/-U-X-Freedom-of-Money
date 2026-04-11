'use client';

import { useState, useEffect } from 'react';
import { useChainId, useSwitchChain, useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { U_CONTRACT, BOOK_U_AMOUNT, ERC20_ABI } from './constants';

const BSC_CHAIN_ID = 56;

const USDT_BSC = '0x55d398326f99059fF775485246999027B3197955' as const;
const USDC_BSC = '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d' as const;

// PancakeSwap Smart Router V3 (supports V2, V3, and StableSwap)
const PANCAKE_ROUTER = '0x13f4EA83D0bd40E75C8222255bc855a974568Dd4' as `0x${string}`;

const STABLE_SWAP_ABI = [
  {
    name: 'exactInputStableSwap',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'path', type: 'address[]' },
      { name: 'flag', type: 'uint256[]' },
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMinimum', type: 'uint256' },
      { name: 'to', type: 'address' },
    ],
    outputs: [{ name: 'amountOut', type: 'uint256' }],
  },
] as const;

const APPROVE_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

const TOKENS = [
  { symbol: 'USDT', address: USDT_BSC },
  { symbol: 'USDC', address: USDC_BSC },
] as const;

const GOLD       = '#A18B2F';
const GOLD_LIGHT = '#E9D276';
const GOLD_DIM   = 'rgba(161,139,47,0.18)';
const MUTED      = '#6B6B6B';
const TEXT       = '#1A1A1A';

export function SwapWidget({
  onSwapped,
  onCancel,
  amountU: customAmountU,
  embedded = false,
}: {
  onSwapped: () => void;
  onCancel: () => void;
  amountU?: bigint;
  embedded?: boolean;
}) {
  const chainId = useChainId();
  const { switchChain, isPending: switching } = useSwitchChain();
  const { address } = useAccount();

  const targetAmountU = customAmountU ?? BOOK_U_AMOUNT;
  const targetUsd     = (Number(targetAmountU) / 1e18).toFixed(2);
  // For stablecoin swap: input ~= output. Add 0.5% buffer for StableSwap fee + slippage.
  const inputAmount   = BigInt(Math.ceil(Number(targetAmountU) * 1.005));
  const inputUsd      = (Number(inputAmount) / 1e18).toFixed(2);

  const isBSC = chainId === BSC_CHAIN_ID;
  const [selectedToken, setSelectedToken] = useState(0); // 0=USDT, 1=USDC
  const token = TOKENS[selectedToken];

  // Check allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: token.address,
    abi: APPROVE_ABI,
    functionName: 'allowance',
    args: [address!, PANCAKE_ROUTER],
    query: { enabled: !!address && isBSC },
  });

  // Check token balance
  const { data: tokenBalance } = useReadContract({
    address: token.address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address!],
    query: { enabled: !!address && isBSC },
  });

  const hasTokenBalance = tokenBalance !== undefined && tokenBalance >= inputAmount;
  const needsApproval   = allowance !== undefined && allowance < inputAmount;

  // Approve tx
  const { writeContract: writeApprove, data: approveTxHash, isPending: approving } = useWriteContract();
  const { isSuccess: approveConfirmed } = useWaitForTransactionReceipt({ hash: approveTxHash });

  // Swap tx
  const { writeContract: writeSwap, data: swapTxHash, isPending: swapping, error: swapError } = useWriteContract();
  const { isSuccess: swapConfirmed } = useWaitForTransactionReceipt({ hash: swapTxHash });

  // After approve confirms, refetch allowance
  useEffect(() => {
    if (approveConfirmed) refetchAllowance();
  }, [approveConfirmed, refetchAllowance]);

  // After swap confirms, notify parent
  useEffect(() => {
    if (swapConfirmed) onSwapped();
  }, [swapConfirmed, onSwapped]);

  function handleApprove() {
    writeApprove({
      address: token.address,
      abi: APPROVE_ABI,
      functionName: 'approve',
      args: [PANCAKE_ROUTER, inputAmount],
    });
  }

  function handleSwap() {
    if (!address) return;
    writeSwap({
      address: PANCAKE_ROUTER,
      abi: STABLE_SWAP_ABI,
      functionName: 'exactInputStableSwap',
      args: [
        [token.address, U_CONTRACT],    // path: USDT/USDC -> $U
        [BigInt(2)],                            // flag: 2 = StableSwap
        inputAmount,                     // amountIn
        targetAmountU,                   // amountOutMinimum (exact amount needed)
        address,                         // to: user's wallet
      ],
    });
  }

  const tokenBalanceDisplay = tokenBalance !== undefined ? (Number(tokenBalance) / 1e18).toFixed(2) : '...';

  return (
    <div style={embedded ? {} : { border: `1.5px solid ${GOLD_DIM}`, borderRadius: 16, overflow: 'hidden', background: '#fff' }}>

      {!embedded && (
        <div style={{ padding: '12px 16px', background: '#F7F5F0', borderBottom: `1px solid ${GOLD_DIM}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Swap to $U</span>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: 18, lineHeight: 1, padding: 0 }}>x</button>
        </div>
      )}

      <div style={{ padding: '16px 16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Wrong chain */}
        {!isBSC && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: '#FEF9EC', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: TEXT, lineHeight: 1.6 }}>
              Switch your wallet to <strong>BNB Chain</strong> to swap.
            </div>
            <button
              onClick={() => switchChain({ chainId: BSC_CHAIN_ID })}
              disabled={switching}
              style={{ padding: '12px', borderRadius: 50, border: 'none', cursor: 'pointer',
                background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, color: '#fff', fontSize: 14, fontWeight: 700 }}
            >
              {switching ? 'Switching...' : 'Switch to BNB Chain'}
            </button>
          </div>
        )}

        {/* BSC connected */}
        {isBSC && (
          <>
            {/* Token selector */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: 0.5 }}>Swap from</label>
                <span style={{ fontSize: 10, fontWeight: 600, color: GOLD, background: 'rgba(161,139,47,0.10)', borderRadius: 20, padding: '2px 8px' }}>
                  BNB Chain
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {TOKENS.map((t, i) => (
                  <button
                    key={t.symbol}
                    onClick={() => setSelectedToken(i)}
                    style={{
                      padding: '7px 14px', borderRadius: 50,
                      border: `1.5px solid ${selectedToken === i ? GOLD : '#E0E0DC'}`,
                      background: selectedToken === i ? 'rgba(233,210,118,0.12)' : '#fff',
                      color: selectedToken === i ? GOLD : MUTED,
                      fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    {t.symbol}
                  </button>
                ))}
              </div>
            </div>

            {/* Swap details */}
            <div style={{ background: '#F7F5F0', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: MUTED }}>You pay</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{inputUsd} {token.symbol}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: MUTED }}>You receive</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: GOLD }}>{targetUsd} $U</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: '#BBB' }}>Your {token.symbol} balance</span>
                <span style={{ fontSize: 11, color: hasTokenBalance ? '#16A34A' : '#DC2626', fontWeight: 600 }}>{tokenBalanceDisplay}</span>
              </div>
            </div>

            {/* Insufficient balance warning */}
            {tokenBalance !== undefined && !hasTokenBalance && (
              <div style={{ background: '#FEF2F2', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#DC2626' }}>
                Insufficient {token.symbol} balance. You need at least {inputUsd} {token.symbol}.
              </div>
            )}

            {/* Action buttons */}
            {hasTokenBalance && needsApproval && (
              <button
                onClick={handleApprove}
                disabled={approving}
                style={{
                  padding: '12px', borderRadius: 50, border: 'none', cursor: approving ? 'not-allowed' : 'pointer',
                  background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, color: '#fff', fontSize: 14, fontWeight: 700,
                  width: '100%',
                }}
              >
                {approving ? 'Approving...' : `Approve ${token.symbol}`}
              </button>
            )}

            {hasTokenBalance && !needsApproval && (
              <button
                onClick={handleSwap}
                disabled={swapping}
                style={{
                  padding: '12px', borderRadius: 50, border: 'none', cursor: swapping ? 'not-allowed' : 'pointer',
                  background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, color: '#fff', fontSize: 14, fontWeight: 700,
                  width: '100%',
                }}
              >
                {swapping ? 'Swapping...' : `Swap ${inputUsd} ${token.symbol} for ${targetUsd} $U`}
              </button>
            )}

            {swapConfirmed && (
              <div style={{ background: '#F0FDF4', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#16A34A', fontWeight: 600, textAlign: 'center' }}>
                Swap complete! Your $U balance will update shortly.
              </div>
            )}

            {swapError && (
              <div style={{ background: '#FEF2F2', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#DC2626' }}>
                {swapError.message.split('\n')[0]}
              </div>
            )}

            {/* Disclaimer */}
            <div style={{ fontSize: 10, color: '#BBB', lineHeight: 1.5 }}>
              Swap routed through <a href="https://pancakeswap.finance" target="_blank" rel="noreferrer" style={{ color: GOLD, textDecoration: 'none' }}>PancakeSwap StableSwap</a> (audited by PeckShield, CertiK, SlowMist). 0.5% slippage buffer included. No additional fees from United Stables.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
