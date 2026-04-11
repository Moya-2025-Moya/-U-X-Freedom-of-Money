import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/lib/supabase-server';

const TX_RE     = /^0x[0-9a-fA-F]{64}$/;
const WALLET_RE = /^0x[0-9a-fA-F]{40}$/;

function maskName(name: string): string {
  return name.split(' ').map(part => {
    if (part.length <= 2) return part[0] + '*';
    return part[0] + '*'.repeat(part.length - 2) + part[part.length - 1];
  }).join(' ');
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (!q) return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });

  const isTx     = TX_RE.test(q);
  const isWallet = WALLET_RE.test(q);
  if (!isTx && !isWallet) {
    return NextResponse.json({ error: 'Invalid query. Must be a tx hash (0x + 64 chars) or wallet address (0x + 40 chars).' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const col = isTx ? 'tx_hash' : 'wallet_address';

  const { data, error } = await supabase
    .from('book_orders')
    .select('id, created_at, full_name, status, tx_hash, wallet_address, amazon_tracking')
    .eq(col, isTx ? q.toLowerCase() : q.toLowerCase())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[order lookup] error:', error);
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }

  const maskedOrders = (data ?? []).map(o => ({
    ...o,
    full_name: maskName(o.full_name),
  }));
  return NextResponse.json({ orders: maskedOrders });
}
