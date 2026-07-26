import * as React from 'react';

export type MeetingsTab = 'schedule' | 'resources' | 'recap' | 'checkin';

const TABS: { key: MeetingsTab; label: string; href: string }[] = [
  { key: 'schedule',  label: 'Schedule',    href: '/admin/dashboard/meetings' },
  { key: 'resources', label: 'Resources',   href: '/admin/dashboard/meetings/resources' },
  { key: 'recap',     label: 'Emails / Social', href: '/admin/dashboard/meetings/recap' },
  { key: 'checkin',   label: 'Check-In',    href: '/admin/dashboard/meetings/checkin' },
];

/** Second-level tab bar within the Meetings component. */
export function MeetingsTabs({ active }: { active: MeetingsTab }) {
  return (
    <div
      style={{
        background: '#fff',
        borderBottom: '1px solid #ede9f7',
        padding: '0 40px',
        display: 'flex',
        gap: 2,
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
              color: isActive ? '#6D3BE4' : '#7a6e8a',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              padding: '12px 14px',
              display: 'inline-block',
              letterSpacing: '-0.01em',
              borderBottom: `2px solid ${isActive ? '#6D3BE4' : 'transparent'}`,
            }}
          >
            {label}
          </a>
        );
      })}
    </div>
  );
}
