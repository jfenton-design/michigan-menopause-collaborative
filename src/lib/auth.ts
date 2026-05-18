// Required env vars:
// ADMIN_PASSWORD — Dr. Leff's login password
// ADMIN_SESSION_SECRET — Random string for signing (min 32 chars)

import { cookies } from 'next/headers';

export async function createSessionToken(): Promise<string> {
  const password = process.env.ADMIN_PASSWORD ?? '';
  const secret = process.env.ADMIN_SESSION_SECRET ?? '';
  const encoder = new TextEncoder();
  const data = encoder.encode(password + secret);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function validateSessionToken(token: string): Promise<boolean> {
  const expected = await createSessionToken();
  return token === expected;
}

export async function validatePassword(password: string): Promise<boolean> {
  return password === process.env.ADMIN_PASSWORD;
}

export async function getAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('mmc-admin-session')?.value;
  if (!token) return false;
  return validateSessionToken(token);
}
