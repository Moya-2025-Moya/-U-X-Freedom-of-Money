'use client';

import { useState, useEffect, useCallback } from 'react';
import { useChainId, useSwitchChain, useAccount, useSendTransaction, useWaitForTransactionReceipt, useReadContract, useWriteContract } from 'wagmi';
import { U_CONTRACT, BOOK_U_AMOUNT, ERC20_ABI } from './constants';

const BSC_CHAIN_ID = 56;

const USDT_BSC = '0x55d398326f99059fF775485246999027B3197955' as const;
const USDC_BSC = '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d' as const;

const PARASWAP_PROXY = '0x216b4b4ba9f3e719726886d34a177484278bfcae' as `0x${string}`;

const APPROVE_ABI = [
  {
    name: 'approve', type: 'function', stateMutability: 'nonpayable' as const,
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance', type: 'function', stateMutability: 'view' as const,
    inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

const TOKENS = [
  { symbol: 'USDT', address: USDT_BSC, decimals: 18 },
  { symbol: 'USDC', address: USDC_BSC, decimals: 18 },
] as const;

const GOLD       = '#A18B2F';
const GOLD_LIGHT = '#E9D276';
const GOLD_DIM   = 'rgba(161,139,47,0.18)';
const MUTED      = '#6B6B6B';
const TEXT       = '#1A1A1A';

// Steps: idle -> quoting -> (approve -> approving -> approved ->) building -> ready -> swapping -> done
type Step = 'idle' | 'quoting' | 'approve' | 'approving' | 'building' | 'ready' | 'swapping' | 'done' | 'error';

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
  const inputEstimate = BigInt(Math.ceil(Number(targetAmountU) * 1.01));
  const inputUsd      = (Number(inputEstimate) / 1e18).toFixed(2);

  const isBSC = chainId === BSC_CHAIN_ID;
  const [selectedToken, setSelectedToken] = useState(0);
  const [step, setStep]         = useState<Step>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [quoteOutput, setQuoteOutput] = useState('');
  const [priceRoute, setPriceRoute]   = useState<unknown>(null);
  const [swapTxData, setSwapTxData]   = useState<{ to: string; data: string; value: string } | null>(null);

  const token = TOKENS[selectedToken];

  // Allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: token.address, abi: APPROVE_ABI, functionName: 'allowance',
    args: [address!, PARASWAP_PROXY],
    query: { enabled: !!address && isBSC },
  });

  // Token balance
  const { data: tokenBalance } = useReadContract({
    address: token.address, abi: ERC20_ABI, functionName: 'balanceOf',
    args: [address!],
    query: { enabled: !!address && isBSC },
  });

  const hasBalance = tokenBalance !== undefined && tokenBalance >= inputEstimate;

  // Approve tx
  const { writeContract: writeApprove, data: approveTxHash, isPending: approving } = useWriteContract();
  const { isSuccess: approveConfirmed } = useWaitForTransactionReceipt({ hash: approveTxHash });

  // Swap tx
  const { sendTransaction, data: swapTxHash, isPending: sendingSwap, error: swapSendError } = useSendTransaction();
  const { isSuccess: swapConfirmed } = useWaitForTransactionReceipt({ hash: swapTxHash });

  // After approve confirms -> build tx
  useEffect(() => {
    if (approveConfirmed && step === 'approving') {
      refetchAllowance();
      buildTx();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approveConfirmed]);

  // After swap confirms
  useEffect(() => {
    if (swapConfirmed) { setStep('done'); onSwapped(); }
  }, [swapConfirmed, onSwapped]);

  // If swap send fails
  useEffect(() => {
    if (swapSendError && step === 'swapping') {
      setErrorMsg(swapSendError.message.split('\n')[0]);
      setStep('error');
    }
  }, [swapSendError, step]);

  // Step 1: Get quote from Paraswap
  async function fetchQuote() {
    if (!address) return;
    setStep('quoting');
    setErrorMsg('');
    try {
      const srcAmount = inputEstimate.toString();
      const res = await fetch(
        `https://apiv5.paraswap.io/prices?srcToken=${token.address}&destToken=${U_CONTRACT}&amount=${srcAmount}&srcDecimals=${token.decimals}&destDecimals=18&network=56&side=SELL`
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const destAmount = data.priceRoute.destAmount;
      setQuoteOutput((Number(destAmount) / 1e18).toFixed(2));
      setPriceRoute(data.priceRoute);

      if (BigInt(destAmount) < targetAmountU) {
        throw new Error(`Output ${(Number(destAmount)/1e18).toFixed(2)} $U is less than needed ${targetUsd}. Try again.`);
      }

      // Check allowance - if not enough, go to approve step
      const currentAllowance = allowance ?? BigInt(0);
      if (currentAllowance < inputEstimate) {
        setStep('approve');
      } else {
        // Allowance OK, build tx directly
        await doBuildTx(data.priceRoute, srcAmount);
      }
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Failed to get quote');
      setStep('error');
    }
  }

  // Step 2 (if needed): Approve
  function handleApprove() {
    setStep('approving');
    writeApprove({
      address: token.address,
      abi: APPROVE_ABI,
      functionName: 'approve',
      args: [PARASWAP_PROXY, inputEstimate],
    });
  }

  // Step 3: Build tx from Paraswap
  async function doBuildTx(route: unknown, srcAmount: string) {
    setStep('building');
    try {
      const res = await fetch('https://apiv5.paraswap.io/transactions/56', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          srcToken: token.address,
          destToken: U_CONTRACT,
          srcAmount,
          slippage: 100,
          priceRoute: route,
          userAddress: address,
          txOrigin: address,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error));
      setSwapTxData({ to: data.to, data: data.data, value: data.value || '0' });
      setStep('ready');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Failed to build transaction');
      setStep('error');
    }
  }

  // Called after approve confirms
  function buildTx() {
    if (!priceRoute) return;
    doBuildTx(priceRoute, inputEstimate.toString());
  }

  // Step 4: Execute swap
  function handleSwap() {
    if (!swapTxData) return;
    setStep('swapping');
    sendTransaction({
      to: swapTxData.to as `0x${string}`,
      data: swapTxData.data as `0x${string}`,
      value: BigInt(swapTxData.value),
    });
  }

  const tokenBalDisplay = tokenBalance !== undefined ? (Number(tokenBalance) / 1e18).toFixed(2) : '...';

  return (
    <div style={embedded ? {} : { border: `1.5px solid ${GOLD_DIM}`, borderRadius: 16, overflow: 'hidden', background: '#fff' }}>

      {!embedded && (
        <div style={{ padding: '12px 16px', background: '#F7F5F0', borderBottom: `1px solid ${GOLD_DIM}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Swap to $U</span>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: 18, lineHeight: 1, padding: 0 }}>x</button>
        </div>
      )}

      <div style={{ padding: '16px 16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {!isBSC && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: '#FEF9EC', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: TEXT }}>
              Switch to <strong>BNB Chain</strong> to swap.
            </div>
            <button onClick={() => switchChain({ chainId: BSC_CHAIN_ID })} disabled={switching}
              style={{ padding: '12px', borderRadius: 50, border: 'none', cursor: 'pointer',
                background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, color: '#fff', fontSize: 14, fontWeight: 700 }}>
              {switching ? 'Switching...' : 'Switch to BNB Chain'}
            </button>
          </div>
        )}

        {isBSC && (
          <>
            {/* Token selector */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: MUTED }}>Swap from</label>
                <span style={{ fontSize: 10, fontWeight: 600, color: GOLD, background: 'rgba(161,139,47,0.10)', borderRadius: 20, padding: '2px 8px' }}>BNB Chain</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {TOKENS.map((t, i) => (
                  <button key={t.symbol}
                    onClick={() => { setSelectedToken(i); setStep('idle'); setSwapTxData(null); setPriceRoute(null); setQuoteOutput(''); }}
                    style={{
                      padding: '7px 14px', borderRadius: 50,
                      border: `1.5px solid ${selectedToken === i ? GOLD : '#E0E0DC'}`,
                      background: selectedToken === i ? 'rgba(233,210,118,0.12)' : '#fff',
                      color: selectedToken === i ? GOLD : MUTED,
                      fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    }}>
                    {t.symbol}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div style={{ background: '#F7F5F0', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: MUTED }}>You pay (approx.)</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{inputUsd} {token.symbol}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: MUTED }}>You receive</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: GOLD }}>{quoteOutput || `~${targetUsd}`} $U</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: '#BBB' }}>Your {token.symbol}</span>
                <span style={{ fontSize: 11, color: hasBalance ? '#16A34A' : '#DC2626', fontWeight: 600 }}>{tokenBalDisplay}</span>
              </div>
            </div>

            {tokenBalance !== undefined && !hasBalance && (
              <div style={{ background: '#FEF2F2', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#DC2626' }}>
                Insufficient {token.symbol}. You need at least {inputUsd}.
              </div>
            )}

            {/* Idle: Get Quote */}
            {hasBalance && step === 'idle' && (
              <button onClick={fetchQuote}
                style={{ padding: '12px', borderRadius: 50, border: 'none', cursor: 'pointer',
                  background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, color: '#fff', fontSize: 14, fontWeight: 700, width: '100%' }}>
                Get Quote
              </button>
            )}

            {step === 'quoting' && (
              <div style={{ textAlign: 'center', padding: '12px', fontSize: 13, color: MUTED }}>Fetching best price...</div>
            )}

            {/* Approve */}
            {step === 'approve' && (
              <button onClick={handleApprove}
                style={{ padding: '12px', borderRadius: 50, border: 'none', cursor: 'pointer',
                  background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, color: '#fff', fontSize: 14, fontWeight: 700, width: '100%' }}>
                Step 1/2: Approve {token.symbol}
              </button>
            )}

            {step === 'approving' && (
              <div style={{ textAlign: 'center', padding: '12px', fontSize: 13, color: MUTED }}>
                {approving ? 'Confirm approval in wallet...' : 'Waiting for approval confirmation...'}
              </div>
            )}

            {step === 'building' && (
              <div style={{ textAlign: 'center', padding: '12px', fontSize: 13, color: MUTED }}>Preparing swap...</div>
            )}

            {/* Ready: Execute Swap */}
            {step === 'ready' && (
              <button onClick={handleSwap}
                style={{ padding: '12px', borderRadius: 50, border: 'none', cursor: 'pointer',
                  background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, color: '#fff', fontSize: 14, fontWeight: 700, width: '100%' }}>
                {priceRoute ? 'Step 2/2: ' : ''}Swap {inputUsd} {token.symbol} for {quoteOutput} $U
              </button>
            )}

            {step === 'swapping' && (
              <div style={{ textAlign: 'center', padding: '12px', fontSize: 13, color: MUTED }}>
                {sendingSwap ? 'Confirm swap in wallet...' : 'Swapping on-chain...'}
              </div>
            )}

            {step === 'done' && (
              <div style={{ background: '#F0FDF4', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#16A34A', fontWeight: 600, textAlign: 'center' }}>
                Swap complete! Balance updated.
              </div>
            )}

            {step === 'error' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ background: '#FEF2F2', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#DC2626' }}>
                  {errorMsg}
                </div>
                <button onClick={() => { setStep('idle'); setErrorMsg(''); setPriceRoute(null); setSwapTxData(null); }}
                  style={{ fontSize: 12, color: GOLD, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                  Try again
                </button>
              </div>
            )}

            <div style={{ fontSize: 10, color: '#BBB', lineHeight: 1.5 }}>
              Swap routed by <a href="https://www.paraswap.io" target="_blank" rel="noreferrer" style={{ color: GOLD, textDecoration: 'none' }}>Paraswap</a> via PancakeSwap liquidity pools (audited by PeckShield, CertiK, SlowMist). 1% slippage tolerance. No fees from United Stables.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
