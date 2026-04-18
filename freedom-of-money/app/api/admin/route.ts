import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/lib/supabase-server';

const STATUSES = ['pending', 'ordered', 'shipped', 'delivered', 'cancelled'];

const ADMIN_COOKIE = 'fom_admin';

// Constant-time-ish string compare to resist timing
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function isAuthed(req: NextRequest): boolean {
  const password = process.env.ADMIN_PASSWORD;
  // If no password is configured, refuse — fail-closed
  if (!password) return false;
  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!cookie) return false;
  return safeEqual(cookie, password);
}

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// POST /api/admin  { password }  -> sets cookie, authenticates
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return NextResponse.json({ error: 'Admin is not configured on this server.' }, { status: 503 });
  }
  if (!body?.password || typeof body.password !== 'string') {
    return NextResponse.json({ error: 'Password required' }, { status: 400 });
  }
  if (!safeEqual(body.password, password)) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, password, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return res;
}

// DELETE /api/admin -> logout
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}

// GET - list all orders (optionally filtered by status)
export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return unauthorized();

  const status = req.nextUrl.searchParams.get('status');
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('book_orders')
    .select('id, created_at, full_name, email, phone, address_line1, address_line2, city, state_province, postal_code, country, notes, status, tx_hash, wallet_address, amazon_tracking')
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

// PATCH - update status and/or amazon_tracking for one order
export async function PATCH(req: NextRequest) {
  if (!isAuthed(req)) return unauthorized();

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
