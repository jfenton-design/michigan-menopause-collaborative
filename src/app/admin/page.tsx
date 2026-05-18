import * as React from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { BloomMark } from '@/components/Logo';
import { validatePassword, createSessionToken, getAdminSession } from '@/lib/auth';

export const metadata = { title: 'Admin · MMC' };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const isLoggedIn = await getAdminSession();
  if (isLoggedIn) redirect('/admin/dashboard');

  const params = await searchParams;
  const hasError = params.error === '1';

  async function login(formData: FormData) {
    'use server';
    const password = formData.get('password') as string;
    const valid = await validatePassword(password);
    if (!valid) redirect('/admin?error=1');
    const token = await createSessionToken();
    const cookieStore = await cookies();
    cookieStore.set('mmc-admin-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/admin',
      maxAge: 60 * 60 * 24 * 7,
    });
    redirect('/admin/dashboard');
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#1F1535',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 16,
          padding: '48px 40px',
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 8px 40px rgba(0,0,0,0.32)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36 }}>
          <BloomMark dim={56} ink="#1F1535" accent="#7C3AED" />
          <div
            style={{
              marginTop: 16,
              fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
              fontWeight: 600,
              fontSize: 18,
              color: '#1F1535',
              textAlign: 'center',
              letterSpacing: '-0.02em',
            }}
          >
            MMC Admin
          </div>
          <div
            style={{
              fontSize: 13,
              color: '#7a6e8a',
              marginTop: 4,
              fontFamily: 'var(--font-plex-mono), monospace',
              letterSpacing: '0.04em',
            }}
          >
            Michigan Menopause Collaborative
          </div>
        </div>

        <form action={login} style={{ display: 'grid', gap: 16 }}>
          <div>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontFamily: 'var(--font-plex-mono), monospace',
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#5a5168',
                marginBottom: 8,
              }}
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              style={{
                width: '100%',
                padding: '10px 14px',
                border: hasError ? '1.5px solid #c0392b' : '1.5px solid #d8d3e8',
                borderRadius: 8,
                fontSize: 15,
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
            {hasError && (
              <div
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  color: '#c0392b',
                  fontFamily: 'var(--font-plex-mono), monospace',
                }}
              >
                Incorrect password. Try again.
              </div>
            )}
          </div>

          <button
            type="submit"
            style={{
              background: '#6D3BE4',
              color: 'white',
              padding: '12px 22px',
              borderRadius: 8,
              border: 'none',
              fontSize: 15,
              cursor: 'pointer',
              fontWeight: 500,
              width: '100%',
              marginTop: 4,
              fontFamily: 'inherit',
            }}
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
