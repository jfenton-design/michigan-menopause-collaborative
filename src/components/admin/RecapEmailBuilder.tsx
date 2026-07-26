'use client';
import * as React from 'react';
import type { Meeting } from '@/lib/data';
import { MeetingRecap } from '@/app/admin/dashboard/meetings/checkin/MeetingRecap';
import { s } from './formStyles';

/**
 * Standalone recap-email builder for the Emails / Social hub. Picks a meeting
 * and reuses <MeetingRecap> (the same builder used inside Check-In), supplying
 * the attendee emails derived from check-in attendance so "Copy recipients"
 * still works outside the Check-In flow.
 */
export function RecapEmailBuilder({
  meetings,
  emailsByMeeting,
}: {
  meetings: Meeting[];
  emailsByMeeting: Record<string, string[]>;
}) {
  // Default to the most recent past meeting — recaps go out after a meeting.
  const [id, setId] = React.useState(meetings[meetings.length - 1]?.id ?? meetings[0]?.id ?? '');
  const [toast, setToast] = React.useState<string | null>(null);
  const meeting = meetings.find(m => m.id === id) ?? meetings[0];

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text).then(
      () => { setToast(label); setTimeout(() => setToast(null), 1800); },
      () => { setToast('Copy failed — select and copy manually'); setTimeout(() => setToast(null), 2200); },
    );
  }

  if (!meeting) {
    return <p style={{ color: '#7a6e8a', fontSize: 14 }}>Add a meeting first to build a recap email.</p>;
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

      <MeetingRecap meeting={meeting} emails={emailsByMeeting[meeting.id] ?? []} onCopy={copyText} bare />

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#1F1535', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, zIndex: 200 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
