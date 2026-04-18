'use client';

import { useState, useEffect, useCallback } from 'react';
import { useChainId, useSwitchChain, useAccount, useSendTransaction, useWaitForTransactionReceipt, useReadContract, useWriteContract, useBalance } from 'wagmi';
import { U_CONTRACT, BOOK_U_AMOUNT, ERC20_ABI } from './constants';

const BSC_CHAIN_ID = 56;

const USDT_BSC = '0x55d398326f99059fF775485246999027B3197955' as const;
const USDC_BSC = '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d' as const;
// Native BNB sentinel used by aggregators (Paraswap, 1inch, etc.)
const NATIVE_BNB = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' as const;

const PARASWAP_PROXY = '0x216b4b4ba9f3e719726886d34a177484278bfcae' as `0x${string}`;

const APPROVE_ABI = [
  {
    name: 'approve', type: 'function', stateMutability: 'nonpayable' as const,
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance', type: 'function', stateMutability: 'view' as const,
    inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

type Token = { symbol: string; address: `0x${string}`; decimals: number; isNative?: boolean };

const TOKENS: Token[] = [
  { symbol: 'USDT', address: USDT_BSC, decimals: 18 },
  { symbol: 'USDC', address: USDC_BSC, decimals: 18 },
  { symbol: 'BNB',  address: NATIVE_BNB, decimals: 18, isNative: true },
];

const GOLD       = '#A18B2F';
const GOLD_LIGHT = '#E9D276';
const GOLD_DIM   = 'rgba(161,139,47,0.18)';
const MUTED      = '#6B6B6B';
const TEXT       = '#1A1A1A';

type Step = 'idle' | 'quoting' | 'approve' | 'approving' | 'building' | 'ready' | 'swapping' | 'done' | 'error';

export function SwapWidget({
  onSwapped,
  onCancel,
  amountU: customAmountU,
  embedded = false,
}: {
  onSwapped: () => void;
  onCancel: () => void;
  amountU?: bigint;
  embedded?: boolean;
}) {
  const chainId = useChainId();
  const { switchChain, isPending: switching } = useSwitchChain();
  const { address } = useAccount();

  const targetAmountU = customAmountU ?? BOOK_U_AMOUNT;
  const targetUsd     = (Number(targetAmountU) / 1e18).toFixed(2);

  const isBSC = chainId === BSC_CHAIN_ID;
  const [selectedToken, setSelectedToken] = useState(0);
  const [step, setStep]         = useState<Step>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [quoteOutput, setQuoteOutput] = useState('');
  const [quoteInputAmount, setQuoteInputAmount] = useState<bigint | null>(null);
  const [priceRoute, setPriceRoute]   = useState<unknown>(null);
  const [swapTxData, setSwapTxData]   = useState<{ to: string; data: string; value: string } | null>(null);
  const [lastSwapHash, setLastSwapHash] = useState<`0x${string}` | null>(null);

  const token = TOKENS[selectedToken];

  // Estimate input: for stables 1% buffer; for BNB we re-price on quote
  const inputEstimate = token.isNative
    // Rough fallback — real amount comes from quote API (reverse-quote)
    ? BigInt(Math.ceil(Number(targetAmountU) / 600)) // ~$600/BNB est; widget will refine via quote
    : BigInt(Math.ceil(Number(targetAmountU) * 1.01));

  const decDiv = BigInt(10) ** BigInt(token.decimals);
  const inputUsd = quoteInputAmount !== null
    ? (Number(quoteInputAmount) / Number(decDiv)).toFixed(token.isNative ? 5 : 2)
    : (Number(inputEstimate) / Number(decDiv)).toFixed(token.isNative ? 5 : 2);

  // ERC-20 allowance (skipped for native BNB)
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: token.address, abi: APPROVE_ABI, functionName: 'allowance',
    args: [address!, PARASWAP_PROXY],
    query: { enabled: !!address && isBSC && !token.isNative },
  });

  // ERC-20 balance
  const { data: tokenBalance } = useReadContract({
    address: token.address, abi: ERC20_ABI, functionName: 'balanceOf',
    args: [address!],
    query: { enabled: !!address && isBSC && !token.isNative },
  });

  // Native BNB balance
  const { data: nativeBalance } = useBalance({
    address: address as `0x${string}` | undefined,
    query: { enabled: !!address && isBSC && token.isNative },
  });

  const currentBalance = token.isNative
    ? (nativeBalance?.value ?? BigInt(0))
    : (tokenBalance ?? BigInt(0));

  const requiredInput = quoteInputAmount ?? inputEstimate;
  const hasBalance = currentBalance >= requiredInput;

  const { writeContract: writeApprove, data: approveTxHash, isPending: approving } = useWriteContract();
  const { isSuccess: approveConfirmed } = useWaitForTransactionReceipt({ hash: approveTxHash });

  const { sendTransaction, data: swapTxHash, isPending: sendingSwap, error: swapSendError } = useSendTransaction();
  const { isSuccess: swapConfirmed } = useWaitForTransactionReceipt({ hash: swapTxHash });

  const resetToIdle = useCallback(() => {
    setStep('idle');
    setErrorMsg('');
    setPriceRoute(null);
    setSwapTxData(null);
    setQuoteOutput('');
    setQuoteInputAmount(null);
  }, []);

  useEffect(() => {
    if (approveConfirmed && step === 'approving') {
      refetchAllowance();
      buildTx();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approveConfirmed]);

  useEffect(() => {
    if (swapConfirmed && swapTxHash && lastSwapHash !== swapTxHash) {
      setLastSwapHash(swapTxHash);
      setStep('done');
      onSwapped();
    }
  }, [swapConfirmed, swapTxHash, lastSwapHash, onSwapped]);

  useEffect(() => {
    if (swapSendError && step === 'swapping') {
      setErrorMsg(friendlyError(swapSendError.message));
      setStep('error');
    }
  }, [swapSendError, step]);

  // Reverse-quote: specify destAmount = needed $U, let Paraswap tell us input required
  async function fetchQuote() {
    if (!address) return;
    setStep('quoting');
    setErrorMsg('');
    try {
      const params = new URLSearchParams({
        srcToken: token.address,
        destToken: U_CONTRACT,
        amount: targetAmountU.toString(),
        srcDecimals: String(token.decimals),
        destDecimals: '18',
        network: '56',
        side: 'BUY', // we specify output amount, aggregator computes input
      });
      const res = await fetch(`https://apiv5.paraswap.io/prices?${params}`);
      const data = await res.json();
      if (data.error) throw new Error(typeof data.error === 'string' ? data.error : 'Quote failed');
      if (!data.priceRoute) throw new Error('No route found. Try a different token.');

      const srcAmount = data.priceRoute.srcAmount as string;
      const destAmount = data.priceRoute.destAmount as string;
      setQuoteOutput((Number(destAmount) / 1e18).toFixed(2));
      setQuoteInputAmount(BigInt(srcAmount));
      setPriceRoute(data.priceRoute);

      // Enough balance?
      if (currentBalance < BigInt(srcAmount)) {
        throw new Error(`Insufficient ${token.symbol}. Need ~${(Number(srcAmount) / Number(decDiv)).toFixed(token.isNative ? 5 : 2)}.`);
      }

      // Allowance (only for ERC-20)
      if (!token.isNative) {
        const currentAllowance = allowance ?? BigInt(0);
        if (currentAllowance < BigInt(srcAmount)) {
          setStep('approve');
          return;
        }
      }
      await doBuildTx(data.priceRoute, srcAmount);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Failed to get quote');
      setStep('error');
    }
  }

  function handleApprove() {
    if (token.isNative) return;
    setStep('approving');
    // Approve at least the quoted amount (plus 1% safety)
    const amt = quoteInputAmount
      ? (quoteInputAmount * BigInt(101)) / BigInt(100)
      : inputEstimate;
    writeApprove({
      address: token.address,
      abi: APPROVE_ABI,
      functionName: 'approve',
      args: [PARASWAP_PROXY, amt],
    });
  }

  async function doBuildTx(route: unknown, srcAmount: string) {
    setStep('building');
    try {
      const res = await fetch('https://apiv5.paraswap.io/transactions/56?ignoreChecks=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          srcToken: token.address,
          destToken: U_CONTRACT,
          srcAmount,
          destAmount: targetAmountU.toString(),
          slippage: 150, // 1.5% buffer (esp. helpful for BNB)
          priceRoute: route,
          userAddress: address,
          txOrigin: address,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error));
      setSwapTxData({ to: data.to, data: data.data, value: data.value || '0' });
      setStep('ready');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Failed to build transaction');
      setStep('error');
    }
  }

  function buildTx() {
    if (!priceRoute || !quoteInputAmount) return;
    doBuildTx(priceRoute, quoteInputAmount.toString());
  }

  function handleSwap() {
    if (!swapTxData) return;
    setStep('swapping');
    sendTransaction({
      to: swapTxData.to as `0x${string}`,
      data: swapTxData.data as `0x${string}`,
      value: BigInt(swapTxData.value),
    });
  }

  const tokenBalDisplay = token.isNative
    ? (nativeBalance ? (Number(nativeBalance.value) / 1e18).toFixed(5) : '...')
    : (tokenBalance !== undefined ? (Number(tokenBalance) / Number(decDiv)).toFixed(2) : '...');

  return (
    <div style={embedded ? {} : { border: `1.5px solid ${GOLD_DIM}`, borderRadius: 16, overflow: 'hidden', background: '#fff' }}>

      {!embedded && (
        <div style={{ padding: '12px 16px', background: '#F7F5F0', borderBottom: `1px solid ${GOLD_DIM}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Swap to $U</span>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: 18, lineHeight: 1, padding: 0 }} aria-label="Close">×</button>
        </div>
      )}

      <div style={{ padding: '16px 16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {!isBSC && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: '#FEF9EC', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: TEXT }}>
              Switch to <strong>BNB Chain</strong> to swap.
            </div>
            <button onClick={() => switchChain({ chainId: BSC_CHAIN_ID })} disabled={switching}
              style={{ padding: '12px', borderRadius: 50, border: 'none', cursor: 'pointer',
                background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, color: '#fff', fontSize: 14, fontWeight: 700 }}>
              {switching ? 'Switching...' : 'Switch to BNB Chain'}
            </button>
          </div>
        )}

        {isBSC && (
          <>
            {/* Token selector */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: MUTED }}>Pay with</label>
                <span style={{ fontSize: 10, fontWeight: 600, color: GOLD, background: 'rgba(161,139,47,0.10)', borderRadius: 20, padding: '2px 8px' }}>BNB Chain</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {TOKENS.map((t, i) => (
                  <button key={t.symbol}
                    onClick={() => { setSelectedToken(i); resetToIdle(); }}
                    disabled={step === 'approving' || step === 'swapping' || step === 'quoting' || step === 'building'}
                    style={{
                      padding: '7px 14px', borderRadius: 50,
                      border: `1.5px solid ${selectedToken === i ? GOLD : '#E0E0DC'}`,
                      background: selectedToken === i ? 'rgba(233,210,118,0.12)' : '#fff',
                      color: selectedToken === i ? GOLD : MUTED,
                      fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    }}>
                    {t.symbol}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div style={{ background: '#F7F5F0', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: MUTED }}>You pay{quoteInputAmount ? '' : ' (approx.)'}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{inputUsd} {token.symbol}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: MUTED }}>You receive</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: GOLD }}>{quoteOutput || `~${targetUsd}`} $U</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: '#BBB' }}>Your {token.symbol}</span>
                <span style={{ fontSize: 11, color: hasBalance ? '#16A34A' : '#DC2626', fontWeight: 600 }}>{tokenBalDisplay}</span>
              </div>
            </div>

            {currentBalance === BigInt(0) && step === 'idle' && (
              <div style={{ background: '#FEF2F2', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#DC2626' }}>
                No {token.symbol} detected. Try another token or fund this wallet first.
              </div>
            )}

            {/* Get Quote */}
            {step === 'idle' && currentBalance > BigInt(0) && (
              <button onClick={fetchQuote}
                style={{ padding: '12px', borderRadius: 50, border: 'none', cursor: 'pointer',
                  background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, color: '#fff', fontSize: 14, fontWeight: 700, width: '100%' }}>
                Get Quote
              </button>
            )}

            {step === 'quoting' && (
              <div style={{ textAlign: 'center', padding: '12px', fontSize: 13, color: MUTED }}>
                <Spinner /> Fetching best price...
              </div>
            )}

            {/* Approve */}
            {step === 'approve' && (
              <button onClick={handleApprove}
                style={{ padding: '12px', borderRadius: 50, border: 'none', cursor: 'pointer',
                  background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, color: '#fff', fontSize: 14, fontWeight: 700, width: '100%' }}>
                Step 1/2: Approve {token.symbol}
              </button>
            )}

            {step === 'approving' && (
              <div style={{ textAlign: 'center', padding: '12px', fontSize: 13, color: MUTED }}>
                <Spinner /> {approving ? 'Confirm approval in wallet...' : 'Waiting for approval confirmation...'}
              </div>
            )}

            {step === 'building' && (
              <div style={{ textAlign: 'center', padding: '12px', fontSize: 13, color: MUTED }}>
                <Spinner /> Preparing swap...
              </div>
            )}

            {/* Ready */}
            {step === 'ready' && (
              <button onClick={handleSwap}
                style={{ padding: '12px', borderRadius: 50, border: 'none', cursor: 'pointer',
                  background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, color: '#fff', fontSize: 14, fontWeight: 700, width: '100%' }}>
                {token.isNative ? '' : 'Step 2/2: '}Swap for {quoteOutput} $U
              </button>
            )}

            {step === 'swapping' && (
              <div style={{ textAlign: 'center', padding: '12px', fontSize: 13, color: MUTED }}>
                <Spinner /> {sendingSwap ? 'Confirm swap in wallet...' : 'Swapping on-chain...'}
              </div>
            )}

            {step === 'done' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ background: '#F0FDF4', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#16A34A', fontWeight: 600, textAlign: 'center' }}>
                  Swap complete. Balance updated.
                </div>
                <button onClick={resetToIdle}
                  style={{ padding: '10px', borderRadius: 50, border: `1.5px solid ${GOLD_DIM}`, background: '#fff',
                    color: GOLD, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  Swap more
                </button>
              </div>
            )}

            {step === 'error' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ background: '#FEF2F2', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#DC2626' }}>
                  {errorMsg}
                </div>
                <button onClick={resetToIdle}
                  style={{ fontSize: 12, color: GOLD, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline', alignSelf: 'flex-start' }}>
                  Try again
                </button>
              </div>
            )}

            <div style={{ fontSize: 10, color: '#BBB', lineHeight: 1.5 }}>
              Routed by <a href="https://www.paraswap.io" target="_blank" rel="noreferrer" style={{ color: GOLD, textDecoration: 'none' }}>Paraswap</a> across BNB Chain DEX liquidity. 1.5% slippage tolerance. No fees from United Stables.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" aria-hidden
      style={{ verticalAlign: 'text-bottom', marginRight: 6 }}>
      <circle cx="12" cy="12" r="10" fill="none" stroke={GOLD_DIM} strokeWidth={3} />
      <path d="M22 12a10 10 0 0 1-10 10" fill="none" stroke={GOLD} strokeWidth={3} strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

// Map wagmi/ethers jargon to human-friendly messages
function friendlyError(msg: string): string {
  const low = msg.toLowerCase();
  if (low.includes('user rejected') || low.includes('user denied')) return 'You cancelled the transaction in your wallet.';
  if (low.includes('insufficient funds')) return 'Not enough balance to cover gas + amount.';
  if (low.includes('slippage')) return 'Price moved too much. Try again in a moment.';
  if (low.includes('timeout')) return 'Network is slow — check the transaction on BscScan and retry if needed.';
  return msg.split('\n')[0];
}
