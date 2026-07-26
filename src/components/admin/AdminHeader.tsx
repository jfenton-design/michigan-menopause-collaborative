import * as React from 'react';
import { BloomMark } from '@/components/Logo';
import { logout } from '@/app/admin/dashboard/actions';

export type AdminTab = 'content' | 'membership' | 'meetings';

const TABS: { key: AdminTab; label: string; href: string }[] = [
  { key: 'content',    label: 'Website Content', href: '/admin/dashboard/content' },
  { key: 'membership', label: 'Membership',      href: '/admin/dashboard/membership' },
  { key: 'meetings',   label: 'Meetings',        href: '/admin/dashboard/meetings' },
];

/**
 * Shared dark chrome for every admin screen: brand + the three top-level tabs
 * (Website Content · Membership · Meetings) + sign out. Self-contained inline
 * styles so it works from both server pages and client components.
 */
export function AdminHeader({ active }: { active: AdminTab }) {
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 20 }}>
      {/* Brand row */}
      <div
        style={{
          background: '#1F1535',
          padding: '16px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BloomMark dim={32} ink="white" accent="#9B6FFF" />
          <span style={{ color: 'white', fontWeight: 600, fontSize: 16, letterSpacing: '-0.01em', marginLeft: 14 }}>
            MMC Admin Panel
          </span>
        </div>
        <form action={logout}>
          <button
            type="submit"
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              padding: '7px 16px',
              borderRadius: 8,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Sign out
          </button>
        </form>
      </div>

      {/* Primary tab strip */}
      <div
        style={{
          background: '#2a1c47',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '0 40px',
          display: 'flex',
          gap: 4,
          flexWrap: 'wrap',
        }}
      >
        {TABS.map(({ key, label, href }) => {
          const isActive = key === active;
          return (
            <a
              key={key}
              href={href}
              style={{
                color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                textDecoration: 'none',
                padding: '11px 14px',
                display: 'inline-block',
                letterSpacing: '-0.01em',
                borderBottom: `2px solid ${isActive ? '#9B6FFF' : 'transparent'}`,
              }}
            >
              {label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
