import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, type Hex } from 'viem';
import { bsc } from 'viem/chains';
import { getSupabaseAdmin } from '@/app/lib/supabase-server';
import { U_CONTRACT, TREASURY, BOOK_U_AMOUNT, RESTRICTED_PATTERNS } from '@/app/freedomofmoney/lib/constants';

// ─── On-chain client - dedicated RPC, same as frontend ───────────────────────
const bscClient = createPublicClient({
  chain: bsc,
  transport: http(process.env.BSC_RPC_URL || 'https://bsc-dataseed1.binance.org'),
});

const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' as const;
const VERIFY_TIMEOUT_MS = 15_000;

// Canonical message bound to (domain, email, tx). Signing this proves the
// caller controls the on-chain sender, for this specific order.
function canonicalOrderMessage(email: string, txHash: string): string {
  return [
    'United Stables: Confirm Freedom of Money book order',
    `Email: ${email}`,
    `Tx: ${txHash}`,
  ].join('\n');
}

// ─── On-chain verification ────────────────────────────────────────────────────
// Returns the real on-chain sender (payer). Never trusts a client-supplied address.
type VerifyResult = { error: string } | { sender: `0x${string}` };

async function verifyPaymentTx(txHash: `0x${string}`): Promise<VerifyResult> {
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
    if (msg === 'timeout') return { error: 'Blockchain verification timed out - please try again' };
    console.error('[verifyPaymentTx] getTransactionReceipt failed:', msg, 'tx:', txHash);
    return { error: 'Payment verification failed' };
  }

  if (!receipt) {
    console.error('[verifyPaymentTx] receipt is null for tx:', txHash);
    return { error: 'Payment verification failed' };
  }
  if (receipt.status !== 'success') {
    console.error('[verifyPaymentTx] tx failed on-chain:', txHash);
    return { error: 'Payment verification failed' };
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
    return { error: 'Payment verification failed' };
  }

  const toAddr = ('0x' + (transferLog.topics[2] as string).slice(26)).toLowerCase();
  const value  = BigInt(transferLog.data);

  if (toAddr !== TREASURY.toLowerCase()) {
    console.error('[verifyPaymentTx] wrong recipient:', toAddr, 'expected:', TREASURY.toLowerCase(), 'tx:', txHash);
    return { error: 'Payment verification failed' };
  }

  if (value < BOOK_U_AMOUNT) {
    console.error('[verifyPaymentTx] insufficient payment:', value.toString(), 'required:', BOOK_U_AMOUNT.toString(), 'tx:', txHash);
    return { error: 'Payment verification failed' };
  }

  const sender = ('0x' + (transferLog.topics[1] as string).slice(26)).toLowerCase() as `0x${string}`;
  return { sender };
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

  if (!str(body.phone))             return 'Phone number is required';
  if (str(body.phone).length > 30)   return 'Phone number is too long';

  if (str(body.notes).length > 1000) return 'Notes must be under 1000 characters';

  // tx_hash is required - no payment, no order
  if (!str(body.tx_hash)) return 'Transaction hash is required';
  if (!/^0x[0-9a-f]{64}$/.test(str(body.tx_hash))) return 'Invalid transaction hash format';

  // signature is required - proves caller controls the paying wallet
  if (!str(body.signature)) return 'Wallet signature is required';
  if (!/^0x[0-9a-fA-F]+$/.test(str(body.signature))) return 'Invalid signature format';

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

    const country = (body.country as string).trim().toLowerCase();
    if (RESTRICTED_PATTERNS.some(r => country.includes(r))) {
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
    const signature = (body.signature as string).trim() as Hex;

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

    // On-chain payment verification - source of truth for sender
    const verifyResult = await verifyPaymentTx(tx_hash);
    if ('error' in verifyResult) {
      return NextResponse.json({ error: verifyResult.error }, { status: 400 });
    }
    const wallet_address = verifyResult.sender;

    // Signature verification - caller must prove control of the paying wallet.
    // Uses viem's verifyMessage (EIP-191), which falls back to ERC-1271 for
    // smart-contract wallets (Safe, Argent, etc.).
    const message = canonicalOrderMessage(email, tx_hash);
    let sigValid = false;
    try {
      sigValid = await bscClient.verifyMessage({
        address: wallet_address,
        message,
        signature,
      });
    } catch (e) {
      console.error('[verifySignature] error:', e, 'tx:', tx_hash);
      return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 });
    }
    if (!sigValid) {
      return NextResponse.json(
        { error: 'Signature does not match the wallet that paid' },
        { status: 400 },
      );
    }

    // Try insert first
    const { data, error } = await supabase
      .from('book_orders')
      .insert({
        full_name:      (body.full_name as string).trim(),
        email,
        phone:          (body.phone as string).trim(),
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
