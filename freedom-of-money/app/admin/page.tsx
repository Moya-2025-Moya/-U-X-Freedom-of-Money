'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { bscscanTx } from '@/app/lib/constants';

const GOLD = '#A18B2F';
const GOLD_LIGHT = '#E9D276';
const GOLD_DIM = 'rgba(161,139,47,0.18)';
const BG = '#FAFAF8';
const TEXT = '#1A1A1A';
const MUTED = '#6B6B6B';

const STATUSES = ['pending', 'ordered', 'shipped', 'delivered', 'cancelled'] as const;
type Status = typeof STATUSES[number];

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pending',   color: '#92400E', bg: '#FEF3C7' },
  ordered:   { label: 'Ordered',   color: '#1E40AF', bg: '#DBEAFE' },
  shipped:   { label: 'Shipped',   color: '#065F46', bg: '#D1FAE5' },
  delivered: { label: 'Delivered', color: '#166534', bg: '#DCFCE7' },
  cancelled: { label: 'Cancelled', color: '#991B1B', bg: '#FEE2E2' },
};

type Order = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state_province: string | null;
  postal_code: string;
  country: string;
  notes: string | null;
  status: Status;
  tx_hash: string | null;
  wallet_address: string | null;
  amazon_tracking: string | null;
};

const short = (s: string, n = 10) => s.length <= n * 2 ? s : `${s.slice(0, n)}…${s.slice(-6)}`;

const fetcher = (url: string) => fetch(url).then(r => r.json());

// ─── Order row ────────────────────────────────────────────────────────────────
function OrderRow({ order, onUpdate }: { order: Order; onUpdate: () => void }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>(order.status);
  const [tracking, setTracking] = useState(order.amazon_tracking ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const cfg = STATUS_CONFIG[status];

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, status, amazon_tracking: tracking || null }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaved(true);
      onUpdate();
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  const address = [order.address_line1, order.address_line2, order.city, order.state_province, order.postal_code, order.country].filter(Boolean).join(', ');

  return (
    <div style={{ border: `1px solid ${open ? GOLD_DIM : '#E8E8E4'}`, borderRadius: 14, overflow: 'hidden', background: '#fff', transition: 'border-color 0.15s' }}>
      {/* Row header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' as const }}
      >
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '160px 1fr 160px 130px', gap: 12, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{order.full_name}</div>
            <div style={{ fontSize: 11, color: MUTED }}>{order.email}</div>
          </div>
          <div style={{ fontSize: 12, color: MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{address}</div>
          <div style={{ fontSize: 11, color: MUTED, fontFamily: 'monospace' }}>
            {order.tx_hash ? short(order.tx_hash) : <span style={{ color: '#D1D5DB' }}>no tx hash</span>}
          </div>
          <div style={{ textAlign: 'right' as const }}>
            <span style={{ padding: '4px 10px', borderRadius: 50, background: cfg.bg, fontSize: 11, fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
          </div>
        </div>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <path d="M6 9l6 6 6-6" stroke={MUTED} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Expanded detail */}
      {open && (
        <div style={{ borderTop: `1px solid ${GOLD_DIM}`, padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 6 }}>Shipping Address</div>
              <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                {order.full_name}
                {order.phone && <><br />{order.phone}</>}
                <br />{order.address_line1}{order.address_line2 && <><br />{order.address_line2}</>}
                <br />{order.city}{order.state_province ? `, ${order.state_province}` : ''} {order.postal_code}
                <br />{order.country}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 4 }}>Ordered</div>
                <div style={{ fontSize: 13 }}>{new Date(order.created_at).toLocaleString('en-GB')}</div>
              </div>
              {order.tx_hash && (
                <div>
                  <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 4 }}>Tx Hash</div>
                  <a href={bscscanTx(order.tx_hash)} target="_blank" rel="noreferrer" style={{ fontSize: 12, fontFamily: 'monospace', color: GOLD, textDecoration: 'none' }}>
                    {short(order.tx_hash, 12)} ↗
                  </a>
                </div>
              )}
              {order.notes && (
                <div>
                  <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 4 }}>Notes</div>
                  <div style={{ fontSize: 13, color: MUTED }}>{order.notes}</div>
                </div>
              )}
            </div>
          </div>

          {/* Update controls */}
          <div style={{ borderTop: `1px solid #F0EDE8`, paddingTop: 16, display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: 0.5 }}>Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as Status)}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #E0E0DC', background: '#fff', fontSize: 13, color: TEXT, fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}
              >
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1, minWidth: 160 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: 0.5 }}>Amazon Tracking No.</label>
              <input
                value={tracking}
                onChange={e => setTracking(e.target.value)}
                placeholder="e.g. GB123456789"
                style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #E0E0DC', background: '#fff', fontSize: 13, color: TEXT, fontFamily: 'inherit', outline: 'none' }}
                onFocus={e => { e.target.style.borderColor = GOLD; }}
                onBlur={e => { e.target.style.borderColor = '#E0E0DC'; }}
              />
            </div>
            <button
              onClick={save} disabled={saving}
              style={{
                padding: '8px 20px', borderRadius: 8, border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                background: saved ? '#16A34A' : saving ? '#C8BA6A' : `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`,
                color: '#fff', fontSize: 13, fontWeight: 700,
              }}
            >
              {saved ? 'Saved ✓' : saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Admin Page ───────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const { data, mutate } = useSWR<{ orders: Order[] }>(
    `/api/admin?status=${statusFilter}`,
    fetcher,
    { refreshInterval: 30_000 },
  );

  const orders = data?.orders ?? [];
  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {} as Record<Status, number>);

  return (
    <>
      <style>{`* { box-sizing: border-box; } body { margin: 0; }`}</style>
      <div style={{ background: BG, minHeight: '100vh', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: TEXT }}>

        {/* NAV */}
        <nav style={{ borderBottom: '1px solid #E8E8E4', padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 16, background: '#fff' }}>
          <Link href="/freedomofmoney" style={{ fontSize: 12, color: MUTED, textDecoration: 'none' }}>← Campaign</Link>
          <span style={{ color: '#D1D5DB' }}>|</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Order Admin</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
            <Link href="/track" style={{ fontSize: 12, color: MUTED, textDecoration: 'none' }}>Track Page ↗</Link>
          </div>
        </nav>

        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 80px' }}>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 28 }}>
            {[{ key: 'all' as const, label: 'Total', count: orders.length }, ...STATUSES.map(s => ({ key: s, label: STATUS_CONFIG[s].label, count: counts[s] }))].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                style={{
                  padding: '14px 16px', borderRadius: 12, border: `1.5px solid ${statusFilter === key ? GOLD : '#E8E8E4'}`,
                  background: statusFilter === key ? 'rgba(233,210,118,0.08)' : '#fff',
                  cursor: 'pointer', textAlign: 'left' as const,
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 800, color: statusFilter === key ? GOLD : TEXT }}>{count}</div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{label}</div>
              </button>
            ))}
          </div>

          {/* Table header */}
          {orders.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 160px 130px 40px', gap: 12, padding: '0 20px 10px', fontSize: 10, color: MUTED, letterSpacing: 1, textTransform: 'uppercase' as const }}>
              <span>Name / Email</span>
              <span>Address</span>
              <span>Tx Hash</span>
              <span style={{ textAlign: 'right' as const }}>Status</span>
              <span />
            </div>
          )}

          {/* Orders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {!data ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: MUTED, fontSize: 14 }}>Loading…</div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: MUTED, fontSize: 14 }}>No orders {statusFilter !== 'all' ? `with status "${STATUS_CONFIG[statusFilter as Status]?.label}"` : 'yet'}.</div>
            ) : (
              orders.map(o => <OrderRow key={o.id} order={o} onUpdate={() => mutate()} />)
            )}
          </div>

        </div>
      </div>
    </>
  );
}
