import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'bd-engine-token';

function getSecret(): Uint8Array {
  const secret = process.env.BD_ENGINE_JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('BD_ENGINE_JWT_SECRET must be set and at least 16 characters');
  }
  return new TextEncoder().encode(secret);
}

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (token) {
    try {
      await jwtVerify(token, getSecret());
      return true;
    } catch {
      // invalid token
    }
  }

  const apiKey = request.headers.get('x-api-key');
  if (apiKey && apiKey === process.env.BD_ENGINE_API_KEY) {
    return true;
  }

  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes - no auth required
  if (
    pathname === '/' ||
    pathname === '/purchase' ||
    pathname === '/track' ||
    pathname === '/details' ||
    pathname.startsWith('/api/purchase') ||
    pathname.startsWith('/api/order')
  ) {
    return NextResponse.next();
  }

  // Admin routes require auth
  const authed = await isAuthenticated(request);

  if (!authed) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return new NextResponse('Unauthorized', { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.svg$|.*\\.png$|.*\\.jpg$|.*\\.webp$).*)',
  ],
};
