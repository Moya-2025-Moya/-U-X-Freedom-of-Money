'use client';

import { useEffect } from 'react';
import Link from 'next/link';

const GOLD       = '#A18B2F';
const GOLD_LIGHT = '#E9D276';
const GOLD_DIM   = 'rgba(161,139,47,0.18)';
const BG         = '#FAFAF8';
const TEXT       = '#1A1A1A';
const MUTED      = '#6B6B6B';

export default function FreedomOfMoneyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[freedomofmoney]', error);
  }, [error]);

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', color: TEXT, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 460, width: '100%', textAlign: 'center', background: '#fff', border: `1px solid ${GOLD_DIM}`, borderRadius: 20, padding: '40px 28px' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width={30} height={30} viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4M12 17h.01" stroke="#DC2626" strokeWidth={2.5} strokeLinecap="round" />
            <circle cx={12} cy={12} r={10} stroke="#DC2626" strokeWidth={2} />
          </svg>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, margin: '0 0 10px' }}>Something went wrong</h1>
        <p style={{ fontSize: 13, color: MUTED, margin: '0 0 6px', lineHeight: 1.6 }}>
          We hit an unexpected error while loading this page.
        </p>
        {error.digest && (
          <p style={{ fontSize: 11, color: MUTED, fontFamily: 'monospace', margin: '0 0 24px' }}>ref: {error.digest}</p>
        )}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 18 }}>
          <button onClick={reset} style={{
            padding: '10px 22px', borderRadius: 50, border: 'none',
            background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`,
            color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>Try again</button>
          <Link href="/freedomofmoney" style={{
            padding: '10px 22px', borderRadius: 50, border: `1.5px solid ${GOLD_DIM}`,
            color: GOLD, fontSize: 13, fontWeight: 600, textDecoration: 'none',
          }}>Back to Campaign</Link>
        </div>
      </div>
    </div>
  );
}
