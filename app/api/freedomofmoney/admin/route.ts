import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/lib/supabase-server';

const STATUSES = ['pending', 'ordered', 'shipped', 'delivered', 'cancelled'];

// GET — list all orders (optionally filtered by status)
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status');
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('book_orders')
    .select('id, created_at, full_name, email, address_line1, address_line2, city, state_province, postal_code, country, notes, status, tx_hash, wallet_address, amazon_tracking')
    .order('created_at', { ascending: false });

  if (status && status !== 'all' && STATUSES.includes(status)) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[admin orders] GET error:', error);
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 });
  }

  return NextResponse.json({ orders: data ?? [] });
}

// PATCH — update status and/or amazon_tracking for one order
export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: 'Missing order id' }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (body.status) {
    if (!STATUSES.includes(body.status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    updates.status = body.status;
  }
  if ('amazon_tracking' in body) {
    updates.amazon_tracking = body.amazon_tracking ?? null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('book_orders')
    .update(updates)
    .eq('id', body.id);

  if (error) {
    console.error('[admin orders] PATCH error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
