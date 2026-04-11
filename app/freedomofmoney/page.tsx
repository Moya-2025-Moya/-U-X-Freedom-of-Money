'use client';

// ─── Palette (U brand: cream white + gold) ────────────────────────────────────
const GOLD       = '#A18B2F';
const GOLD_LIGHT = '#E9D276';
const GOLD_MID   = '#C8A83C';
const BG         = '#F7F5F0';
const CARD       = '#FFFFFF';
const BORDER     = 'rgba(161,139,47,0.14)';
const TEXT       = '#1A1A1A';
const MUTED      = '#6B6B6B';
const CONTRACT   = '0xcE24439F2D9C6a2289F741120FE202248B666666';
const TREASURY   = '0x7B72496CC89D82A31f1513D8F01973db70c3E85B';

const CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; background: ${BG}; }
  ::selection { background: rgba(161,139,47,0.18); }

  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes floatY {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-10px); }
  }
  @keyframes floatY2 {
    0%,100% { transform: translateY(0) rotate(-1.5deg); }
    50%      { transform: translateY(-14px) rotate(1.5deg); }
  }
  @keyframes glowPulse {
    0%,100% { opacity: 0.5; transform: scale(1);   }
    50%      { opacity: 1;   transform: scale(1.08); }
  }
  @keyframes glowPulse2 {
    0%,100% { opacity: 0.4; }
    50%      { opacity: 1; }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes ringExpand {
    0%   { transform: scale(0.9); opacity: 0.5; }
    100% { transform: scale(1.55); opacity: 0;  }
  }
  @keyframes scanLine {
    0%   { top: 0%; }
    100% { top: 100%; }
  }
  @keyframes blobDrift {
    0%,100% { transform: translate(0,0) scale(1); }
    33%      { transform: translate(12px,-8px) scale(1.04); }
    66%      { transform: translate(-8px,6px) scale(0.97); }
  }

  .shimmer-gold {
    background: linear-gradient(100deg, ${GOLD} 20%, ${GOLD_LIGHT} 45%, ${GOLD_MID} 55%, ${GOLD} 80%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
  }
  .hover-lift { transition: transform 0.2s, box-shadow 0.2s; }
  .hover-lift:hover { transform: translateY(-2px); }
  .fade-in { animation: fadeInUp 0.7s ease both; }
`;

// ─── U Logo ───────────────────────────────────────────────────────────────────
function ULogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={Math.round(size * 64 / 58)} viewBox="0 0 58 64" fill="none">
      <path d="M37.5659 55.4667C26.4385 55.4667 17.3414 46.08 17.3414 35.1289V1.42222C17.3414 0.64 16.6911 0 15.8963 0H1.44512C0.650304 0 0 0.64 0 1.42222V35.0151C0 50.7591 13.0856 64.0924 29.0758 64C44.6109 63.9076 57.2268 51.7547 57.7759 36.5796C57.234 47.104 48.3899 55.4667 37.5659 55.4667Z" fill="url(#ul-g1)" />
      <path d="M56.3581 0H41.9069C41.1121 0 40.4618 0.64 40.4618 1.42222V35.2356C40.4618 41.3653 35.6784 46.6347 29.4572 46.9191C22.8169 47.2249 17.3398 42.0196 17.3398 35.5556C17.3398 46.5493 26.4007 55.4667 37.5715 55.4667C48.7423 55.4667 57.2324 47.104 57.7743 36.5796C57.7888 36.2382 57.8032 35.8969 57.8032 35.5556V1.42222C57.8032 0.64 57.1529 0 56.3581 0Z" fill="url(#ul-g2)" />
      <defs>
        <linearGradient id="ul-g1" x1="31" y1="63" x2="26" y2="2" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E9D276" /><stop offset="1" stopColor="#A18B2F" />
        </linearGradient>
        <linearGradient id="ul-g2" x1="41" y1="52" x2="36" y2="3" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9F9FA2" /><stop offset="1" stopColor="#D7D7D7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Decorative background blobs (like u.tech corner orbs) ───────────────────
function BgBlobs() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Top-left gold blob */}
      <div style={{
        position: 'absolute', top: -80, left: -80,
        width: 380, height: 380, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(233,210,118,0.28) 0%, transparent 70%)',
        animation: 'blobDrift 9s ease-in-out infinite',
        filter: 'blur(40px)',
      }} />
      {/* Bottom-right gold blob */}
      <div style={{
        position: 'absolute', bottom: -100, right: -60,
        width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(161,139,47,0.18) 0%, transparent 70%)',
        animation: 'blobDrift 11s 2s ease-in-out infinite',
        filter: 'blur(50px)',
      }} />
    </div>
  );
}

// ─── Book cover with glow rings ───────────────────────────────────────────────
function BookCover() {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {[1, 2].map(n => (
        <div key={n} style={{
          position: 'absolute',
          inset: -n * 16,
          borderRadius: 18 + n * 8,
          border: `1px solid rgba(161,139,47,${0.14 - n * 0.04})`,
          animation: `ringExpand ${2.2 + n * 0.8}s ${n * 0.5}s ease-out infinite`,
          pointerEvents: 'none',
        }} />
      ))}
      <div style={{
        position: 'absolute', inset: -32, borderRadius: 48,
        background: 'radial-gradient(ellipse, rgba(161,139,47,0.12) 0%, transparent 70%)',
        animation: 'glowPulse 3.5s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        width: 200, height: 300, borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '8px 16px 48px rgba(0,0,0,0.18), -2px 0 0 rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)',
        animation: 'floatY2 6s ease-in-out infinite',
        position: 'relative',
      }}>
        <img src="/book-cover.png" alt="Freedom of Money by Changpeng Zhao" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
        <div style={{
          position: 'absolute', left: 0, right: 0, height: '28%',
          background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.06), transparent)',
          animation: 'scanLine 4s linear infinite',
          pointerEvents: 'none',
        }} />
      </div>
    </div>
  );
}

// ─── Charity Orb (dark section centerpiece) ───────────────────────────────────
function CharityOrb({ balance = '0' }: { balance?: string }) {
  const coins = [
    { dx: -18, delay: '0s',   dur: '2.2s', r: 11 },
    { dx:  10, delay: '0.8s', dur: '1.9s', r:  8 },
    { dx:  -6, delay: '1.5s', dur: '2.5s', r: 10 },
    { dx:  20, delay: '2.1s', dur: '2.0s', r:  7 },
  ];
  const startY = 34;
  return (
    <div style={{ textAlign: 'center', padding: '64px 24px 52px', position: 'relative' }}>
      <div style={{
        position: 'absolute', left: '50%', top: '42%',
        transform: 'translate(-50%,-50%)',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(233,210,118,0.10) 0%, transparent 68%)',
        animation: 'glowPulse 4s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', display: 'inline-block', animation: 'floatY 5s ease-in-out infinite' }}>
        <svg width="220" height="240" viewBox="0 0 200 220" style={{ display: 'block', overflow: 'visible' }}>
          <defs>
            <radialGradient id="orb-main" cx="33%" cy="28%" r="68%">
              <stop offset="0%"   stopColor="#F7E97C" />
              <stop offset="22%"  stopColor="#E2C040" />
              <stop offset="55%"  stopColor="#B8880C" />
              <stop offset="85%"  stopColor="#7A4E06" />
              <stop offset="100%" stopColor="#4A2C02" />
            </radialGradient>
            <radialGradient id="orb-hi" cx="30%" cy="26%" r="40%">
              <stop offset="0%"   stopColor="rgba(255,252,200,0.50)" />
              <stop offset="60%"  stopColor="rgba(255,240,120,0.08)" />
              <stop offset="100%" stopColor="rgba(255,240,120,0)" />
            </radialGradient>
            <radialGradient id="orb-rim" cx="50%" cy="92%" r="55%">
              <stop offset="0%"   stopColor="rgba(230,180,60,0.25)" />
              <stop offset="100%" stopColor="rgba(230,180,60,0)" />
            </radialGradient>
            <radialGradient id="coin-g" cx="35%" cy="30%" r="60%">
              <stop offset="0%"   stopColor="#F5E87A" />
              <stop offset="100%" stopColor="#9C6E08" />
            </radialGradient>
            <filter id="orb-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="coin-shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.5)" />
            </filter>
          </defs>

          {/* Pulsing outer ring */}
          <circle cx="100" cy="130" r="88" fill="none" stroke="rgba(233,210,118,0.18)" strokeWidth="1">
            <animate attributeName="r" values="88;104;88" dur="3.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="3.2s" repeatCount="indefinite" />
          </circle>

          {/* Orb */}
          <circle cx="100" cy="130" r="78" fill="url(#orb-main)" filter="url(#orb-glow)" />
          <circle cx="100" cy="130" r="78" fill="url(#orb-hi)" />
          <circle cx="100" cy="130" r="78" fill="url(#orb-rim)" />

          {/* Coin slot */}
          <rect x="74" y="56" width="52" height="10" rx="5" fill="rgba(0,0,0,0.45)" />
          <rect x="76" y="57" width="48" height="5" rx="3" fill="rgba(255,200,50,0.12)" />

          {/* U emblem */}
          <text x="100" y="148" textAnchor="middle" fontSize="60" fontWeight="900"
            fill="rgba(255,255,255,0.88)" fontFamily="system-ui,-apple-system,sans-serif"
            letterSpacing="-2">U</text>

          {/* Animated coins */}
          {coins.map((c, i) => (
            <g key={i} filter="url(#coin-shadow)">
              <circle r={c.r} fill="url(#coin-g)" stroke="rgba(255,230,80,0.4)" strokeWidth="0.8">
                <animateTransform attributeName="transform" type="translate"
                  values={`${100+c.dx} ${startY};${100+c.dx} ${startY-54};${100+c.dx} ${startY-54}`}
                  dur={c.dur} begin={c.delay} repeatCount="indefinite"
                  calcMode="spline" keySplines="0.4 0 0.6 1;0 0 1 1" />
                <animate attributeName="opacity" values="0;1;0" dur={c.dur} begin={c.delay} repeatCount="indefinite" />
              </circle>
              <text textAnchor="middle" fontSize={c.r * 0.9} fontWeight="900" fill="rgba(80,40,0,0.9)" fontFamily="system-ui">
                <animateTransform attributeName="transform" type="translate"
                  values={`${100+c.dx} ${startY+c.r*0.36};${100+c.dx} ${startY-54+c.r*0.36};${100+c.dx} ${startY-54+c.r*0.36}`}
                  dur={c.dur} begin={c.delay} repeatCount="indefinite"
                  calcMode="spline" keySplines="0.4 0 0.6 1;0 0 1 1" />
                <animate attributeName="opacity" values="0;1;0" dur={c.dur} begin={c.delay} repeatCount="indefinite" />
                U
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div style={{ marginTop: 8, position: 'relative', zIndex: 2 }}>
        <div className="shimmer-gold" style={{ fontSize: 80, fontWeight: 900, letterSpacing: -4, lineHeight: 1 }}>{balance}</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: GOLD_LIGHT, marginBottom: 6 }}>$U</div>
        <div style={{ fontSize: 11, color: 'rgba(233,210,118,0.5)', letterSpacing: 3, textTransform: 'uppercase' as const, marginBottom: 28, fontWeight: 600 }}>For Charity</div>
        <a
          href={`https://bscscan.com/address/${TREASURY}`}
          target="_blank" rel="noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12, color: 'rgba(233,210,118,0.8)', textDecoration: 'none', fontWeight: 600,
            padding: '10px 24px', borderRadius: 50,
            border: '1px solid rgba(233,210,118,0.2)',
            background: 'rgba(233,210,118,0.06)',
          }}
        >
          Verify on BscScan ↗
        </a>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{
      background: CARD,
      border: `1.5px solid ${accent ? GOLD : BORDER}`,
      borderRadius: 14, padding: '14px 18px', flex: 1,
      boxShadow: accent ? `0 4px 20px rgba(161,139,47,0.12)` : `0 1px 4px rgba(0,0,0,0.04)`,
    }}>
      <div style={{ fontSize: 9, color: MUTED, letterSpacing: 1.8, textTransform: 'uppercase' as const, marginBottom: 5, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 900, color: accent ? GOLD : TEXT, letterSpacing: -1.5, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FreedomOfMoneyPage() {
  return (
    <>
      <style>{CSS}</style>

      <div style={{ background: BG, minHeight: '100vh', fontFamily: 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', color: TEXT }}>

        {/* NAV */}
        <nav style={{
          padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 100,
          background: 'rgba(247,245,240,0.88)', backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${BORDER}`,
        }}>
          <a href="https://u.tech/" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <ULogo size={22} />
            <span style={{ fontSize: 13, fontWeight: 700, color: TEXT, letterSpacing: 0.2 }}>United Stables</span>
          </a>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <a href="/freedomofmoney/track" style={{ padding: '7px 16px', borderRadius: 50, textDecoration: 'none', color: MUTED, fontSize: 12, fontWeight: 600 }}>Track Order</a>
            <a href="/freedomofmoney/purchase" style={{
              padding: '8px 20px', borderRadius: 50, textDecoration: 'none',
              background: TEXT, color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: 0.2,
            }}>Order Now</a>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ position: 'relative', overflow: 'hidden', padding: '80px 32px 100px' }}>
          <BgBlobs />

          <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', gap: 72, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 2 }}>

            {/* Book */}
            <div className="fade-in" style={{ flexShrink: 0, animationDelay: '0.1s' }}>
              <BookCover />
            </div>

            {/* Copy */}
            <div className="fade-in" style={{ flex: '1 1 300px', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 22, animationDelay: '0.2s' }}>

              {/* Live badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '5px 12px', borderRadius: 50, alignSelf: 'flex-start',
                border: `1px solid ${BORDER}`,
                background: 'rgba(161,139,47,0.07)',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD_MID, display: 'inline-block', animation: 'glowPulse2 2s ease-in-out infinite' }} />
                <span style={{ fontSize: 10, color: GOLD, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const }}>Live · April 2026</span>
              </div>

              <div>
                <h1 style={{ fontSize: 'clamp(28px,3.8vw,50px)', fontWeight: 900, lineHeight: 1.05, margin: '0 0 4px', letterSpacing: -2, color: TEXT }}>
                  Freedom of Money
                </h1>
                <h1 style={{ fontSize: 'clamp(28px,3.8vw,50px)', fontWeight: 900, lineHeight: 1.05, margin: '0 0 14px', letterSpacing: -2 }}>
                  <span className="shimmer-gold">× United Stables</span>
                </h1>
                <p style={{ fontSize: 14, color: MUTED, margin: 0, lineHeight: 1.8 }}>
                  CZ&apos;s memoir, shipped worldwide.<br />
                  Pay with <strong style={{ color: GOLD }}>$U</strong> · 100% of proceeds to charity · Verified on-chain.
                </p>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: 10 }}>
                <StatCard label="Books Ordered" value="0" accent />
                <StatCard label="On-chain Txns" value="0" />
              </div>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a href="/freedomofmoney/purchase" className="hover-lift" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '13px 28px', borderRadius: 50, textDecoration: 'none',
                  background: TEXT, color: '#fff', fontSize: 14, fontWeight: 700,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
                  letterSpacing: 0.2,
                }}>
                  Order Your Copy
                  <svg width={15} height={15} viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
                </a>
                <a href="/freedomofmoney/track" className="hover-lift" style={{
                  display: 'inline-flex', alignItems: 'center', padding: '13px 22px', borderRadius: 50, textDecoration: 'none',
                  border: `1.5px solid ${BORDER}`, color: MUTED, fontSize: 13, fontWeight: 600,
                  background: CARD,
                }}>
                  Track Order
                </a>
              </div>

            </div>
          </div>
        </section>

        {/* DIVIDER */}
        <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${BORDER}, transparent)` }} />

        {/* CHARITY ORB — dark accent section */}
        <section style={{
          background: '#0F0F0A',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Subtle corner accents */}
          <div style={{ position: 'absolute', top: 24, left: 24, width: 48, height: 48, borderTop: '1px solid rgba(233,210,118,0.12)', borderLeft: '1px solid rgba(233,210,118,0.12)' }} />
          <div style={{ position: 'absolute', top: 24, right: 24, width: 48, height: 48, borderTop: '1px solid rgba(233,210,118,0.12)', borderRight: '1px solid rgba(233,210,118,0.12)' }} />
          <div style={{ position: 'absolute', bottom: 24, left: 24, width: 48, height: 48, borderBottom: '1px solid rgba(233,210,118,0.12)', borderLeft: '1px solid rgba(233,210,118,0.12)' }} />
          <div style={{ position: 'absolute', bottom: 24, right: 24, width: 48, height: 48, borderBottom: '1px solid rgba(233,210,118,0.12)', borderRight: '1px solid rgba(233,210,118,0.12)' }} />

          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <CharityOrb balance="0" />
          </div>
        </section>

        {/* DIVIDER */}
        <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${BORDER}, transparent)` }} />

        {/* PURCHASE LOG */}
        <section style={{ padding: '60px 32px 88px', maxWidth: 960, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontSize: 10, color: GOLD, letterSpacing: 3, textTransform: 'uppercase' as const, fontWeight: 700, marginBottom: 10 }}>Transparency</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: -1, color: TEXT }}>Purchase Log</h2>
            <p style={{ fontSize: 13, color: MUTED, marginTop: 8 }}>Every order is verifiable on BNB Chain</p>
          </div>

          <div style={{
            border: `1px solid ${BORDER}`,
            borderRadius: 20, overflow: 'hidden',
            background: CARD,
            boxShadow: '0 2px 24px rgba(0,0,0,0.06)',
          }}>
            <div style={{ padding: '14px 24px', background: 'rgba(161,139,47,0.04)', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: GOLD_MID, animation: 'glowPulse2 2.5s ease-in-out infinite' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>Live Orders</span>
              </div>
              <a href={`https://bscscan.com/address/${TREASURY}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: MUTED, textDecoration: 'none', fontWeight: 600 }}>View on BscScan ↗</a>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                    {['Buyer', 'Amount', 'Date'].map(c => (
                      <th key={c} style={{ padding: '12px 24px', textAlign: 'left', fontSize: 9, color: MUTED, letterSpacing: 1.8, textTransform: 'uppercase' as const, fontWeight: 700 }}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={3} style={{ padding: '64px 24px', textAlign: 'center' }}>
                      <div style={{ fontSize: 36, marginBottom: 10 }}>📦</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginBottom: 5 }}>No orders yet</div>
                      <div style={{ fontSize: 13, color: MUTED }}>Be the first to own a piece of history.</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: `1px solid ${BORDER}`, padding: '40px 24px', background: CARD }}>
          <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>

            <a href="https://u.tech/" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <ULogo size={20} />
              <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>United Stables</span>
            </a>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                { label: 'Campaign FAQ', href: '/freedomofmoney/details', ext: false },
                { label: 'Track Order',  href: '/freedomofmoney/track',   ext: false },
                { label: 'GitHub',       href: 'https://github.com/Moya-2025-Moya/-U-X-Freedom-of-Money', ext: true },
                { label: 'u.tech',       href: 'https://u.tech/', ext: true },
              ].map(({ label, href, ext }) => (
                <a key={label} href={href} {...(ext ? { target: '_blank', rel: 'noreferrer' } : {})}
                  style={{ fontSize: 12, color: MUTED, textDecoration: 'none', padding: '6px 14px', borderRadius: 50, border: `1px solid ${BORDER}` }}>
                  {label}{ext ? ' ↗' : ''}
                </a>
              ))}
            </div>

            <div style={{ fontSize: 10, color: '#AAA', textAlign: 'center', lineHeight: 1.8, maxWidth: 560 }}>
              <span style={{ fontFamily: 'monospace' }}>{CONTRACT.slice(0, 18)}...{CONTRACT.slice(-6)}</span>
              {' · '}PeckShield #2025-157
            </div>
            <div style={{ fontSize: 10, color: '#AAA', textAlign: 'center', maxWidth: 520, lineHeight: 1.7 }}>
              Shipping availability varies by region. Orders to certain restricted destinations cannot be fulfilled. Details shown at checkout.
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
