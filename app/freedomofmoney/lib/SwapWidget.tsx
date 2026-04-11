'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from 'wagmi';
import { formatUnits, type PublicClient } from 'viem';
import { U_CONTRACT, BOOK_U_AMOUNT, BOOK_USD } from './constants';

// ─── BSC addresses ────────────────────────────────────────────────────────────
const ROUTER = '0x13f4EA83D0bd40E75C8222255bc855a974568Dd4' as `0x${string}`;
const QUOTER  = '0xb048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997' as `0x${string}`;

const BSC_CHAIN_ID = 56;
const ETH_CHAIN_ID = 1;

// ─── BSC tokens with confirmed V3 pools ──────────────────────────────────────
// BNB has no V3 pool with $U (V2 only) — handled separately via redirect
const TOKENS = [
  { symbol: 'USDT', address: '0x55d398326f99059fF775485246999027B3197955' as `0x${string}`, decimals: 18 },
  { symbol: 'USDC', address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d' as `0x${string}`, decimals: 18 },
] as const;
type Token = typeof TOKENS[number];

const FEE_TIERS = [100, 500, 2500, 10000] as const;
const SLIPPAGE   = 1.01; // 1%

const QUOTE_REFRESH_MS = 30_000; // auto-refresh every 30s

// ─── PancakeSwap external swap URLs ──────────────────────────────────────────
const PANCAKESWAP_XCHAIN_URL = `https://pancakeswap.finance/swap?chain=eth&outputCurrency=${U_CONTRACT}`;
const PANCAKESWAP_BSC_URL    = `https://pancakeswap.finance/swap?chain=bsc&outputCurrency=${U_CONTRACT}`;

// ─── ABIs ─────────────────────────────────────────────────────────────────────
const QUOTER_ABI = [
  {
    name: 'quoteExactOutputSingle',
    type: 'function',
    // Marked 'view' so viem uses eth_call — the correct way to invoke PancakeSwap's Quoter
    stateMutability: 'view',
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
      { name: 'amountIn',                type: 'uint256' },
      { name: 'sqrtPriceX96After',       type: 'uint160' },
      { name: 'initializedTicksCrossed', type: 'uint32'  },
      { name: 'gasEstimate',             type: 'uint256' },
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
        { name: 'tokenIn',           type: 'address' },
        { name: 'tokenOut',          type: 'address' },
        { name: 'fee',               type: 'uint24'  },
        { name: 'recipient',         type: 'address' },
        { name: 'amountOut',         type: 'uint256' },
        { name: 'amountInMaximum',   type: 'uint256' },
        { name: 'sqrtPriceLimitX96', type: 'uint160' },
      ],
    }],
    outputs: [{ name: 'amountIn', type: 'uint256' }],
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
] as const;

// ─── Quote helper — uses readContract (eth_call), standard for quoters ────────
async function getBestQuote(
  client: PublicClient,
  tokenIn: `0x${string}`,
  amountOut: bigint,
): Promise<{ amountIn: bigint; fee: number } | null> {
  for (const fee of FEE_TIERS) {
    try {
      const result = await client.readContract({
        address: QUOTER,
        abi: QUOTER_ABI,
        functionName: 'quoteExactOutputSingle',
        args: [{ tokenIn, tokenOut: U_CONTRACT, amount: amountOut, fee, sqrtPriceLimitX96: BigInt(0) }],
      });
      // viem returns tuple [amountIn, sqrtPriceX96After, initializedTicksCrossed, gasEstimate]
      const amountIn = (result as readonly [bigint, ...unknown[]])[0];
      if (amountIn > BigInt(0)) return { amountIn, fee };
    } catch (e) {
      // Pool doesn't exist at this fee tier — try next
      console.debug(`[quote] fee=${fee} failed:`, e);
    }
  }
  return null;
}

// ─── Brand colours ────────────────────────────────────────────────────────────
const GOLD       = '#A18B2F';
const GOLD_LIGHT = '#E9D276';
const GOLD_DIM   = 'rgba(161,139,47,0.18)';
const TEXT       = '#1A1A1A';
const MUTED      = '#6B6B6B';

// ─── Main component ───────────────────────────────────────────────────────────
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
  const { address } = useAccount();
  const chainId = useChainId();
  const client = usePublicClient();
  const { switchChain, isPending: switching } = useSwitchChain();

  const targetAmountU   = customAmountU ?? BOOK_U_AMOUNT;
  const targetAmountUsd = Number(targetAmountU) / 1e18;

  const isETH = chainId === ETH_CHAIN_ID;

  const [token, setToken]                     = useState<Token>(TOKENS[0]);
  const [quote, setQuote]                     = useState<{ amountIn: bigint; fee: number } | null>(null);
  const [quoting, setQuoting]                 = useState(false);
  const [quoteError, setQuoteError]           = useState('');
  const [quotedAt, setQuotedAt]               = useState<number | null>(null);
  const [crossChainClicked, setCrossChainClicked] = useState(false);

  // approve
  const { writeContract: approve, data: approveTxHash, isPending: approving } = useWriteContract();
  const { isLoading: approveWaiting, isSuccess: approveOk } = useWaitForTransactionReceipt({ hash: approveTxHash });

  // swap
  const { writeContract: swap, data: swapTxHash, isPending: swapping, error: swapError } = useWriteContract();
  const { isLoading: swapWaiting, isSuccess: swapOk } = useWaitForTransactionReceipt({ hash: swapTxHash });

  const isBusy = approving || approveWaiting || swapping || swapWaiting || swapOk;

  // ── Initial + token-change quote fetch ────────────────────────────────────
  const fetchQuote = useCallback(async () => {
    if (!client || isETH) return;
    setQuoting(true);
    setQuoteError('');
    setQuote(null);
    setQuotedAt(null);
    const result = await getBestQuote(client as PublicClient, token.address, targetAmountU);
    if (result) {
      setQuote(result);
      setQuotedAt(Date.now());
    } else {
      setQuoteError(`No liquidity found for ${token.symbol} → $U. Try a different token.`);
    }
    setQuoting(false);
  }, [client, token, targetAmountU, isETH]);

  useEffect(() => { fetchQuote(); }, [fetchQuote]);

  // ── Silent auto-refresh every 30s (keeps old quote visible while fetching) ─
  useEffect(() => {
    if (isETH || isBusy) return;
    const id = setInterval(async () => {
      if (!client) return;
      const result = await getBestQuote(client as PublicClient, token.address, targetAmountU);
      if (result) {
        setQuote(result);
        setQuotedAt(Date.now());
      }
    }, QUOTE_REFRESH_MS);
    return () => clearInterval(id);
  }, [isETH, isBusy, client, token, targetAmountU]);

  useEffect(() => { if (swapOk) onSwapped(); }, [swapOk, onSwapped]);

  const amountInMax   = quote ? BigInt(Math.ceil(Number(quote.amountIn) * SLIPPAGE)) : BigInt(0);
  const amountDisplay = quote
    ? `${parseFloat(formatUnits(quote.amountIn, token.decimals)).toFixed(4)} ${token.symbol}`
    : '…';

  const quoteAgeS = quotedAt ? Math.floor((Date.now() - quotedAt) / 1000) : null;

  function handleApprove() {
    if (!quote || !address) return;
    approve({ address: token.address, abi: ERC20_APPROVE_ABI, functionName: 'approve', args: [ROUTER, amountInMax] });
  }

  function handleSwap() {
    if (!quote || !address) return;
    // All in-page tokens (USDT, USDC) are ERC20 — always use token address
    swap({
      address: ROUTER, abi: ROUTER_ABI, functionName: 'exactOutputSingle',
      args: [{ tokenIn: token.address, tokenOut: U_CONTRACT, fee: quote.fee, recipient: address, amountOut: targetAmountU, amountInMaximum: amountInMax, sqrtPriceLimitX96: BigInt(0) }],
    });
  }

  // USDT and USDC always require ERC20 approval before swap
  const needsApprove = true;
  const step: 'approve' | 'swap' | 'done' =
    swapOk ? 'done' : approveOk ? 'swap' : 'approve';

  return (
    <div style={embedded ? { background: '#fff' } : { border: `1.5px solid ${GOLD_DIM}`, borderRadius: 16, overflow: 'hidden', background: '#fff' }}>
      {/* Header — only shown when not embedded */}
      {!embedded && (
        <div style={{ padding: '13px 18px', background: '#F7F5F0', borderBottom: `1px solid ${GOLD_DIM}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none">
              <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" stroke={GOLD} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Swap to $U — powered by PancakeSwap</span>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: 20, lineHeight: 1, padding: 0 }}>×</button>
        </div>
      )}

      <div style={{ padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── ETH chain: step-by-step cross-chain flow ── */}
        {isETH ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: '#F7F5F0', borderRadius: 12, padding: '14px 16px', fontSize: 13, color: TEXT, lineHeight: 1.7 }}>
              You&apos;re on <strong>Ethereum</strong>. Complete these two steps to pay with $U:
            </div>

            {/* Step 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: crossChainClicked ? GOLD : MUTED, letterSpacing: 0.5 }}>
                STEP 1 — Swap ETH / USDT / USDC → $U on BNB Chain
              </div>
              <a
                href={PANCAKESWAP_XCHAIN_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => setCrossChainClicked(true)}
                style={{
                  display: 'block', textAlign: 'center', padding: '13px',
                  borderRadius: 50, textDecoration: 'none',
                  background: crossChainClicked
                    ? '#E0E0DC'
                    : `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`,
                  color: crossChainClicked ? MUTED : '#fff',
                  fontSize: 14, fontWeight: 700,
                  boxShadow: crossChainClicked ? 'none' : `0 4px 16px rgba(161,139,47,0.3)`,
                }}
              >
                {crossChainClicked ? 'Opened PancakeSwap ✓' : 'Swap on PancakeSwap ↗'}
              </a>
              {crossChainClicked && (
                <p style={{ fontSize: 11, color: MUTED, margin: 0, lineHeight: 1.6 }}>
                  On PancakeSwap: set output chain to <strong>BNB Chain</strong>, output token to <strong>$U</strong>, and confirm the swap.
                </p>
              )}
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 0.5 }}>
                STEP 2 — Switch wallet to BNB Chain
              </div>
              <button
                onClick={() => switchChain({ chainId: BSC_CHAIN_ID })}
                disabled={switching}
                style={{
                  padding: '13px', borderRadius: 50, border: `1.5px solid ${GOLD_DIM}`,
                  cursor: switching ? 'not-allowed' : 'pointer',
                  background: '#fff',
                  color: GOLD, fontSize: 14, fontWeight: 700,
                }}
              >
                {switching ? 'Switching…' : '2. Switch to BNB Chain'}
              </button>
              <p style={{ fontSize: 11, color: MUTED, margin: 0, lineHeight: 1.6 }}>
                After switching, your $U balance will update and you can pay directly here.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ── BSC chain: in-page PancakeSwap V3 swap ── */}

            {/* Token selector */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: 0.5 }}>Pay with</label>
                <span style={{ fontSize: 10, fontWeight: 600, color: GOLD, background: 'rgba(161,139,47,0.10)', borderRadius: 20, padding: '2px 8px', letterSpacing: 0.4 }}>BNB Chain</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {TOKENS.map(t => (
                  <button
                    key={t.symbol}
                    onClick={() => setToken(t)}
                    style={{
                      padding: '8px 16px', borderRadius: 50,
                      border: `1.5px solid ${token.symbol === t.symbol ? GOLD : '#E0E0DC'}`,
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, color: MUTED }}>You pay (approx.)</span>
                  {/* Refresh button */}
                  <button
                    onClick={fetchQuote}
                    disabled={quoting || isBusy}
                    title="Refresh quote"
                    style={{
                      background: 'none', border: 'none', padding: '0 2px',
                      cursor: quoting || isBusy ? 'default' : 'pointer',
                      color: quoting ? GOLD : MUTED, fontSize: 13, lineHeight: 1,
                      opacity: quoting ? 0.6 : 1,
                      display: 'flex', alignItems: 'center',
                    }}
                  >
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" style={{ transition: 'transform 0.4s', transform: quoting ? 'rotate(360deg)' : 'none' }}>
                      <path d="M4 12a8 8 0 018-8V2l4 4-4 4V8a6 6 0 100 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                    </svg>
                  </button>
                  {quoteAgeS !== null && quoteAgeS > 5 && (
                    <span style={{ fontSize: 10, color: MUTED, opacity: 0.7 }}>{quoteAgeS}s ago</span>
                  )}
                </div>
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
                  Route: {token.symbol} → $U · Fee tier {quote.fee / 100}% · 1% max slippage
                </div>
              )}
            </div>

            {quoteError && (
              <div style={{ padding: '10px 14px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', fontSize: 12, color: '#DC2626' }}>
                {quoteError}
              </div>
            )}
            {swapError && (
              <div style={{ padding: '10px 14px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', fontSize: 12, color: '#DC2626' }}>
                {(swapError as Error).message.split('\n')[0]}
              </div>
            )}

            {/* Action buttons */}
            {!quoteError && quote && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {needsApprove && step === 'approve' && (
                  <button
                    onClick={handleApprove}
                    disabled={approving || approveWaiting}
                    style={{
                      padding: '13px', borderRadius: 50, border: 'none',
                      cursor: approving || approveWaiting ? 'not-allowed' : 'pointer',
                      background: approving || approveWaiting ? '#C8BA6A' : '#1A1A1A',
                      color: '#fff', fontSize: 14, fontWeight: 700,
                    }}
                  >
                    {approving ? 'Waiting for wallet…' : approveWaiting ? 'Approving…' : `1. Approve ${token.symbol}`}
                  </button>
                )}

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
                  {swapping ? 'Waiting for wallet…' : swapWaiting ? 'Confirming swap…'
                    : needsApprove ? `2. Swap ${amountDisplay} → ${targetAmountUsd.toFixed(2)} $U`
                    : `Swap ${amountDisplay} → ${targetAmountUsd.toFixed(2)} $U`}
                </button>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 11, color: MUTED, margin: 0, lineHeight: 1.6 }}>
                PancakeSwap V3 · BNB Chain · $U: <span style={{ fontFamily: 'monospace' }}>{U_CONTRACT.slice(0, 10)}…{U_CONTRACT.slice(-4)}</span>
              </p>
              <a
                href={PANCAKESWAP_BSC_URL}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 11, color: GOLD, textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 12 }}
              >
                其他代币 ↗
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
