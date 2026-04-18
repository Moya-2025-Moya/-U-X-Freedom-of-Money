import Link from 'next/link';

const GOLD       = '#A18B2F';
const GOLD_LIGHT = '#E9D276';
const GOLD_DIM   = 'rgba(161,139,47,0.18)';
const BG         = '#FAFAF8';
const TEXT       = '#1A1A1A';
const MUTED      = '#6B6B6B';

export default function NotFound() {
  const pages = [
    { href: '/freedomofmoney',          label: 'Campaign',  desc: 'Main landing page' },
    { href: '/freedomofmoney/purchase', label: 'Order',     desc: 'Buy a copy with $U' },
    { href: '/freedomofmoney/swap',     label: 'Get $U',    desc: 'Swap any token into $U' },
    { href: '/freedomofmoney/track',    label: 'Track Order', desc: 'Check your delivery status' },
    { href: '/freedomofmoney/details',  label: 'About',     desc: 'How it works + FAQ' },
  ];
  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', color: TEXT, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 72, fontWeight: 900, letterSpacing: -3, color: GOLD, lineHeight: 1, marginBottom: 6 }}>404</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, margin: '0 0 10px' }}>Page not found</h1>
        <p style={{ fontSize: 13, color: MUTED, margin: '0 0 28px', lineHeight: 1.6 }}>
          The page you&apos;re looking for doesn&apos;t exist. Pick a destination below.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' as const }}>
          {pages.map(p => (
            <Link key={p.href} href={p.href} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
              padding: '14px 18px', borderRadius: 12, background: '#fff', border: `1px solid ${GOLD_DIM}`,
              textDecoration: 'none', color: TEXT,
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{p.label}</div>
                <div style={{ fontSize: 12, color: MUTED }}>{p.desc}</div>
              </div>
              <span style={{ color: GOLD, fontSize: 18 }}>→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
