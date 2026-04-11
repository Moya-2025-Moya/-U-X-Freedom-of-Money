import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { bsc } from 'viem/chains';
import { getSupabaseAdmin } from '@/app/lib/supabase-server';
import { U_CONTRACT, TREASURY, BOOK_U_AMOUNT } from '@/app/freedomofmoney/lib/constants';

// ─── On-chain client - dedicated RPC, same as frontend ───────────────────────
const bscClient = createPublicClient({
  chain: bsc,
  transport: http(process.env.BSC_RPC_URL || 'https://bsc-dataseed1.binance.org'),
});

const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' as const;
const VERIFY_TIMEOUT_MS = 15_000;

// ─── On-chain verification ────────────────────────────────────────────────────
async function verifyPaymentTx(
  txHash: `0x${string}`,
  senderWallet: string | null,
): Promise<string | null> {
  let receipt;
  try {
    receipt = await Promise.race([
      bscClient.getTransactionReceipt({ hash: txHash }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), VERIFY_TIMEOUT_MS),
      ),
    ]);
  } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    if (msg === 'timeout') return 'Blockchain verification timed out - please try again';
    console.error('[verifyPaymentTx] getTransactionReceipt failed:', msg, 'tx:', txHash);
    return 'Payment verification failed';
  }

  if (!receipt) {
    console.error('[verifyPaymentTx] receipt is null for tx:', txHash);
    return 'Payment verification failed';
  }
  if (receipt.status !== 'success') {
    console.error('[verifyPaymentTx] tx failed on-chain:', txHash);
    return 'Payment verification failed';
  }

  // Find the Transfer log: $U → TREASURY
  const transferLog = receipt.logs.find(
    log =>
      log.address.toLowerCase() === U_CONTRACT.toLowerCase() &&
      log.topics[0] === TRANSFER_TOPIC &&
      log.topics.length >= 3,
  );

  if (!transferLog) {
    console.error('[verifyPaymentTx] no Transfer event found in tx:', txHash);
    return 'Payment verification failed';
  }

  const toAddr  = ('0x' + (transferLog.topics[2] as string).slice(26)).toLowerCase();
  const value   = BigInt(transferLog.data);

  if (toAddr !== TREASURY.toLowerCase()) {
    console.error('[verifyPaymentTx] wrong recipient:', toAddr, 'expected:', TREASURY.toLowerCase(), 'tx:', txHash);
    return 'Payment verification failed';
  }

  if (value < BOOK_U_AMOUNT) {
    console.error('[verifyPaymentTx] insufficient payment:', value.toString(), 'required:', BOOK_U_AMOUNT.toString(), 'tx:', txHash);
    return 'Payment verification failed';
  }

  // Verify sender matches connected wallet (optional - only when wallet_address is provided)
  if (senderWallet) {
    const fromAddr = ('0x' + (transferLog.topics[1] as string).slice(26)).toLowerCase();
    if (fromAddr !== senderWallet.toLowerCase()) {
      console.error('[verifyPaymentTx] sender mismatch:', fromAddr, 'expected:', senderWallet.toLowerCase(), 'tx:', txHash);
      return 'Payment verification failed';
    }
  }

  return null; // valid
}

// ─── Validation ───────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(body: Record<string, unknown>): string | null {
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

  if (!str(body.full_name))      return 'Full name is required';
  if (str(body.full_name).length > 200) return 'Full name is too long';

  if (!str(body.email))          return 'Email is required';
  if (!EMAIL_RE.test(str(body.email))) return 'Invalid email address';
  if (str(body.email).length > 320)    return 'Email is too long';

  if (!str(body.address_line1))  return 'Address is required';
  if (str(body.address_line1).length > 300) return 'Address line 1 is too long';

  if (str(body.address_line2).length > 300) return 'Address line 2 is too long';
  if (!str(body.city))           return 'City is required';
  if (str(body.city).length > 100) return 'City name is too long';

  if (!str(body.postal_code))    return 'Postal code is required';
  if (str(body.postal_code).length > 20) return 'Postal code is too long';

  if (!str(body.country))        return 'Country is required';
  if (str(body.country).length > 100) return 'Country name is too long';

  if (str(body.notes).length > 1000) return 'Notes must be under 1000 characters';

  // tx_hash is required - no payment, no order
  if (!str(body.tx_hash)) return 'Transaction hash is required';
  if (!/^0x[0-9a-f]{64}$/.test(str(body.tx_hash))) return 'Invalid transaction hash format';

  return null;
}

// ─── Rate limit: check via DB (works across all serverless instances) ────────
async function isRateLimited(email: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.rpc('check_book_order_rate_limit', { p_email: email });
  return data === true;
}

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const validationError = validate(body as Record<string, unknown>);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const RESTRICTED_COUNTRIES = ['china', 'mainland china', 'prc', "people's republic of china", '中国', '中华人民共和国', 'north korea', 'dprk', 'iran', 'syria', 'cuba', 'crimea'];

    const country = (body.country as string).trim().toLowerCase();
    if (RESTRICTED_COUNTRIES.some(r => country.includes(r))) {
      return NextResponse.json({ error: 'Orders cannot be fulfilled to this region' }, { status: 400 });
    }

    const email = (body.email as string).trim().toLowerCase();

    if (await isRateLimited(email)) {
      return NextResponse.json(
        { error: 'Please wait a moment before submitting again.' },
        { status: 429 },
      );
    }

    const tx_hash = (body.tx_hash as string).trim().toLowerCase() as `0x${string}`;
    const wallet_address = (body.wallet_address as string)?.trim().toLowerCase() || null;
    if (wallet_address && !/^0x[0-9a-f]{40}$/.test(wallet_address)) {
      return NextResponse.json({ error: 'Invalid wallet address format' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Duplicate tx guard - one tx hash can only fund one order
    const { data: existing } = await supabase
      .from('book_orders')
      .select('id')
      .eq('tx_hash', tx_hash)
      .maybeSingle();
    if (existing) {
      return NextResponse.json(
        { error: 'This transaction has already been used for an order' },
        { status: 400 },
      );
    }

    // On-chain payment verification
    const txError = await verifyPaymentTx(tx_hash, wallet_address);
    if (txError) {
      return NextResponse.json({ error: txError }, { status: 400 });
    }

    // Try insert first
    const { data, error } = await supabase
      .from('book_orders')
      .insert({
        full_name:      (body.full_name as string).trim(),
        email,
        phone:          (body.phone as string)?.trim() || null,
        address_line1:  (body.address_line1 as string).trim(),
        address_line2:  (body.address_line2 as string)?.trim() || null,
        city:           (body.city as string).trim(),
        state_province: (body.state_province as string)?.trim() || null,
        postal_code:    (body.postal_code as string).trim(),
        country:        (body.country as string).trim(),
        notes:          (body.notes as string)?.trim() || null,
        tx_hash,
        wallet_address,
        amount_u:       Number(BOOK_U_AMOUNT) / 1e18,
        status:         'pending',
      })
      .select('id')
      .single();

    if (error) {
      // If unique violation on tx_hash, return the existing order (idempotent retry)
      if (error.code === '23505' && error.message?.includes('tx_hash')) {
        const { data: existing } = await supabase
          .from('book_orders')
          .select('id')
          .eq('tx_hash', tx_hash)
          .single();
        if (existing) {
          return NextResponse.json({ success: true, id: existing.id });
        }
      }
      console.error('[book_orders] insert error:', error);
      return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error('[book_orders] unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
