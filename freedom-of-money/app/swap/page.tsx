'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import Link from 'next/link';
import {
  WagmiProvider, useAccount, useConnect, useDisconnect,
  useChainId, useSwitchChain, useBalance,
  useSendTransaction, useWaitForTransactionReceipt,
  useReadContract, useWriteContract,
} from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '../lib/wagmi-config';
import { U_CONTRACT, ERC20_ABI } from '../lib/constants';

// ─── Constants ────────────────────────────────────────────────────────────────
const BSC_CHAIN_ID = 56;
const USDT_BSC    = '0x55d398326f99059fF775485246999027B3197955' as const;
const USDC_BSC    = '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d' as const;
const NATIVE_BNB  = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' as const;
const PARASWAP_PROXY = '0x216b4b4ba9f3e719726886d34a177484278bfcae' as `0x${string}`;

const APPROVE_ABI = [
  { name: 'approve', type: 'function', stateMutability: 'nonpayable' as const,
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }] },
  { name: 'allowance', type: 'function', stateMutability: 'view' as const,
    inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }] },
] as const;

type Token = { symbol: string; address: `0x${string}`; decimals: number; isNative?: boolean; color: string };
const TOKENS: Token[] = [
  { symbol: 'USDT', address: USDT_BSC,   decimals: 18, color: '#26A17B' },
  { symbol: 'USDC', address: USDC_BSC,   decimals: 18, color: '#2775CA' },
  { symbol: 'BNB',  address: NATIVE_BNB, decimals: 18, isNative: true, color: '#F3BA2F' },
];

const GOLD       = '#A18B2F';
const GOLD_LIGHT = '#E9D276';
const GOLD_DIM   = 'rgba(161,139,47,0.18)';
const BG         = '#FAFAF8';
const TEXT       = '#1A1A1A';
const MUTED      = '#6B6B6B';
const LINE       = '#EDE9DF';
const SOFT       = '#FAFAF5';

const queryClient = new QueryClient();

type Step = 'idle' | 'quoting' | 'approve' | 'approving' | 'building' | 'ready' | 'swapping' | 'done' | 'error';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
const fmtUnits = (v: bigint, decimals: number, digits: number) =>
  (Number(v) / 10 ** decimals).toFixed(digits);

function friendlyError(msg: string): string {
  const low = msg.toLowerCase();
  if (low.includes('user rejected') || low.includes('user denied')) return 'You cancelled the transaction in your wallet.';
  if (low.includes('insufficient funds')) return "Not enough balance to cover gas + the amount.";
  if (low.includes('slippage')) return 'Price moved too much. Try again in a moment.';
  if (low.includes('timeout')) return 'Network is slow — check BscScan and retry if needed.';
  if (low.length > 180) return msg.split('\n')[0].slice(0, 180) + '…';
  return msg.split('\n')[0];
}

// ─── UI atoms ─────────────────────────────────────────────────────────────────
function ULogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={Math.round(size * 64 / 58)} viewBox="0 0 58 64" fill="none">
      <path d="M37.5659 55.4667C26.4385 55.4667 17.3414 46.08 17.3414 35.1289V1.42222C17.3414 0.64 16.6911 0 15.8963 0H1.44512C0.650304 0 0 0.64 0 1.42222V35.0151C0 50.7591 13.0856 64.0924 29.0758 64C44.6109 63.9076 57.2268 51.7547 57.7759 36.5796C57.234 47.104 48.3899 55.4667 37.5659 55.4667Z" fill="url(#sw-g1)" />
      <path d="M56.3581 0H41.9069C41.1121 0 40.4618 0.64 40.4618 1.42222V35.2356C40.4618 41.3653 35.6784 46.6347 29.4572 46.9191C22.8169 47.2249 17.3398 42.0196 17.3398 35.5556C17.3398 46.5493 26.4007 55.4667 37.5715 55.4667C48.7423 55.4667 57.2324 47.104 57.7743 36.5796C57.7888 36.2382 57.8032 35.8969 57.8032 35.5556V1.42222C57.8032 0.64 57.1529 0 56.3581 0Z" fill="url(#sw-g2)" />
      <defs>
        <linearGradient id="sw-g1" x1="31" y1="63" x2="26" y2="2" gradientUnits="userSpaceOnUse"><stop stopColor="#E9D276" /><stop offset="1" stopColor="#A18B2F" /></linearGradient>
        <linearGradient id="sw-g2" x1="41" y1="52" x2="36" y2="3" gradientUnits="userSpaceOnUse"><stop stopColor="#9F9FA2" /><stop offset="1" stopColor="#D7D7D7" /></linearGradient>
      </defs>
    </svg>
  );
}

function Spinner({ color = '#fff' }: { color?: string }) {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" aria-hidden style={{ verticalAlign: 'text-bottom', marginRight: 6 }}>
      <circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth={3} opacity={0.25} />
      <path d="M22 12a10 10 0 0 1-10 10" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function TokenGlyph({ token, size = 28 }: { token: Token; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: token.color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 800, letterSpacing: -0.5, flexShrink: 0,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    }}>
      {token.symbol[0]}
    </div>
  );
}

// ─── Swap core ────────────────────────────────────────────────────────────────
function SwapCore() {
  const chainId = useChainId();
  const { switchChain, isPending: switching } = useSwitchChain();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  const [selectedToken, setSelectedToken] = useState(0);
  const [destAmountStr, setDestAmountStr] = useState('22');
  const [step, setStep] = useState<Step>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [quote, setQuote] = useState<{ srcAmount: bigint; destAmount: bigint; priceRoute: unknown } | null>(null);
  const [swapTx, setSwapTx] = useState<{ to: string; data: string; value: string } | null>(null);
  const [lastSwapHash, setLastSwapHash] = useState<`0x${string}` | null>(null);

  const token = TOKENS[selectedToken];
  const isBSC = chainId === BSC_CHAIN_ID;
  const destAmountNum = Number(destAmountStr) || 0;
  const destAmountBig = BigInt(Math.floor(Math.max(0, destAmountNum) * 1e6)) * BigInt(1e12);

  // $U balance
  const { data: uBalance, refetch: refetchUBalance } = useReadContract({
    address: U_CONTRACT, abi: ERC20_ABI, functionName: 'balanceOf',
    args: [address!], query: { enabled: !!address },
  });
  // Source balance (ERC20 vs native)
  const { data: tokenBalance } = useReadContract({
    address: token.address, abi: ERC20_ABI, functionName: 'balanceOf',
    args: [address!], query: { enabled: !!address && isBSC && !token.isNative },
  });
  const { data: nativeBalance } = useBalance({
    address: address as `0x${string}` | undefined,
    query: { enabled: !!address && isBSC && token.isNative },
  });
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: token.address, abi: APPROVE_ABI, functionName: 'allowance',
    args: [address!, PARASWAP_PROXY],
    query: { enabled: !!address && isBSC && !token.isNative },
  });

  const currentBalance = token.isNative ? (nativeBalance?.value ?? BigInt(0)) : (tokenBalance ?? BigInt(0));

  const { writeContract: writeApprove, data: approveTxHash, isPending: approving } = useWriteContract();
  const { isSuccess: approveConfirmed } = useWaitForTransactionReceipt({ hash: approveTxHash });

  const { sendTransaction, data: swapTxHash, isPending: sendingSwap, error: swapSendError } = useSendTransaction();
  const { isSuccess: swapConfirmed } = useWaitForTransactionReceipt({ hash: swapTxHash });

  const reset = useCallback(() => {
    setStep('idle'); setErrorMsg(''); setQuote(null); setSwapTx(null);
  }, []);

  // Reset quote when inputs change (reset is stable via useCallback)
  useEffect(() => { reset(); }, [selectedToken, destAmountStr, reset]);

  // After approve confirms -> build
  useEffect(() => {
    if (approveConfirmed && step === 'approving' && quote) {
      refetchAllowance();
      buildTxFor(quote);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approveConfirmed]);

  // After swap confirms
  useEffect(() => {
    if (swapConfirmed && swapTxHash && lastSwapHash !== swapTxHash) {
      setLastSwapHash(swapTxHash);
      setStep('done');
      refetchUBalance();
    }
  }, [swapConfirmed, swapTxHash, lastSwapHash, refetchUBalance]);

  useEffect(() => {
    if (swapSendError && step === 'swapping') {
      setErrorMsg(friendlyError(swapSendError.message));
      setStep('error');
    }
  }, [swapSendError, step]);

  async function fetchQuote() {
    if (!address || destAmountNum < 1) return;
    setStep('quoting');
    setErrorMsg('');
    try {
      const params = new URLSearchParams({
        srcToken: token.address, destToken: U_CONTRACT,
        amount: destAmountBig.toString(),
        srcDecimals: String(token.decimals), destDecimals: '18',
        network: '56', side: 'BUY',
      });
      const res = await fetch(`https://apiv5.paraswap.io/prices?${params}`);
      const data = await res.json();
      if (data.error) throw new Error(typeof data.error === 'string' ? data.error : 'Quote failed');
      if (!data.priceRoute) throw new Error('No route found. Try a different token.');

      const srcAmount  = BigInt(data.priceRoute.srcAmount);
      const destAmount = BigInt(data.priceRoute.destAmount);
      const q = { srcAmount, destAmount, priceRoute: data.priceRoute };
      setQuote(q);

      if (currentBalance < srcAmount) {
        throw new Error(`Not enough ${token.symbol}. Need ~${fmtUnits(srcAmount, token.decimals, token.isNative ? 5 : 2)}.`);
      }
      if (!token.isNative && (allowance ?? BigInt(0)) < srcAmount) {
        setStep('approve'); return;
      }
      await buildTxFor(q);
    } catch (e) {
      setErrorMsg(e instanceof Error ? friendlyError(e.message) : 'Quote failed');
      setStep('error');
    }
  }

  function handleApprove() {
    if (!quote || token.isNative) return;
    setStep('approving');
    const amt = (quote.srcAmount * BigInt(101)) / BigInt(100);
    writeApprove({ address: token.address, abi: APPROVE_ABI, functionName: 'approve', args: [PARASWAP_PROXY, amt] });
  }

  async function buildTxFor(q: { srcAmount: bigint; destAmount: bigint; priceRoute: unknown }) {
    setStep('building');
    try {
      const res = await fetch('https://apiv5.paraswap.io/transactions/56?ignoreChecks=true', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          srcToken: token.address, destToken: U_CONTRACT,
          srcAmount: q.srcAmount.toString(), destAmount: destAmountBig.toString(),
          slippage: 150, priceRoute: q.priceRoute, userAddress: address, txOrigin: address,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(typeof data.error === 'string' ? data.error : 'Build failed');
      setSwapTx({ to: data.to, data: data.data, value: data.value || '0' });
      setStep('ready');
    } catch (e) {
      setErrorMsg(e instanceof Error ? friendlyError(e.message) : 'Build failed');
      setStep('error');
    }
  }

  function handleSwap() {
    if (!swapTx) return;
    setStep('swapping');
    sendTransaction({
      to: swapTx.to as `0x${string}`,
      data: swapTx.data as `0x${string}`,
      value: BigInt(swapTx.value),
    });
  }

  // ── CTA state machine ──
  let ctaLabel: ReactNode;
  let ctaHandler: () => void = () => {};
  let ctaDisabled = false;
  let ctaVariant: 'primary' | 'subtle' = 'primary';

  const srcAmountDisplay = quote
    ? fmtUnits(quote.srcAmount, token.decimals, token.isNative ? 5 : 2)
    : '—';

  if (!isBSC) {
    ctaLabel   = switching ? <><Spinner /> Switching…</> : 'Switch to BNB Chain';
    ctaHandler = () => switchChain({ chainId: BSC_CHAIN_ID });
    ctaDisabled = switching;
  } else if (destAmountNum < 1) {
    ctaLabel = 'Enter an amount';
    ctaDisabled = true; ctaVariant = 'subtle';
  } else if (currentBalance === BigInt(0) && step === 'idle') {
    ctaLabel = `No ${token.symbol} in this wallet`;
    ctaDisabled = true; ctaVariant = 'subtle';
  } else if (step === 'idle') {
    ctaLabel = `Review swap`;
    ctaHandler = fetchQuote;
  } else if (step === 'quoting') {
    ctaLabel = <><Spinner /> Fetching best price…</>;
    ctaDisabled = true;
  } else if (step === 'approve') {
    ctaLabel = `Step 1 of 2 · Approve ${token.symbol}`;
    ctaHandler = handleApprove;
  } else if (step === 'approving') {
    ctaLabel = <><Spinner /> {approving ? 'Confirm in wallet…' : 'Waiting for approval…'}</>;
    ctaDisabled = true;
  } else if (step === 'building') {
    ctaLabel = <><Spinner /> Preparing swap…</>;
    ctaDisabled = true;
  } else if (step === 'ready') {
    ctaLabel = `Swap ${srcAmountDisplay} ${token.symbol} for ${destAmountNum} $U`;
    ctaHandler = handleSwap;
  } else if (step === 'swapping') {
    ctaLabel = <><Spinner /> {sendingSwap ? 'Confirm swap in wallet…' : 'Swapping on-chain…'}</>;
    ctaDisabled = true;
  } else if (step === 'done') {
    ctaLabel = 'Swap again';
    ctaHandler = reset; ctaVariant = 'subtle';
  } else if (step === 'error') {
    ctaLabel = 'Try again';
    ctaHandler = reset;
  }

  const uBalanceStr = uBalance !== undefined ? fmtUnits(uBalance as bigint, 18, 2) : '…';
  const tokenBalanceStr = token.isNative
    ? (nativeBalance ? fmtUnits(nativeBalance.value, 18, 5) : '…')
    : (tokenBalance !== undefined ? fmtUnits(tokenBalance as bigint, token.decimals, 2) : '…');

  const isBusy = step === 'quoting' || step === 'approving' || step === 'building' || step === 'swapping';

  // ── Render ──
  return (
    <div style={{ maxWidth: 440, margin: '0 auto', padding: '28px 20px 60px' }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 22 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px',
          borderRadius: 50, border: `1px solid ${GOLD_DIM}`, background: 'rgba(233,210,118,0.08)',
          marginBottom: 12,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD }} />
          <span style={{ fontSize: 11, color: GOLD, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' as const }}>Swap · BNB Chain</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, margin: '0 0 6px' }}>Get $U</h1>
        <p style={{ fontSize: 12, color: MUTED, margin: 0, lineHeight: 1.6 }}>
          Best price auto-routed via Paraswap.
        </p>
      </div>

      {/* Wallet pill */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', marginBottom: 10, borderRadius: 50,
        background: '#fff', border: `1px solid ${LINE}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: TEXT }}>
            {address ? short(address) : ''}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
            <span style={{ fontSize: 11, color: MUTED }}>$U</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: GOLD }}>{uBalanceStr}</span>
          </div>
          <button
            onClick={() => { if (confirm('Disconnect wallet?')) disconnect(); }}
            style={{ background: 'none', border: 'none', color: MUTED, fontSize: 11, cursor: 'pointer', padding: 0 }}
            aria-label="Disconnect"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ─── FROM card ─── */}
      <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 18, padding: '16px 18px 18px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 10, color: MUTED, letterSpacing: 1, textTransform: 'uppercase' as const, fontWeight: 600 }}>You pay</span>
          <span style={{ fontSize: 11, color: MUTED }}>
            Balance <span style={{ color: currentBalance >= (quote?.srcAmount ?? BigInt(0)) ? TEXT : '#DC2626', fontWeight: 700 }}>{tokenBalanceStr}</span>
          </span>
        </div>

        {/* Token tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {TOKENS.map((t, i) => (
            <button key={t.symbol}
              onClick={() => setSelectedToken(i)}
              disabled={isBusy}
              style={{
                flex: 1, padding: '9px 10px', borderRadius: 10,
                border: `1.5px solid ${selectedToken === i ? GOLD : LINE}`,
                background: selectedToken === i ? 'rgba(233,210,118,0.12)' : '#fff',
                color: selectedToken === i ? TEXT : MUTED,
                cursor: isBusy ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                fontSize: 13, fontWeight: 700, opacity: isBusy ? 0.6 : 1,
                transition: 'border-color 0.15s',
              }}>
              <TokenGlyph token={t} size={18} />
              {t.symbol}
            </button>
          ))}
        </div>

        {/* Amount row */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1.5, color: quote ? TEXT : '#B5B0A0', fontVariantNumeric: 'tabular-nums' as const, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {srcAmountDisplay}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 50, background: SOFT, flexShrink: 0 }}>
            <TokenGlyph token={token} size={20} />
            <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{token.symbol}</span>
          </div>
        </div>
        {!quote && (
          <p style={{ fontSize: 11, color: MUTED, margin: '6px 0 0' }}>Click &ldquo;Review swap&rdquo; to fetch the exact amount.</p>
        )}
      </div>

      {/* Arrow between cards */}
      <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 2, margin: '-12px 0' }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: '#fff', border: `1.5px solid ${LINE}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
        }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 5v14M6 13l6 6 6-6" stroke={MUTED} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* ─── TO card ─── */}
      <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 18, padding: '16px 18px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 10, color: MUTED, letterSpacing: 1, textTransform: 'uppercase' as const, fontWeight: 600 }}>You receive</span>
          <span style={{ fontSize: 11, color: MUTED }}>
            Balance <span style={{ color: GOLD, fontWeight: 700 }}>{uBalanceStr}</span>
          </span>
        </div>

        {/* Amount row — editable */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
          <input
            type="number" inputMode="decimal" min="1" step="1"
            value={destAmountStr}
            onChange={e => setDestAmountStr(e.target.value)}
            aria-label="Amount of $U to receive"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: 'inherit', fontSize: 34, fontWeight: 800, letterSpacing: -1.5,
              color: TEXT, padding: 0, minWidth: 0, fontVariantNumeric: 'tabular-nums' as const,
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 50, background: SOFT, flexShrink: 0 }}>
            <ULogo size={16} />
            <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>$U</span>
          </div>
        </div>

        {/* Presets */}
        <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
          {['22', '50', '100', '500'].map(v => (
            <button key={v}
              onClick={() => setDestAmountStr(v)}
              disabled={isBusy}
              style={{
                padding: '5px 11px', borderRadius: 50,
                border: `1px solid ${destAmountStr === v ? GOLD : LINE}`,
                background: destAmountStr === v ? 'rgba(233,210,118,0.12)' : '#fff',
                color: destAmountStr === v ? GOLD : MUTED,
                fontSize: 11, fontWeight: 700, cursor: isBusy ? 'not-allowed' : 'pointer',
                opacity: isBusy ? 0.6 : 1,
              }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Status feedback */}
      {step === 'error' && errorMsg && (
        <div style={{ marginTop: 14, padding: '11px 14px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', fontSize: 12, color: '#DC2626' }}>
          {errorMsg}
        </div>
      )}
      {step === 'done' && (
        <div style={{ marginTop: 14, padding: '11px 14px', borderRadius: 10, background: '#F0FDF4', border: '1px solid #BBF7D0', fontSize: 13, color: '#166534', fontWeight: 600, textAlign: 'center' }}>
          Swap complete · $U balance updated
        </div>
      )}

      {/* CTA */}
      <button
        onClick={ctaHandler}
        disabled={ctaDisabled}
        style={{
          marginTop: 14, width: '100%', padding: '15px', borderRadius: 50,
          border: ctaVariant === 'subtle' && !ctaDisabled ? `1.5px solid ${GOLD_DIM}` : '1.5px solid transparent',
          background: ctaDisabled
            ? '#E0DDD3'
            : ctaVariant === 'subtle'
              ? '#fff'
              : `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`,
          color: ctaDisabled ? MUTED : ctaVariant === 'subtle' ? GOLD : '#fff',
          fontSize: 15, fontWeight: 700, letterSpacing: 0.2,
          cursor: ctaDisabled ? 'not-allowed' : 'pointer',
          boxShadow: ctaDisabled || ctaVariant === 'subtle' ? 'none' : '0 6px 20px rgba(161,139,47,0.32)',
          transition: 'background 0.2s, box-shadow 0.2s',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4,
        }}
      >
        {ctaLabel}
      </button>

      {/* Route info */}
      <div style={{ fontSize: 10, color: '#A8A5A0', textAlign: 'center', marginTop: 12, lineHeight: 1.6 }}>
        Routed by <a href="https://www.paraswap.io" target="_blank" rel="noreferrer" style={{ color: GOLD, textDecoration: 'none' }}>Paraswap</a> across BNB Chain DEX liquidity · 1.5% slippage · No fees from United Stables.
      </div>
    </div>
  );
}

// ─── Connect screen ───────────────────────────────────────────────────────────
function ConnectGate() {
  const { connect, connectors, isPending } = useConnect();
  return (
    <div style={{ maxWidth: 440, margin: '0 auto', padding: '32px 20px 60px' }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px',
          borderRadius: 50, border: `1px solid ${GOLD_DIM}`, background: 'rgba(233,210,118,0.08)',
          marginBottom: 12,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD }} />
          <span style={{ fontSize: 11, color: GOLD, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' as const }}>Swap · BNB Chain</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, margin: '0 0 6px' }}>Get $U</h1>
        <p style={{ fontSize: 13, color: MUTED, margin: 0, lineHeight: 1.6 }}>
          Swap USDT, USDC or BNB into $U. Best price via Paraswap.
        </p>
      </div>
      <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 18, padding: '36px 24px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width={28} height={28} viewBox="0 0 24 24" fill="none">
            <rect x="2" y="6" width="20" height="14" rx="2" stroke="#fff" strokeWidth={2} />
            <path d="M2 10h20" stroke="#fff" strokeWidth={2} />
            <circle cx="17" cy="15" r="1.5" fill="#fff" />
          </svg>
        </div>
        <h2 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 6px' }}>Connect a wallet</h2>
        <p style={{ fontSize: 12, color: MUTED, margin: '0 0 20px', lineHeight: 1.6 }}>
          Any BNB Chain wallet (MetaMask, Trust, OKX, etc.) works.
        </p>
        <button
          onClick={() => connect({ connector: connectors[0] })}
          disabled={isPending || !connectors[0]}
          style={{
            padding: '13px 36px', borderRadius: 50, border: 'none',
            cursor: isPending ? 'not-allowed' : 'pointer',
            background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`,
            color: '#fff', fontSize: 14, fontWeight: 700,
            boxShadow: '0 6px 20px rgba(161,139,47,0.32)',
          }}
        >
          {isPending ? <><Spinner /> Connecting…</> : 'Connect Wallet'}
        </button>
      </div>
    </div>
  );
}

// ─── Router layer ─────────────────────────────────────────────────────────────
function SwapInner() {
  const { isConnected } = useAccount();
  return isConnected ? <SwapCore /> : <ConnectGate />;
}

export default function SwapPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      <style>{`* { box-sizing: border-box; } body { margin: 0; } input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; } input[type=number] { -moz-appearance: textfield; }`}</style>
      <div style={{ background: BG, minHeight: '100vh', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: TEXT }}>

        <nav style={{ position: 'sticky', top: 0, zIndex: 100, padding: '14px 20px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(250,250,248,0.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 50, padding: '9px 18px', display: 'flex', alignItems: 'center', gap: 14, maxWidth: 600, width: '100%' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none', flex: 1 }}>
              <ULogo size={20} />
              <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>United Stables</span>
            </Link>
            <Link href="/" style={{ fontSize: 12, color: MUTED, textDecoration: 'none' }}>← Campaign</Link>
            <span style={{ fontSize: 12, color: GOLD, fontWeight: 700 }}>Get $U</span>
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

        <div style={{ textAlign: 'center', padding: '12px 20px 40px' }}>
          <Link href="/" style={{ fontSize: 12, color: MUTED, textDecoration: 'none' }}>← Back to Campaign</Link>
        </div>
      </div>
    </>
  );
}
