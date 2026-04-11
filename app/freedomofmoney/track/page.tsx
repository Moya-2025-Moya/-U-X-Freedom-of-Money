'use client';

import { useState } from 'react';
import Link from 'next/link';
import { bscscanTx } from '../lib/constants';

const GOLD = '#A18B2F';
const GOLD_LIGHT = '#E9D276';
const GOLD_DIM = 'rgba(161,139,47,0.18)';
const BG = '#FAFAF8';
const TEXT = '#1A1A1A';
const MUTED = '#6B6B6B';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; desc: string }> = {
  pending:   { label: 'Pending',   color: '#92400E', bg: '#FEF3C7', desc: 'Order received, being processed.' },
  ordered:   { label: 'Ordered',   color: '#1E40AF', bg: '#DBEAFE', desc: 'Book purchased from Amazon, preparing to ship.' },
  shipped:   { label: 'Shipped',   color: '#065F46', bg: '#D1FAE5', desc: 'On its way to you.' },
  delivered: { label: 'Delivered', color: '#166534', bg: '#DCFCE7', desc: 'Delivered successfully.' },
  cancelled: { label: 'Cancelled', color: '#991B1B', bg: '#FEE2E2', desc: 'This order was cancelled.' },
};

type Order = {
  id: string;
  created_at: string;
  full_name: string;
  status: string;
  tx_hash: string | null;
  wallet_address: string | null;
  amazon_tracking: string | null;
};

function ULogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={Math.round(size * 64 / 58)} viewBox="0 0 58 64" fill="none">
      <path d="M37.5659 55.4667C26.4385 55.4667 17.3414 46.08 17.3414 35.1289V1.42222C17.3414 0.64 16.6911 0 15.8963 0H1.44512C0.650304 0 0 0.64 0 1.42222V35.0151C0 50.7591 13.0856 64.0924 29.0758 64C44.6109 63.9076 57.2268 51.7547 57.7759 36.5796C57.234 47.104 48.3899 55.4667 37.5659 55.4667Z" fill="url(#tl1)" />
      <path d="M56.3581 0H41.9069C41.1121 0 40.4618 0.64 40.4618 1.42222V35.2356C40.4618 41.3653 35.6784 46.6347 29.4572 46.9191C22.8169 47.2249 17.3398 42.0196 17.3398 35.5556C17.3398 46.5493 26.4007 55.4667 37.5715 55.4667C48.7423 55.4667 57.2324 47.104 57.7743 36.5796C57.7888 36.2382 57.8032 35.8969 57.8032 35.5556V1.42222C57.8032 0.64 57.1529 0 56.3581 0Z" fill="url(#tl2)" />
      <defs>
        <linearGradient id="tl1" x1="31.2652" y1="63.1324" x2="25.9731" y2="1.66354" gradientUnits="userSpaceOnUse"><stop stopColor="#E9D276" /><stop offset="1" stopColor="#A18B2F" /></linearGradient>
        <linearGradient id="tl2" x1="41.0615" y1="51.6907" x2="35.9859" y2="2.58582" gradientUnits="userSpaceOnUse"><stop stopColor="#9F9FA2" /><stop offset="1" stopColor="#D7D7D7" /></linearGradient>
      </defs>
    </svg>
  );
}

function OrderCard({ order }: { order: Order }) {
  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  return (
    <div style={{ background: '#fff', border: `1px solid ${GOLD_DIM}`, borderRadius: 16, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>{order.full_name}</div>
          <div style={{ fontSize: 12, color: MUTED }}>{new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        </div>
        <div style={{ padding: '5px 12px', borderRadius: 50, background: cfg.bg, fontSize: 12, fontWeight: 700, color: cfg.color, flexShrink: 0 }}>
          {cfg.label}
        </div>
      </div>

      <div style={{ fontSize: 12, color: MUTED, background: '#F7F5F0', borderRadius: 8, padding: '8px 12px' }}>{cfg.desc}</div>

      {order.amazon_tracking && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="20" height="14" rx="2" stroke={GOLD} strokeWidth={2} /><path d="M16 7V5a2 2 0 00-4 0v2M12 12v4M10 14h4" stroke={GOLD} strokeWidth={2} strokeLinecap="round" /></svg>
          <span style={{ fontSize: 12, color: TEXT }}>Amazon tracking: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{order.amazon_tracking}</span></span>
        </div>
      )}

      {order.tx_hash && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke={MUTED} strokeWidth={2} strokeLinecap="round" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke={MUTED} strokeWidth={2} strokeLinecap="round" /></svg>
          <a href={bscscanTx(order.tx_hash)} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: GOLD, fontFamily: 'monospace', textDecoration: 'none' }}>
            {order.tx_hash.slice(0, 14)}…{order.tx_hash.slice(-6)} ↗
          </a>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError('');
    setOrders(null);
    setSearched(true);
    try {
      const res = await fetch(`/api/freedomofmoney/order?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lookup failed');
      setOrders(data.orders);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`* { box-sizing: border-box; } body { margin: 0; }`}</style>
      <div style={{ background: BG, minHeight: '100vh', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: TEXT }}>

        {/* NAV */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 100, padding: '16px 24px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(250,250,248,0.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 50, padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 20, maxWidth: 600, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              <ULogo size={22} />
              <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>United Stables</span>
            </div>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <Link href="/freedomofmoney" style={{ fontSize: 12, color: MUTED, textDecoration: 'none' }}>← Campaign</Link>
              <span style={{ fontSize: 12, color: GOLD, fontWeight: 600 }}>Track Order</span>
            </div>
          </div>
        </nav>

        <div style={{ maxWidth: 560, margin: '0 auto', padding: '60px 24px 80px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 50, border: `1px solid ${GOLD_DIM}`, background: 'rgba(233,210,118,0.08)', marginBottom: 20 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD, display: 'inline-block' }} />
              <span style={{ fontSize: 11, color: GOLD, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' as const }}>Order Tracking</span>
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -1, margin: '0 0 10px' }}>Track Your Order</h1>
            <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.65, margin: 0 }}>
              Enter your transaction hash or wallet address to check your order status.
            </p>
          </div>

          {/* Search form */}
          <form onSubmit={search} style={{ marginBottom: 36 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="0x… tx hash or wallet address"
                style={{
                  flex: 1, padding: '13px 16px', borderRadius: 12,
                  border: '1.5px solid #E0E0DC', background: '#fff',
                  fontSize: 14, color: TEXT, fontFamily: 'monospace', outline: 'none',
                }}
                onFocus={e => { e.target.style.borderColor = GOLD; }}
                onBlur={e => { e.target.style.borderColor = '#E0E0DC'; }}
              />
              <button
                type="submit" disabled={loading || !query.trim()}
                style={{
                  padding: '13px 22px', borderRadius: 12, border: 'none', cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
                  background: loading || !query.trim() ? '#E0E0DC' : `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`,
                  color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0,
                }}
              >
                {loading ? '…' : 'Search'}
              </button>
            </div>
            <p style={{ fontSize: 11, color: MUTED, marginTop: 8 }}>
              Accepts a 66-character tx hash (0x + 64 hex) or a 42-character wallet address.
            </p>
          </form>

          {/* Results */}
          {error && (
            <div style={{ padding: '14px 18px', borderRadius: 12, background: '#FEF2F2', border: '1px solid #FECACA', fontSize: 13, color: '#DC2626' }}>
              {error}
            </div>
          )}

          {searched && !loading && !error && orders !== null && (
            orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: MUTED }}>
                <svg width={40} height={40} viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 16px', display: 'block' }}>
                  <circle cx={11} cy={11} r={8} stroke="#D1D5DB" strokeWidth={2} />
                  <path d="M21 21l-4.35-4.35" stroke="#D1D5DB" strokeWidth={2} strokeLinecap="round" />
                </svg>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>No order found</div>
                <div style={{ fontSize: 13 }}>Double-check the tx hash or wallet address and try again.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {orders.map(o => <OrderCard key={o.id} order={o} />)}
              </div>
            )
          )}

        </div>
      </div>
    </>
  );
}
