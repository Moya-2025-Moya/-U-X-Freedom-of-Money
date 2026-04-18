import { NextResponse } from 'next/server';

// Auth is enforced inside API route handlers (see app/api/admin/route.ts).
// This middleware is intentionally a no-op; kept as an easy place to add
// future request-level concerns (headers, rate limits, etc.)
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
