import { createPublicClient, http, formatUnits } from 'viem';
import { bsc } from 'viem/chains';
import { getSupabaseAdmin } from '@/app/lib/supabase-server';
import { U_CONTRACT as U_ADDR, TREASURY as TREASURY_ADDR, ERC20_ABI } from './lib/constants';

export const revalidate = 60;

const bscClient = createPublicClient({
  chain: bsc,
  transport: http(process.env.BSC_RPC_URL || 'https://bsc-dataseed1.bnbchain.org'),
});

type OrderRow = {
  id: string;
  created_at: string;
  wallet_address: string | null;
  amount_u: number | null;
  tx_hash: string | null;
};

async function getStats() {
  const supabase = getSupabaseAdmin();
  const [balanceRaw, orderData, ordersData] = await Promise.allSettled([
    bscClient.readContract({
      address: U_ADDR,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [TREASURY_ADDR],
    }),
    supabase
      .from('book_orders')
      .select('id', { count: 'exact', head: true }),
    supabase
      .from('book_orders')
      .select('id, created_at, wallet_address, amount_u, tx_hash')
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  const balance = balanceRaw.status === 'fulfilled'
    ? parseFloat(formatUnits(balanceRaw.value as bigint, 18)).toFixed(2)
    : '0';
  const orderCount = orderData.status === 'fulfilled'
    ? (orderData.value.count ?? 0)
    : 0;
  const orders: OrderRow[] = ordersData.status === 'fulfilled'
    ? (ordersData.value.data ?? [])
    : [];

  return { balance, orderCount, orders };
}

// ─── Palette ──────────────────────────────────────────────────────────────────
const GOLD       = '#A18B2F';
const GOLD_LIGHT = '#E9D276';
const GOLD_MID   = '#C8A83C';
const BG         = '#F7F5F0';
const CARD       = '#FFFFFF';
const BORDER     = 'rgba(161,139,47,0.14)';
const TEXT       = '#1A1A1A';
const MUTED      = '#888';
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
    50%     { transform: translateY(-6px); }
  }
  @keyframes pulse {
    0%,100% { opacity: 0.4; }
    50%     { opacity: 1; }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .shimmer-gold {
    background: linear-gradient(100deg, ${GOLD} 20%, ${GOLD_LIGHT} 45%, ${GOLD_MID} 55%, ${GOLD} 80%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
  }
  .fade-in { animation: fadeIn 0.6s ease both; }

  @media (max-width: 768px) {
    .hero-flex { flex-direction: column !important; gap: 40px !important; text-align: center !important; }
    .hero-copy { max-width: 100% !important; align-items: center !important; }
    .hero-section { padding: 48px 20px 56px !important; }
    .nav-inner { padding: 8px 16px !important; gap: 12px !important; }
    .charity-row { flex-direction: column !important; gap: 24px !important; }
  }
  @media (max-width: 480px) {
    .book-img { width: 150px !important; height: 225px !important; }
    .hero-title { font-size: 32px !important; }
  }
`;

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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default async function FreedomOfMoneyPage() {
  const { balance, orderCount, orders } = await getStats();
  return (
    <>
      <style>{CSS}</style>
      <div style={{ background: BG, minHeight: '100vh', fontFamily: 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', color: TEXT }}>

        {/* NAV */}
        <nav style={{ padding: '14px 24px', display: 'flex', justifyContent: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
          <div className="nav-inner" style={{
            background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0,0,0,0.06)', borderRadius: 50,
            padding: '9px 24px', display: 'flex', alignItems: 'center', gap: 20,
            maxWidth: 560, width: '100%',
          }}>
            <a href="https://u.tech/" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none', marginRight: 'auto' }}>
              <ULogo size={20} />
              <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>United Stables</span>
            </a>
            <a href="/freedomofmoney/details" style={{ fontSize: 12, color: MUTED, textDecoration: 'none' }}>About</a>
            <a href="/freedomofmoney/purchase" style={{
              padding: '7px 18px', borderRadius: 50, textDecoration: 'none',
              background: TEXT, color: '#fff', fontSize: 12, fontWeight: 700,
            }}>Order</a>
          </div>
        </nav>

        {/* HERO */}
        <section className="hero-section" style={{ padding: '64px 32px 72px' }}>
          <div className="hero-flex" style={{ maxWidth: 920, margin: '0 auto', display: 'flex', gap: 56, alignItems: 'center', justifyContent: 'center' }}>

            <div className="fade-in" style={{ flexShrink: 0 }}>
              <div className="book-img" style={{
                width: 190, height: 285, borderRadius: 4, overflow: 'hidden',
                boxShadow: '4px 8px 32px rgba(0,0,0,0.12)',
                animation: 'floatY 5s ease-in-out infinite',
              }}>
                <img src="/book-cover.png" alt="Freedom of Money" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
              </div>
            </div>

            <div className="fade-in hero-copy" style={{ flex: '1 1 280px', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 24, animationDelay: '0.12s' }}>

              <h1 className="hero-title" style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.1, margin: 0, letterSpacing: -2 }}>
                Freedom of <span className="shimmer-gold">Money</span>
              </h1>
              <p style={{ fontSize: 15, color: MUTED, margin: 0, lineHeight: 1.65 }}>
                Pay with <strong style={{ color: GOLD }}>$U</strong>. 100% to charity. On-chain verified.
              </p>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a href="/freedomofmoney/purchase" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '13px 28px', borderRadius: 50, textDecoration: 'none',
                  background: TEXT, color: '#fff', fontSize: 14, fontWeight: 700,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                }}>
                  Order Your Copy
                  <svg width={15} height={15} viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
                </a>
                <a href="/freedomofmoney/track" style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '13px 22px', borderRadius: 50, textDecoration: 'none',
                  border: `1.5px solid ${BORDER}`, color: MUTED, fontSize: 13, fontWeight: 600,
                  background: CARD,
                }}>
                  Track Order
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CHARITY + STATS - single horizontal band */}
        <section style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
          <div className="charity-row" style={{ maxWidth: 720, margin: '0 auto', padding: '40px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48 }}>

            {/* Charity amount */}
            <div style={{ textAlign: 'center' }}>
              <div className="shimmer-gold" style={{ fontSize: 48, fontWeight: 900, letterSpacing: -2, lineHeight: 1 }}>{balance}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: GOLD, marginTop: 4 }}>$U for Charity</div>
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 48, background: BORDER, flexShrink: 0 }} />

            {/* Orders */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: -2, lineHeight: 1, color: TEXT }}>{orderCount}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: MUTED, marginTop: 4 }}>Books Ordered</div>
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 48, background: BORDER, flexShrink: 0 }} />

            {/* Verify */}
            <a
              href={`https://bscscan.com/address/${TREASURY}`}
              target="_blank" rel="noreferrer"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                textDecoration: 'none', color: MUTED, fontSize: 12, fontWeight: 600,
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', animation: 'pulse 2s ease-in-out infinite' }} />
              <span>Verify ↗</span>
            </a>
          </div>
        </section>

        {/* PURCHASE LOG */}
        <section style={{ padding: '48px 32px 72px', maxWidth: 960, margin: '0 auto' }}>
          <div style={{
            border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden',
            background: CARD, boxShadow: '0 1px 12px rgba(0,0,0,0.04)',
          }}>
            <div style={{ padding: '12px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD_MID, animation: 'pulse 2.5s ease-in-out infinite' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>Purchase Log</span>
              </div>
              <a href={`https://bscscan.com/address/${TREASURY}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: MUTED, textDecoration: 'none' }}>BscScan ↗</a>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {['Buyer', 'Amount', 'Tx', 'Date'].map(c => (
                    <th key={c} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 10, color: MUTED, letterSpacing: 1.5, textTransform: 'uppercase' as const, fontWeight: 600 }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '40px 20px', textAlign: 'center', fontSize: 13, color: MUTED }}>
                      No orders yet.
                    </td>
                  </tr>
                ) : orders.map(o => (
                  <tr key={o.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <td style={{ padding: '10px 20px', fontSize: 13, color: TEXT, fontFamily: 'monospace' }}>
                      {o.wallet_address ? `${o.wallet_address.slice(0, 6)}...${o.wallet_address.slice(-4)}` : 'N/A'}
                    </td>
                    <td style={{ padding: '10px 20px', fontSize: 13, color: GOLD, fontWeight: 600 }}>
                      {o.amount_u ? `${o.amount_u} $U` : '22 $U'}
                    </td>
                    <td style={{ padding: '10px 20px', fontSize: 12 }}>
                      {o.tx_hash ? (
                        <a href={`https://bscscan.com/tx/${o.tx_hash}`} target="_blank" rel="noreferrer" style={{ color: MUTED, textDecoration: 'none', fontFamily: 'monospace' }}>
                          {o.tx_hash.slice(0, 10)}... ↗
                        </a>
                      ) : 'N/A'}
                    </td>
                    <td style={{ padding: '10px 20px', fontSize: 12, color: MUTED }}>
                      {new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: `1px solid ${BORDER}`, padding: '32px 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <a href="https://u.tech/" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none' }}>
              <ULogo size={18} />
              <span style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>United Stables</span>
            </a>
            <div style={{ display: 'flex', gap: 16, fontSize: 11, color: MUTED }}>
              <a href="/freedomofmoney/details" style={{ color: MUTED, textDecoration: 'none' }}>About</a>
              <a href="/freedomofmoney/track" style={{ color: MUTED, textDecoration: 'none' }}>Track Order</a>
              <a href="https://u.tech/" target="_blank" rel="noreferrer" style={{ color: MUTED, textDecoration: 'none' }}>u.tech ↗</a>
            </div>
            <a href="https://github.com/Moya-2025-Moya/-U-X-Freedom-of-Money/tree/main" target="_blank" rel="noreferrer"
              style={{ fontSize: 11, color: MUTED, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill={MUTED}><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              Open Source ↗
            </a>
            <div style={{ fontSize: 10, color: '#BBB', fontFamily: 'monospace' }}>{CONTRACT}</div>
          </div>
        </footer>
      </div>
    </>
  );
}
