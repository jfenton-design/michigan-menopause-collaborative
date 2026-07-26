'use client';
import * as React from 'react';
import { s } from './formStyles';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * "Add meeting" as a modal so the schedule page leads with the list of
 * meetings, not a long empty form. The button opens the dialog; the form posts
 * to the `createMeeting` server action (passed in), which redirects on success —
 * that navigation closes the modal on its own.
 */
export function AddMeetingModal({ action }: { action: (formData: FormData) => void | Promise<void> }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button type="button" style={s.submitBtn} onClick={() => setOpen(true)}>＋ Add meeting</button>

      {open && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(31,21,53,0.45)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            padding: '48px 16px', overflowY: 'auto',
          }}
        >
          <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 640, padding: '28px 28px 32px', boxShadow: '0 20px 60px rgba(31,21,53,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ ...s.sectionTitle, margin: 0 }}>Add meeting</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" style={{ background: 'none', border: 'none', fontSize: 26, lineHeight: 1, cursor: 'pointer', color: '#7a6e8a', padding: 4 }}>×</button>
            </div>

            <form action={action}>
              <div style={s.grid2}>
                <div style={s.fieldGroup}>
                  <label style={s.label}>Quarter</label>
                  <input name="quarter" required style={s.input} placeholder="Summer 2026" />
                </div>
                <div style={s.fieldGroup}>
                  <label style={s.label}>Weekday</label>
                  <select name="weekday" required style={s.input}>
                    {WEEKDAYS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div style={s.grid2}>
                <div style={s.fieldGroup}>
                  <label style={s.label}>Month</label>
                  <select name="month" required style={s.input}>
                    {MONTHS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div style={s.grid2}>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Day</label>
                    <input name="day" type="number" min={1} max={31} required style={s.input} placeholder="21" />
                  </div>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Year</label>
                    <input name="year" type="number" min={2024} max={2040} required style={s.input} placeholder="2026" />
                  </div>
                </div>
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Time</label>
                <input name="time" required style={s.input} placeholder="6:30 — 8:00 PM" />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Location (full)</label>
                <textarea
                  name="location"
                  required
                  rows={2}
                  style={{ ...s.input, resize: 'vertical' }}
                  placeholder={"Danialle's Clubhouse\n235 Pierce Street, Birmingham, MI"}
                />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Location short</label>
                <input name="locationShort" required style={s.input} placeholder="Danialle's Clubhouse · Birmingham" />
              </div>
              <div style={{ display: 'flex', gap: 24, marginBottom: 20, flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                  <input type="checkbox" name="rsvpOpen" defaultChecked={false} />
                  RSVP open
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                  <input type="checkbox" name="showKarmanos" defaultChecked={true} />
                  Include Danialle&apos;s Clubhouse thank-you note
                </label>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" style={s.submitBtn}>Add meeting</button>
                <button type="button" onClick={() => setOpen(false)} style={{ ...s.deleteBtn, color: '#5a5168' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
