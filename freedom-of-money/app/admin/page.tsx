'use client';

import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { bscscanTx } from '../lib/constants';

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

// ─── Toast ────────────────────────────────────────────────────────────────────
type Toast = { id: number; message: string; kind: 'error' | 'success' };
let toastId = 0;
function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((message: string, kind: Toast['kind'] = 'success') => {
    const id = ++toastId;
    setToasts(t => [...t, { id, message, kind }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);
  const node = (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 200, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 'calc(100vw - 40px)' }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
          background: t.kind === 'error' ? '#FEF2F2' : '#F0FDF4',
          border: `1px solid ${t.kind === 'error' ? '#FECACA' : '#BBF7D0'}`,
          color: t.kind === 'error' ? '#DC2626' : '#166534',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}>{t.message}</div>
      ))}
    </div>
  );
  return { push, node };
}

const fetcher = async (url: string) => {
  const r = await fetch(url);
  if (r.status === 401) {
    const err = new Error('Unauthorized');
    (err as Error & { status?: number }).status = 401;
    throw err;
  }
  return r.json();
};

// ─── Order row ────────────────────────────────────────────────────────────────
function OrderRow({ order, onUpdate, onError, onSuccess }: {
  order: Order;
  onUpdate: () => void;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>(order.status);
  const [tracking, setTracking] = useState(order.amazon_tracking ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const cfg = STATUS_CONFIG[status];

  async function save() {
    // Destructive action: confirm on cancelled
    if (status === 'cancelled' && order.status !== 'cancelled') {
      if (!confirm(`Mark order for ${order.full_name} as cancelled? This will be visible to the customer on the Track page.`)) {
        setStatus(order.status);
        return;
      }
    }
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, status, amazon_tracking: tracking || null }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Save failed');
      setSaved(true);
      onSuccess('Order updated');
      onUpdate();
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Save failed');
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
        style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' as const, flexWrap: 'wrap' }}
      >
        <div style={{ flex: '1 1 160px', minWidth: 160 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{order.full_name}</div>
          <div style={{ fontSize: 11, color: MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.email}</div>
        </div>
        <div style={{ flex: '2 1 220px', minWidth: 0, fontSize: 12, color: MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{address}</div>
        <div style={{ flex: '0 1 140px', fontSize: 11, color: MUTED, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {order.tx_hash ? short(order.tx_hash) : <span style={{ color: '#D1D5DB' }}>no tx</span>}
        </div>
        <span style={{ padding: '4px 10px', borderRadius: 50, background: cfg.bg, fontSize: 11, fontWeight: 700, color: cfg.color, flexShrink: 0 }}>{cfg.label}</span>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <path d="M6 9l6 6 6-6" stroke={MUTED} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Expanded detail */}
      {open && (
        <div style={{ borderTop: `1px solid ${GOLD_DIM}`, padding: '20px 16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
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
                  <a href={bscscanTx(order.tx_hash)} target="_blank" rel="noreferrer" style={{ fontSize: 12, fontFamily: 'monospace', color: GOLD, textDecoration: 'none', wordBreak: 'break-all' as const }}>
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

// ─── Login form ───────────────────────────────────────────────────────────────
function LoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Login failed');
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '80px auto', padding: '0 24px' }}>
      <form onSubmit={submit} style={{ background: '#fff', border: `1px solid ${GOLD_DIM}`, borderRadius: 18, padding: '32px 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <rect x={4} y={11} width={16} height={10} rx={2} stroke="#fff" strokeWidth={2} />
              <path d="M8 11V8a4 4 0 018 0v3" stroke="#fff" strokeWidth={2} />
            </svg>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 4px' }}>Admin Login</h1>
          <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>Enter the admin password to continue.</p>
        </div>
        <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Password</label>
        <input
          type="password" value={password} onChange={e => setPassword(e.target.value)} autoFocus
          style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E0E0DC', background: '#fff', fontSize: 14, outline: 'none', marginBottom: 14 }}
          onFocus={e => { e.target.style.borderColor = GOLD; }}
          onBlur={e => { e.target.style.borderColor = '#E0E0DC'; }}
        />
        {error && (
          <div style={{ padding: '10px 14px', borderRadius: 8, background: '#FEF2F2', border: '1px solid #FECACA', fontSize: 12, color: '#DC2626', marginBottom: 14 }}>{error}</div>
        )}
        <button
          type="submit" disabled={submitting || !password}
          style={{
            width: '100%', padding: '12px', borderRadius: 50, border: 'none', cursor: submitting || !password ? 'not-allowed' : 'pointer',
            background: submitting || !password ? '#C8BA6A' : `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`,
            color: '#fff', fontSize: 14, fontWeight: 700,
          }}
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Link href="/" style={{ fontSize: 12, color: MUTED, textDecoration: 'none' }}>← Back to Campaign</Link>
      </div>
    </div>
  );
}

// ─── Admin Page ───────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const { push, node: toastNode } = useToasts();

  // Probe auth: fetch once and see if 401
  useEffect(() => {
    let mounted = true;
    fetch('/api/admin?status=all')
      .then(r => { if (mounted) setAuthed(r.status !== 401); })
      .catch(() => { if (mounted) setAuthed(false); });
    return () => { mounted = false; };
  }, []);

  const { data, mutate, error: swrError } = useSWR<{ orders: Order[] }>(
    authed ? `/api/admin?status=${statusFilter}` : null,
    fetcher,
    { refreshInterval: 30_000 },
  );

  useEffect(() => {
    if (swrError?.status === 401) setAuthed(false);
  }, [swrError]);

  async function logout() {
    if (!confirm('Log out of admin?')) return;
    await fetch('/api/admin', { method: 'DELETE' });
    setAuthed(false);
  }

  if (authed === null) {
    return (
      <div style={{ background: BG, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED, fontSize: 13 }}>
        Checking access…
      </div>
    );
  }

  if (!authed) {
    return (
      <>
        <style>{`* { box-sizing: border-box; } body { margin: 0; }`}</style>
        <div style={{ background: BG, minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', color: TEXT }}>
          <LoginGate onSuccess={() => setAuthed(true)} />
        </div>
      </>
    );
  }

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
        <nav style={{ borderBottom: '1px solid #E8E8E4', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, background: '#fff', flexWrap: 'wrap' }}>
          <Link href="/" style={{ fontSize: 12, color: MUTED, textDecoration: 'none' }}>← Campaign</Link>
          <span style={{ color: '#D1D5DB' }}>|</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Order Admin</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link href="/swap" style={{ fontSize: 12, color: MUTED, textDecoration: 'none' }}>Get $U ↗</Link>
            <Link href="/track" style={{ fontSize: 12, color: MUTED, textDecoration: 'none' }}>Track ↗</Link>
            <button onClick={logout} style={{ fontSize: 12, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Log out</button>
          </div>
        </nav>

        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px 80px' }}>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10, marginBottom: 24 }}>
            {[{ key: 'all' as const, label: 'Total', count: orders.length }, ...STATUSES.map(s => ({ key: s, label: STATUS_CONFIG[s].label, count: counts[s] }))].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                style={{
                  padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${statusFilter === key ? GOLD : '#E8E8E4'}`,
                  background: statusFilter === key ? 'rgba(233,210,118,0.08)' : '#fff',
                  cursor: 'pointer', textAlign: 'left' as const,
                }}
              >
                <div style={{ fontSize: 20, fontWeight: 800, color: statusFilter === key ? GOLD : TEXT }}>{count}</div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{label}</div>
              </button>
            ))}
          </div>

          {/* Orders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {!data ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ height: 58, borderRadius: 14, background: 'linear-gradient(90deg, #F0EDE8 0%, #F7F5F0 50%, #F0EDE8 100%)', backgroundSize: '200% 100%', animation: 'fomShimmer 1.5s infinite' }} />
                ))}
                <style>{`@keyframes fomShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
              </div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: MUTED, fontSize: 14 }}>No orders {statusFilter !== 'all' ? `with status "${STATUS_CONFIG[statusFilter as Status]?.label}"` : 'yet'}.</div>
            ) : (
              orders.map(o => (
                <OrderRow key={o.id} order={o}
                  onUpdate={() => mutate()}
                  onError={msg => push(msg, 'error')}
                  onSuccess={msg => push(msg, 'success')}
                />
              ))
            )}
          </div>

        </div>
        {toastNode}
      </div>
    </>
  );
}
