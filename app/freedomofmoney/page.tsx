import { createPublicClient, http, formatUnits } from 'viem';
import { bsc } from 'viem/chains';
import { getSupabaseAdmin } from '@/app/lib/supabase-server';
import { U_CONTRACT as U_ADDR, TREASURY as TREASURY_ADDR, ERC20_ABI } from './lib/constants';

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

// ─── Server-side data fetching ────────────────────────────────────────────────
const bscClient = createPublicClient({
  chain: bsc,
  transport: http('https://bnb-mainnet.g.alchemy.com/v2/TBTri88WcPoFSqH9luU86'),
});

async function getStats() {
  const [balanceRaw, orderData] = await Promise.allSettled([
    bscClient.readContract({
      address: U_ADDR,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [TREASURY_ADDR],
    }),
    getSupabaseAdmin()
      .from('book_orders')
      .select('id', { count: 'exact', head: true }),
  ]);

  const balance = balanceRaw.status === 'fulfilled'
    ? parseFloat(formatUnits(balanceRaw.value as bigint, 18)).toFixed(2)
    : '0';
  const orderCount = orderData.status === 'fulfilled'
    ? (orderData.value.count ?? 0)
    : 0;

  return { balance, orderCount };
}

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
    50%      { transform: translateY(-8px); }
  }
  @keyframes glowPulse2 {
    0%,100% { opacity: 0.4; }
    50%      { opacity: 1; }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0);    }
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

  @media (max-width: 768px) {
    .hero-flex { flex-direction: column !important; gap: 48px !important; }
    .hero-copy { max-width: 100% !important; }
    .stat-row { flex-direction: column !important; }
    .nav-inner { padding: 8px 16px !important; }
    .nav-links a { font-size: 11px !important; padding: 6px 14px !important; }
    .hero-section { padding: 48px 20px 64px !important; }
    .log-section { padding: 40px 16px 60px !important; }
    .footer-links { flex-direction: column !important; }
  }
  @media (max-width: 480px) {
    .book-img { width: 160px !important; height: 240px !important; }
    .hero-title { font-size: 28px !important; }
  }
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

// ─── Book cover ──────────────────────────────────────────────────────────────
function BookCover() {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div className="book-img" style={{
        width: 200, height: 300, borderRadius: 6,
        overflow: 'hidden',
        boxShadow: '6px 12px 40px rgba(0,0,0,0.15), -2px 0 0 rgba(0,0,0,0.06)',
        animation: 'floatY 5s ease-in-out infinite',
        position: 'relative',
      }}>
        <img src="/book-cover.png" alt="Freedom of Money by Changpeng Zhao" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
      </div>
    </div>
  );
}

// ─── Charity Counter (trust-building, on-brand) ──────────────────────────────
function CharityCounter({ balance = '0' }: { balance?: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '56px 24px 48px' }}>

      {/* Live badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 12px', borderRadius: 50, marginBottom: 20,
        border: `1px solid ${BORDER}`, background: CARD,
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', animation: 'glowPulse2 2s ease-in-out infinite' }} />
        <span style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' as const }}>Live on BNB Chain</span>
      </div>

      {/* Amount */}
      <div className="shimmer-gold" style={{ fontSize: 56, fontWeight: 900, letterSpacing: -3, lineHeight: 1, marginBottom: 6 }}>{balance}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: GOLD, marginBottom: 4 }}>$U</div>
      <div style={{ fontSize: 11, color: MUTED, letterSpacing: 3, textTransform: 'uppercase' as const, marginBottom: 10, fontWeight: 600 }}>Collected for Charity</div>
      <p style={{ fontSize: 13, color: MUTED, margin: '0 auto 24px', maxWidth: 340, lineHeight: 1.6 }}>
        Every purchase adds to this pool. Fully transparent and verifiable on-chain.
      </p>

      {/* Verify button */}
      <a
        href={`https://bscscan.com/address/${TREASURY}`}
        target="_blank" rel="noreferrer"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 12, color: TEXT, textDecoration: 'none', fontWeight: 600,
          padding: '10px 24px', borderRadius: 50,
          border: `1px solid ${BORDER}`, background: CARD,
        }}
      >
        Verify on BscScan ↗
      </a>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{
      background: CARD,
      border: `1.5px solid ${accent ? GOLD : BORDER}`,
      borderRadius: 14, padding: '14px 18px', flex: 1, minWidth: 120,
      boxShadow: accent ? '0 4px 20px rgba(161,139,47,0.10)' : '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <div style={{ fontSize: 9, color: MUTED, letterSpacing: 1.8, textTransform: 'uppercase' as const, marginBottom: 5, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 900, color: accent ? GOLD : TEXT, letterSpacing: -1.5, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

// ─── Main Page (async Server Component — fetches live data) ──────────────────
export default async function FreedomOfMoneyPage() {
  const { balance, orderCount } = await getStats();
  return (
    <>
      <style>{CSS}</style>

      <div style={{ background: BG, minHeight: '100vh', fontFamily: 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', color: TEXT }}>

        {/* NAV — centered pill, matching u.tech */}
        <nav style={{
          padding: '16px 24px', display: 'flex', justifyContent: 'center',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div className="nav-inner" style={{
            background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0,0,0,0.06)', borderRadius: 50,
            padding: '10px 28px', display: 'flex', alignItems: 'center', gap: 24,
            maxWidth: 640, width: '100%',
          }}>
            <a href="https://u.tech/" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginRight: 'auto' }}>
              <ULogo size={22} />
              <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>United Stables</span>
            </a>
            <div className="nav-links" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <a href="/freedomofmoney/details" style={{ padding: '7px 14px', borderRadius: 50, textDecoration: 'none', color: MUTED, fontSize: 12, fontWeight: 500 }}>About</a>
              <a href="/freedomofmoney/track" style={{ padding: '7px 14px', borderRadius: 50, textDecoration: 'none', color: MUTED, fontSize: 12, fontWeight: 500 }}>Track</a>
              <a href="/freedomofmoney/purchase" style={{
                padding: '8px 20px', borderRadius: 50, textDecoration: 'none',
                background: TEXT, color: '#fff', fontSize: 12, fontWeight: 700,
              }}>Order Now</a>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section className="hero-section" style={{ position: 'relative', padding: '72px 32px 88px' }}>
          <div className="hero-flex" style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', gap: 64, alignItems: 'center', justifyContent: 'center' }}>

            {/* Book */}
            <div className="fade-in" style={{ flexShrink: 0 }}>
              <BookCover />
            </div>

            {/* Copy */}
            <div className="fade-in hero-copy" style={{ flex: '1 1 300px', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 20, animationDelay: '0.15s' }}>

              <div>
                <h1 className="hero-title" style={{ fontSize: 46, fontWeight: 900, lineHeight: 1.08, margin: '0 0 6px', letterSpacing: -2, color: TEXT }}>
                  Freedom of <span className="shimmer-gold">Money</span>
                </h1>
                <p style={{ fontSize: 15, color: MUTED, margin: '12px 0 0', lineHeight: 1.75 }}>
                  The official CZ memoir, shipped worldwide. Pay with <strong style={{ color: GOLD }}>$U</strong>. 100% of proceeds go to charity, verified on-chain.
                </p>
              </div>

              {/* Stats */}
              <div className="stat-row" style={{ display: 'flex', gap: 10 }}>
                <StatCard label="Books Ordered" value={String(orderCount)} accent />
                <StatCard label="Raised ($U)" value={balance} />
              </div>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a href="/freedomofmoney/purchase" className="hover-lift" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '13px 28px', borderRadius: 50, textDecoration: 'none',
                  background: TEXT, color: '#fff', fontSize: 14, fontWeight: 700,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
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

              {/* Trust line */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: MUTED }}>Audited by PeckShield</span>
                <span style={{ fontSize: 11, color: MUTED }}>$U: <span style={{ fontFamily: 'monospace' }}>{CONTRACT}</span></span>
              </div>
            </div>
          </div>
        </section>

        {/* DIVIDER */}
        <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${BORDER}, transparent)`, maxWidth: 800, margin: '0 auto' }} />

        {/* CHARITY COUNTER — clean, white, on brand */}
        <section>
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <CharityCounter balance={balance} />
          </div>
        </section>

        {/* DIVIDER */}
        <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${BORDER}, transparent)`, maxWidth: 800, margin: '0 auto' }} />

        {/* PURCHASE LOG */}
        <section className="log-section" style={{ padding: '56px 32px 80px', maxWidth: 960, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontSize: 10, color: GOLD, letterSpacing: 3, textTransform: 'uppercase' as const, fontWeight: 700, marginBottom: 10 }}>Transparency</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: -1, color: TEXT }}>Purchase Log</h2>
            <p style={{ fontSize: 13, color: MUTED, marginTop: 8 }}>Every order is verifiable on BNB Chain</p>
          </div>

          <div style={{
            border: `1px solid ${BORDER}`,
            borderRadius: 20, overflow: 'hidden',
            background: CARD,
            boxShadow: '0 2px 24px rgba(0,0,0,0.05)',
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
                    <td colSpan={3} style={{ padding: '56px 24px', textAlign: 'center' }}>
                      <div style={{ fontSize: 14, color: MUTED }}>Orders will appear here once the first purchase is made.</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: `1px solid ${BORDER}`, padding: '36px 24px', background: CARD }}>
          <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>

            <a href="https://u.tech/" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <ULogo size={20} />
              <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>United Stables</span>
            </a>

            <div className="footer-links" style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                { label: 'About', href: '/freedomofmoney/details' },
                { label: 'Track Order', href: '/freedomofmoney/track' },
                { label: 'u.tech', href: 'https://u.tech/', ext: true },
              ].map(({ label, href, ...rest }) => (
                <a key={label} href={href} {...('ext' in rest ? { target: '_blank', rel: 'noreferrer' } : {})}
                  style={{ fontSize: 12, color: MUTED, textDecoration: 'none', padding: '6px 14px', borderRadius: 50, border: `1px solid ${BORDER}` }}>
                  {label}{'ext' in rest ? ' ↗' : ''}
                </a>
              ))}
            </div>

            <div style={{ fontSize: 10, color: '#AAA', textAlign: 'center', lineHeight: 1.8 }}>
              $U: <span style={{ fontFamily: 'monospace' }}>{CONTRACT}</span> · Audited by PeckShield #2025-157
            </div>
            <div style={{ fontSize: 10, color: '#AAA', textAlign: 'center', maxWidth: 520, lineHeight: 1.7 }}>
              Shipping availability varies by region. Certain restricted destinations cannot be fulfilled.
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
