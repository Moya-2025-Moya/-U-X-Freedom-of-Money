const GOLD     = '#A18B2F';
const GOLD_DIM = 'rgba(161,139,47,0.18)';
const BG       = '#FAFAF8';
const MUTED    = '#6B6B6B';

export default function Loading() {
  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14 }}>
      <svg width={28} height={28} viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="10" fill="none" stroke={GOLD_DIM} strokeWidth={3} />
        <path d="M22 12a10 10 0 0 1-10 10" fill="none" stroke={GOLD} strokeWidth={3} strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
        </path>
      </svg>
      <span style={{ fontSize: 12, color: MUTED, letterSpacing: 1.5, textTransform: 'uppercase' }}>Loading</span>
    </div>
  );
}
