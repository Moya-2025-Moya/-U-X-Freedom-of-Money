'use client';

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

// ─── Treasury Bag — animated money bag showing charity fund ──────────────────
function TreasuryBag({ balance = '0' }: { balance?: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <style>{`
        @keyframes bagFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes coinDrop {
          0% { opacity: 0; transform: translateY(-30px); }
          30% { opacity: 1; }
          80% { opacity: 0.6; transform: translateY(10px); }
          100% { opacity: 0; transform: translateY(30px); }
        }
      `}</style>

      <div style={{ position: 'relative', display: 'inline-block' }}>
        {/* Floating animated coins dropping into bag */}
        {[
          { left: 52, delay: '0s',   dur: '2.4s' },
          { left: 62, delay: '0.8s', dur: '2.1s' },
          { left: 44, delay: '1.5s', dur: '2.7s' },
        ].map(({ left, delay, dur }, i) => (
          <div key={i} style={{
            position: 'absolute', top: 0, left: left,
            width: 14, height: 14, borderRadius: '50%',
            background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`,
            animation: `coinDrop ${dur} ${delay} ease-in infinite`,
            zIndex: 10,
            boxShadow: `0 2px 4px rgba(161,139,47,0.4)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 7, fontWeight: 900, color: '#fff',
          }}>U</div>
        ))}

        {/* Bag SVG */}
        <div style={{ animation: 'bagFloat 4s ease-in-out infinite' }}>
          <svg width="160" height="180" viewBox="0 0 120 156" style={{ display: 'block' }}>
            <defs>
              <radialGradient id="tbag-body" cx="32%" cy="28%" r="65%">
                <stop offset="0%" stopColor="#EDD97A" />
                <stop offset="55%" stopColor="#C09A2E" />
                <stop offset="100%" stopColor="#8a6818" />
              </radialGradient>
              <radialGradient id="tbag-knot" cx="38%" cy="32%" r="58%">
                <stop offset="0%" stopColor="#D4AF44" />
                <stop offset="100%" stopColor="#7a5810" />
              </radialGradient>
              <radialGradient id="tbag-shine" cx="30%" cy="26%" r="42%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.38)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
              <radialGradient id="tbag-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(233,210,118,0.3)" />
                <stop offset="100%" stopColor="rgba(233,210,118,0)" />
              </radialGradient>
            </defs>

            {/* Outer glow pulse ring */}
            <ellipse cx="60" cy="106" rx="56" ry="52" fill="url(#tbag-glow)">
              <animate attributeName="rx" values="56;70;56" dur="3s" repeatCount="indefinite" />
              <animate attributeName="ry" values="52;65;52" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0;1" dur="3s" repeatCount="indefinite" />
            </ellipse>

            {/* Knot at very top */}
            <circle cx="60" cy="17" r="12" fill="url(#tbag-knot)" />
            <ellipse cx="60" cy="24" rx="8" ry="5" fill="url(#tbag-knot)" opacity="0.7" />

            {/* Neck / stem narrowing downward */}
            <path d="M 50 44 Q 50 26 60 22 Q 70 26 70 44 Z" fill="url(#tbag-body)" />

            {/* Bag body — main large ellipse */}
            <ellipse cx="60" cy="104" rx="54" ry="50" fill="url(#tbag-body)" />

            {/* Shine highlight */}
            <ellipse cx="60" cy="104" rx="54" ry="50" fill="url(#tbag-shine)" />

            {/* Subtle shadow line at neck-body join */}
            <ellipse cx="60" cy="54" rx="20" ry="5" fill="rgba(0,0,0,0.12)" />

            {/* $U emblem circle on bag */}
            <circle cx="60" cy="104" r="28" fill="rgba(255,255,255,0.12)" />
            <text x="60" y="114" textAnchor="middle" fontSize="30" fontWeight="900" fill="rgba(255,255,255,0.90)" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="-1">U</text>
          </svg>
        </div>
      </div>

      {/* Balance */}
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 56, fontWeight: 900, color: GOLD, letterSpacing: -2, lineHeight: 1 }}>{balance}</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: GOLD, marginBottom: 6 }}>$U</div>
        <div style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>collected for charity</div>
        <a
          href="https://bscscan.com/address/0x7B72496CC89D82A31f1513D8F01973db70c3E85B"
          target="_blank" rel="noreferrer"
          style={{ fontSize: 11, color: MUTED, textDecoration: 'none', borderBottom: `1px solid ${GOLD_DIM}`, paddingBottom: 1 }}
        >
          Verify on BscScan ↗
        </a>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FreedomOfMoneyPage() {
  return (
    <>
      <style>{`* { box-sizing: border-box; } body { margin: 0; }`}</style>

      <div style={{ background: BG, minHeight: '100vh', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: TEXT }}>

        {/* NAV — logo only, links in footer */}
        <nav style={{ padding: '14px 32px', display: 'flex', alignItems: 'center' }}>
          <a href="https://ustables.tech" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <ULogo size={22} />
            <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>United Stables</span>
          </a>
        </nav>

        {/* HERO — book + info side by side */}
        <section style={{ padding: '32px 32px 40px', maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 48, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>

            {/* Book cover */}
            <div style={{ flexShrink: 0 }}>
              <BookCover scale={1.15} />
            </div>

            {/* Right: title + price + stats + CTAs */}
            <div style={{ flex: '1 1 300px', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 18, paddingTop: 8 }}>

              {/* Live badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 50, border: `1px solid ${GOLD_DIM}`, background: 'rgba(233,210,118,0.08)', alignSelf: 'flex-start' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: GOLD, display: 'inline-block' }} />
                <span style={{ fontSize: 10, color: GOLD, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' as const }}>Live · April 2026</span>
              </div>

              {/* Title — single line */}
              <div>
                <h1 style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 8px', letterSpacing: -1.5 }}>
                  Freedom of Money{' '}
                  <span style={{ WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text', backgroundClip: 'text', backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>× $U</span>
                </h1>
                <p style={{ fontSize: 13, color: MUTED, margin: 0, lineHeight: 1.7 }}>
                  CZ's memoir · All proceeds to charity · Verifiable on-chain
                </p>
              </div>

              {/* Price */}
              <div style={{ background: '#fff', border: `1px solid ${GOLD_DIM}`, borderRadius: 12, padding: '12px 18px', display: 'inline-flex', alignItems: 'baseline', gap: 8, alignSelf: 'flex-start' }}>
                <span style={{ fontSize: 10, color: MUTED, letterSpacing: 1, textTransform: 'uppercase' as const }}>Price</span>
                <span style={{ fontSize: 28, fontWeight: 900, color: TEXT, letterSpacing: -1 }}>{BOOK_USD}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: GOLD }}>$U</span>
                <span style={{ fontSize: 12, color: MUTED }}>≈ £{BOOK_GBP}</span>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { label: 'Books Ordered', value: '0', gold: true },
                  { label: 'On-chain Txs', value: '0', gold: false },
                ].map(({ label, value, gold }, i) => (
                  <div key={i} style={{ background: '#fff', border: `1.5px solid ${gold ? GOLD : GOLD_DIM}`, borderRadius: 12, padding: '12px 18px', flex: 1 }}>
                    <div style={{ fontSize: 9, color: MUTED, letterSpacing: 1.2, textTransform: 'uppercase' as const, marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 30, fontWeight: 900, color: gold ? GOLD : TEXT, letterSpacing: -1, lineHeight: 1 }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a href="/freedomofmoney/purchase" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, color: '#fff', borderRadius: 50, fontSize: 14, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 16px rgba(161,139,47,0.35)' }}>
                  Order Your Copy →
                </a>
                <a href="/freedomofmoney/track" style={{ display: 'inline-flex', alignItems: 'center', padding: '12px 22px', background: TEXT, color: '#fff', borderRadius: 50, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                  Track Order
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* TREASURY BAG — centerpiece visual */}
        <section style={{ background: '#fff', borderTop: `1px solid ${GOLD_DIM}`, borderBottom: `1px solid ${GOLD_DIM}` }}>
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <TreasuryBag balance="0" />
          </div>
        </section>

        {/* PURCHASE LOG */}
        <section style={{ padding: '40px 32px 56px', maxWidth: 960, margin: '0 auto' }}>
          <div style={{ border: `1px solid ${GOLD_DIM}`, borderRadius: 16, overflow: 'hidden', background: '#fff' }}>
            <div style={{ padding: '14px 20px', background: '#F7F5F0', borderBottom: `1px solid ${GOLD_DIM}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Purchase Log</span>
              <a href="https://bscscan.com/address/0x7B72496CC89D82A31f1513D8F01973db70c3E85B" target="_blank" rel="noreferrer" style={{ fontSize: 11, color: MUTED, textDecoration: 'none' }}>View on BscScan ↗</a>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${GOLD_DIM}` }}>
                    {['Buyer', 'Amount', 'Date'].map((c) => (
                      <th key={c} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 10, color: MUTED, letterSpacing: 1, textTransform: 'uppercase' as const, fontWeight: 600 }}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={4} style={{ padding: '40px 20px', textAlign: 'center', color: MUTED, fontSize: 13 }}>
                      No orders yet — be the first.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: `1px solid ${GOLD_DIM}`, padding: '32px 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>

            {/* Logo */}
            <a href="https://ustables.tech" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <ULogo size={18} />
              <span style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>United Stables</span>
            </a>

            {/* Links row */}
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                { label: 'Campaign Details & FAQ', href: '/freedomofmoney/details', external: true },
                { label: 'Track Your Order', href: '/freedomofmoney/track', external: false },
                { label: 'GitHub', href: 'https://github.com/Moya-2025-Moya/-U-X-Freedom-of-Money', external: true },
                { label: 'u.tech', href: 'https://ustables.tech', external: true },
              ].map(({ label, href, external }) => (
                <a key={label} href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})} style={{ fontSize: 12, color: MUTED, textDecoration: 'none' }}>
                  {label}{external ? ' ↗' : ''}
                </a>
              ))}
            </div>

            {/* Contract */}
            <div style={{ fontSize: 10, color: '#BBB', textAlign: 'center' }}>
              $U: <span style={{ fontFamily: 'monospace', color: MUTED }}>{CONTRACT_SHORT}</span> · PeckShield #2025-157
            </div>

          </div>
        </footer>

      </div>
    </>
  );
}
