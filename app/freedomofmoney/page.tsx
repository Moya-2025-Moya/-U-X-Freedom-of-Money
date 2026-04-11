'use client';

// ─── Palette ──────────────────────────────────────────────────────────────────
const GOLD        = '#E9D276';
const GOLD_DEEP   = '#A18B2F';
const GOLD_MID    = '#C8A83C';
const DARK_BG     = '#0B0B08';
const DARK_CARD   = '#131310';
const DARK_BORDER = 'rgba(233,210,118,0.14)';
const TEXT        = '#F0EDE4';
const MUTED       = '#7A7A6E';
const CONTRACT    = '0xcE24439F2D9C6a2289F741120FE202248B666666';
const TREASURY    = '0x7B72496CC89D82A31f1513D8F01973db70c3E85B';

const CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; background: ${DARK_BG}; }
  ::selection { background: rgba(233,210,118,0.28); }

  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes floatY {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-12px); }
  }
  @keyframes floatY2 {
    0%,100% { transform: translateY(0) rotate(-2deg); }
    50%      { transform: translateY(-16px) rotate(2deg); }
  }
  @keyframes glowPulse {
    0%,100% { opacity: 0.5; transform: scale(1);   }
    50%      { opacity: 1;   transform: scale(1.08); }
  }
  @keyframes glowPulse2 {
    0%,100% { opacity: 0.3; }
    50%      { opacity: 0.7; }
  }
  @keyframes borderGlow {
    0%,100% { box-shadow: 0 0 0 0 rgba(233,210,118,0); }
    50%      { box-shadow: 0 0 24px 4px rgba(233,210,118,0.22); }
  }
  @keyframes coinDrop {
    0%   { opacity: 0; transform: translateY(-32px) scale(0.7); }
    20%  { opacity: 1; transform: translateY(0)     scale(1);   }
    70%  { opacity: 0.7; }
    100% { opacity: 0; transform: translateY(48px) scale(0.8); }
  }
  @keyframes bagFloat {
    0%,100% { transform: translateY(0) rotate(-1deg); }
    50%      { transform: translateY(-14px) rotate(1deg); }
  }
  @keyframes particleFloat {
    0%   { transform: translateY(0)   opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 0.6; }
    100% { transform: translateY(-120px); opacity: 0; }
  }
  @keyframes twinkle {
    0%,100% { opacity: 0.2; transform: scale(0.8); }
    50%      { opacity: 1;   transform: scale(1.4); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes ringExpand {
    0%   { transform: scale(0.9); opacity: 0.6; }
    100% { transform: scale(1.6); opacity: 0;   }
  }
  @keyframes scanLine {
    0%   { top: 0%; }
    100% { top: 100%; }
  }

  .shimmer-text {
    background: linear-gradient(100deg, ${GOLD_DEEP} 20%, ${GOLD} 40%, #fff 50%, ${GOLD} 60%, ${GOLD_DEEP} 80%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3.5s linear infinite;
  }
  .hover-lift { transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; }
  .hover-lift:hover { transform: translateY(-3px); }
  .fade-in { animation: fadeInUp 0.8s ease both; }
`;

// ─── Floating stars background ────────────────────────────────────────────────
function StarField() {
  const stars = [
    { x:8,  y:12, d:'2.1s', dl:'0s',   s:3 },
    { x:22, y:34, d:'3.0s', dl:'0.4s', s:2 },
    { x:45, y:8,  d:'2.7s', dl:'0.9s', s:4 },
    { x:62, y:55, d:'3.4s', dl:'0.2s', s:2 },
    { x:78, y:20, d:'2.4s', dl:'1.1s', s:3 },
    { x:88, y:72, d:'2.9s', dl:'0.6s', s:2 },
    { x:15, y:80, d:'3.1s', dl:'1.5s', s:3 },
    { x:55, y:88, d:'2.6s', dl:'0.3s', s:2 },
    { x:92, y:45, d:'3.3s', dl:'0.8s', s:3 },
    { x:33, y:65, d:'2.8s', dl:'1.3s', s:2 },
    { x:70, y:90, d:'3.5s', dl:'0.1s', s:3 },
    { x:5,  y:50, d:'2.5s', dl:'1.8s', s:2 },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {stars.map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${s.x}%`, top: `${s.y}%`,
          width: s.s, height: s.s,
          borderRadius: '50%',
          background: GOLD,
          animation: `twinkle ${s.d} ${s.dl} ease-in-out infinite`,
          boxShadow: `0 0 ${s.s * 3}px ${GOLD}`,
        }} />
      ))}
    </div>
  );
}

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

// ─── Book cover with glow ─────────────────────────────────────────────────────
function BookCover() {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Outer glow rings */}
      {[1, 2, 3].map(n => (
        <div key={n} style={{
          position: 'absolute',
          inset: -n * 18,
          borderRadius: 18 + n * 10,
          border: `1px solid rgba(233,210,118,${0.18 - n * 0.04})`,
          animation: `ringExpand ${2 + n * 0.7}s ${n * 0.4}s ease-out infinite`,
          pointerEvents: 'none',
        }} />
      ))}
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', inset: -40, borderRadius: 60,
        background: `radial-gradient(ellipse, rgba(233,210,118,0.2) 0%, transparent 70%)`,
        animation: 'glowPulse 3s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      {/* Book */}
      <div style={{
        width: 210, height: 315, borderRadius: 8,
        overflow: 'hidden',
        boxShadow: `12px 20px 60px rgba(0,0,0,0.7), -3px 0 0 rgba(0,0,0,0.3), 0 0 40px rgba(233,210,118,0.15)`,
        border: '1px solid rgba(255,255,255,0.06)',
        animation: 'floatY2 6s ease-in-out infinite',
        position: 'relative',
      }}>
        <img src="/book-cover.png" alt="Freedom of Money by Changpeng Zhao" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
        {/* Scan-line sheen effect */}
        <div style={{
          position: 'absolute', left: 0, right: 0, height: '30%',
          background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.04), transparent)',
          animation: 'scanLine 4s linear infinite',
          pointerEvents: 'none',
        }} />
      </div>
    </div>
  );
}

// ─── Treasury Bag ─────────────────────────────────────────────────────────────
function TreasuryBag({ balance = '0' }: { balance?: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 24px', position: 'relative' }}>
      {/* Big ambient glow behind bag */}
      <div style={{
        position: 'absolute', left: '50%', top: '40%',
        transform: 'translate(-50%,-50%)',
        width: 360, height: 360,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(233,210,118,0.12) 0%, transparent 70%)`,
        animation: 'glowPulse 4s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', display: 'inline-block' }}>
        {/* Falling $U coins */}
        {[
          { left: 56, delay: '0s',   dur: '2.4s', size: 16 },
          { left: 68, delay: '0.7s', dur: '2.1s', size: 14 },
          { left: 44, delay: '1.4s', dur: '2.7s', size: 18 },
          { left: 74, delay: '2.0s', dur: '2.3s', size: 13 },
        ].map(({ left, delay, dur, size }, i) => (
          <div key={i} style={{
            position: 'absolute', top: 0, left: left,
            width: size, height: size, borderRadius: '50%',
            background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DEEP})`,
            animation: `coinDrop ${dur} ${delay} ease-in infinite`,
            zIndex: 10,
            boxShadow: `0 2px 8px rgba(233,210,118,0.6)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.44, fontWeight: 900, color: '#fff',
          }}>U</div>
        ))}

        {/* Bag SVG */}
        <div style={{ animation: 'bagFloat 4.5s ease-in-out infinite' }}>
          <svg width="200" height="220" viewBox="0 0 120 156" style={{ display: 'block' }}>
            <defs>
              <radialGradient id="bag-body" cx="32%" cy="28%" r="65%">
                <stop offset="0%"   stopColor="#EDD97A" />
                <stop offset="55%"  stopColor="#C09A2E" />
                <stop offset="100%" stopColor="#7a5810" />
              </radialGradient>
              <radialGradient id="bag-knot" cx="38%" cy="32%" r="58%">
                <stop offset="0%"   stopColor="#D4AF44" />
                <stop offset="100%" stopColor="#6a4808" />
              </radialGradient>
              <radialGradient id="bag-shine" cx="28%" cy="24%" r="44%">
                <stop offset="0%"   stopColor="rgba(255,255,255,0.45)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
              <filter id="bag-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Expanding ring */}
            <ellipse cx="60" cy="106" rx="54" ry="50" fill="none" stroke={GOLD} strokeWidth="0.5" opacity="0.4">
              <animate attributeName="rx" values="54;80;54" dur="3s" repeatCount="indefinite" />
              <animate attributeName="ry" values="50;74;50" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite" />
            </ellipse>

            {/* Knot */}
            <circle cx="60" cy="17" r="13" fill="url(#bag-knot)" filter="url(#bag-glow)" />
            <ellipse cx="60" cy="25" rx="9" ry="5.5" fill="url(#bag-knot)" opacity="0.6" />

            {/* Neck */}
            <path d="M 50 46 Q 50 26 60 22 Q 70 26 70 46 Z" fill="url(#bag-body)" />

            {/* Body */}
            <ellipse cx="60" cy="105" rx="55" ry="51" fill="url(#bag-body)" />

            {/* Shine */}
            <ellipse cx="60" cy="105" rx="55" ry="51" fill="url(#bag-shine)" />

            {/* Shadow neck join */}
            <ellipse cx="60" cy="56" rx="21" ry="6" fill="rgba(0,0,0,0.18)" />

            {/* U emblem */}
            <circle cx="60" cy="105" r="30" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <text x="60" y="116" textAnchor="middle" fontSize="32" fontWeight="900"
              fill="rgba(255,255,255,0.92)" fontFamily="system-ui,-apple-system,sans-serif" letterSpacing="-1">U</text>
          </svg>
        </div>
      </div>

      {/* Balance */}
      <div style={{ marginTop: 16, position: 'relative', zIndex: 2 }}>
        <div className="shimmer-text" style={{ fontSize: 72, fontWeight: 900, letterSpacing: -3, lineHeight: 1 }}>{balance}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: GOLD, marginBottom: 8 }}>$U</div>
        <div style={{ fontSize: 14, color: MUTED, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24, fontWeight: 600 }}>Collected for Charity</div>
        <a
          href={`https://bscscan.com/address/${TREASURY}`}
          target="_blank" rel="noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12, color: GOLD, textDecoration: 'none', fontWeight: 600,
            padding: '8px 20px', borderRadius: 50,
            border: `1px solid ${DARK_BORDER}`,
            background: 'rgba(233,210,118,0.06)',
            transition: 'background 0.2s',
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
      background: DARK_CARD,
      border: `1.5px solid ${accent ? GOLD_DEEP : DARK_BORDER}`,
      borderRadius: 16, padding: '16px 20px', flex: 1,
      animation: accent ? 'borderGlow 3s ease-in-out infinite' : 'none',
      position: 'relative', overflow: 'hidden',
    }}>
      {accent && (
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 100, height: 100, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(233,210,118,0.12) 0%, transparent 70%)`,
        }} />
      )}
      <div style={{ fontSize: 9, color: MUTED, letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 6, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 34, fontWeight: 900, color: accent ? GOLD : TEXT, letterSpacing: -1.5, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FreedomOfMoneyPage() {
  return (
    <>
      <style>{CSS}</style>

      <div style={{ background: DARK_BG, minHeight: '100vh', fontFamily: 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', color: TEXT }}>

        {/* NAV */}
        <nav style={{
          padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 100,
          background: 'rgba(11,11,8,0.85)', backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${DARK_BORDER}`,
        }}>
          <a href="https://u.tech/" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <ULogo size={24} />
            <span style={{ fontSize: 13, fontWeight: 700, color: TEXT, letterSpacing: 0.3 }}>United Stables</span>
          </a>
          <div style={{ display: 'flex', gap: 8 }}>
            <a href="/freedomofmoney/purchase" style={{
              padding: '8px 20px', borderRadius: 50, textDecoration: 'none',
              background: `linear-gradient(135deg, ${GOLD_MID}, ${GOLD_DEEP})`,
              color: '#fff', fontSize: 12, fontWeight: 700,
              boxShadow: `0 2px 12px rgba(161,139,47,0.4)`,
            }}>Order Now</a>
            <a href="/freedomofmoney/track" style={{
              padding: '8px 18px', borderRadius: 50, textDecoration: 'none',
              border: `1px solid ${DARK_BORDER}`, color: MUTED, fontSize: 12, fontWeight: 600,
            }}>Track Order</a>
          </div>
        </nav>

        {/* HERO */}
        <section style={{
          position: 'relative', overflow: 'hidden',
          padding: '80px 32px 100px',
          background: `
            radial-gradient(ellipse 60% 50% at 15% 50%, rgba(161,139,47,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 85% 40%, rgba(233,210,118,0.05) 0%, transparent 60%),
            ${DARK_BG}
          `,
        }}>
          <StarField />

          <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', gap: 64, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 2 }}>

            {/* Book cover */}
            <div className="fade-in" style={{ flexShrink: 0, animationDelay: '0.1s' }}>
              <BookCover />
            </div>

            {/* Right col */}
            <div className="fade-in" style={{ flex: '1 1 320px', maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 24, animationDelay: '0.25s' }}>

              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '5px 14px', borderRadius: 50, alignSelf: 'flex-start',
                border: `1px solid rgba(233,210,118,0.3)`,
                background: 'rgba(233,210,118,0.07)',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD, display: 'inline-block', boxShadow: `0 0 8px ${GOLD}`, animation: 'glowPulse2 2s ease-in-out infinite' }} />
                <span style={{ fontSize: 10, color: GOLD, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const }}>Live · April 2026</span>
              </div>

              {/* Title */}
              <div>
                <h1 style={{ fontSize: 'clamp(30px,4vw,52px)', fontWeight: 900, lineHeight: 1.05, margin: '0 0 4px', letterSpacing: -2, color: TEXT }}>
                  Freedom of Money
                </h1>
                <h1 style={{ fontSize: 'clamp(30px,4vw,52px)', fontWeight: 900, lineHeight: 1.05, margin: '0 0 16px', letterSpacing: -2 }}>
                  <span className="shimmer-text">× United Stables</span>
                </h1>
                <p style={{ fontSize: 14, color: MUTED, margin: 0, lineHeight: 1.8, letterSpacing: 0.2 }}>
                  CZ&apos;s memoir, shipped worldwide.<br />
                  Pay with <span style={{ color: GOLD, fontWeight: 700 }}>$U</span> · 100% of proceeds go to charity · Verified on-chain.
                </p>
              </div>

              {/* Price tag */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '10px 18px', borderRadius: 12, alignSelf: 'flex-start',
                background: DARK_CARD, border: `1px solid ${DARK_BORDER}`,
              }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" stroke={GOLD} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="7" y1="7" x2="7.01" y2="7" stroke={GOLD} strokeWidth={2.5} strokeLinecap="round" />
                </svg>
                <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Lowest Price</span>
                <span style={{ fontSize: 12, color: MUTED }}>· Varies by region</span>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: 12 }}>
                <StatCard label="Books Ordered"  value="0" accent />
                <StatCard label="On-chain Txns"  value="0" />
              </div>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a href="/freedomofmoney/purchase" className="hover-lift" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '14px 32px', borderRadius: 50, textDecoration: 'none',
                  background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DEEP})`,
                  color: '#000', fontSize: 15, fontWeight: 800,
                  boxShadow: `0 6px 28px rgba(161,139,47,0.5), 0 2px 0 rgba(255,255,255,0.08) inset`,
                  letterSpacing: 0.3,
                }}>
                  Order Your Copy
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="#000" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
                </a>
                <a href="/freedomofmoney/track" className="hover-lift" style={{
                  display: 'inline-flex', alignItems: 'center', padding: '14px 26px', borderRadius: 50, textDecoration: 'none',
                  border: `1.5px solid ${DARK_BORDER}`, color: MUTED, fontSize: 14, fontWeight: 600,
                  background: DARK_CARD, letterSpacing: 0.2,
                }}>
                  Track Order
                </a>
              </div>

            </div>
          </div>
        </section>

        {/* DIVIDER */}
        <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${DARK_BORDER}, transparent)` }} />

        {/* TREASURY CENTERPIECE */}
        <section style={{
          position: 'relative', overflow: 'hidden',
          background: `radial-gradient(ellipse 70% 80% at 50% 60%, rgba(233,210,118,0.05) 0%, transparent 70%), ${DARK_BG}`,
        }}>
          {/* Decorative corner lines */}
          <div style={{ position: 'absolute', top: 32, left: 32, width: 60, height: 60, borderTop: `1px solid ${DARK_BORDER}`, borderLeft: `1px solid ${DARK_BORDER}` }} />
          <div style={{ position: 'absolute', top: 32, right: 32, width: 60, height: 60, borderTop: `1px solid ${DARK_BORDER}`, borderRight: `1px solid ${DARK_BORDER}` }} />
          <div style={{ position: 'absolute', bottom: 32, left: 32, width: 60, height: 60, borderBottom: `1px solid ${DARK_BORDER}`, borderLeft: `1px solid ${DARK_BORDER}` }} />
          <div style={{ position: 'absolute', bottom: 32, right: 32, width: 60, height: 60, borderBottom: `1px solid ${DARK_BORDER}`, borderRight: `1px solid ${DARK_BORDER}` }} />

          <div style={{ maxWidth: 500, margin: '0 auto' }}>
            <TreasuryBag balance="0" />
          </div>
        </section>

        {/* DIVIDER */}
        <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${DARK_BORDER}, transparent)` }} />

        {/* PURCHASE LOG */}
        <section style={{ padding: '56px 32px 80px', maxWidth: 960, margin: '0 auto' }}>

          {/* Section header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 10, color: GOLD, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>Transparency</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: -1, color: TEXT }}>Purchase Log</h2>
            <p style={{ fontSize: 13, color: MUTED, marginTop: 8 }}>Every order is verifiable on BNB Chain</p>
          </div>

          <div style={{
            border: `1px solid ${DARK_BORDER}`,
            borderRadius: 20, overflow: 'hidden',
            background: DARK_CARD,
            boxShadow: `0 0 0 1px rgba(233,210,118,0.05), 0 24px 64px rgba(0,0,0,0.4)`,
          }}>
            {/* Table header */}
            <div style={{ padding: '14px 24px', background: 'rgba(233,210,118,0.04)', borderBottom: `1px solid ${DARK_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: GOLD, boxShadow: `0 0 8px ${GOLD}`, animation: 'glowPulse2 2.5s ease-in-out infinite' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: TEXT, letterSpacing: 0.3 }}>Live Orders</span>
              </div>
              <a href={`https://bscscan.com/address/${TREASURY}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: MUTED, textDecoration: 'none', fontWeight: 600 }}>View on BscScan ↗</a>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${DARK_BORDER}` }}>
                    {['Buyer', 'Amount', 'Date'].map(c => (
                      <th key={c} style={{ padding: '12px 24px', textAlign: 'left', fontSize: 9, color: MUTED, letterSpacing: 1.8, textTransform: 'uppercase' as const, fontWeight: 700 }}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={3} style={{ padding: '60px 24px', textAlign: 'center' }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginBottom: 6 }}>No orders yet</div>
                      <div style={{ fontSize: 13, color: MUTED }}>Be the first to own a piece of history.</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: `1px solid ${DARK_BORDER}`, padding: '40px 24px', background: DARK_CARD }}>
          <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>

            <a href="https://u.tech/" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
              <ULogo size={20} />
              <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>United Stables</span>
            </a>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                { label: 'Campaign FAQ', href: '/freedomofmoney/details', ext: false },
                { label: 'Track Order',  href: '/freedomofmoney/track',   ext: false },
                { label: 'GitHub',       href: 'https://github.com/Moya-2025-Moya/-U-X-Freedom-of-Money', ext: true },
                { label: 'u.tech',       href: 'https://u.tech/', ext: true },
              ].map(({ label, href, ext }) => (
                <a key={label} href={href} {...(ext ? { target: '_blank', rel: 'noreferrer' } : {})}
                  style={{ fontSize: 12, color: MUTED, textDecoration: 'none', padding: '6px 14px', borderRadius: 50, border: `1px solid ${DARK_BORDER}`, transition: 'color 0.2s' }}>
                  {label}{ext ? ' ↗' : ''}
                </a>
              ))}
            </div>

            <div style={{ fontSize: 10, color: '#444', textAlign: 'center', lineHeight: 1.8, maxWidth: 560 }}>
              <span style={{ fontFamily: 'monospace', color: '#555' }}>{CONTRACT.slice(0, 18)}...{CONTRACT.slice(-6)}</span>
              {' · '}PeckShield #2025-157
            </div>
            <div style={{ fontSize: 10, color: '#444', textAlign: 'center', maxWidth: 520, lineHeight: 1.7 }}>
              Shipping availability varies by region. Orders to certain restricted destinations cannot be fulfilled. Details shown at checkout.
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
