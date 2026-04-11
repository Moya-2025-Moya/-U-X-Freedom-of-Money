'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from 'wagmi';
import { formatUnits, type PublicClient } from 'viem';
import { U_CONTRACT, BOOK_U_AMOUNT } from './constants';

// ─── Addresses (BSC Mainnet) ──────────────────────────────────────────────────
const ROUTER = '0x13f4EA83D0bd40E75C8222255bc855a974568Dd4' as `0x${string}`;
const QUOTER  = '0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25aC' as `0x${string}`;
const WBNB    = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095b' as `0x${string}`;

// ─── Supported input tokens ───────────────────────────────────────────────────
const TOKENS = [
  { symbol: 'BNB',  address: WBNB,                                              decimals: 18, native: true  },
  { symbol: 'USDT', address: '0x55d398326f99059fF775485246999027B3197955' as `0x${string}`, decimals: 18, native: false },
  { symbol: 'USDC', address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d' as `0x${string}`, decimals: 18, native: false },
  { symbol: 'ETH',  address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8' as `0x${string}`, decimals: 18, native: false },
] as const;
type Token = typeof TOKENS[number];

const FEE_TIERS = [100, 500, 2500, 10000] as const;
const SLIPPAGE   = 1.05; // 5% max slippage

// ─── ABIs ─────────────────────────────────────────────────────────────────────
const QUOTER_ABI = [
  {
    name: 'quoteExactOutputSingle',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{
      name: 'params', type: 'tuple',
      components: [
        { name: 'tokenIn',           type: 'address' },
        { name: 'tokenOut',          type: 'address' },
        { name: 'amount',            type: 'uint256' },
        { name: 'fee',               type: 'uint24'  },
        { name: 'sqrtPriceLimitX96', type: 'uint160' },
      ],
    }],
    outputs: [
      { name: 'amountIn',                  type: 'uint256' },
      { name: 'sqrtPriceX96After',         type: 'uint160' },
      { name: 'initializedTicksCrossed',   type: 'uint32'  },
      { name: 'gasEstimate',               type: 'uint256' },
    ],
  },
] as const;

const ROUTER_ABI = [
  {
    name: 'exactOutputSingle',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{
      name: 'params', type: 'tuple',
      components: [
        { name: 'tokenIn',          type: 'address' },
        { name: 'tokenOut',         type: 'address' },
        { name: 'fee',              type: 'uint24'  },
        { name: 'recipient',        type: 'address' },
        { name: 'amountOut',        type: 'uint256' },
        { name: 'amountInMaximum',  type: 'uint256' },
        { name: 'sqrtPriceLimitX96', type: 'uint160' },
      ],
    }],
    outputs: [{ name: 'amountIn', type: 'uint256' }],
  },
  { name: 'refundETH', type: 'function', stateMutability: 'payable', inputs: [], outputs: [] },
  {
    name: 'multicall',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'data', type: 'bytes[]' }],
    outputs: [{ name: 'results', type: 'bytes[]' }],
  },
] as const;

const ERC20_APPROVE_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

// ─── Quote helper ─────────────────────────────────────────────────────────────
async function getBestQuote(
  client: PublicClient,
  tokenIn: `0x${string}`,
  amountOut: bigint,
): Promise<{ amountIn: bigint; fee: number } | null> {
  for (const fee of FEE_TIERS) {
    try {
      const result = await client.simulateContract({
        address: QUOTER,
        abi: QUOTER_ABI,
        functionName: 'quoteExactOutputSingle',
        args: [{ tokenIn, tokenOut: U_CONTRACT, amount: amountOut, fee, sqrtPriceLimitX96: BigInt(0) }],
      });
      const amountIn = (result.result as [bigint, bigint, number, bigint])[0];
      if (amountIn > BigInt(0)) return { amountIn, fee };
    } catch {
      // Pool doesn't exist for this fee tier — try next
    }
  }
  return null;
}

// ─── Brand colours (inline — component is standalone) ─────────────────────────
const GOLD     = '#A18B2F';
const GOLD_LIGHT = '#E9D276';
const GOLD_DIM = 'rgba(161,139,47,0.18)';
const TEXT     = '#1A1A1A';
const MUTED    = '#6B6B6B';

// ─── Main component ───────────────────────────────────────────────────────────
export function SwapWidget({ onSwapped, onCancel, amountU: customAmountU }: {
  onSwapped: () => void;
  onCancel: () => void;
  amountU?: bigint;
}) {
  const { address } = useAccount();
  const client = usePublicClient();

  const targetAmountU = customAmountU ?? BOOK_U_AMOUNT;
  const targetAmountUsd = Number(targetAmountU) / 1e18;

  const [token, setToken]           = useState<Token>(TOKENS[0]);
  const [quote, setQuote]           = useState<{ amountIn: bigint; fee: number } | null>(null);
  const [quoting, setQuoting]       = useState(false);
  const [quoteError, setQuoteError] = useState('');

  // approve
  const { writeContract: approve, data: approveTxHash, isPending: approving } = useWriteContract();
  const { isLoading: approveWaiting, isSuccess: approveOk } = useWaitForTransactionReceipt({ hash: approveTxHash });

  // swap
  const { writeContract: swap, data: swapTxHash, isPending: swapping, error: swapError } = useWriteContract();
  const { isLoading: swapWaiting, isSuccess: swapOk } = useWaitForTransactionReceipt({ hash: swapTxHash });

  // ── Fetch quote whenever token changes ────────────────────────────────────
  const fetchQuote = useCallback(async () => {
    if (!client) return;
    setQuoting(true);
    setQuoteError('');
    setQuote(null);
    const result = await getBestQuote(client as PublicClient, token.address, targetAmountU);
    if (result) {
      setQuote(result);
    } else {
      setQuoteError(`No liquidity pool found for ${token.symbol} → $U on PancakeSwap.`);
    }
    setQuoting(false);
  }, [client, token, targetAmountU]);

  useEffect(() => { fetchQuote(); }, [fetchQuote]);

  // ── After swap confirmed ──────────────────────────────────────────────────
  useEffect(() => { if (swapOk) onSwapped(); }, [swapOk, onSwapped]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const amountInMax = quote ? BigInt(Math.ceil(Number(quote.amountIn) * SLIPPAGE)) : BigInt(0);
  const amountDisplay = quote
    ? `${parseFloat(formatUnits(quote.amountIn, token.decimals)).toFixed(4)} ${token.symbol}`
    : '…';

  // ── Handlers ─────────────────────────────────────────────────────────────
  function handleApprove() {
    if (!quote || !address) return;
    approve({
      address: token.address,
      abi: ERC20_APPROVE_ABI,
      functionName: 'approve',
      args: [ROUTER, amountInMax],
    });
  }

  function handleSwap() {
    if (!quote || !address) return;
    if (token.native) {
      // BNB: send value, router auto-wraps + refunds excess
      swap({
        address: ROUTER,
        abi: ROUTER_ABI,
        functionName: 'exactOutputSingle',
        args: [{
          tokenIn: WBNB,
          tokenOut: U_CONTRACT,
          fee: quote.fee,
          recipient: address,
          amountOut: targetAmountU,
          amountInMaximum: amountInMax,
          sqrtPriceLimitX96: BigInt(0),
        }],
        value: amountInMax,
      });
    } else {
      swap({
        address: ROUTER,
        abi: ROUTER_ABI,
        functionName: 'exactOutputSingle',
        args: [{
          tokenIn: token.address,
          tokenOut: U_CONTRACT,
          fee: quote.fee,
          recipient: address,
          amountOut: targetAmountU,
          amountInMaximum: amountInMax,
          sqrtPriceLimitX96: BigInt(0),
        }],
      });
    }
  }

  const needsApprove = !token.native;
  const step: 'quote' | 'approve' | 'swap' | 'done' =
    swapOk        ? 'done'
    : approveOk || token.native ? 'swap'
    : 'approve';

  return (
    <div style={{ border: `1.5px solid ${GOLD_DIM}`, borderRadius: 16, overflow: 'hidden', background: '#fff' }}>
      {/* Header */}
      <div style={{ padding: '13px 18px', background: '#F7F5F0', borderBottom: `1px solid ${GOLD_DIM}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none">
            <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" stroke={GOLD} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 700 }}>Swap to $U — powered by PancakeSwap</span>
        </div>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: 20, lineHeight: 1, padding: 0 }}>×</button>
      </div>

      <div style={{ padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Token selector */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>Pay with</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TOKENS.map(t => (
              <button
                key={t.symbol}
                onClick={() => setToken(t)}
                style={{
                  padding: '8px 16px', borderRadius: 50, border: `1.5px solid ${token.symbol === t.symbol ? GOLD : '#E0E0DC'}`,
                  background: token.symbol === t.symbol ? 'rgba(233,210,118,0.12)' : '#fff',
                  color: token.symbol === t.symbol ? GOLD : MUTED,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}
              >
                {t.symbol}
              </button>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div style={{ background: '#F7F5F0', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: MUTED }}>You pay (approx.)</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: quoting ? MUTED : TEXT }}>
              {quoting ? 'Fetching…' : quoteError ? '—' : amountDisplay}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: MUTED }}>You receive (exact)</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: GOLD }}>{targetAmountUsd.toFixed(2)} $U</span>
          </div>
          {quote && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${GOLD_DIM}`, fontSize: 11, color: MUTED }}>
              Route: {token.symbol} → $U · Fee tier {quote.fee / 100}% · 5% max slippage
            </div>
          )}
        </div>

        {quoteError && (
          <div style={{ padding: '10px 14px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', fontSize: 12, color: '#DC2626' }}>
            {quoteError} Try a different token.
          </div>
        )}

        {(swapError) && (
          <div style={{ padding: '10px 14px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', fontSize: 12, color: '#DC2626' }}>
            {(swapError as Error).message.split('\n')[0]}
          </div>
        )}

        {/* Action buttons */}
        {!quoteError && quote && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Step 1: Approve (ERC20 only) */}
            {needsApprove && step === 'approve' && (
              <button
                onClick={handleApprove}
                disabled={approving || approveWaiting}
                style={{
                  padding: '13px', borderRadius: 50, border: 'none', cursor: approving || approveWaiting ? 'not-allowed' : 'pointer',
                  background: approving || approveWaiting ? '#C8BA6A' : '#1A1A1A',
                  color: '#fff', fontSize: 14, fontWeight: 700,
                }}
              >
                {approving ? 'Waiting for wallet…' : approveWaiting ? 'Approving…' : `1. Approve ${token.symbol}`}
              </button>
            )}

            {/* Step 2: Swap */}
            <button
              onClick={handleSwap}
              disabled={step !== 'swap' || swapping || swapWaiting || !quote}
              style={{
                padding: '13px', borderRadius: 50, border: 'none',
                cursor: step !== 'swap' || swapping || swapWaiting ? 'not-allowed' : 'pointer',
                background: step !== 'swap' ? '#E0E0DC'
                  : swapping || swapWaiting ? '#C8BA6A'
                  : `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`,
                color: '#fff', fontSize: 14, fontWeight: 700,
                boxShadow: step === 'swap' && !swapping && !swapWaiting ? `0 4px 16px rgba(161,139,47,0.3)` : 'none',
              }}
            >
              {swapping    ? 'Waiting for wallet…'
               : swapWaiting ? 'Confirming swap…'
               : needsApprove ? `2. Swap ${amountDisplay} → ${targetAmountUsd.toFixed(2)} $U`
               : `Swap ${amountDisplay} → ${targetAmountUsd.toFixed(2)} $U`}
            </button>
          </div>
        )}

        <p style={{ fontSize: 11, color: MUTED, margin: 0, lineHeight: 1.6 }}>
          Swap is routed through PancakeSwap V3 on BNB Chain. $U contract: <span style={{ fontFamily: 'monospace' }}>{U_CONTRACT.slice(0, 10)}…{U_CONTRACT.slice(-4)}</span>
        </p>
      </div>
    </div>
  );
}
