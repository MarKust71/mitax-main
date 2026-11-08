import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Must match SESSION_COOKIE in '@/lib/auth/session' (not imported: that module pulls in the DB).
const SESSION_COOKIE = 'session';

// Optimistic check only (cookie presence). The real session validation happens in the page.
export function proxy(request: NextRequest) {
  if (!request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
