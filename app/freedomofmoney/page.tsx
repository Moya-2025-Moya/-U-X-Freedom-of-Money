'use client';

import type { ReactNode } from 'react';

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

// ─── Book Cover ───────────────────────────────────────────────────────────────
function BookCover({ scale = 1 }: { scale?: number }) {
  const w = Math.round(180 * scale);
  const h = Math.round(270 * scale);
  const p = (n: number) => Math.round(n * scale);
  return (
    <div style={{
      width: w, height: h, flexShrink: 0,
      borderRadius: 6, overflow: 'hidden', background: '#D5D5D3',
      boxShadow: `${p(8)}px ${p(14)}px ${p(36)}px rgba(0,0,0,0.28), -2px 0 0 rgba(0,0,0,0.08)`,
      border: '1px solid rgba(0,0,0,0.08)',
    }}>
      <img src="/book-cover.png" alt="Freedom of Money by Changpeng Zhao" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
    </div>
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

// ─── Giving Icon — heart with upward arrow (charitable giving) ────────────────
function GivingIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill={GOLD} opacity="0.85" />
      <path d="M12 10 L12 15.5 M9.5 12.5 L12 10 L14.5 12.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Impact Visual — "One Payment. Two Good Things." ─────────────────────────
function ImpactVisual() {
  return (
    <div style={{ background: '#fff', border: `1px solid ${GOLD_DIM}`, borderRadius: 20, padding: '36px 40px', maxWidth: 760, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>

        {/* You pay */}
        <div style={{ textAlign: 'center', minWidth: 96 }}>
          <div style={{ width: 54, height: 54, borderRadius: 16, background: `rgba(161,139,47,0.08)`, border: `1.5px solid ${GOLD_DIM}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
            <CardIcon size={22} />
          </div>
          <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1.5, textTransform: 'uppercase' as const, marginBottom: 3 }}>You pay</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: TEXT, lineHeight: 1 }}>{BOOK_USD}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: GOLD }}>$U</div>
        </div>

        {/* Flow arrow → */}
        <svg width={36} height={12} viewBox="0 0 36 12">
          <line x1="0" y1="6" x2="26" y2="6" stroke={GOLD} strokeWidth="1.5" strokeDasharray="3 2" />
          <path d="M22 2 L30 6 L22 10" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* Treasury sphere */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 10px' }}>
            <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: `1.5px solid rgba(161,139,47,0.22)`, animation: 'pulseRing 2.4s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 24px rgba(161,139,47,0.32)' }}>
              <span style={{ fontSize: 26, fontWeight: 900, color: '#fff', fontFamily: 'system-ui, sans-serif' }}>U</span>
            </div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: TEXT }}>Treasury</div>
          <div style={{ fontSize: 10, color: MUTED, fontFamily: 'monospace' }}>0x7B72…E85B</div>
        </div>

        {/* Split arrow → two outputs */}
        <svg width={48} height={68} viewBox="0 0 48 68">
          <path d="M 0 34 L 14 34 L 32 14" fill="none" stroke={GOLD} strokeWidth="1.5" strokeDasharray="3 2" strokeLinecap="round" />
          <path d="M 14 34 L 32 54" fill="none" stroke={GOLD} strokeWidth="1.5" strokeDasharray="3 2" strokeLinecap="round" />
          <path d="M 26 9 L 34 14 L 29 21" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 26 59 L 34 54 L 29 47" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* Two outcomes */}
        <div style={{ minWidth: 160, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Book */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: `rgba(161,139,47,0.08)`, border: `1px solid ${GOLD_DIM}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <BookIcon size={17} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, lineHeight: 1.3 }}>Book ships to door</div>
              <div style={{ fontSize: 11, color: MUTED }}>1-3 business days</div>
            </div>
          </div>

          <div style={{ height: 1, background: GOLD_DIM, marginLeft: 48 }} />

          {/* Charity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: `rgba(161,139,47,0.08)`, border: `1px solid ${GOLD_DIM}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <GivingIcon size={20} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, lineHeight: 1.3 }}>Funds charity</div>
              <div style={{ fontSize: 11, color: MUTED }}>100% · Recorded on-chain</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FreedomOfMoneyPage() {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseRing {
          0%, 100% { transform: scale(1); opacity: 1; }
          60% { transform: scale(1.18); opacity: 0; }
        }
        .fade-up { animation: fadeUp 0.7s ease forwards; }
        .fade-up-1 { animation-delay: 0.1s; opacity: 0; }
        .fade-up-2 { animation-delay: 0.25s; opacity: 0; }
        .fade-up-3 { animation-delay: 0.4s; opacity: 0; }
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
              <span style={{ fontSize: 12, color: GOLD, fontWeight: 600 }}>Freedom of Money</span>
              <a href="https://u.tech" target="_blank" rel="noreferrer" style={{ fontSize: 12, color: MUTED, textDecoration: 'none' }}>u.tech ↗</a>
              <a href="https://github.com/Moya-2025-Moya/-U-X-Freedom-of-Money" target="_blank" rel="noreferrer" style={{ fontSize: 12, color: MUTED, textDecoration: 'none' }}>GitHub ↗</a>
              <a href="/freedomofmoney/details" target="_blank" rel="noreferrer" style={{ fontSize: 12, color: MUTED, textDecoration: 'none' }}>Details ↗</a>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ position: 'relative', padding: '80px 24px 80px', textAlign: 'center', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
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

          <div className="fade-up fade-up-2" style={{ display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 56, flexWrap: 'wrap' }}>
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
            <a href="/freedomofmoney/track" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', background: TEXT, color: '#fff', borderRadius: 50, fontSize: 14, fontWeight: 600, textDecoration: 'none', letterSpacing: 0.3 }}>
              Track Order
            </a>
          </div>
        </section>

        {/* LIVE STATS — the core */}
        <section style={{ padding: '0 24px 72px', maxWidth: 900, margin: '0 auto' }}>
          <SectionLabel>Live</SectionLabel>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 700, marginBottom: 40, letterSpacing: -1 }}>How We're Doing</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
            {[
              { label: 'Books Ordered', value: '0', unit: '', note: 'Orders open · Be the first', highlight: true },
              { label: 'Treasury Balance', value: '0', unit: '$U', note: '0x7B72…E85B', highlight: false },
              { label: 'On-chain Txs', value: '0', unit: '', note: 'BscScan verified', highlight: false },
            ].map(({ label, value, unit, note, highlight }, i) => (
              <div key={i} style={{ background: '#fff', border: `1.5px solid ${highlight ? GOLD : GOLD_DIM}`, borderRadius: 16, padding: '24px 28px' }}>
                <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1.5, textTransform: 'uppercase' as const, marginBottom: 12 }}>{label}</div>
                <div style={{ fontSize: 40, fontWeight: 900, color: highlight ? GOLD : TEXT, letterSpacing: -2, lineHeight: 1 }}>
                  {value}
                  {unit && <span style={{ fontSize: 18, fontWeight: 600, color: GOLD, letterSpacing: 0, marginLeft: 4 }}>{unit}</span>}
                </div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 10 }}>{note}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <a href="https://bscscan.com/address/0x7B72496CC89D82A31f1513D8F01973db70c3E85B" target="_blank" rel="noreferrer" style={{ fontSize: 11, color: MUTED, textDecoration: 'none', borderBottom: `1px solid ${GOLD_DIM}`, paddingBottom: 2 }}>
              View treasury live on BscScan ↗
            </a>
          </div>
        </section>

        {/* IMPACT VISUAL */}
        <section style={{ padding: '0 24px 80px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <SectionLabel>Where your $U goes</SectionLabel>
            <h2 style={{ textAlign: 'center', fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 700, marginBottom: 10, letterSpacing: -0.8 }}>One Payment. Two Good Things.</h2>
            <p style={{ textAlign: 'center', color: MUTED, fontSize: 14, marginBottom: 40, maxWidth: 460, margin: '0 auto 40px' }}>Your $U buys a physical book shipped to your door — and goes entirely to charity, visible on-chain.</p>
            <ImpactVisual />
          </div>
        </section>

        {/* HOW TO ORDER */}
        <section style={{ background: '#fff', padding: '80px 24px' }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <SectionLabel>How to order</SectionLabel>
            <h2 style={{ textAlign: 'center', fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 700, marginBottom: 48, letterSpacing: -0.8 }}>Three Steps</h2>
            <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 18, left: 'calc(16.66% + 18px)', right: 'calc(16.66% + 18px)', height: 1, background: GOLD_DIM, zIndex: 0 }} />
              {[
                { n: 1, title: 'Connect Wallet', body: 'Open the purchase page and connect your BNB Chain wallet — MetaMask or any injected wallet.' },
                { n: 2, title: 'Pay with $U', body: `Send ${BOOK_USD} $U. No $U? Swap any token to $U in-page via PancakeSwap — one click.` },
                { n: 3, title: 'Book Ships', body: 'Enter your shipping address. Your copy ships within 1-3 business days via Amazon.' },
              ].map(({ n, title, body }, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center', padding: '0 12px', position: 'relative', zIndex: 1 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 14, fontWeight: 700, color: '#fff', boxShadow: '0 2px 10px rgba(161,139,47,0.3)' }}>{n}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 8 }}>{title}</div>
                  <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.7 }}>{body}</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <a href="/freedomofmoney/purchase" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 40px', background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, color: '#fff', borderRadius: 50, fontSize: 14, fontWeight: 700, textDecoration: 'none', letterSpacing: 0.3, boxShadow: '0 4px 20px rgba(161,139,47,0.35)' }}>
                Order Your Copy →
              </a>
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
            $U Contract (BNB Chain): <span style={{ fontFamily: 'monospace', color: GOLD }}>{CONTRACT_SHORT}</span> · PeckShield #2025-157
          </div>
          <div style={{ fontSize: 11, color: '#CCC', display: 'flex', gap: 20, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <span>United Stables · April 2026</span>
            <a href="/freedomofmoney/details" target="_blank" rel="noreferrer" style={{ color: MUTED, textDecoration: 'none' }}>Campaign details & FAQ ↗</a>
            <a href="https://github.com/Moya-2025-Moya/-U-X-Freedom-of-Money" target="_blank" rel="noreferrer" style={{ color: MUTED, textDecoration: 'none' }}>Open source ↗</a>
          </div>
        </footer>

      </div>
    </>
  );
}
