import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { bsc } from 'viem/chains';
import { getSupabaseAdmin } from '@/app/lib/supabase-server';
import { U_CONTRACT, TREASURY, BOOK_U_AMOUNT } from '@/app/freedomofmoney/lib/constants';

// ─── On-chain verification ────────────────────────────────────────────────────
const bscClient = createPublicClient({ chain: bsc, transport: http() });

const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' as const;

async function verifyPaymentTx(
  txHash: `0x${string}`,
  senderWallet: string | null,
): Promise<string | null> {
  let receipt;
  try {
    receipt = await bscClient.getTransactionReceipt({ hash: txHash });
  } catch {
    return 'Transaction not found on BNB Chain';
  }

  if (!receipt) return 'Transaction not found on BNB Chain';
  if (receipt.status !== 'success') return 'Transaction failed on-chain';

  // The tx must interact with the $U contract
  if (receipt.to?.toLowerCase() !== U_CONTRACT.toLowerCase()) {
    return 'Transaction is not a $U token transfer';
  }

  // Find the Transfer log from $U to TREASURY
  const transferLog = receipt.logs.find(
    log =>
      log.address.toLowerCase() === U_CONTRACT.toLowerCase() &&
      log.topics[0] === TRANSFER_TOPIC &&
      log.topics.length >= 3,
  );

  if (!transferLog) return 'No $U Transfer event found in transaction';

  // topics[2] is the "to" address, left-padded to 32 bytes
  const toAddr = ('0x' + (transferLog.topics[2] as string).slice(26)).toLowerCase();
  const value  = BigInt(transferLog.data);

  if (toAddr !== TREASURY.toLowerCase()) {
    return 'Transfer recipient is not the United Stables treasury';
  }

  if (value < BOOK_U_AMOUNT) {
    return `Insufficient payment: received ${value} but required ${BOOK_U_AMOUNT}`;
  }

  // Optional: verify the sender matches the wallet that connected
  if (senderWallet) {
    const fromAddr = ('0x' + (transferLog.topics[1] as string).slice(26)).toLowerCase();
    if (fromAddr !== senderWallet.toLowerCase()) {
      return 'Transaction sender does not match the connected wallet address';
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

  // tx_hash is now required
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

    // Validate fields (including required tx_hash)
    const validationError = validate(body as Record<string, unknown>);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const email = (body.email as string).trim().toLowerCase();

    // Rate limit
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

    // Duplicate tx_hash guard — prevent reuse of the same payment tx
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
        status:         'pending',
      })
      .select('id')
      .single();

    if (error) {
      console.error('[book_orders] insert error:', error);
      return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error('[book_orders] unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
