'use client';


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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FreedomOfMoneyPage() {
  return (
    <>
      <style>{`* { box-sizing: border-box; } body { margin: 0; }`}</style>

      <div style={{ background: BG, minHeight: '100vh', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: TEXT }}>

        {/* NAV */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 100, padding: '14px 24px', display: 'flex', justifyContent: 'center' }}>
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

        {/* HERO — book + stats combined */}
        <section style={{ padding: '56px 32px 48px', maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 48, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>

            {/* Book cover */}
            <div style={{ flexShrink: 0 }}>
              <BookCover scale={1.1} />
            </div>

            {/* Right: title + stats + CTA */}
            <div style={{ flex: '1 1 300px', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Live badge + title */}
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 50, border: `1px solid ${GOLD_DIM}`, background: 'rgba(233,210,118,0.08)', marginBottom: 14 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: GOLD, display: 'inline-block' }} />
                  <span style={{ fontSize: 10, color: GOLD, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' as const }}>Live · April 2026</span>
                </div>
                <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 6px', letterSpacing: -1.5 }}>Freedom of Money</h1>
                <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 10px', letterSpacing: -1.5 }}>
                  <span style={{ WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text', backgroundClip: 'text', backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>× $U</span>
                </h1>
                <p style={{ fontSize: 13, color: MUTED, margin: 0, lineHeight: 1.6 }}>CZ's memoir · #1 Bestseller · All proceeds to charity · Verifiable on-chain</p>
              </div>

              {/* Price */}
              <div style={{ background: '#fff', border: `1px solid ${GOLD_DIM}`, borderRadius: 12, padding: '14px 18px', display: 'inline-flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 10, color: MUTED, letterSpacing: 1, textTransform: 'uppercase' as const }}>Price</span>
                <span style={{ fontSize: 30, fontWeight: 900, color: TEXT, letterSpacing: -1 }}>{BOOK_USD}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: GOLD }}>$U</span>
                <span style={{ fontSize: 12, color: MUTED }}>≈ £{BOOK_GBP}</span>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {[
                  { label: 'Books Ordered', value: '0', unit: '', gold: true },
                  { label: 'Treasury', value: '0', unit: '$U', gold: false },
                  { label: 'On-chain Txs', value: '0', unit: '', gold: false },
                ].map(({ label, value, unit, gold }, i) => (
                  <div key={i} style={{ background: '#fff', border: `1.5px solid ${gold ? GOLD : GOLD_DIM}`, borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ fontSize: 9, color: MUTED, letterSpacing: 1.2, textTransform: 'uppercase' as const, marginBottom: 6 }}>{label}</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: gold ? GOLD : TEXT, letterSpacing: -1, lineHeight: 1 }}>
                      {value}{unit && <span style={{ fontSize: 13, fontWeight: 600, color: GOLD, marginLeft: 2 }}>{unit}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a href="/freedomofmoney/purchase" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, color: '#fff', borderRadius: 50, fontSize: 14, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 16px rgba(161,139,47,0.35)' }}>
                  Order Your Copy →
                </a>
                <a href="/freedomofmoney/track" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: TEXT, color: '#fff', borderRadius: 50, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                  Track Order
                </a>
              </div>

              {/* BscScan link */}
              <a href="https://bscscan.com/address/0x7B72496CC89D82A31f1513D8F01973db70c3E85B" target="_blank" rel="noreferrer" style={{ fontSize: 11, color: MUTED, textDecoration: 'none' }}>
                Treasury: <span style={{ fontFamily: 'monospace' }}>0x7B72…E85B</span> · View on BscScan ↗
              </a>
            </div>
          </div>
        </section>

        {/* PURCHASE LOG */}
        <section style={{ padding: '0 32px 56px', maxWidth: 960, margin: '0 auto' }}>
          <div style={{ border: `1px solid ${GOLD_DIM}`, borderRadius: 16, overflow: 'hidden', background: '#fff' }}>
            <div style={{ padding: '14px 20px', background: '#F7F5F0', borderBottom: `1px solid ${GOLD_DIM}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Purchase Log</span>
              <a href="https://bscscan.com/address/0x7B72496CC89D82A31f1513D8F01973db70c3E85B" target="_blank" rel="noreferrer" style={{ fontSize: 11, color: MUTED, textDecoration: 'none' }}>View on BscScan ↗</a>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${GOLD_DIM}` }}>
                    {['Buyer', 'Amount', 'Tx Hash', 'Date'].map((c) => (
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

        {/* HOW TO ORDER */}
        <section style={{ background: '#fff', padding: '48px 32px 56px' }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 18, left: 'calc(16.66% + 18px)', right: 'calc(16.66% + 18px)', height: 1, background: GOLD_DIM, zIndex: 0 }} />
              {[
                { n: 1, title: 'Connect Wallet', body: 'BNB Chain · MetaMask or any injected wallet' },
                { n: 2, title: 'Pay with $U', body: `${BOOK_USD} $U — or swap any token in-page` },
                { n: 3, title: 'Book Ships', body: 'Enter address · Ships 1-3 days via Amazon' },
              ].map(({ n, title, body }, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center', padding: '0 12px', position: 'relative', zIndex: 1 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 14, fontWeight: 700, color: '#fff', boxShadow: '0 2px 10px rgba(161,139,47,0.3)' }}>{n}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.6 }}>{body}</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 36 }}>
              <a href="/freedomofmoney/purchase" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 36px', background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, color: '#fff', borderRadius: 50, fontSize: 14, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 16px rgba(161,139,47,0.35)' }}>
                Order Your Copy →
              </a>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: `1px solid ${GOLD_DIM}`, padding: '32px 24px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
            <ULogo size={18} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>United Stables</span>
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginBottom: 8 }}>
            $U: <span style={{ fontFamily: 'monospace', color: GOLD }}>{CONTRACT_SHORT}</span> · PeckShield #2025-157
          </div>
          <div style={{ fontSize: 11, color: MUTED, display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/freedomofmoney/details" target="_blank" rel="noreferrer" style={{ color: MUTED, textDecoration: 'none' }}>Campaign details & FAQ ↗</a>
            <a href="https://github.com/Moya-2025-Moya/-U-X-Freedom-of-Money" target="_blank" rel="noreferrer" style={{ color: MUTED, textDecoration: 'none' }}>Open source ↗</a>
          </div>
        </footer>

      </div>
    </>
  );
}
