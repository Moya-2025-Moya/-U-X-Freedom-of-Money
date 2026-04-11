'use client';

import { useState } from 'react';

// ─── Brand constants ──────────────────────────────────────────────────────────
const GOLD = '#A18B2F';
const GOLD_LIGHT = '#E9D276';
const GOLD_DIM = 'rgba(161,139,47,0.18)';
const BG = '#FAFAF8';
const TEXT = '#1A1A1A';
const MUTED = '#6B6B6B';

// ─── Campaign data ────────────────────────────────────────────────────────────
const BOOK_GBP = 10.39;
const GBP_USD = 1.296;
const BOOK_USD = +(BOOK_GBP * GBP_USD).toFixed(2);
const CONTRACT_SHORT = '0xcE24439F2D9C6a2289F741120FE202248B666666';

// ─── U Logo SVG ───────────────────────────────────────────────────────────────
function ULogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={Math.round(size * 64 / 58)} viewBox="0 0 58 64" fill="none">
      <path d="M37.5659 55.4667C26.4385 55.4667 17.3414 46.08 17.3414 35.1289V1.42222C17.3414 0.64 16.6911 0 15.8963 0H1.44512C0.650304 0 0 0.64 0 1.42222V35.0151C0 50.7591 13.0856 64.0924 29.0758 64C44.6109 63.9076 57.2268 51.7547 57.7759 36.5796C57.234 47.104 48.3899 55.4667 37.5659 55.4667Z" fill="url(#g1)" />
      <path d="M56.3581 0H41.9069C41.1121 0 40.4618 0.64 40.4618 1.42222V35.2356C40.4618 41.3653 35.6784 46.6347 29.4572 46.9191C22.8169 47.2249 17.3398 42.0196 17.3398 35.5556C17.3398 46.5493 26.4007 55.4667 37.5715 55.4667C48.7423 55.4667 57.2324 47.104 57.7743 36.5796C57.7888 36.2382 57.8032 35.8969 57.8032 35.5556V1.42222C57.8032 0.64 57.1529 0 56.3581 0Z" fill="url(#g2)" />
      <defs>
        <linearGradient id="g1" x1="31.2652" y1="63.1324" x2="25.9731" y2="1.66354" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E9D276" /><stop offset="1" stopColor="#A18B2F" />
        </linearGradient>
        <linearGradient id="g2" x1="41.0615" y1="51.6907" x2="35.9859" y2="2.58582" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9F9FA2" /><stop offset="1" stopColor="#D7D7D7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Book Cover (real cover photo) ───────────────────────────────────────────
function BookCover({ scale = 1 }: { scale?: number }) {
  const w = Math.round(180 * scale);
  const h = Math.round(270 * scale);
  const p = (n: number) => Math.round(n * scale);
  return (
    <div style={{
      width: w, height: h, flexShrink: 0,
      borderRadius: 6,
      overflow: 'hidden',
      background: '#D5D5D3',
      boxShadow: `${p(8)}px ${p(14)}px ${p(36)}px rgba(0,0,0,0.28), -2px 0 0 rgba(0,0,0,0.08)`,
      border: '1px solid rgba(0,0,0,0.08)',
    }}>
      <img
        src="/book-cover.png"
        alt="Freedom of Money by Changpeng Zhao"
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
      />
    </div>
  );
}

// ─── Browser Frame ────────────────────────────────────────────────────────────
function BrowserFrame({ children, url = 'freedomofmoney.xyz' }: { children: React.ReactNode; url?: string }) {
  return (
    <div style={{ border: '1px solid #E5E5E5', borderRadius: 12, overflow: 'hidden', background: '#fff', boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
      <div style={{ background: '#F5F5F3', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #E8E8E8' }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
          ))}
        </div>
        <div style={{ flex: 1, background: '#EBEBEB', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: '#666', textAlign: 'center' as const }}>
          {url}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

// ─── Step Badge ───────────────────────────────────────────────────────────────
function StepBadge({ n, total }: { n: number; total: number }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>{n}</div>
      <span style={{ fontSize: 12, color: MUTED, letterSpacing: 2, textTransform: 'uppercase' as const }}>Step {n} of {total}</span>
    </div>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
      <div style={{ height: 1, width: 32, background: GOLD }} />
      <span style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase' as const, color: GOLD, fontWeight: 600 }}>{children}</span>
      <div style={{ height: 1, width: 32, background: GOLD }} />
    </div>
  );
}

// ─── SVG Icons (no emoji) ─────────────────────────────────────────────────────
function BookIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function CardIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function SearchIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ListIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="7" y1="9" x2="17" y2="9" />
      <line x1="7" y1="13" x2="17" y2="13" />
      <line x1="7" y1="17" x2="13" y2="17" />
    </svg>
  );
}

function HeartIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function ClockIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

// ─── All In One Click Diagram ────────────────────────────────────────────────
function AllInOneClickDiagram() {
  const tokens = [
    { ticker: 'USDT', name: 'Tether',    color: '#26A17B' },
    { ticker: 'USDC', name: 'USD Coin',  color: '#2775CA' },
    { ticker: 'BNB',  name: 'BNB Chain', color: '#F3BA2F' },
    { ticker: 'ETH',  name: 'Ethereum',  color: '#627EEA' },
    { ticker: 'SOL',  name: 'Solana',    color: '#9945FF' },
  ];
  const tokenCYs = [24, 72, 120, 168, 216];
  const PSX = 440, PSY = 120, PSR = 44;
  const UX  = 638, UY  = 120, UR  = 34;

  const tPaths = tokenCYs.map((cy) =>
    `M 136 ${cy} C 266 ${cy} 385 ${PSY + (cy - PSY) * 0.1} 396 120`
  );
  const outPath = `M 484 120 L 604 120`;

  return (
    <svg width="100%" viewBox="0 0 720 258" style={{ display: 'block' }}>
      <defs>
        {tPaths.map((d, i) => <path key={i} id={`aioc2-${i}`} d={d} />)}
        <path id="aioc2-out" d={outPath} />
        <linearGradient id="aioc2-gold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E9D276" /><stop offset="100%" stopColor="#A18B2F" />
        </linearGradient>
        <radialGradient id="aioc2-vault" cx="38%" cy="33%" r="60%">
          <stop offset="0%" stopColor="#E9D276" /><stop offset="100%" stopColor="#A18B2F" />
        </radialGradient>
      </defs>

      {/* Token-to-PS paths */}
      {tPaths.map((d, i) => (
        <path key={i} d={d} stroke="rgba(161,139,47,0.22)" strokeWidth="1.2" fill="none" strokeDasharray="4 3" />
      ))}
      {/* PS-to-$U path */}
      <path d={outPath} stroke="rgba(161,139,47,0.45)" strokeWidth="2" fill="none" strokeDasharray="4 3" />

      {/* Dots: token → PancakeSwap */}
      {tokenCYs.map((_, i) => (
        <circle key={i} r="3" fill="url(#aioc2-gold)">
          <animateMotion dur="1.8s" repeatCount="indefinite" begin={`${i * 0.3}s`} calcMode="linear">
            <mpath href={`#aioc2-${i}`} xlinkHref={`#aioc2-${i}`} />
          </animateMotion>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.9;1" dur="1.8s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
        </circle>
      ))}

      {/* Dots: PancakeSwap → $U */}
      {[0, 0.3, 0.6].map((delay, i) => (
        <circle key={i} r="3.5" fill="url(#aioc2-gold)">
          <animateMotion dur="0.9s" repeatCount="indefinite" begin={`${delay}s`} calcMode="linear">
            <mpath href="#aioc2-out" xlinkHref="#aioc2-out" />
          </animateMotion>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur="0.9s" repeatCount="indefinite" begin={`${delay}s`} />
        </circle>
      ))}

      {/* Token pill badges */}
      {tokens.map(({ ticker, name, color }, i) => {
        const cy = tokenCYs[i];
        return (
          <g key={ticker}>
            {/* Pill background */}
            <rect x="0" y={cy - 17} width="136" height="34" rx="17" fill="white" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
            {/* Brand color circle */}
            <circle cx="17" cy={cy} r="13" fill={color} />
            {/* Logo mark */}
            {ticker === 'USDT' && (
              <g transform={`translate(17, ${cy})`}>
                <rect x="-5.5" y="-6.5" width="11" height="2.8" rx="1.4" fill="white" />
                <rect x="-1.6" y="-4.2" width="3.2" height="9.5" rx="1.4" fill="white" />
              </g>
            )}
            {ticker === 'USDC' && (
              <g transform={`translate(17, ${cy})`}>
                <path d="M 4.5,-6 A 6.5,6.5 0 1,0 4.5,6" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
              </g>
            )}
            {ticker === 'BNB' && (
              <g transform={`translate(17, ${cy})`}>
                <polygon points="0,-7 3.5,-3.5 0,0 -3.5,-3.5" fill="rgba(0,0,0,0.75)" />
                <polygon points="0,7 3.5,3.5 0,0 -3.5,3.5" fill="rgba(0,0,0,0.75)" />
                <polygon points="-7,0 -3.5,-3.5 0,0 -3.5,3.5" fill="rgba(0,0,0,0.75)" />
                <polygon points="7,0 3.5,-3.5 0,0 3.5,3.5" fill="rgba(0,0,0,0.75)" />
                <polygon points="-3,0 0,-3 3,0 0,3" fill="rgba(0,0,0,0.75)" />
              </g>
            )}
            {ticker === 'ETH' && (
              <g transform={`translate(17, ${cy})`}>
                <polygon points="0,-8 5.5,0 0,3 -5.5,0" fill="white" opacity="0.95" />
                <polygon points="0,8 5.5,0 0,3 -5.5,0" fill="white" opacity="0.55" />
              </g>
            )}
            {ticker === 'SOL' && (
              <g transform={`translate(17, ${cy})`}>
                <rect x="-6.5" y="-7" width="13" height="2.8" rx="1.4" fill="white" transform="skewX(-15)" />
                <rect x="-6.5" y="-1.4" width="13" height="2.8" rx="1.4" fill="white" transform="skewX(-15)" />
                <rect x="-6.5" y="4.2" width="13" height="2.8" rx="1.4" fill="white" transform="skewX(-15)" />
              </g>
            )}
            {/* Ticker text */}
            <text x="38" y={cy - 2} fontSize="12" fontWeight="700" fill="#1A1A1A" fontFamily="system-ui, -apple-system, sans-serif">{ticker}</text>
            {/* Full name text */}
            <text x="38" y={cy + 12} fontSize="10" fill="#888" fontFamily="system-ui, -apple-system, sans-serif">{name}</text>
          </g>
        );
      })}

      {/* "+ more tokens" label */}
      <text x="68" y="248" textAnchor="middle" fontSize="11" fill="#BBBBBB" fontFamily="system-ui, sans-serif">+ more tokens</text>

      {/* PancakeSwap node */}
      <circle cx={PSX} cy={PSY} r={PSR} fill="#FFF9F0" stroke="rgba(161,139,47,0.32)" strokeWidth="1.5" />
      <image href="/pancakeswap-logo.svg" x={PSX - 28} y={PSY - 32} width="56" height="56" />
      <text x={PSX} y={PSY + PSR + 14} textAnchor="middle" fontSize="9" fontWeight="700" fill="#7a5500">PancakeSwap</text>

      {/* $U node with pulse ring */}
      <circle cx={UX} cy={UY} r={UR} fill="none" stroke="#A18B2F" strokeWidth="1.5">
        <animate attributeName="r" values={`${UR};${UR + 14}`} dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.28;0" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx={UX} cy={UY} r={UR} fill="url(#aioc2-vault)" />
      <text x={UX} y={UY + 7} textAnchor="middle" fontSize="22" fontWeight="900" fill="#fff"
        fontFamily="system-ui, -apple-system, sans-serif">U</text>

      {/* "All in one click." label */}
      <text x={UX} y={UY + UR + 18} textAnchor="middle" fontSize="11" fontWeight="700"
        fill="#A18B2F" letterSpacing="0.8">All in one click.</text>
    </svg>
  );
}

// ─── Swap Flow Diagram ────────────────────────────────────────────────────────
function SwapFlowDiagram() {
  const tokens = [
    { name: 'USDT', y: 12 },
    { name: 'USDC', y: 34 },
    { name: 'BNB',  y: 56 },
    { name: 'ETH',  y: 78 },
    { name: 'SOL',  y: 100 },
  ];
  const PSX = 148, PSY = 56;
  const UX = 238, UY = 56;

  return (
    <svg width="100%" viewBox="0 0 264 112" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="sd-gold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E9D276" /><stop offset="100%" stopColor="#A18B2F" />
        </linearGradient>
        <radialGradient id="sd-vault" cx="38%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#E9D276" /><stop offset="100%" stopColor="#A18B2F" />
        </radialGradient>
        {tokens.map(({ y }, i) => {
          const d = y === PSY
            ? `M 62 ${y} L ${PSX - 23} ${y}`
            : `M 62 ${y} C 104 ${y} ${PSX - 23} ${PSY + (y - PSY) * 0.28} ${PSX - 23} ${PSY}`;
          return <path key={i} id={`sd-in-${i}`} d={d} />;
        })}
        <path id="sd-out" d={`M ${PSX + 23} ${PSY} L ${UX - 20} ${UY}`} />
      </defs>

      {/* Input dashed paths */}
      {tokens.map(({ y }, i) => {
        const d = y === PSY
          ? `M 62 ${y} L ${PSX - 23} ${y}`
          : `M 62 ${y} C 104 ${y} ${PSX - 23} ${PSY + (y - PSY) * 0.28} ${PSX - 23} ${PSY}`;
        return <path key={i} d={d} stroke="rgba(161,139,47,0.22)" strokeWidth="1.2" fill="none" strokeDasharray="3 2" />;
      })}
      {/* Output path */}
      <path d={`M ${PSX + 23} ${PSY} L ${UX - 20} ${UY}`} stroke="rgba(161,139,47,0.45)" strokeWidth="1.5" fill="none" strokeDasharray="3 2" />

      {/* Animated dots: each token → PancakeSwap */}
      {tokens.map((_, i) => (
        <circle key={i} r="2.5" fill="url(#sd-gold)">
          <animateMotion dur="1.6s" repeatCount="indefinite" begin={`${i * 0.32}s`} calcMode="linear">
            <mpath href={`#sd-in-${i}`} xlinkHref={`#sd-in-${i}`} />
          </animateMotion>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.88;1" dur="1.6s" repeatCount="indefinite" begin={`${i * 0.32}s`} />
        </circle>
      ))}
      {/* Animated dots: PancakeSwap → $U (faster, denser) */}
      {[0, 0.27, 0.54].map((delay, i) => (
        <circle key={i} r="3" fill="url(#sd-gold)">
          <animateMotion dur="0.8s" repeatCount="indefinite" begin={`${delay}s`} calcMode="linear">
            <mpath href="#sd-out" xlinkHref="#sd-out" />
          </animateMotion>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur="0.8s" repeatCount="indefinite" begin={`${delay}s`} />
        </circle>
      ))}

      {/* Token pills */}
      {tokens.map(({ name, y }) => (
        <g key={name}>
          <rect x="0" y={y - 10} width="60" height="20" rx="10" fill="#F2F2F0" stroke="rgba(161,139,47,0.28)" strokeWidth="1" />
          <text x="30" y={y + 4.5} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#3a3a3a" fontFamily="system-ui, sans-serif">{name}</text>
        </g>
      ))}

      {/* "more" pill */}
      <g>
        <text x="30" y="116" textAnchor="middle" fontSize="8.5" fill="#999" fontFamily="system-ui">+ more</text>
      </g>

      {/* PancakeSwap node */}
      <circle cx={PSX} cy={PSY} r="23" fill="#FFF9F0" stroke="rgba(161,139,47,0.35)" strokeWidth="1.5" />
      <image href="/pancakeswap-logo.svg" x={PSX - 16} y={PSY - 18} width="32" height="32" />

      {/* $U node */}
      <circle cx={UX} cy={UY} r="20" fill="url(#sd-vault)" />
      <text x={UX} y={UY + 6} textAnchor="middle" fontSize="15" fontWeight="900" fill="#fff" fontFamily="system-ui, sans-serif">U</text>
    </svg>
  );
}

// ─── Payment Step (own state for tab toggle) ──────────────────────────────────
function PaymentStep() {
  const [tab, setTab] = useState<'direct' | 'convert'>('direct');
  return (
    <div style={{ padding: 24 }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', marginBottom: 16, border: `1px solid ${GOLD_DIM}`, borderRadius: 8, overflow: 'hidden' }}>
        {(['direct', 'convert'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '8px 0', border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
            background: tab === t ? TEXT : 'transparent',
            color: tab === t ? '#fff' : MUTED,
          }}>
            {t === 'direct' ? 'Pay with $U' : 'Convert & Pay'}
          </button>
        ))}
      </div>

      {tab === 'direct' ? (
        <>
          <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 4 }}>Complete Payment</div>
          <div style={{ fontSize: 11, color: MUTED, marginBottom: 18 }}>Connect your BSC wallet to transfer $U</div>
          <div style={{ background: '#F7F5F0', borderRadius: 10, padding: 14, marginBottom: 12, border: `1px solid ${GOLD_DIM}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: MUTED }}>Amount</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{BOOK_USD} <span style={{ color: GOLD }}>$U</span></span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: MUTED }}>To (Treasury)</span>
              <span style={{ fontSize: 10, color: MUTED, fontFamily: 'monospace' }}>0x7B72…E85B</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: MUTED }}>Network</span>
              <span style={{ fontSize: 11, color: TEXT }}>BNB Chain</span>
            </div>
          </div>
          <div style={{ fontSize: 10, color: MUTED, marginBottom: 14, padding: '8px 10px', background: '#F0F0F0', borderRadius: 6, lineHeight: 1.5 }}>
            $U contract: <span style={{ fontFamily: 'monospace', color: GOLD }}>{CONTRACT_SHORT}</span><br />
            PeckShield Audit #2025-157 · No Critical/High findings
          </div>
          <button style={{ width: '100%', padding: '11px 0', background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.3 }}>
            Connect Wallet & Pay
          </button>
        </>
      ) : (
        <>
          <div style={{ background: '#F9F8F5', border: `1px solid ${GOLD_DIM}`, borderRadius: 10, padding: '12px 12px 8px', marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 8, fontWeight: 600 }}>Any token → $U</div>
            <SwapFlowDiagram />
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginBottom: 14 }}>Any token, auto-converted to $U via PancakeSwap before payment.</div>
          <div style={{ background: '#F7F5F0', borderRadius: 10, padding: 14, marginBottom: 6, border: `1px solid ${GOLD_DIM}` }}>
            <div style={{ fontSize: 10, color: MUTED, marginBottom: 6 }}>You Pay</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>{BOOK_USD}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fff', border: '1px solid #E5E5E5', borderRadius: 6, padding: '5px 10px', fontSize: 12, fontWeight: 600, color: TEXT }}>
                USDT / USDC / BNB / ETH <span style={{ color: MUTED, fontSize: 10, marginLeft: 2 }}>▾</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center' as const, margin: '5px 0', color: GOLD, fontSize: 15, fontWeight: 600 }}>↕</div>
          <div style={{ background: '#F7F5F0', borderRadius: 10, padding: 14, marginBottom: 12, border: `1px solid ${GOLD_DIM}` }}>
            <div style={{ fontSize: 10, color: MUTED, marginBottom: 6 }}>You Get</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>{BOOK_USD}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(233,210,118,0.1)', border: `1px solid ${GOLD_DIM}`, borderRadius: 6, padding: '5px 10px', fontSize: 12, fontWeight: 600, color: GOLD }}>
                <ULogo size={13} /><span>$U</span>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 10, color: MUTED, marginBottom: 14, padding: '6px 10px', background: '#F0F0F0', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2" strokeLinecap="round"><path d="M16 3l4 4-4 4"/><path d="M20 7H4"/><path d="M8 21l-4-4 4-4"/><path d="M4 17h16"/></svg>
            via PancakeSwap · best rate auto-selected · ~3s
          </div>
          <button style={{ width: '100%', padding: '11px 0', background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.3 }}>
            Swap & Buy
          </button>
        </>
      )}
    </div>
  );
}

// ─── Treasury Flow (pure SVG: animateMotion + mpath on identical path strings) ─
// Money flow: Wallet → Treasury → 100% Charity (gold, animated)
// Service:    Treasury triggers Book fulfilment (gray, no dots — not money)
function TreasuryFlow() {
  const dL  = 'M 115 110 L 328 110';               // Wallet → Treasury
  const dCh = 'M 432 110 C 550 110 550 50 644 50';  // Treasury → Charity (ALL $U, upper)
  const dBk = 'M 432 110 C 550 110 550 170 644 170'; // Treasury → Book delivery (service, lower)

  return (
    <div style={{ padding: '12px 0 8px' }}>
      <svg width="100%" viewBox="0 0 760 235" style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <path id="tflow-l"  d={dL}  />
          <path id="tflow-ch" d={dCh} />
          <path id="tflow-bk" d={dBk} />
          <linearGradient id="dot-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E9D276" />
            <stop offset="100%" stopColor="#A18B2F" />
          </linearGradient>
          <radialGradient id="vault-grad" cx="38%" cy="33%" r="60%">
            <stop offset="0%" stopColor="#E9D276" />
            <stop offset="100%" stopColor="#A18B2F" />
          </radialGradient>
        </defs>

        {/* All three paths: gold, equal weight */}
        <path d={dL}  stroke="rgba(161,139,47,0.28)" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
        <path d={dCh} stroke="rgba(161,139,47,0.28)" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
        <path d={dBk} stroke="rgba(161,139,47,0.28)" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />

        {/* Wallet → Treasury dots */}
        {[{ r: 4, delay: '0s' }, { r: 3, delay: '0.8s' }, { r: 2.5, delay: '1.6s' }].map(({ r, delay }, i) => (
          <circle key={`l${i}`} r={r} fill="url(#dot-grad)">
            <animateMotion dur="2.4s" repeatCount="indefinite" begin={delay} calcMode="linear">
              <mpath href="#tflow-l" xlinkHref="#tflow-l" />
            </animateMotion>
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.05;0.9;1" dur="2.4s" repeatCount="indefinite" begin={delay} />
          </circle>
        ))}

        {/* Treasury → Charity dots */}
        {[{ r: 3.5, delay: '0.4s' }, { r: 2.5, delay: '1.2s' }, { r: 3, delay: '2.0s' }].map(({ r, delay }, i) => (
          <circle key={`ch${i}`} r={r} fill="url(#dot-grad)">
            <animateMotion dur="2.4s" repeatCount="indefinite" begin={delay} calcMode="linear">
              <mpath href="#tflow-ch" xlinkHref="#tflow-ch" />
            </animateMotion>
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.05;0.9;1" dur="2.4s" repeatCount="indefinite" begin={delay} />
          </circle>
        ))}

        {/* Treasury → Book dots */}
        {[{ r: 3.5, delay: '1.0s' }, { r: 2.5, delay: '1.8s' }].map(({ r, delay }, i) => (
          <circle key={`bk${i}`} r={r} fill="url(#dot-grad)">
            <animateMotion dur="2.4s" repeatCount="indefinite" begin={delay} calcMode="linear">
              <mpath href="#tflow-bk" xlinkHref="#tflow-bk" />
            </animateMotion>
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.05;0.9;1" dur="2.4s" repeatCount="indefinite" begin={delay} />
          </circle>
        ))}

        {/* WALLET node */}
        <rect x="55" y="80" width="60" height="60" rx="16" fill="#fff" stroke="rgba(161,139,47,0.25)" strokeWidth="1.5" />
        <rect x="68" y="93" width="34" height="24" rx="4" fill="none" stroke="#A18B2F" strokeWidth="1.5" />
        <line x1="68" y1="102" x2="102" y2="102" stroke="#A18B2F" strokeWidth="1.2" />
        <rect x="84" y="105" width="10" height="7" rx="2.5" fill="rgba(161,139,47,0.18)" stroke="#A18B2F" strokeWidth="1.2" />
        <text x="85" y="156" textAnchor="middle" fontSize="11" fontWeight="600" fill="#1A1A1A">Your Wallet</text>
        <text x="85" y="170" textAnchor="middle" fontSize="10" fill="#6B6B6B">BSC · $U</text>

        {/* TREASURY node */}
        <circle cx="380" cy="110" r="52" fill="none" stroke="#A18B2F" strokeWidth="1.5">
          <animate attributeName="r" values="52;68" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <circle cx="380" cy="110" r="52" fill="url(#vault-grad)" />
        <text x="380" y="121" textAnchor="middle" fontSize="30" fontWeight="900" fill="#fff" fontFamily="system-ui, sans-serif">U</text>
        <text x="380" y="177" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1A1A1A">Treasury</text>
        <text x="380" y="192" textAnchor="middle" fontSize="10" fill="#6B6B6B" fontFamily="monospace">0x7B72…E85B</text>

        {/* CHARITY node (upper-right) — where your $U goes */}
        <rect x="644" y="24" width="52" height="52" rx="14" fill="#fff" stroke="rgba(161,139,47,0.28)" strokeWidth="1.5" />
        <path d="M 670 58 C 668 55 659 50 659 44 C 659 40.5 661.8 38 665 38 C 667.2 38 669.2 39.5 670 41 C 670.8 39.5 672.8 38 675 38 C 678.2 38 681 40.5 681 44 C 681 50 672 55 670 58Z" fill="rgba(161,139,47,0.18)" stroke="#A18B2F" strokeWidth="1.5" strokeLinejoin="round" />
        <text x="670" y="91" textAnchor="middle" fontSize="11" fontWeight="600" fill="#1A1A1A">Charity Donation</text>
        <text x="670" y="105" textAnchor="middle" fontSize="10" fill="#6B6B6B">100% · On-chain</text>

        {/* BOOK DELIVERY node (lower-right) — what you receive */}
        <rect x="644" y="144" width="52" height="52" rx="14" fill="#fff" stroke="rgba(161,139,47,0.28)" strokeWidth="1.5" />
        <rect x="655" y="155" width="30" height="22" rx="2" fill="none" stroke="#A18B2F" strokeWidth="1.5" />
        <rect x="653" y="150" width="34" height="8" rx="2" fill="none" stroke="#A18B2F" strokeWidth="1.5" />
        <line x1="670" y1="150" x2="670" y2="177" stroke="#A18B2F" strokeWidth="1.2" />
        <text x="670" y="211" textAnchor="middle" fontSize="11" fontWeight="600" fill="#1A1A1A">Your Book</text>
        <text x="670" y="225" textAnchor="middle" fontSize="10" fill="#6B6B6B">We ship to your door</text>
      </svg>
    </div>
  );
}

// ─── FAQ Data ─────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: 'What is this campaign?',
    a: "A page where users buy CZ's physical book \"Freedom of Money\" using $U stablecoin. 100% of the $U goes to charity. We purchase the book and ship it directly to the user's address. All fund flows are publicly verifiable on BscScan.",
  },
  {
    q: 'Why now?',
    a: "The book launched April 8, 2026, reaching #1 Bestseller with proceeds fully donated to charity. This is a narrow time window: peak attention on CZ, $U's first real retail payment use case, and on-chain charity transparency. These three narratives converge right now.",
  },
  {
    q: 'How does the purchase work?',
    a: `User fills in a shipping address, connects their BSC wallet, and sends ${BOOK_USD} $U to the Treasury address. Once confirmed on-chain, 100% of the $U is donated to charity. We purchase the book and ship it to the user's door within 1-3 days.`,
  },
  {
    q: 'How is the money transparent?',
    a: 'The Treasury is a standard BSC wallet address. No smart contract, no hidden logic. Every inbound $U payment and every outbound charity transfer is publicly visible on BscScan. The campaign page displays all transaction hashes in real time.',
  },
  {
    q: 'Is this safe?',
    a: "No custom smart contracts. The only on-chain action is calling $U's standard ERC-20 transfer() function into the Treasury address. $U is audited by PeckShield (Report #2025-157) with zero Critical/High findings. Treasury is a plain wallet: no executable logic, zero drainable attack surface.",
  },
  {
    q: 'What is the technical architecture?',
    a: 'Frontend: Next.js + Vercel. Wallet: wagmi + viem (BSC). Orders: Supabase. Treasury data: BscScan API. Fulfilment: manual purchase and shipping by our team. $U contract: 0xcE24439F2D9C6a2289F741120FE202248B666666.',
  },
  {
    q: 'What is the timeline?',
    a: 'Days 1-2: Generate Treasury address, prepare Amazon accounts. Days 3-7: Frontend, Supabase, on-chain listener. Days 8-10: End-to-end test with a real order. Days 11-14: Deploy, announce on social.',
  },
  {
    q: 'What are the risks?',
    a: 'Exchange rate: $U is pegged at $1, GBP/USD float is absorbed by locking price at checkout. Fulfilment delay: early-stage manual process, communicated upfront as 1-3 days. Privacy: shipping addresses stored in Supabase, basic privacy policy required.',
  },
  {
    q: 'What still needs to happen before launch?',
    a: '1. Generate dedicated Treasury MetaMask address. 2. Confirm charity recipient(s). 3. Confirm Amazon account coverage by region. 4. Decide whether to co-announce on $U official channels.',
  },
];

// ─── Purchase Flow States ─────────────────────────────────────────────────────
const FLOW_STEPS = [
  {
    title: 'Discover',
    annotation: 'User lands on the page. The book, the cause, and the price in $U are front and centre. No exchange rate math, just a single number.',
    ui: (
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <BookCover scale={0.72} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: GOLD, textTransform: 'uppercase' as const, marginBottom: 6, fontWeight: 600 }}>Freedom of Money</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, lineHeight: 1.3, marginBottom: 4 }}>CZ's Memoir</div>
            <div style={{ fontSize: 11, color: MUTED, marginBottom: 14, lineHeight: 1.5 }}>Former Binance CEO. #1 bestseller. All proceeds donated to charity.</div>
            <div style={{ background: '#F7F5F0', borderRadius: 10, padding: '10px 14px', marginBottom: 14, border: `1px solid ${GOLD_DIM}` }}>
              <div style={{ fontSize: 10, color: MUTED, marginBottom: 2 }}>Price</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: TEXT }}>{BOOK_USD}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: GOLD }}>$U</span>
                <span style={{ fontSize: 11, color: MUTED }}>approx. £{BOOK_GBP}</span>
              </div>
            </div>
            <button style={{ width: '100%', padding: '10px 0', background: TEXT, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', letterSpacing: 0.3 }}>
              Buy with $U →
            </button>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Ship To',
    annotation: 'User enters their delivery address. Standard form, no wallet required yet. Supports worldwide shipping wherever Amazon delivers.',
    ui: (
      <div style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 16 }}>Where should we ship your book?</div>
        {[
          { label: 'Full Name', placeholder: 'Satoshi Nakamoto', full: true },
          { label: 'Address Line 1', placeholder: '21 Bitcoin Street', full: true },
          { label: 'City', placeholder: 'London', full: false },
          { label: 'Postcode', placeholder: 'EC1A 1BB', full: false },
        ].map(({ label, placeholder, full }, i) => (
          <div key={i} style={{ marginBottom: 10, display: 'inline-block', width: full ? '100%' : 'calc(50% - 5px)', marginRight: full ? 0 : (i % 2 === 0 ? 10 : 0) }}>
            <div style={{ fontSize: 10, color: MUTED, marginBottom: 4, letterSpacing: 0.5 }}>{label}</div>
            <div style={{ padding: '8px 12px', border: '1px solid #E5E5E5', borderRadius: 7, fontSize: 12, color: '#CCC', background: '#FAFAFA' }}>{placeholder}</div>
          </div>
        ))}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: MUTED, marginBottom: 4, letterSpacing: 0.5 }}>Country</div>
          <div style={{ padding: '8px 12px', border: '1px solid #E5E5E5', borderRadius: 7, fontSize: 12, color: '#888', display: 'flex', justifyContent: 'space-between' }}>
            <span>United Kingdom</span><span>▾</span>
          </div>
        </div>
        <button style={{ width: '100%', padding: '10px 0', background: TEXT, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Continue →
        </button>
      </div>
    ),
  },
  {
    title: 'Pay with $U',
    annotation: 'Wallet connection and payment. Pay directly in $U, or swap any token (USDT, USDC, BNB, ETH...) via PancakeSwap. Conversion is handled automatically before the payment hits the Treasury.',
    ui: <PaymentStep />,
  },
  {
    title: 'Confirming',
    annotation: 'The $U transfer is submitted to the BSC mempool. User sees the tx hash immediately and can verify on BscScan while waiting for confirmation (about 3 seconds).',
    ui: (
      <div style={{ padding: 32, textAlign: 'center' as const }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ marginBottom: 20 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', border: `3px solid ${GOLD_DIM}`, borderTop: `3px solid ${GOLD}`, margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 4 }}>Confirming on-chain</div>
          <div style={{ fontSize: 12, color: MUTED }}>BNB Chain · ~3 seconds</div>
        </div>
        <div style={{ background: '#F7F5F0', borderRadius: 8, padding: '10px 14px', marginBottom: 12, textAlign: 'left' as const }}>
          <div style={{ fontSize: 10, color: MUTED, marginBottom: 3 }}>Transaction Hash</div>
          <div style={{ fontSize: 11, fontFamily: 'monospace', color: GOLD, wordBreak: 'break-all' as const }}>0xf4a2...c891</div>
        </div>
        <div style={{ fontSize: 11, color: MUTED, padding: '8px 12px', border: `1px solid ${GOLD_DIM}`, borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span>↗</span> View on BscScan
        </div>
      </div>
    ),
  },
  {
    title: 'Order Confirmed',
    annotation: 'Payment confirmed. The order is written to Supabase. User receives their order ID and tx hash. We fulfil via Amazon within 1-3 business days.',
    ui: (
      <div style={{ padding: 28, textAlign: 'center' as const }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22, color: '#fff', fontWeight: 700 }}>
          ✓
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: TEXT, marginBottom: 4 }}>Order Confirmed</div>
        <div style={{ fontSize: 12, color: MUTED, marginBottom: 20 }}>Your book ships within 1-3 business days</div>
        <div style={{ background: '#F7F5F0', borderRadius: 10, padding: 14, textAlign: 'left' as const, marginBottom: 16 }}>
          {[
            ['Order ID', 'FOM-2025-001'],
            ['Tx Hash', '0xf4a2...c891'],
            ['Amount', `${BOOK_USD} $U`],
            ['Ships to', 'London, UK'],
          ].map(([k, v], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: i < 3 ? 8 : 0 }}>
              <span style={{ fontSize: 11, color: MUTED }}>{k}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: TEXT, fontFamily: k === 'Tx Hash' || k === 'Order ID' ? 'monospace' : 'inherit' }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: MUTED, padding: '8px 12px', border: `1px solid ${GOLD_DIM}`, borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span>↗</span> Verify on BscScan
        </div>
      </div>
    ),
  },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FreedomOfMoneyPage() {
  const [qaOpen, setQaOpen] = useState(false);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.7s ease forwards; }
        .fade-up-1 { animation-delay: 0.1s; opacity: 0; }
        .fade-up-2 { animation-delay: 0.25s; opacity: 0; }
        .fade-up-3 { animation-delay: 0.4s; opacity: 0; }
      `}</style>

      <div style={{ background: BG, minHeight: '100vh', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: TEXT }}>

        {/* NAV */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 100, padding: '16px 24px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(250,250,248,0.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 50, padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 20, maxWidth: 600, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              <ULogo size={22} />
              <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>United Stables</span>
            </div>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: GOLD, fontWeight: 600 }}>Freedom of Money</span>
              <a href="https://u.tech" target="_blank" rel="noreferrer" style={{ fontSize: 12, color: MUTED, textDecoration: 'none' }}>u.tech ↗</a>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ position: 'relative', padding: '80px 24px 100px', textAlign: 'center', overflow: 'hidden', minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(233,210,118,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(161,139,47,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div className="fade-up fade-up-1" style={{ marginBottom: 20 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 50, border: `1px solid ${GOLD_DIM}`, background: 'rgba(233,210,118,0.08)', marginBottom: 32 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD, display: 'inline-block' }} />
              <span style={{ fontSize: 11, color: GOLD, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' }}>Live Campaign · April 2026</span>
            </div>
          </div>

          <div className="fade-up fade-up-1">
            <h1 style={{ fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 800, lineHeight: 1.05, margin: '0 0 8px', letterSpacing: -2 }}>
              Freedom of Money
            </h1>
            <h1 style={{ fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 800, lineHeight: 1.05, margin: '0 0 32px', letterSpacing: -2 }}>
              <span style={{ WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text', backgroundClip: 'text', backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>× $U</span>
            </h1>
          </div>

          <div className="fade-up fade-up-2">
            <p style={{ fontSize: 18, color: MUTED, maxWidth: 520, margin: '0 auto 48px', lineHeight: 1.65 }}>
              CZ's bestselling memoir. Purchased with $U. Proceeds to charity. Every dollar verifiable on-chain.
            </p>
          </div>

          <div className="fade-up fade-up-2" style={{ display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 64, flexWrap: 'wrap' }}>
            <BookCover scale={1} />
            <div style={{ textAlign: 'left', maxWidth: 260 }}>
              <div style={{ fontSize: 11, color: GOLD, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Freedom of Money</div>
              <div style={{ fontSize: 14, color: MUTED, marginBottom: 20, lineHeight: 1.6 }}>Published April 8, 2026. #1 Amazon Bestseller. All author proceeds donated to charity.</div>
              <div style={{ background: '#fff', border: `1px solid ${GOLD_DIM}`, borderRadius: 12, padding: '14px 18px', display: 'inline-block' }}>
                <div style={{ fontSize: 10, color: MUTED, marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase' }}>Price</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: TEXT, letterSpacing: -1 }}>{BOOK_USD}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: GOLD }}>$U</span>
                  <span style={{ fontSize: 12, color: MUTED }}>approx. £{BOOK_GBP}</span>
                </div>
                <div style={{ fontSize: 10, color: MUTED, marginTop: 4 }}>$U pegged at $1 · price locked at checkout</div>
              </div>
            </div>
          </div>

          <div className="fade-up fade-up-3" style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/freedomofmoney/purchase" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, color: '#fff', borderRadius: 50, fontSize: 14, fontWeight: 700, textDecoration: 'none', letterSpacing: 0.3, boxShadow: '0 4px 20px rgba(161,139,47,0.35)' }}>
              Order Your Copy →
            </a>
            <a href="#flow" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', background: TEXT, color: '#fff', borderRadius: 50, fontSize: 14, fontWeight: 600, textDecoration: 'none', letterSpacing: 0.3 }}>
              See the full experience ↓
            </a>
          </div>
        </section>

        {/* WHY THIS WORKS */}
        <section style={{ padding: '80px 24px', maxWidth: 960, margin: '0 auto' }}>
          <SectionLabel>Why This Campaign</SectionLabel>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, marginBottom: 48, letterSpacing: -1 }}>Three Things. One Moment.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[
              {
                icon: <BookIcon size={32} />,
                title: 'The Book',
                body: "CZ's memoir launched April 8, 2026. #1 Bestseller on day one. £10.39 physical. 100% of proceeds go to charity. Maximum cultural moment, minimum price barrier.",
              },
              {
                icon: <CardIcon size={32} />,
                title: "$U's First Real Purchase",
                body: "Not DeFi. Not trading. A physical book, shipped to your door. This is $U's first retail payment use case: proof that a stablecoin works in the real world.",
              },
              {
                icon: <SearchIcon size={32} />,
                title: 'Transparent by Default',
                body: "A public Treasury address on BSC. Every inbound payment and every charity outflow is on-chain, forever. We don't say the money goes to charity. The blockchain does.",
              },
            ].map(({ icon, title, body }, i) => (
              <div key={i} style={{ background: '#fff', border: `1px solid ${GOLD_DIM}`, borderRadius: 16, padding: 28 }}>
                <div style={{ marginBottom: 16 }}>{icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: TEXT }}>{title}</div>
                <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.65 }}>{body}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ANY TOKEN → $U DIAGRAM */}
        <section style={{ padding: '80px 24px 60px', background: '#fff' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <SectionLabel>Pay with Anything</SectionLabel>
            <h2 style={{ textAlign: 'center', fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 700, marginBottom: 8, letterSpacing: -0.8 }}>Any Token, One Click.</h2>
            <p style={{ textAlign: 'center', color: MUTED, fontSize: 14, marginBottom: 40 }}>PancakeSwap converts your token to $U automatically before payment.</p>
            <AllInOneClickDiagram />
          </div>
        </section>

        {/* PURCHASE FLOW */}
        <section id="flow" style={{ padding: '80px 24px', background: '#fff' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <SectionLabel>User Journey</SectionLabel>
            <h2 style={{ textAlign: 'center', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, marginBottom: 12, letterSpacing: -1 }}>The Purchase Experience</h2>
            <p style={{ textAlign: 'center', color: MUTED, fontSize: 14, marginBottom: 64 }}>Scroll through each step of the user flow as it will appear in production.</p>

            {FLOW_STEPS.map((step, i) => {
              const isEven = i % 2 === 0;
              return (
                <div key={i} style={{ display: 'flex', gap: 40, alignItems: 'center', marginBottom: 80, flexDirection: isEven ? 'row' : 'row-reverse', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 340px', minWidth: 280 }}>
                    <BrowserFrame>{step.ui}</BrowserFrame>
                  </div>
                  <div style={{ flex: '1 1 220px', minWidth: 200 }}>
                    <StepBadge n={i + 1} total={FLOW_STEPS.length} />
                    <h3 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 12px', letterSpacing: -0.5 }}>{step.title}</h3>
                    <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.7, margin: 0 }}>{step.annotation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* TREASURY VIZ */}
        <section style={{ padding: '80px 24px', maxWidth: 960, margin: '0 auto' }}>
          <SectionLabel>Fund Flows</SectionLabel>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, marginBottom: 12, letterSpacing: -1 }}>Where Your $U Goes</h2>
          <p style={{ textAlign: 'center', color: MUTED, fontSize: 14, marginBottom: 48 }}>You get a physical book shipped to your door. Your $U goes 100% to charity.</p>

          <div style={{ background: '#fff', border: `1px solid ${GOLD_DIM}`, borderRadius: 20, padding: '32px 40px', marginBottom: 32 }}>
            <TreasuryFlow />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Treasury Balance', value: '0', unit: '$U', note: '0x7B72…E85B' },
              { label: 'Books Ordered', value: '0', unit: '', note: 'Orders open' },
              { label: 'Donated to Charity', value: '0', unit: '$U', note: 'On-chain verifiable' },
              { label: 'On-chain Txs', value: '0', unit: '', note: 'BscScan verified' },
            ].map(({ label, value, unit, note }, i) => (
              <div key={i} style={{ background: '#fff', border: `1px solid ${GOLD_DIM}`, borderRadius: 14, padding: 20 }}>
                <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: TEXT, letterSpacing: -1 }}>
                  {value} <span style={{ fontSize: 14, fontWeight: 600, color: GOLD }}>{unit}</span>
                </div>
                <div style={{ fontSize: 10, color: MUTED, marginTop: 4 }}>{note}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#F7F5F0', border: `1px solid ${GOLD_DIM}`, borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>Treasury Address</div>
              <div style={{ fontSize: 13, fontFamily: 'monospace', color: TEXT }}>0x7B72496CC89D82A31f1513D8F01973db70c3E85B</div>
            </div>
            <a href="https://bscscan.com/address/0x7B72496CC89D82A31f1513D8F01973db70c3E85B" target="_blank" rel="noreferrer" style={{ fontSize: 11, padding: '6px 14px', border: `1px solid ${GOLD_DIM}`, borderRadius: 20, color: GOLD, textDecoration: 'none' }}>
              View on BscScan ↗
            </a>
          </div>
        </section>

        {/* TRANSPARENCY */}
        <section style={{ padding: '80px 24px', background: '#fff' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <SectionLabel>Transparency</SectionLabel>
            <h2 style={{ textAlign: 'center', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, marginBottom: 12, letterSpacing: -1 }}>Not Our Word. The Chain's.</h2>
            <p style={{ textAlign: 'center', color: MUTED, fontSize: 14, marginBottom: 48 }}>Every purchase and every charity outflow is recorded on BNB Chain, permanently.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
              {[
                { title: 'Purchase Log', icon: <ListIcon size={18} />, cols: ['Buyer', 'Amount', 'Tx Hash', 'Date'] },
                { title: 'Charity Outflows', icon: <HeartIcon size={18} />, cols: ['Recipient', 'Amount', 'Tx Hash', 'Date'] },
              ].map(({ title, icon, cols }, i) => (
                <div key={i} style={{ border: `1px solid ${GOLD_DIM}`, borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ background: '#F7F5F0', padding: '14px 20px', borderBottom: `1px solid ${GOLD_DIM}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {icon}
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{title}</span>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${GOLD_DIM}` }}>
                          {cols.map((c) => (
                            <th key={c} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, color: MUTED, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={cols.length} style={{ padding: '32px 16px', textAlign: 'center', color: MUTED, fontSize: 13 }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><ClockIcon size={24} /></div>
                            No transactions yet. Be the first.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Q&A: single toggle */}
        <section style={{ padding: '80px 24px' }}>
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <SectionLabel>Campaign Q&A</SectionLabel>
            <h2 style={{ textAlign: 'center', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, marginBottom: 48, letterSpacing: -1 }}>Everything You Need to Know</h2>

            <div style={{ border: `1px solid ${qaOpen ? GOLD_DIM : '#E8E8E8'}`, borderRadius: 12, overflow: 'hidden', background: '#fff', transition: 'border-color 0.2s' }}>
              <button
                onClick={() => setQaOpen(!qaOpen)}
                style={{ width: '100%', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' as const }}
              >
                <span style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>Full Campaign Q&A ({FAQ_ITEMS.length} questions)</span>
                <span style={{ color: GOLD, fontSize: 22, flexShrink: 0, transition: 'transform 0.2s', transform: qaOpen ? 'rotate(45deg)' : 'rotate(0deg)', fontWeight: 300, lineHeight: 1 }}>+</span>
              </button>
              {qaOpen && (
                <div style={{ borderTop: `1px solid ${GOLD_DIM}` }}>
                  {FAQ_ITEMS.map((item, i) => (
                    <div key={i} style={{ padding: '18px 24px', borderBottom: i < FAQ_ITEMS.length - 1 ? 'rgba(161,139,47,0.1) 1px solid' : 'none' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 8 }}>{item.q}</div>
                      <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.7 }}>{item.a}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: `1px solid ${GOLD_DIM}`, padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
            <ULogo size={20} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>United Stables</span>
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginBottom: 8 }}>
            $U Contract (BNB Chain): <span style={{ fontFamily: 'monospace', color: GOLD }}>{CONTRACT_SHORT}</span> · PeckShield #2025-157
          </div>
          <div style={{ fontSize: 11, color: '#CCC' }}>
            United Stables · April 2026 · <a href="https://github.com/Moya-2025-Moya/-U-X-Freedom-of-Money" target="_blank" rel="noreferrer" style={{ color: '#CCC', textDecoration: 'underline' }}>Open source ↗</a>
          </div>
        </footer>

      </div>
    </>
  );
}
