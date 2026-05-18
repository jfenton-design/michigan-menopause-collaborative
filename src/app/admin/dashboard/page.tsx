import * as React from 'react';
import { BloomMark } from '@/components/Logo';
import { getResources, getMeetings, getMembers } from '@/lib/admin-db';
import { SPECIALTIES } from '@/lib/data';
import {
  logout,
  uploadResource,
  deleteResource,
  createMeeting,
  deleteMeeting,
  addMember,
  deleteMember,
} from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dashboard · MMC Admin' };

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const RESOURCE_TYPES = ['Meeting notes', 'Article', 'Reference', 'Handout', 'Other'];

const s = {
  page: { background: '#F5F3FB', minHeight: '100vh', fontFamily: 'var(--font-dm-sans), system-ui, sans-serif' },
  header: {
    background: '#1F1535',
    padding: '16px 40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { color: 'white', fontWeight: 600, fontSize: 16, letterSpacing: '-0.01em', marginLeft: 14 },
  content: { maxWidth: 900, margin: '0 auto', padding: '40px 24px' },
  card: {
    background: 'white',
    borderRadius: 12,
    padding: '28px 32px',
    marginBottom: 32,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  sectionTitle: {
    fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 20,
    marginTop: 0,
    color: '#1F1535',
  },
  label: {
    fontFamily: 'var(--font-plex-mono), monospace',
    fontSize: 11,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: '#5a5168',
    display: 'block',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #d8d3e8',
    borderRadius: 8,
    fontSize: 15,
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
  },
  fieldGroup: { marginBottom: 16 },
  submitBtn: {
    background: '#6D3BE4',
    color: 'white',
    padding: '10px 22px',
    borderRadius: 8,
    border: 'none',
    fontSize: 15,
    cursor: 'pointer',
    fontWeight: 500,
    fontFamily: 'inherit',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#c0392b',
    fontSize: 13,
    cursor: 'pointer',
    padding: '4px 8px',
    fontFamily: 'var(--font-plex-mono), monospace',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #ede9f7',
  },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  divider: { borderTop: '1px solid #ede9f7', marginTop: 28, marginBottom: 28 },
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ saved }, resources, meetings, members] = await Promise.all([
    searchParams,
    getResources(),
    getMeetings(),
    getMembers(),
  ]);

  const memberSpecialties = SPECIALTIES.filter(s => s !== 'All specialties');

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BloomMark dim={32} ink="white" accent="#9B6FFF" />
          <span style={s.headerTitle}>MMC Admin Panel</span>
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

      {saved === '1' && (
        <div style={{ background: '#EAF4EA', borderBottom: '1px solid #b7ddb7', padding: '12px 40px', fontSize: 14, color: '#2d6a2d' }}>
          ✓ Saved — changes may take about a minute to appear on michiganmenopause.com.
        </div>
      )}

      <div style={s.content}>

        {/* ── RESOURCES ── */}
        <div style={s.card}>
          <h2 style={s.sectionTitle}>Resources</h2>

          <form action={uploadResource} encType="multipart/form-data">
            <div style={s.grid2}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Title</label>
                <input name="title" required style={s.input} placeholder="Summer 2026 meeting notes" />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Quarter</label>
                <input name="quarter" required style={s.input} placeholder="Summer 2026" />
              </div>
            </div>
            <div style={s.grid2}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Type</label>
                <select name="type" required style={s.input}>
                  {RESOURCE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Citation / date line</label>
                <input name="citation" style={s.input} placeholder="July 21, 2026 · Birmingham" />
              </div>
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>PDF file (optional)</label>
              <input name="file" type="file" accept=".pdf" style={{ ...s.input, padding: '8px 14px' }} />
            </div>
            <button type="submit" style={s.submitBtn}>Upload resource</button>
          </form>

          {resources.length > 0 && (
            <>
              <div style={s.divider} />
              <div>
                {resources.map((r, i) => (
                  <div key={i} style={s.row}>
                    <div>
                      <span style={{ fontWeight: 500, fontSize: 14 }}>{r.title}</span>
                      <span
                        style={{
                          marginLeft: 10,
                          fontFamily: 'var(--font-plex-mono), monospace',
                          fontSize: 11,
                          color: '#7a6e8a',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        {r.quarter} · {r.type} · {r.status}
                      </span>
                    </div>
                    <form action={deleteResource}>
                      <input type="hidden" name="title" value={r.title} />
                      {r.url && <input type="hidden" name="url" value={r.url} />}
                      <button type="submit" style={s.deleteBtn}>Delete</button>
                    </form>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── MEETINGS ── */}
        <div style={s.card}>
          <h2 style={s.sectionTitle}>Meetings</h2>

          <form action={createMeeting}>
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
            <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" name="rsvpOpen" defaultChecked={false} />
                RSVP open
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" name="showKarmanos" defaultChecked={true} />
                Include Danialle&apos;s Clubhouse thank-you note
              </label>
            </div>
            <button type="submit" style={s.submitBtn}>Add meeting</button>
          </form>

          {meetings.length > 0 && (
            <>
              <div style={s.divider} />
              <div>
                {meetings.map((m, i) => (
                  <div key={i} style={s.row}>
                    <div>
                      <span style={{ fontWeight: 500, fontSize: 14 }}>{m.quarter}</span>
                      <span style={{ marginLeft: 10, fontSize: 13, color: '#7a6e8a' }}>
                        {m.month} {m.day}, {m.year}
                      </span>
                    </div>
                    <form action={deleteMeeting}>
                      <input type="hidden" name="id" value={m.id} />
                      <button type="submit" style={s.deleteBtn}>Delete</button>
                    </form>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── MEMBERS ── */}
        <div style={s.card}>
          <h2 style={s.sectionTitle}>Members</h2>

          <form action={addMember}>
            <div style={s.grid2}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Full name</label>
                <input name="name" required style={s.input} placeholder="Dr. A. Whitfield" />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Credentials</label>
                <input name="credentials" required style={s.input} placeholder="MD · MSCP" />
              </div>
            </div>
            <div style={s.grid2}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Specialty</label>
                <select name="specialty" required style={s.input}>
                  {memberSpecialties.map(sp => <option key={sp}>{sp}</option>)}
                </select>
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Location (city)</label>
                <input name="location" required style={s.input} placeholder="Birmingham" />
              </div>
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Practice / website</label>
              <input name="practice" required style={s.input} placeholder="whitfieldwomen.com" />
            </div>
            <button type="submit" style={s.submitBtn}>Add member</button>
          </form>

          {members.length > 0 && (
            <>
              <div style={s.divider} />
              <div>
                {members.map((m, i) => (
                  <div key={i} style={s.row}>
                    <div>
                      <span style={{ fontWeight: 500, fontSize: 14 }}>{m.name}</span>
                      <span style={{ marginLeft: 10, fontSize: 13, color: '#7a6e8a' }}>
                        {m.specialty} · {m.location}
                      </span>
                    </div>
                    <form action={deleteMember}>
                      <input type="hidden" name="name" value={m.name} />
                      <button type="submit" style={s.deleteBtn}>Delete</button>
                    </form>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
