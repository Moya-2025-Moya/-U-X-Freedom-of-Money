'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { WagmiProvider, useAccount, useConnect, useDisconnect, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '../lib/wagmi-config';
import { U_CONTRACT, TREASURY, BOOK_U_AMOUNT, ERC20_ABI, bscscanTx } from '../lib/constants';
import { SwapWidget } from '../lib/SwapWidget';

// ─── Restricted destinations ──────────────────────────────────────────────────
const RESTRICTED_PATTERNS = ['china', 'mainland china', 'prc', "people's republic of china", '中国', '中华人民共和国'];
function isRestricted(country: string) {
  return RESTRICTED_PATTERNS.includes(country.trim().toLowerCase());
}

// ─── Brand constants ──────────────────────────────────────────────────────────
const GOLD       = '#A18B2F';
const GOLD_LIGHT = '#E9D276';
const GOLD_DIM   = 'rgba(161,139,47,0.18)';
const BG         = '#FAFAF8';
const TEXT       = '#1A1A1A';
const MUTED      = '#6B6B6B';

// Fixed book price ($U is $1-pegged, book is priced at UK Amazon list)
const BOOK_USD = Number(BOOK_U_AMOUNT) / 1e18;

const queryClient = new QueryClient();

// ─── Types ────────────────────────────────────────────────────────────────────
interface ShippingForm {
  full_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  notes: string;
}

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
  const steps = ['Connect Wallet', 'Ship To', 'Pay $U'];
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
function Field({ label, name, value, onChange, placeholder, required = false, readOnly = false, autoComplete }: {
  label: string; name: string; value: string; onChange?: (v: string) => void;
  placeholder?: string; required?: boolean; readOnly?: boolean; autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>
        {label}{required && <span style={{ color: GOLD, marginLeft: 3 }}>*</span>}
      </label>
      <input
        type="text" name={name} value={value} placeholder={placeholder} required={required}
        readOnly={readOnly} autoComplete={autoComplete}
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

// ─── Country select ──────────────────────────────────────────────────────────
const COUNTRIES = [
  'Argentina', 'Australia', 'Austria', 'Belgium', 'Brazil',
  'Canada', 'Chile', 'Colombia', 'Denmark', 'Finland',
  'France', 'Germany', 'Hong Kong', 'India', 'Indonesia',
  'Ireland', 'Israel', 'Italy', 'Japan', 'Kenya',
  'Macau', 'Malaysia', 'Mexico', 'Netherlands', 'New Zealand',
  'Nigeria', 'Norway', 'Philippines', 'Portugal', 'Saudi Arabia',
  'Singapore', 'South Africa', 'South Korea', 'Spain', 'Sweden',
  'Switzerland', 'Taiwan', 'Thailand', 'Turkey', 'UAE',
  'United Kingdom', 'United States', 'Vietnam',
];

function CountrySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>
        Country<span style={{ color: GOLD, marginLeft: 3 }}>*</span>
      </label>
      <select
        name="country" value={value} required autoComplete="country-name"
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          padding: '11px 14px', borderRadius: 10, fontSize: 14, color: value ? TEXT : MUTED, fontFamily: 'inherit',
          border: `1.5px solid ${focused ? GOLD : '#E0E0DC'}`,
          background: focused ? '#FFFDF5' : '#fff',
          outline: 'none', transition: 'border-color 0.15s, background 0.15s',
          cursor: 'pointer', appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236B6B6B' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 14px center',
        }}
      >
        <option value="" disabled>Select country</option>
        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
    </div>
  );
}

const short = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

// ─── Step 1: Connect Wallet ───────────────────────────────────────────────────
function Step1({ onConnected }: { onConnected: () => void }) {
  const { connect, connectors, isPending } = useConnect();
  const { isConnected, address } = useAccount();

  useEffect(() => { if (isConnected) onConnected(); }, [isConnected, onConnected]);

  const connector = connectors[0];

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
        Connect a BNB Chain wallet (e.g. MetaMask) to pay with $U and place your order.
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
        Only BNB Chain (BSC) is supported.
      </p>
    </div>
  );
}

// ─── Step 2: Shipping address ─────────────────────────────────────────────────
function Step2({
  initial,
  onNext,
}: {
  initial: ShippingForm;
  onNext: (form: ShippingForm) => void;
}) {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [form, setForm] = useState<ShippingForm>(initial);
  const [error, setError] = useState('');

  const set = (k: keyof ShippingForm) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (isRestricted(form.country)) {
      setError("We're unable to fulfill orders to your shipping region at this time.");
      return;
    }

    const required: (keyof ShippingForm)[] = ['full_name', 'email', 'address_line1', 'city', 'postal_code', 'country'];
    for (const k of required) {
      if (!form[k].trim()) {
        setError(`${k.replace('_', ' ')} is required.`);
        return;
      }
    }

    onNext(form);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Wallet badge */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 50, background: 'rgba(233,210,118,0.08)', border: `1px solid ${GOLD_DIM}` }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E' }} />
          <span style={{ fontSize: 12, color: TEXT, fontWeight: 600 }}>{address ? short(address) : ''}</span>
          <button onClick={() => disconnect()} style={{ background: 'none', border: 'none', color: MUTED, fontSize: 11, cursor: 'pointer', padding: 0 }}>disconnect</button>
        </div>
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, margin: 0, textAlign: 'center' }}>Where should we ship?</h2>
      <p style={{ fontSize: 13, color: MUTED, margin: '0 0 4px', textAlign: 'center', lineHeight: 1.6 }}>
        Your country determines the Amazon marketplace we order from. Enter your address and we&apos;ll confirm the final price on the next step.
      </p>

      {/* Contact */}
      <div>
        <div style={{ fontSize: 11, color: GOLD, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 12 }}>Contact</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Full Name" name="full_name" value={form.full_name} onChange={set('full_name')} placeholder="Satoshi Nakamoto" required autoComplete="name" />
          <Field label="Email" name="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required autoComplete="email" />
        </div>
        <div style={{ marginTop: 12 }}>
          <Field label="Phone (optional)" name="phone" value={form.phone} onChange={set('phone')} placeholder="+1 555 000 0000" autoComplete="tel" />
        </div>
      </div>

      {/* Address */}
      <div style={{ borderTop: '1px solid #F0EDE8', paddingTop: 18 }}>
        <div style={{ fontSize: 11, color: GOLD, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 12 }}>Shipping Address</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="Address Line 1" name="address_line1" value={form.address_line1} onChange={set('address_line1')} placeholder="123 Blockchain Ave" required autoComplete="address-line1" />
          <Field label="Address Line 2" name="address_line2" value={form.address_line2} onChange={set('address_line2')} placeholder="Apt, suite, floor (optional)" autoComplete="address-line2" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="City" name="city" value={form.city} onChange={set('city')} placeholder="London" required autoComplete="address-level2" />
            <Field label="State / Province" name="state_province" value={form.state_province} onChange={set('state_province')} placeholder="England" autoComplete="address-level1" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Postal Code" name="postal_code" value={form.postal_code} onChange={set('postal_code')} placeholder="SW1A 1AA" required autoComplete="postal-code" />
            <CountrySelect value={form.country} onChange={set('country')} />
          </div>
        </div>
      </div>

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
        type="submit"
        style={{
          padding: '15px', borderRadius: 50, border: 'none', cursor: 'pointer',
          background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`,
          color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: 0.3,
          boxShadow: `0 4px 20px rgba(161,139,47,0.35)`,
        }}
      >
        Continue to Payment →
      </button>
    </form>
  );
}

// ─── Step 3: Pay $U ───────────────────────────────────────────────────────────
function Step3({
  form,
  onBack,
}: {
  form: ShippingForm;
  onBack: () => void;
}) {
  const { address } = useAccount();

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

  const [swapOpen, setSwapOpen] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [submitError, setSubmitError] = useState('');
  const [orderId, setOrderId] = useState('');

  const balanceU = balance !== undefined ? Number(balance) / 1e18 : null;
  const hasEnough = balanceU !== null && balanceU >= BOOK_USD;
  const shortfall = balanceU !== null ? Math.max(0, BOOK_USD - balanceU) : BOOK_USD;
  const shortfallBigInt = balanceU !== null && balance !== undefined
    ? (BOOK_U_AMOUNT > balance ? BOOK_U_AMOUNT - balance : BigInt(0))
    : BOOK_U_AMOUNT;

  // After on-chain confirmation, auto-submit order
  useEffect(() => {
    if (!isSuccess || !txHash || submitState !== 'idle') return;
    setSubmitState('submitting');

    fetch('/api/freedomofmoney/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        tx_hash: txHash,
        wallet_address: address,
      }),
    })
      .then(r => r.json().then(d => ({ ok: r.ok, data: d })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.error || 'Submission failed');
        setOrderId(data.id);
        setSubmitState('done');
      })
      .catch(err => {
        setSubmitError(err instanceof Error ? err.message : 'Something went wrong.');
        setSubmitState('error');
      });
  }, [isSuccess, txHash, submitState, form, address]);

  function pay() {
    writeContract({
      address: U_CONTRACT,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [TREASURY, BOOK_U_AMOUNT],
    });
  }

  // Success screen
  if (submitState === 'done' && txHash) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0 40px' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
          <svg width={34} height={34} viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -1, marginBottom: 12 }}>Order Placed</h2>
        <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7, maxWidth: 380, margin: '0 auto 20px' }}>
          Your payment is confirmed and your copy of <em>Freedom of Money</em> is on its way to {form.city}, {form.country}.
        </p>

        {/* Tx hash */}
        <div style={{ background: '#fff', border: `1.5px solid ${GOLD_DIM}`, borderRadius: 14, padding: '14px 18px', maxWidth: 480, margin: '0 auto 20px', textAlign: 'left' }}>
          <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 8 }}>Transaction Hash</div>
          <div style={{ fontFamily: 'monospace', fontSize: 12, color: TEXT, wordBreak: 'break-all', marginBottom: 10, lineHeight: 1.6 }}>{txHash}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <CopyButton text={txHash} label="Copy hash" />
            <a href={bscscanTx(txHash)} target="_blank" rel="noreferrer" style={{ padding: '7px 14px', borderRadius: 8, border: `1.5px solid ${GOLD_DIM}`, fontSize: 12, fontWeight: 600, color: GOLD, textDecoration: 'none' }}>
              BscScan ↗
            </a>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/freedomofmoney/track" style={{ padding: '12px 24px', borderRadius: 50, background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: `0 4px 16px rgba(161,139,47,0.3)` }}>
            Track Your Order →
          </Link>
          <Link href="/freedomofmoney" style={{ padding: '12px 24px', borderRadius: 50, border: `1.5px solid ${GOLD_DIM}`, color: GOLD, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            Back to Campaign
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Shipping summary */}
      <div style={{ background: '#F7F5F0', borderRadius: 14, padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: GOLD, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' as const }}>Shipping To</div>
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', fontSize: 12, color: MUTED, cursor: 'pointer', padding: 0, fontFamily: 'inherit', textDecoration: 'underline' }}
          >
            Edit
          </button>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 2 }}>{form.full_name}</div>
        <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
          {form.address_line1}{form.address_line2 ? `, ${form.address_line2}` : ''}<br />
          {form.city}{form.state_province ? `, ${form.state_province}` : ''} {form.postal_code}<br />
          <strong style={{ color: TEXT }}>{form.country}</strong>
        </div>
      </div>

      {/* Amount due */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, marginBottom: 14 }}>Pay with $U</h2>
        <div style={{ display: 'inline-block', background: '#fff', border: `1px solid ${GOLD_DIM}`, borderRadius: 16, padding: '18px 36px' }}>
          <div style={{ fontSize: 11, color: MUTED, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 8 }}>Amount Due</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, justifyContent: 'center' }}>
            <span style={{ fontSize: 42, fontWeight: 900, letterSpacing: -2, color: TEXT }}>{BOOK_USD.toFixed(2)}</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: GOLD }}>$U</span>
          </div>
          {balanceU !== null && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${GOLD_DIM}`, fontSize: 12, color: hasEnough ? '#16A34A' : '#DC2626' }}>
              Your $U balance: <strong>{balanceU.toFixed(2)}</strong>
              {hasEnough ? ' ✓ sufficient' : ` - need ${shortfall.toFixed(2)} more`}
            </div>
          )}
        </div>
        <p style={{ fontSize: 11, color: MUTED, marginTop: 10 }}>
          $U is pegged 1:1 to USD. Price based on Amazon listing for your region.
        </p>
      </div>

      {/* Swap widget - shown only when balance is insufficient */}
      {balanceU !== null && !hasEnough && (
        <div>
          <button
            onClick={() => setSwapOpen(o => !o)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '11px 16px',
              borderRadius: swapOpen ? '12px 12px 0 0' : 12,
              border: `1.5px solid ${GOLD_DIM}`,
              borderBottom: swapOpen ? 'none' : `1.5px solid ${GOLD_DIM}`,
              background: '#F7F5F0', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: TEXT }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" stroke={GOLD} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Need {shortfall.toFixed(2)} more $U? Swap via PancakeSwap
            </span>
            <span style={{ fontSize: 11, color: MUTED, fontFamily: 'inherit' }}>{swapOpen ? '▲ hide' : '▼ show'}</span>
          </button>
          {swapOpen && (
            <div style={{ border: `1.5px solid ${GOLD_DIM}`, borderTop: 'none', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
              <SwapWidget
                embedded
                onSwapped={() => { refetchBalance(); setSwapOpen(false); }}
                onCancel={() => setSwapOpen(false)}
                amountU={shortfallBigInt}
              />
            </div>
          )}
        </div>
      )}

      {/* Also allow swap when user has enough (collapsed by default) */}
      {(balanceU === null || hasEnough) && (
        <div>
          <button
            onClick={() => setSwapOpen(o => !o)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px', borderRadius: 12,
              border: `1.5px solid ${GOLD_DIM}`,
              background: '#F7F5F0', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <span style={{ fontSize: 12, color: MUTED }}>Need to swap tokens for $U?</span>
            <span style={{ fontSize: 11, color: MUTED }}>{swapOpen ? '▲ hide' : '▼ show'}</span>
          </button>
          {swapOpen && (
            <div style={{ border: `1.5px solid ${GOLD_DIM}`, borderTop: 'none', borderRadius: '0 0 12px 12px', overflow: 'hidden', marginTop: -1 }}>
              <SwapWidget
                embedded
                onSwapped={() => { refetchBalance(); setSwapOpen(false); }}
                onCancel={() => setSwapOpen(false)}
              />
            </div>
          )}
        </div>
      )}

      {writeError && (
        <div style={{ padding: '12px 16px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', fontSize: 13, color: '#DC2626' }}>
          {writeError.message.split('\n')[0]}
        </div>
      )}
      {submitState === 'error' && (
        <div style={{ padding: '12px 16px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', fontSize: 13, color: '#DC2626' }}>
          Order saved failed: {submitError} - your payment went through. Please contact support with your tx hash.
        </div>
      )}

      {/* Submitting overlay */}
      {submitState === 'submitting' && (
        <div style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(233,210,118,0.08)', border: `1px solid ${GOLD_DIM}`, fontSize: 13, color: TEXT, textAlign: 'center' }}>
          Payment confirmed. Saving your order…
        </div>
      )}

      {/* Pay button */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={pay}
          disabled={!hasEnough || isSigning || isConfirming || submitState === 'submitting'}
          style={{
            padding: '14px 40px', borderRadius: 50, border: 'none',
            cursor: (!hasEnough || isSigning || isConfirming) ? 'not-allowed' : 'pointer',
            background: !hasEnough ? '#D1D5DB' : `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`,
            color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: 0.3,
            boxShadow: !hasEnough ? 'none' : `0 4px 20px rgba(161,139,47,0.35)`,
          }}
        >
          {isSigning ? 'Waiting for wallet…'
            : isConfirming ? 'Confirming on-chain…'
            : submitState === 'submitting' ? 'Saving order…'
            : !hasEnough ? `Get ${shortfall.toFixed(2)} more $U first`
            : `Pay ${BOOK_USD.toFixed(2)} $U →`}
        </button>
        {hasEnough && (
          <p style={{ fontSize: 12, color: MUTED, maxWidth: 360, margin: '12px auto 0' }}>
            Your wallet will prompt you to approve a $U transfer to the United Stables treasury.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Inner page ───────────────────────────────────────────────────────────────
const EMPTY_FORM: ShippingForm = {
  full_name: '', email: '', phone: '',
  address_line1: '', address_line2: '',
  city: '', state_province: '', postal_code: '', country: '', notes: '',
};

function PurchaseInner() {
  const { isConnected } = useAccount();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<ShippingForm>(EMPTY_FORM);

  useEffect(() => {
    if (!isConnected && step > 1) setStep(1);
  }, [isConnected, step]);

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '40px 24px 80px' }}>

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
        {step === 2 && (
          <Step2
            initial={form}
            onNext={f => { setForm(f); setStep(3); }}
          />
        )}
        {step === 3 && (
          <Step3
            form={form}
            onBack={() => setStep(2)}
          />
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Link href="/freedomofmoney" style={{ fontSize: 12, color: MUTED, textDecoration: 'none' }}>← Back to Campaign</Link>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PurchasePage() {
  return (
    <>
      <style>{`* { box-sizing: border-box; } body { margin: 0; }`}</style>
      <div style={{ background: BG, minHeight: '100vh', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: TEXT }}>
        <nav style={{ position: 'sticky', top: 0, zIndex: 100, padding: '16px 24px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(250,250,248,0.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 50, padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 20, maxWidth: 600, width: '100%' }}>
            <a href="https://u.tech/" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, textDecoration: 'none' }}>
              <ULogo size={22} />
              <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>United Stables</span>
            </a>
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
