'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { WagmiProvider, useAccount, useConnect, useDisconnect, useReadContract } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '../lib/wagmi-config';
import { U_CONTRACT, ERC20_ABI } from '../lib/constants';
import { SwapWidget } from '../lib/SwapWidget';

const GOLD       = '#A18B2F';
const GOLD_LIGHT = '#E9D276';
const GOLD_DIM   = 'rgba(161,139,47,0.18)';
const BG         = '#FAFAF8';
const TEXT       = '#1A1A1A';
const MUTED      = '#6B6B6B';

const queryClient = new QueryClient();

function ULogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={Math.round(size * 64 / 58)} viewBox="0 0 58 64" fill="none">
      <path d="M37.5659 55.4667C26.4385 55.4667 17.3414 46.08 17.3414 35.1289V1.42222C17.3414 0.64 16.6911 0 15.8963 0H1.44512C0.650304 0 0 0.64 0 1.42222V35.0151C0 50.7591 13.0856 64.0924 29.0758 64C44.6109 63.9076 57.2268 51.7547 57.7759 36.5796C57.234 47.104 48.3899 55.4667 37.5659 55.4667Z" fill="url(#swl1)" />
      <path d="M56.3581 0H41.9069C41.1121 0 40.4618 0.64 40.4618 1.42222V35.2356C40.4618 41.3653 35.6784 46.6347 29.4572 46.9191C22.8169 47.2249 17.3398 42.0196 17.3398 35.5556C17.3398 46.5493 26.4007 55.4667 37.5715 55.4667C48.7423 55.4667 57.2324 47.104 57.7743 36.5796C57.7888 36.2382 57.8032 35.8969 57.8032 35.5556V1.42222C57.8032 0.64 57.1529 0 56.3581 0Z" fill="url(#swl2)" />
      <defs>
        <linearGradient id="swl1" x1="31" y1="63" x2="26" y2="2" gradientUnits="userSpaceOnUse"><stop stopColor="#E9D276" /><stop offset="1" stopColor="#A18B2F" /></linearGradient>
        <linearGradient id="swl2" x1="41" y1="52" x2="36" y2="3" gradientUnits="userSpaceOnUse"><stop stopColor="#9F9FA2" /><stop offset="1" stopColor="#D7D7D7" /></linearGradient>
      </defs>
    </svg>
  );
}

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

function SwapInner() {
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { isConnected, address } = useAccount();
  const [amountUsd, setAmountUsd] = useState<string>('22');

  const { data: balance, refetch } = useReadContract({
    address: U_CONTRACT,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address!],
    query: { enabled: !!address },
  });

  const balanceU = balance !== undefined ? Number(balance) / 1e18 : null;
  const amountNum = Number(amountUsd) || 0;
  const amountBigInt = BigInt(Math.floor(amountNum * 1e6)) * BigInt(1e12); // 18 decimals

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '40px 24px 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 50, border: `1px solid ${GOLD_DIM}`, background: 'rgba(233,210,118,0.08)', marginBottom: 16 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD }} />
          <span style={{ fontSize: 11, color: GOLD, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' as const }}>Swap</span>
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -1, margin: '0 0 8px' }}>Get $U</h1>
        <p style={{ fontSize: 13, color: MUTED, margin: 0, lineHeight: 1.6 }}>
          Swap USDT, USDC, or BNB into $U on BNB Chain. Best price routed across PancakeSwap via Paraswap.
        </p>
      </div>

      {!isConnected ? (
        <div style={{ background: '#fff', border: `1px solid ${GOLD_DIM}`, borderRadius: 20, padding: '32px 24px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none">
              <rect x="2" y="6" width="20" height="14" rx="2" stroke="#fff" strokeWidth={2} />
              <path d="M2 10h20" stroke="#fff" strokeWidth={2} />
            </svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>Connect wallet to swap</h2>
          <p style={{ fontSize: 13, color: MUTED, margin: '0 0 20px' }}>Any BNB Chain wallet (MetaMask, Trust, etc.)</p>
          <button
            onClick={() => connect({ connector: connectors[0] })}
            disabled={isPending || !connectors[0]}
            style={{
              padding: '12px 32px', borderRadius: 50, border: 'none',
              cursor: isPending ? 'not-allowed' : 'pointer',
              background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`,
              color: '#fff', fontSize: 14, fontWeight: 700,
              boxShadow: `0 4px 16px rgba(161,139,47,0.3)`,
            }}
          >
            {isPending ? 'Connecting…' : 'Connect Wallet'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: `1px solid ${GOLD_DIM}`, borderRadius: 14, padding: '12px 16px' }}>
            <div>
              <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, textTransform: 'uppercase' as const }}>Wallet</div>
              <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 600 }}>{address ? short(address) : ''}</div>
            </div>
            <div style={{ textAlign: 'right' as const }}>
              <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, textTransform: 'uppercase' as const }}>$U balance</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: GOLD }}>{balanceU !== null ? balanceU.toFixed(2) : '…'}</div>
            </div>
          </div>

          <div style={{ background: '#fff', border: `1px solid ${GOLD_DIM}`, borderRadius: 20, padding: '20px 20px 4px' }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
              How much $U do you want?
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
              <input
                type="number" min="1" step="1" inputMode="decimal"
                value={amountUsd}
                onChange={e => setAmountUsd(e.target.value)}
                style={{
                  flex: 1, padding: '12px 14px', fontSize: 20, fontWeight: 700,
                  border: '1.5px solid #E0E0DC', borderRadius: 10, outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <span style={{ fontSize: 16, fontWeight: 700, color: GOLD }}>$U</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              {['22', '50', '100', '500'].map(v => (
                <button key={v} onClick={() => setAmountUsd(v)}
                  style={{
                    padding: '5px 12px', borderRadius: 50,
                    border: `1px solid ${amountUsd === v ? GOLD : '#E0E0DC'}`,
                    background: amountUsd === v ? 'rgba(233,210,118,0.12)' : '#fff',
                    fontSize: 12, fontWeight: 600, color: amountUsd === v ? GOLD : MUTED,
                    cursor: 'pointer',
                  }}>
                  {v} $U
                </button>
              ))}
            </div>
          </div>

          {amountNum >= 1 && (
            <div style={{ border: `1.5px solid ${GOLD_DIM}`, borderRadius: 16, overflow: 'hidden', background: '#fff' }}>
              <SwapWidget
                embedded
                amountU={amountBigInt}
                onSwapped={() => refetch()}
                onCancel={() => {}}
              />
            </div>
          )}

          {amountNum < 1 && (
            <div style={{ padding: '14px 16px', borderRadius: 10, background: '#FEF9EC', fontSize: 12, color: '#92400E' }}>
              Enter an amount of at least 1 $U.
            </div>
          )}

          <button
            onClick={() => {
              if (confirm('Disconnect wallet?')) disconnect();
            }}
            style={{ background: 'none', border: 'none', color: MUTED, fontSize: 12, cursor: 'pointer', padding: 8, alignSelf: 'center' }}
          >
            Disconnect
          </button>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 28 }}>
        <Link href="/freedomofmoney" style={{ fontSize: 12, color: MUTED, textDecoration: 'none' }}>← Back to Campaign</Link>
      </div>
    </div>
  );
}

export default function SwapPage() {
  // Avoid hydration mismatch from wagmi injected state
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      <style>{`* { box-sizing: border-box; } body { margin: 0; }`}</style>
      <div style={{ background: BG, minHeight: '100vh', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: TEXT }}>

        <nav style={{ position: 'sticky', top: 0, zIndex: 100, padding: '16px 24px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(250,250,248,0.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 50, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 16, maxWidth: 600, width: '100%' }}>
            <Link href="/freedomofmoney" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flex: 1 }}>
              <ULogo size={20} />
              <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>United Stables</span>
            </Link>
            <Link href="/freedomofmoney" style={{ fontSize: 12, color: MUTED, textDecoration: 'none' }}>← Campaign</Link>
            <span style={{ fontSize: 12, color: GOLD, fontWeight: 600 }}>Get $U</span>
          </div>
        </nav>

        {mounted ? (
          <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
              <SwapInner />
            </QueryClientProvider>
          </WagmiProvider>
        ) : (
          <div style={{ padding: '80px 20px', textAlign: 'center', color: MUTED, fontSize: 13 }}>Loading…</div>
        )}
      </div>
    </>
  );
}
