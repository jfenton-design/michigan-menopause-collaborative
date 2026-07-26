'use client';
import * as React from 'react';
import type { Meeting } from '@/lib/data';
import { s } from './formStyles';

const VARIANTS = [
  { key: 'default', label: 'Without photo', qs: '' },
  { key: 'photo', label: 'With photo', qs: '&variant=photo' },
] as const;

/**
 * The two square (1080×1080) social cards for a meeting — the text-forward card
 * and the photo-forward card — with live previews and download buttons.
 */
export function SocialAssets({ meetings }: { meetings: Meeting[] }) {
  // Default to the next open meeting (what you'd most likely be promoting).
  const [id, setId] = React.useState(
    meetings.find(m => m.rsvpOpen)?.id ?? meetings[0]?.id ?? '',
  );
  const meeting = meetings.find(m => m.id === id) ?? meetings[0];

  if (!meeting) {
    return <p style={{ color: '#7a6e8a', fontSize: 14 }}>Add a meeting first to generate social images.</p>;
  }

  return (
    <div>
      <div style={{ ...s.fieldGroup, maxWidth: 360 }}>
        <label style={s.label}>Meeting</label>
        <select value={id} onChange={e => setId(e.target.value)} style={s.input}>
          {meetings.map(m => (
            <option key={m.id} value={m.id}>
              {m.quarter} — {m.month} {m.day}, {m.year}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {VARIANTS.map(v => (
          <div key={v.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#5a5168' }}>{v.label}</span>
              <a
                href={`/api/og?id=${meeting.id}${v.qs}`}
                download={`mmc-${meeting.id}-${v.key}-social.png`}
                style={{ ...s.submitBtn, textDecoration: 'none', fontSize: 12, padding: '6px 12px' }}
              >
                Download →
              </a>
            </div>
            <img
              src={`/api/og?id=${meeting.id}${v.qs}`}
              alt={`${v.label} social image for ${meeting.quarter}`}
              style={{ width: '100%', borderRadius: 8, border: '1px solid #ede9f7', display: 'block' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
