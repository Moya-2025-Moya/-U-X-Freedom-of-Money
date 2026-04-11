'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

// ─── Brand constants ──────────────────────────────────────────────────────────
const GOLD = '#A18B2F';
const GOLD_LIGHT = '#E9D276';
const GOLD_DIM = 'rgba(161,139,47,0.18)';
const BG = '#FAFAF8';
const TEXT = '#1A1A1A';
const MUTED = '#6B6B6B';

const BOOK_GBP = 10.39;
const GBP_USD = 1.296;
const BOOK_USD = +(BOOK_GBP * GBP_USD).toFixed(2);
const CONTRACT_SHORT = '0xcE24439F2D9C6a2289F741120FE202248B666666';

// ─── U Logo ───────────────────────────────────────────────────────────────────
function ULogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={Math.round(size * 64 / 58)} viewBox="0 0 58 64" fill="none">
      <path d="M37.5659 55.4667C26.4385 55.4667 17.3414 46.08 17.3414 35.1289V1.42222C17.3414 0.64 16.6911 0 15.8963 0H1.44512C0.650304 0 0 0.64 0 1.42222V35.0151C0 50.7591 13.0856 64.0924 29.0758 64C44.6109 63.9076 57.2268 51.7547 57.7759 36.5796C57.234 47.104 48.3899 55.4667 37.5659 55.4667Z" fill="url(#dg1)" />
      <path d="M56.3581 0H41.9069C41.1121 0 40.4618 0.64 40.4618 1.42222V35.2356C40.4618 41.3653 35.6784 46.6347 29.4572 46.9191C22.8169 47.2249 17.3398 42.0196 17.3398 35.5556C17.3398 46.5493 26.4007 55.4667 37.5715 55.4667C48.7423 55.4667 57.2324 47.104 57.7743 36.5796C57.7888 36.2382 57.8032 35.8969 57.8032 35.5556V1.42222C57.8032 0.64 57.1529 0 56.3581 0Z" fill="url(#dg2)" />
      <defs>
        <linearGradient id="dg1" x1="31.2652" y1="63.1324" x2="25.9731" y2="1.66354" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E9D276" /><stop offset="1" stopColor="#A18B2F" />
        </linearGradient>
        <linearGradient id="dg2" x1="41.0615" y1="51.6907" x2="35.9859" y2="2.58582" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9F9FA2" /><stop offset="1" stopColor="#D7D7D7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
      <div style={{ height: 1, width: 32, background: GOLD }} />
      <span style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase' as const, color: GOLD, fontWeight: 600 }}>{children}</span>
      <div style={{ height: 1, width: 32, background: GOLD }} />
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
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

// ─── All In One Click Diagram ─────────────────────────────────────────────────
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

      {tPaths.map((d, i) => (
        <path key={i} d={d} stroke="rgba(161,139,47,0.22)" strokeWidth="1.2" fill="none" strokeDasharray="4 3" />
      ))}
      <path d={outPath} stroke="rgba(161,139,47,0.45)" strokeWidth="2" fill="none" strokeDasharray="4 3" />

      {tokenCYs.map((_, i) => (
        <circle key={i} r="3" fill="url(#aioc2-gold)">
          <animateMotion dur="1.8s" repeatCount="indefinite" begin={`${i * 0.3}s`} calcMode="linear">
            <mpath href={`#aioc2-${i}`} xlinkHref={`#aioc2-${i}`} />
          </animateMotion>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.9;1" dur="1.8s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
        </circle>
      ))}

      {[0, 0.3, 0.6].map((delay, i) => (
        <circle key={i} r="3.5" fill="url(#aioc2-gold)">
          <animateMotion dur="0.9s" repeatCount="indefinite" begin={`${delay}s`} calcMode="linear">
            <mpath href="#aioc2-out" xlinkHref="#aioc2-out" />
          </animateMotion>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur="0.9s" repeatCount="indefinite" begin={`${delay}s`} />
        </circle>
      ))}

      {tokens.map(({ ticker, name, color }, i) => {
        const cy = tokenCYs[i];
        return (
          <g key={ticker}>
            <rect x="0" y={cy - 17} width="136" height="34" rx="17" fill="white" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
            <circle cx="17" cy={cy} r="13" fill={color} />
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
            <text x="38" y={cy - 2} fontSize="12" fontWeight="700" fill="#1A1A1A" fontFamily="system-ui, -apple-system, sans-serif">{ticker}</text>
            <text x="38" y={cy + 12} fontSize="10" fill="#888" fontFamily="system-ui, -apple-system, sans-serif">{name}</text>
          </g>
        );
      })}

      <text x="68" y="248" textAnchor="middle" fontSize="11" fill="#BBBBBB" fontFamily="system-ui, sans-serif">+ more tokens</text>

      <circle cx={PSX} cy={PSY} r={PSR} fill="#FFF9F0" stroke="rgba(161,139,47,0.32)" strokeWidth="1.5" />
      <image href="/pancakeswap-logo.svg" x={PSX - 28} y={PSY - 32} width="56" height="56" />
      <text x={PSX} y={PSY + PSR + 14} textAnchor="middle" fontSize="9" fontWeight="700" fill="#7a5500">PancakeSwap</text>

      <circle cx={UX} cy={UY} r={UR} fill="none" stroke="#A18B2F" strokeWidth="1.5">
        <animate attributeName="r" values={`${UR};${UR + 14}`} dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.28;0" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx={UX} cy={UY} r={UR} fill="url(#aioc2-vault)" />
      <text x={UX} y={UY + 7} textAnchor="middle" fontSize="22" fontWeight="900" fill="#fff" fontFamily="system-ui, -apple-system, sans-serif">U</text>
      <text x={UX} y={UY + UR + 18} textAnchor="middle" fontSize="11" fontWeight="700" fill="#A18B2F" letterSpacing="0.8">All in one click.</text>
    </svg>
  );
}

// ─── Treasury Flow ────────────────────────────────────────────────────────────
function TreasuryFlow() {
  const dL  = 'M 115 110 L 328 110';
  const dCh = 'M 432 110 C 550 110 550 50 644 50';
  const dBk = 'M 432 110 C 550 110 550 170 644 170';

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

        <path d={dL}  stroke="rgba(161,139,47,0.28)" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
        <path d={dCh} stroke="rgba(161,139,47,0.28)" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
        <path d={dBk} stroke="rgba(161,139,47,0.28)" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />

        {[{ r: 4, delay: '0s' }, { r: 3, delay: '0.8s' }, { r: 2.5, delay: '1.6s' }].map(({ r, delay }, i) => (
          <circle key={`l${i}`} r={r} fill="url(#dot-grad)">
            <animateMotion dur="2.4s" repeatCount="indefinite" begin={delay} calcMode="linear">
              <mpath href="#tflow-l" xlinkHref="#tflow-l" />
            </animateMotion>
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.05;0.9;1" dur="2.4s" repeatCount="indefinite" begin={delay} />
          </circle>
        ))}

        {[{ r: 3.5, delay: '0.4s' }, { r: 2.5, delay: '1.2s' }, { r: 3, delay: '2.0s' }].map(({ r, delay }, i) => (
          <circle key={`ch${i}`} r={r} fill="url(#dot-grad)">
            <animateMotion dur="2.4s" repeatCount="indefinite" begin={delay} calcMode="linear">
              <mpath href="#tflow-ch" xlinkHref="#tflow-ch" />
            </animateMotion>
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.05;0.9;1" dur="2.4s" repeatCount="indefinite" begin={delay} />
          </circle>
        ))}

        {[{ r: 3.5, delay: '1.0s' }, { r: 2.5, delay: '1.8s' }].map(({ r, delay }, i) => (
          <circle key={`bk${i}`} r={r} fill="url(#dot-grad)">
            <animateMotion dur="2.4s" repeatCount="indefinite" begin={delay} calcMode="linear">
              <mpath href="#tflow-bk" xlinkHref="#tflow-bk" />
            </animateMotion>
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.05;0.9;1" dur="2.4s" repeatCount="indefinite" begin={delay} />
          </circle>
        ))}

        <rect x="55" y="80" width="60" height="60" rx="16" fill="#fff" stroke="rgba(161,139,47,0.25)" strokeWidth="1.5" />
        <rect x="68" y="93" width="34" height="24" rx="4" fill="none" stroke="#A18B2F" strokeWidth="1.5" />
        <line x1="68" y1="102" x2="102" y2="102" stroke="#A18B2F" strokeWidth="1.2" />
        <rect x="84" y="105" width="10" height="7" rx="2.5" fill="rgba(161,139,47,0.18)" stroke="#A18B2F" strokeWidth="1.2" />
        <text x="85" y="156" textAnchor="middle" fontSize="11" fontWeight="600" fill="#1A1A1A">Your Wallet</text>
        <text x="85" y="170" textAnchor="middle" fontSize="10" fill="#6B6B6B">BSC · $U</text>

        <circle cx="380" cy="110" r="52" fill="none" stroke="#A18B2F" strokeWidth="1.5">
          <animate attributeName="r" values="52;68" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <circle cx="380" cy="110" r="52" fill="url(#vault-grad)" />
        <text x="380" y="121" textAnchor="middle" fontSize="30" fontWeight="900" fill="#fff" fontFamily="system-ui, sans-serif">U</text>
        <text x="380" y="177" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1A1A1A">Treasury</text>
        <text x="380" y="192" textAnchor="middle" fontSize="10" fill="#6B6B6B" fontFamily="monospace">0x7B72…E85B</text>

        <rect x="644" y="24" width="52" height="52" rx="14" fill="#fff" stroke="rgba(161,139,47,0.28)" strokeWidth="1.5" />
        <path d="M 670 58 C 668 55 659 50 659 44 C 659 40.5 661.8 38 665 38 C 667.2 38 669.2 39.5 670 41 C 670.8 39.5 672.8 38 675 38 C 678.2 38 681 40.5 681 44 C 681 50 672 55 670 58Z" fill="rgba(161,139,47,0.18)" stroke="#A18B2F" strokeWidth="1.5" strokeLinejoin="round" />
        <text x="670" y="91" textAnchor="middle" fontSize="11" fontWeight="600" fill="#1A1A1A">Charity Donation</text>
        <text x="670" y="105" textAnchor="middle" fontSize="10" fill="#6B6B6B">100% · On-chain</text>

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

// ─── FAQ items ────────────────────────────────────────────────────────────────
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
    a: `User connects their BSC wallet and sends ${BOOK_USD} $U to the Treasury address. Once confirmed on-chain, 100% of the $U is donated to charity. We purchase the book and ship it to the user's door within 1-3 days. The tx hash is used to track order status.`,
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
    q: 'What are the risks?',
    a: 'Exchange rate: $U is pegged at $1, GBP/USD float is absorbed by locking price at checkout. Fulfilment: communicated upfront as 1-3 business days. Privacy: shipping addresses stored in Supabase, basic privacy policy required.',
  },
];

// ─── Details Page ─────────────────────────────────────────────────────────────
export default function DetailsPage() {
  const [qaOpen, setQaOpen] = useState(false);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>

      <div style={{ background: BG, minHeight: '100vh', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: TEXT }}>

        {/* NAV */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 100, padding: '16px 24px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(250,250,248,0.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 50, padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 20, maxWidth: 720, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              <ULogo size={22} />
              <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>United Stables</span>
            </div>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <a href="/freedomofmoney" style={{ fontSize: 12, color: MUTED, textDecoration: 'none' }}>← Campaign</a>
              <span style={{ fontSize: 12, color: GOLD, fontWeight: 600 }}>Campaign Details</span>
              <a href="/freedomofmoney/purchase" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, color: '#fff', borderRadius: 50, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                Order →
              </a>
            </div>
          </div>
        </nav>

        {/* HEADER */}
        <div style={{ textAlign: 'center', padding: '60px 24px 40px' }}>
          <div style={{ fontSize: 11, color: GOLD, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>Campaign Details</div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: -1, margin: '0 0 12px' }}>Freedom of Money × $U</h1>
          <p style={{ fontSize: 14, color: MUTED, maxWidth: 480, margin: '0 auto' }}>Full campaign background, technical architecture, fund flows, and Q&A.</p>
        </div>

        {/* WHY THIS CAMPAIGN */}
        <section style={{ padding: '40px 24px 80px', maxWidth: 960, margin: '0 auto' }}>
          <SectionLabel>Why This Campaign</SectionLabel>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 700, marginBottom: 40, letterSpacing: -1 }}>Three Things. One Moment.</h2>
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

        {/* ANY TOKEN → $U */}
        <section style={{ padding: '0 24px 80px', background: '#fff' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', paddingTop: 80 }}>
            <SectionLabel>Pay with Anything</SectionLabel>
            <h2 style={{ textAlign: 'center', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, marginBottom: 8, letterSpacing: -0.8 }}>Any Token, One Click.</h2>
            <p style={{ textAlign: 'center', color: MUTED, fontSize: 14, marginBottom: 40 }}>PancakeSwap converts your token to $U automatically before payment.</p>
            <AllInOneClickDiagram />
          </div>
        </section>

        {/* FUND FLOWS */}
        <section style={{ padding: '80px 24px', maxWidth: 960, margin: '0 auto' }}>
          <SectionLabel>Fund Flows</SectionLabel>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 700, marginBottom: 12, letterSpacing: -1 }}>Where Your $U Goes</h2>
          <p style={{ textAlign: 'center', color: MUTED, fontSize: 14, marginBottom: 48 }}>You get a physical book shipped to your door. Your $U goes 100% to charity.</p>

          <div style={{ background: '#fff', border: `1px solid ${GOLD_DIM}`, borderRadius: 20, padding: '32px 40px', marginBottom: 32 }}>
            <TreasuryFlow />
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

        {/* TRANSPARENCY TABLES */}
        <section style={{ padding: '0 24px 80px', background: '#fff' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', paddingTop: 80 }}>
            <SectionLabel>Transparency</SectionLabel>
            <h2 style={{ textAlign: 'center', fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 700, marginBottom: 12, letterSpacing: -1 }}>Not Our Word. The Chain's.</h2>
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

        {/* Q&A */}
        <section style={{ padding: '0 24px 80px' }}>
          <div style={{ maxWidth: 700, margin: '0 auto', paddingTop: 80 }}>
            <SectionLabel>Campaign Q&A</SectionLabel>
            <h2 style={{ textAlign: 'center', fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, marginBottom: 40, letterSpacing: -1 }}>Everything You Need to Know</h2>

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
          <div style={{ fontSize: 11, color: MUTED, marginBottom: 10 }}>
            $U Contract: <span style={{ fontFamily: 'monospace', color: GOLD }}>{CONTRACT_SHORT}</span> · PeckShield #2025-157
          </div>
          <div style={{ fontSize: 11, color: '#CCC', display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/freedomofmoney" style={{ color: MUTED, textDecoration: 'none' }}>← Back to campaign</a>
            <a href="https://github.com/Moya-2025-Moya/-U-X-Freedom-of-Money" target="_blank" rel="noreferrer" style={{ color: MUTED, textDecoration: 'none' }}>Open source ↗</a>
          </div>
        </footer>

      </div>
    </>
  );
}
