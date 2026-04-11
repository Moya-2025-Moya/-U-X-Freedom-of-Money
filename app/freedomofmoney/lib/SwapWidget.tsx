'use client';

import { useState } from 'react';
import { useChainId, useSwitchChain } from 'wagmi';
import { U_CONTRACT, BOOK_U_AMOUNT } from './constants';

const BSC_CHAIN_ID = 56;
const ETH_CHAIN_ID = 1;

// ─── Input token options ──────────────────────────────────────────────────────
const BSC_TOKENS = [
  { symbol: 'BNB',  input: 'BNB',  stable: false },
  { symbol: 'USDT', input: '0x55d398326f99059fF775485246999027B3197955', stable: true },
  { symbol: 'USDC', input: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', stable: true },
] as const;

const ETH_TOKENS = [
  { symbol: 'ETH',  input: 'ETH',  stable: false },
  { symbol: 'USDT', input: '0xdAC17F958D2ee523a2206206994597C13D831ec7', stable: true },
  { symbol: 'USDC', input: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', stable: true },
] as const;

// ─── Brand colours ────────────────────────────────────────────────────────────
const GOLD       = '#A18B2F';
const GOLD_LIGHT = '#E9D276';
const GOLD_DIM   = 'rgba(161,139,47,0.18)';
const MUTED      = '#6B6B6B';
const TEXT       = '#1A1A1A';

// ─── Component ────────────────────────────────────────────────────────────────
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

  const targetAmountU   = customAmountU ?? BOOK_U_AMOUNT;
  const targetAmountUsd = (Number(targetAmountU) / 1e18).toFixed(2);

  const isETH   = chainId === ETH_CHAIN_ID;
  const isBSC   = chainId === BSC_CHAIN_ID;
  const tokens  = isETH ? ETH_TOKENS : BSC_TOKENS;

  const [selectedToken, setSelectedToken] = useState(1); // default to USDT (stable)
  const [clicked, setClicked]             = useState(false);

  function buildUrl(): string {
    const token = tokens[selectedToken];
    const out   = U_CONTRACT;
    if (isETH) {
      // Cross-chain: PancakeSwap will prompt user to bridge from ETH → BSC
      return `https://pancakeswap.finance/swap?chain=eth&inputCurrency=${token.input}&outputCurrency=${out}&outputAmount=${targetAmountUsd}`;
    }
    // BSC: direct swap, PancakeSwap routes through StableSwap / V2 / V3 automatically
    return `https://pancakeswap.finance/swap?chain=bsc&inputCurrency=${token.input}&outputCurrency=${out}&outputAmount=${targetAmountUsd}`;
  }

  return (
    <div style={embedded ? {} : { border: `1.5px solid ${GOLD_DIM}`, borderRadius: 16, overflow: 'hidden', background: '#fff' }}>

      {/* Header */}
      {!embedded && (
        <div style={{ padding: '13px 18px', background: '#F7F5F0', borderBottom: `1px solid ${GOLD_DIM}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none">
              <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" stroke={GOLD} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Swap to $U - via PancakeSwap</span>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: 20, lineHeight: 1, padding: 0 }}>×</button>
        </div>
      )}

      <div style={{ padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Unknown chain */}
        {!isBSC && !isETH && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: '#FEF9EC', borderRadius: 12, padding: '14px 16px', fontSize: 13, color: TEXT, lineHeight: 1.6 }}>
              Please switch your wallet to <strong>BNB Chain</strong> to swap.
            </div>
            <button
              onClick={() => switchChain({ chainId: BSC_CHAIN_ID })}
              disabled={switching}
              style={{ padding: '13px', borderRadius: 50, border: 'none', cursor: 'pointer',
                background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, color: '#fff', fontSize: 14, fontWeight: 700 }}
            >
              {switching ? 'Switching…' : 'Switch to BNB Chain'}
            </button>
          </div>
        )}

        {/* BNB Chain or ETH */}
        {(isBSC || isETH) && (
          <>
            {/* Token selector */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: 0.5 }}>Pay with</label>
                <span style={{ fontSize: 10, fontWeight: 600, color: GOLD, background: 'rgba(161,139,47,0.10)', borderRadius: 20, padding: '2px 8px', letterSpacing: 0.4 }}>
                  {isETH ? 'Ethereum' : 'BNB Chain'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {tokens.map((t, i) => (
                  <button
                    key={t.symbol}
                    onClick={() => { setSelectedToken(i); setClicked(false); }}
                    style={{
                      padding: '8px 16px', borderRadius: 50,
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

            {/* Amount summary */}
            <div style={{ background: '#F7F5F0', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: MUTED }}>You pay (approx.)</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>
                  {tokens[selectedToken].stable
                    ? `~${targetAmountUsd} ${tokens[selectedToken].symbol}`
                    : `~$${targetAmountUsd} in ${tokens[selectedToken].symbol}`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: MUTED }}>You receive (exact)</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: GOLD }}>{targetAmountUsd} $U</span>
              </div>
            </div>

            {/* ETH cross-chain note */}
            {isETH && (
              <div style={{ background: '#F7F5F0', borderRadius: 12, padding: '12px 16px', fontSize: 12, color: MUTED, lineHeight: 1.6 }}>
                PancakeSwap will bridge your tokens from Ethereum to BNB Chain automatically. After swapping, switch your wallet to BNB Chain to continue.
              </div>
            )}

            {/* Swap button */}
            <a
              href={buildUrl()}
              target="_blank"
              rel="noreferrer"
              onClick={() => setClicked(true)}
              style={{
                display: 'block', textAlign: 'center', padding: '13px',
                borderRadius: 50, textDecoration: 'none',
                background: clicked
                  ? '#E0E0DC'
                  : `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`,
                color: clicked ? MUTED : '#fff',
                fontSize: 14, fontWeight: 700,
                boxShadow: clicked ? 'none' : `0 4px 16px rgba(161,139,47,0.3)`,
              }}
            >
              {clicked
                ? 'Opened PancakeSwap ✓'
                : tokens[selectedToken].stable
                  ? `Swap ${tokens[selectedToken].symbol} → ${targetAmountUsd} $U ↗`
                  : `Swap ${tokens[selectedToken].symbol} → ${targetAmountUsd} $U ↗ (market price)`}
            </a>

            {/* Post-click instructions */}
            {clicked && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ fontSize: 12, color: MUTED, margin: 0, lineHeight: 1.7 }}>
                  Complete the swap on PancakeSwap, then come back - your $U balance will update automatically.
                  {isETH && <> After the swap, also <strong>switch your wallet to BNB Chain</strong>.</>}
                </p>
                {isETH && (
                  <button
                    onClick={() => switchChain({ chainId: BSC_CHAIN_ID })}
                    disabled={switching}
                    style={{ padding: '11px', borderRadius: 50, border: `1.5px solid ${GOLD_DIM}`,
                      cursor: switching ? 'not-allowed' : 'pointer', background: '#fff',
                      color: GOLD, fontSize: 13, fontWeight: 700 }}
                  >
                    {switching ? 'Switching…' : 'Switch to BNB Chain'}
                  </button>
                )}
              </div>
            )}

            <p style={{ fontSize: 11, color: MUTED, margin: 0, lineHeight: 1.6 }}>
              Routed by PancakeSwap · $U: <span style={{ fontFamily: 'monospace' }}>{U_CONTRACT.slice(0, 10)}…{U_CONTRACT.slice(-4)}</span>
              {' · '}
              <a href={`https://pancakeswap.finance/swap?chain=bsc&outputCurrency=${U_CONTRACT}`} target="_blank" rel="noreferrer" style={{ color: GOLD, textDecoration: 'none', fontWeight: 600 }}>Other tokens ↗</a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
