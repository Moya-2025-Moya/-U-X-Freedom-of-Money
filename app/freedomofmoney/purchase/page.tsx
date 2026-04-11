'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { WagmiProvider, useAccount, useConnect, useDisconnect, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '../lib/wagmi-config';
import { U_CONTRACT, TREASURY, ERC20_ABI, bscscanTx } from '../lib/constants';
import { SwapWidget } from '../lib/SwapWidget';

// ─── Regional pricing (Amazon lowest price, USD) ─────────────────────────────
const REGION_PRICES = [
  { code: 'GB', label: 'United Kingdom', priceUsd: 13.47 },  // £10.39
  { code: 'US', label: 'United States',  priceUsd: 14.99 },
  { code: 'CA', label: 'Canada',          priceUsd: 14.99 },
  { code: 'AU', label: 'Australia',       priceUsd: 15.99 },
  { code: 'DE', label: 'Germany',         priceUsd: 14.99 },
  { code: 'FR', label: 'France',          priceUsd: 14.99 },
  { code: 'SG', label: 'Singapore',       priceUsd: 14.99 },
  { code: 'JP', label: 'Japan',           priceUsd: 15.49 },
  { code: 'IN', label: 'India',           priceUsd: 14.49 },
  { code: 'AE', label: 'UAE',             priceUsd: 14.99 },
  { code: 'OTHER', label: 'Other',        priceUsd: 14.99 },
] as const;
type RegionCode = typeof REGION_PRICES[number]['code'];

// Countries we cannot ship to (checked at submit)
const RESTRICTED_PATTERNS = ['china', 'mainland china', 'prc', "people's republic of china", '中国', '中华人民共和国'];

function isRestricted(country: string) {
  return RESTRICTED_PATTERNS.includes(country.trim().toLowerCase());
}

// ─── Brand constants ──────────────────────────────────────────────────────────
const GOLD = '#A18B2F';
const GOLD_LIGHT = '#E9D276';
const GOLD_DIM = 'rgba(161,139,47,0.18)';
const BG = '#FAFAF8';
const TEXT = '#1A1A1A';
const MUTED = '#6B6B6B';

const queryClient = new QueryClient();

// ─── ULogo ────────────────────────────────────────────────────────────────────
function ULogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={Math.round(size * 64 / 58)} viewBox="0 0 58 64" fill="none">
      <path d="M37.5659 55.4667C26.4385 55.4667 17.3414 46.08 17.3414 35.1289V1.42222C17.3414 0.64 16.6911 0 15.8963 0H1.44512C0.650304 0 0 0.64 0 1.42222V35.0151C0 50.7591 13.0856 64.0924 29.0758 64C44.6109 63.9076 57.2268 51.7547 57.7759 36.5796C57.234 47.104 48.3899 55.4667 37.5659 55.4667Z" fill="url(#pu1)" />
      <path d="M56.3581 0H41.9069C41.1121 0 40.4618 0.64 40.4618 1.42222V35.2356C40.4618 41.3653 35.6784 46.6347 29.4572 46.9191C22.8169 47.2249 17.3398 42.0196 17.3398 35.5556C17.3398 46.5493 26.4007 55.4667 37.5715 55.4667C48.7423 55.4667 57.2324 47.104 57.7743 36.5796C57.7888 36.2382 57.8032 35.8969 57.8032 35.5556V1.42222C57.8032 0.64 57.1529 0 56.3581 0Z" fill="url(#pu2)" />
      <defs>
        <linearGradient id="pu1" x1="31.2652" y1="63.1324" x2="25.9731" y2="1.66354" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E9D276" /><stop offset="1" stopColor="#A18B2F" />
        </linearGradient>
        <linearGradient id="pu2" x1="41.0615" y1="51.6907" x2="35.9859" y2="2.58582" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9F9FA2" /><stop offset="1" stopColor="#D7D7D7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepBar({ step }: { step: 1 | 2 | 3 }) {
  const steps = ['Connect Wallet', 'Pay $U', 'Ship To'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 40 }}>
      {steps.map((label, i) => {
        const n = i + 1;
        const done = step > n;
        const active = step === n;
        return (
          <div key={n} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700,
                background: done ? GOLD : active ? `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` : '#E8E8E4',
                color: done || active ? '#fff' : MUTED,
                transition: 'all 0.25s',
              }}>
                {done ? (
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : n}
              </div>
              <span style={{ fontSize: 10, color: active ? GOLD : MUTED, fontWeight: active ? 700 : 400, letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: 60, height: 1, background: step > n ? GOLD : '#E0E0DC', margin: '0 4px', marginBottom: 20, transition: 'background 0.25s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Copy button ──────────────────────────────────────────────────────────────
function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button onClick={copy} style={{
      padding: '7px 14px', borderRadius: 8, border: `1.5px solid ${copied ? GOLD : '#E0E0DC'}`,
      background: copied ? 'rgba(233,210,118,0.12)' : '#fff',
      fontSize: 12, fontWeight: 600, color: copied ? GOLD : MUTED, cursor: 'pointer',
      transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 5,
    }}>
      {copied ? (
        <><svg width={12} height={12} viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={GOLD} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></svg> Copied</>
      ) : (
        <><svg width={12} height={12} viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke={MUTED} strokeWidth={2} /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke={MUTED} strokeWidth={2} /></svg>{label}</>
      )}
    </button>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, name, value, onChange, placeholder, required = false, readOnly = false }: {
  label: string; name: string; value: string; onChange?: (v: string) => void;
  placeholder?: string; required?: boolean; readOnly?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>
        {label}{required && <span style={{ color: GOLD, marginLeft: 3 }}>*</span>}
      </label>
      <input
        type="text" name={name} value={value} placeholder={placeholder} required={required}
        readOnly={readOnly}
        onChange={e => onChange?.(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          padding: '11px 14px', borderRadius: 10, fontSize: 14, color: TEXT, fontFamily: 'inherit',
          border: `1.5px solid ${focused ? GOLD : '#E0E0DC'}`,
          background: readOnly ? '#F7F5F0' : focused ? '#FFFDF5' : '#fff',
          outline: 'none', transition: 'border-color 0.15s, background 0.15s',
          cursor: readOnly ? 'default' : 'text',
        }}
      />
    </div>
  );
}

// ─── Address shortener ────────────────────────────────────────────────────────
const short = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

// ─── Step 1: Connect Wallet ───────────────────────────────────────────────────
function Step1({ onConnected }: { onConnected: () => void }) {
  const { connect, connectors, isPending } = useConnect();
  const { isConnected, address } = useAccount();

  useEffect(() => { if (isConnected) onConnected(); }, [isConnected, onConnected]);

  const connector = connectors[0]; // injected (MetaMask)

  return (
    <div style={{ textAlign: 'center', padding: '20px 0 40px' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
        <svg width={32} height={32} viewBox="0 0 24 24" fill="none">
          <rect x="2" y="6" width="20" height="14" rx="2" stroke="#fff" strokeWidth={2} />
          <path d="M16 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" fill="#fff" />
          <path d="M2 10h20" stroke="#fff" strokeWidth={2} />
        </svg>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 10 }}>Connect Your Wallet</h2>
      <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.65, maxWidth: 340, margin: '0 auto 32px' }}>
        Connect a BNB Chain–compatible wallet (e.g. MetaMask) to pay with $U and place your order.
      </p>
      {isConnected && address ? (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 50, background: 'rgba(233,210,118,0.12)', border: `1px solid ${GOLD_DIM}` }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{short(address)}</span>
        </div>
      ) : (
        <button
          onClick={() => connect({ connector })}
          disabled={isPending}
          style={{
            padding: '14px 36px', borderRadius: 50, border: 'none', cursor: isPending ? 'not-allowed' : 'pointer',
            background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`,
            color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: 0.3,
            boxShadow: `0 4px 20px rgba(161,139,47,0.35)`,
          }}
        >
          {isPending ? 'Connecting…' : 'Connect Wallet'}
        </button>
      )}
      <p style={{ fontSize: 12, color: MUTED, marginTop: 20 }}>
        Only BNB Chain (BSC) is supported. Switch your wallet to the correct network if prompted.
      </p>
    </div>
  );
}


// ─── Step 2: Pay $U ───────────────────────────────────────────────────────────
function Step2({ onPaid }: { onPaid: (txHash: string, country: string) => void }) {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [showSwap, setShowSwap] = useState(false);
  const [regionCode, setRegionCode] = useState<RegionCode | ''>('');

  const region = REGION_PRICES.find(r => r.code === regionCode) ?? null;
  const priceUsd = region?.priceUsd ?? 0;
  const amountU = region ? BigInt(Math.round(priceUsd * 1e18)) : BigInt(0);

  // Read $U balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: U_CONTRACT,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address!],
    query: { enabled: !!address },
  });

  const { writeContract, data: txHash, isPending: isSigning, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isSuccess && txHash) {
      const countryLabel = regionCode === 'OTHER' ? '' : (region?.label ?? '');
      onPaid(txHash, countryLabel);
    }
  }, [isSuccess, txHash, onPaid, region, regionCode]);

  const balanceU = balance ? Number(balance) / 1e18 : null;
  const hasEnough = balanceU !== null && region !== null && balanceU >= priceUsd;
  const isTreasurySet = TREASURY !== '0x0000000000000000000000000000000000000000';

  function pay() {
    writeContract({
      address: U_CONTRACT,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [TREASURY, amountU],
    });
  }

  return (
    <div style={{ padding: '10px 0 20px' }}>
      {/* Wallet badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 50, background: 'rgba(233,210,118,0.08)', border: `1px solid ${GOLD_DIM}` }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E' }} />
          <span style={{ fontSize: 12, color: TEXT, fontWeight: 600 }}>{address ? short(address) : ''}</span>
          <button onClick={() => disconnect()} style={{ background: 'none', border: 'none', color: MUTED, fontSize: 11, cursor: 'pointer', padding: 0 }}>disconnect</button>
        </div>
      </div>

      {/* Shipping region selector */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: 0.8, textTransform: 'uppercase' as const, marginBottom: 8, textAlign: 'center' }}>
          Where are you shipping to?
        </div>
        <select
          value={regionCode}
          onChange={e => setRegionCode(e.target.value as RegionCode | '')}
          style={{
            display: 'block', width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, color: regionCode ? TEXT : MUTED,
            border: `1.5px solid ${regionCode ? GOLD : '#E0E0DC'}`, background: '#fff', outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
          }}
        >
          <option value="">Select your country…</option>
          {REGION_PRICES.map(r => (
            <option key={r.code} value={r.code}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* Amount + balance card */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 16 }}>Pay with $U</h2>
        <div style={{ display: 'inline-block', background: '#fff', border: `1px solid ${GOLD_DIM}`, borderRadius: 16, padding: '20px 36px' }}>
          <div style={{ fontSize: 11, color: MUTED, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 8 }}>Amount Due</div>
          {region ? (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, justifyContent: 'center' }}>
                <span style={{ fontSize: 42, fontWeight: 900, letterSpacing: -2, color: TEXT }}>{priceUsd.toFixed(2)}</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: GOLD }}>$U</span>
              </div>
              <div style={{ fontSize: 11, color: '#22C55E', fontWeight: 600, marginTop: 6 }}>
                ✓ This is the lowest price at your region
              </div>
            </>
          ) : (
            <div style={{ fontSize: 15, color: MUTED, padding: '8px 0' }}>Select a region above</div>
          )}
          {balanceU !== null && region !== null && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${GOLD_DIM}`, fontSize: 12, color: hasEnough ? '#16A34A' : '#DC2626' }}>
              Your $U balance: <strong>{balanceU.toFixed(2)}</strong> {hasEnough ? '✓ sufficient' : `— need ${(priceUsd - balanceU).toFixed(2)} more`}
            </div>
          )}
        </div>
      </div>

      {/* Insufficient balance — show swap option */}
      {balanceU !== null && !hasEnough && region !== null && (
        <div style={{ marginBottom: 20 }}>
          {!showSwap ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: MUTED, marginBottom: 12 }}>
                Don&apos;t have enough $U? Swap any token directly below.
              </p>
              <button
                onClick={() => setShowSwap(true)}
                style={{ padding: '10px 24px', borderRadius: 50, border: `1.5px solid ${GOLD}`, background: 'rgba(233,210,118,0.08)', color: GOLD, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                Swap to $U via PancakeSwap ↓
              </button>
            </div>
          ) : (
            <SwapWidget
              amountU={amountU}
              onSwapped={() => { refetchBalance(); setShowSwap(false); }}
              onCancel={() => setShowSwap(false)}
            />
          )}
        </div>
      )}

      {/* Treasury not set warning */}
      {!isTreasurySet && (
        <div style={{ padding: '12px 16px', borderRadius: 10, background: '#FEF9C3', border: '1px solid #FDE047', fontSize: 13, color: '#854D0E', marginBottom: 16, textAlign: 'center' }}>
          Treasury address not configured yet. Payment unavailable until set up.
        </div>
      )}

      {writeError && (
        <div style={{ padding: '12px 16px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', fontSize: 13, color: '#DC2626', marginBottom: 16 }}>
          {writeError.message.split('\n')[0]}
        </div>
      )}

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={pay}
          disabled={!isTreasurySet || !hasEnough || !region || isSigning || isConfirming}
          style={{
            padding: '14px 40px', borderRadius: 50, border: 'none',
            cursor: (!isTreasurySet || !hasEnough || !region || isSigning || isConfirming) ? 'not-allowed' : 'pointer',
            background: (!isTreasurySet || !hasEnough || !region) ? '#D1D5DB' : `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`,
            color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: 0.3,
            boxShadow: (!isTreasurySet || !hasEnough || !region) ? 'none' : `0 4px 20px rgba(161,139,47,0.35)`,
          }}
        >
          {isSigning ? 'Waiting for wallet…' : isConfirming ? 'Confirming on-chain…' : region ? `Pay ${priceUsd.toFixed(2)} $U` : 'Select region to continue'}
        </button>
        <p style={{ fontSize: 12, color: MUTED, maxWidth: 360, margin: '12px auto 0' }}>
          Your wallet will prompt you to approve a $U transfer to the United Stables treasury.
        </p>
      </div>
    </div>
  );
}

// ─── Step 2b: Tx Hash display (after payment) ─────────────────────────────────
function TxHashDisplay({ txHash, onContinue }: { txHash: string; onContinue: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '20px 0 40px' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
        <svg width={32} height={32} viewBox="0 0 24 24" fill="none">
          <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 10 }}>Payment Confirmed</h2>
      <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.65, maxWidth: 340, margin: '0 auto 28px' }}>
        Your $U has been sent. <strong>Save your transaction hash</strong> — you&apos;ll need it to track your order.
      </p>

      {/* Warning banner */}
      <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 12, padding: '14px 20px', maxWidth: 480, margin: '0 auto 24px', display: 'flex', gap: 12, alignItems: 'flex-start', textAlign: 'left' }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>⚠</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#92400E', marginBottom: 4 }}>Save this hash now</div>
          <div style={{ fontSize: 12, color: '#92400E', lineHeight: 1.5 }}>This is the only way to track your order status later. We do not store it on your behalf until you complete the next step.</div>
        </div>
      </div>

      {/* Hash display */}
      <div style={{ background: '#fff', border: `1.5px solid ${GOLD_DIM}`, borderRadius: 14, padding: '16px 20px', maxWidth: 480, margin: '0 auto 20px' }}>
        <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 10 }}>Transaction Hash</div>
        <div style={{ fontFamily: 'monospace', fontSize: 13, color: TEXT, wordBreak: 'break-all', marginBottom: 14, lineHeight: 1.6 }}>{txHash}</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <CopyButton text={txHash} label="Copy Hash" />
          <a
            href={bscscanTx(txHash)}
            target="_blank" rel="noreferrer"
            style={{ padding: '7px 14px', borderRadius: 8, border: '1.5px solid #E0E0DC', background: '#fff', fontSize: 12, fontWeight: 600, color: MUTED, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}
          >
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke={MUTED} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
            BscScan
          </a>
        </div>
      </div>

      <button
        onClick={onContinue}
        style={{
          padding: '13px 36px', borderRadius: 50, border: 'none', cursor: 'pointer',
          background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`,
          color: '#fff', fontSize: 14, fontWeight: 700, letterSpacing: 0.3,
          boxShadow: `0 4px 20px rgba(161,139,47,0.35)`,
        }}
      >
        I&apos;ve saved it — Enter Shipping Address →
      </button>
    </div>
  );
}

// ─── Step 3: Shipping address form ────────────────────────────────────────────
function Step3({ txHash, initialCountry }: { txHash: string; initialCountry: string }) {
  const { address } = useAccount();
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '',
    address_line1: '', address_line2: '',
    city: '', state_province: '', postal_code: '', country: initialCountry, notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof form) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (isRestricted(form.country)) {
      setError("We're unable to fulfill orders to your shipping region at this time.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/freedomofmoney/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tx_hash: txHash, wallet_address: address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
          <svg width={34} height={34} viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -1, marginBottom: 12 }}>Order Placed</h2>
        <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7, maxWidth: 380, margin: '0 auto 28px' }}>
          We&apos;ve received your address and will order your copy of <em>Freedom of Money</em> from Amazon shortly.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/freedomofmoney/track" style={{ padding: '12px 24px', borderRadius: 50, background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: `0 4px 16px rgba(161,139,47,0.3)` }}>
            Track Your Order →
          </Link>
          <Link href="/freedomofmoney" style={{ padding: '12px 24px', borderRadius: 50, border: `1.5px solid ${GOLD_DIM}`, color: GOLD, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            ← Campaign Page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Tx hash read-only summary */}
      <div style={{ background: 'rgba(233,210,118,0.06)', border: `1px solid ${GOLD_DIM}`, borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, color: GOLD, letterSpacing: 1, textTransform: 'uppercase' as const, fontWeight: 600, marginBottom: 3 }}>Payment verified</div>
          <div style={{ fontFamily: 'monospace', fontSize: 11, color: MUTED }}>{txHash.slice(0, 18)}…{txHash.slice(-6)}</div>
        </div>
        <CopyButton text={txHash} />
      </div>

      {/* Contact */}
      <div>
        <div style={{ fontSize: 11, color: GOLD, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 12 }}>Contact</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Full Name" name="full_name" value={form.full_name} onChange={set('full_name')} placeholder="Satoshi Nakamoto" required />
          <Field label="Email" name="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
        </div>
      </div>

      {/* Address */}
      <div style={{ borderTop: '1px solid #F0EDE8', paddingTop: 18 }}>
        <div style={{ fontSize: 11, color: GOLD, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 12 }}>Shipping Address</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="Address Line 1" name="address_line1" value={form.address_line1} onChange={set('address_line1')} placeholder="123 Blockchain Ave" required />
          <Field label="Address Line 2" name="address_line2" value={form.address_line2} onChange={set('address_line2')} placeholder="Apt, suite, floor (optional)" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="City" name="city" value={form.city} onChange={set('city')} placeholder="London" required />
            <Field label="State / Province" name="state_province" value={form.state_province} onChange={set('state_province')} placeholder="England" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Postal Code" name="postal_code" value={form.postal_code} onChange={set('postal_code')} placeholder="SW1A 1AA" required />
            <Field label="Country" name="country" value={form.country} onChange={set('country')} placeholder="United Kingdom" required />
          </div>
        </div>
      </div>

      {/* Wallet (read-only) */}
      {address && (
        <div style={{ borderTop: '1px solid #F0EDE8', paddingTop: 18 }}>
          <div style={{ fontSize: 11, color: GOLD, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 12 }}>Wallet</div>
          <Field label="Connected Wallet Address" name="wallet" value={address} readOnly />
        </div>
      )}

      {/* Notes */}
      <div style={{ borderTop: '1px solid #F0EDE8', paddingTop: 18 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: TEXT, display: 'block', marginBottom: 6 }}>Notes (optional)</label>
        <textarea
          value={form.notes} onChange={e => set('notes')(e.target.value)}
          placeholder="Anything we should know for delivery…" rows={2}
          style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E0E0DC', background: '#fff', fontSize: 14, color: TEXT, outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
          onFocus={e => { e.target.style.borderColor = GOLD; e.target.style.background = '#FFFDF5'; }}
          onBlur={e => { e.target.style.borderColor = '#E0E0DC'; e.target.style.background = '#fff'; }}
        />
      </div>

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', fontSize: 13, color: '#DC2626' }}>
          {error}
        </div>
      )}

      <button
        type="submit" disabled={loading}
        style={{
          padding: '15px', borderRadius: 50, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          background: loading ? '#C8BA6A' : `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`,
          color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: 0.3,
          boxShadow: loading ? 'none' : `0 4px 20px rgba(161,139,47,0.35)`,
        }}
      >
        {loading ? 'Submitting…' : 'Confirm Order →'}
      </button>
    </form>
  );
}

// ─── Inner page (uses wagmi hooks) ────────────────────────────────────────────
function PurchaseInner() {
  const { isConnected } = useAccount();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [txHash, setTxHash] = useState('');
  const [shippingCountry, setShippingCountry] = useState('');
  const [showTxDisplay, setShowTxDisplay] = useState(false);

  // Sync step with wallet connection state
  useEffect(() => {
    if (!isConnected && step > 1) setStep(1);
  }, [isConnected, step]);

  function handlePaid(hash: string, country: string) {
    setTxHash(hash);
    setShippingCountry(country);
    setShowTxDisplay(true);
  }

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '40px 24px 80px' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 50, border: `1px solid ${GOLD_DIM}`, background: 'rgba(233,210,118,0.08)', marginBottom: 16 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD, display: 'inline-block' }} />
          <span style={{ fontSize: 11, color: GOLD, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' as const }}>Freedom of Money</span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -1, margin: '0 0 6px' }}>Order Your Copy</h1>
        <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>Pay with $U · Get a physical book · Proceeds to charity</p>
      </div>

      <StepBar step={step} />

      <div style={{ background: '#fff', border: `1px solid ${GOLD_DIM}`, borderRadius: 20, padding: '32px 28px' }}>
        {step === 1 && <Step1 onConnected={() => setStep(2)} />}
        {step === 2 && !showTxDisplay && <Step2 onPaid={handlePaid} />}
        {step === 2 && showTxDisplay && <TxHashDisplay txHash={txHash} onContinue={() => setStep(3)} />}
        {step === 3 && <Step3 txHash={txHash} initialCountry={shippingCountry} />}
      </div>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Link href="/freedomofmoney" style={{ fontSize: 12, color: MUTED, textDecoration: 'none' }}>← Back to Campaign</Link>
      </div>
    </div>
  );
}

// ─── Page (providers wrapper) ─────────────────────────────────────────────────
export default function PurchasePage() {
  return (
    <>
      <style>{`* { box-sizing: border-box; } body { margin: 0; }`}</style>
      <div style={{ background: BG, minHeight: '100vh', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: TEXT }}>
        <nav style={{ position: 'sticky', top: 0, zIndex: 100, padding: '16px 24px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(250,250,248,0.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 50, padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 20, maxWidth: 600, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              <ULogo size={22} />
              <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>United Stables</span>
            </div>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <Link href="/freedomofmoney" style={{ fontSize: 12, color: MUTED, textDecoration: 'none' }}>← Campaign</Link>
              <span style={{ fontSize: 12, color: GOLD, fontWeight: 600 }}>Order</span>
            </div>
          </div>
        </nav>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <PurchaseInner />
          </QueryClientProvider>
        </WagmiProvider>
      </div>
    </>
  );
}
