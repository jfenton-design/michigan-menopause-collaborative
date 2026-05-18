import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/admin/dashboard', '/admin/dashboard/:path*'],
};

async function createSessionToken(): Promise<string> {
  const password = process.env.ADMIN_PASSWORD ?? '';
  const secret = process.env.ADMIN_SESSION_SECRET ?? '';
  const encoder = new TextEncoder();
  const data = encoder.encode(password + secret);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('mmc-admin-session')?.value;
  if (!token) return NextResponse.redirect(new URL('/admin', request.url));
  const expected = await createSessionToken();
  if (token !== expected) return NextResponse.redirect(new URL('/admin', request.url));
  return NextResponse.next();
}
