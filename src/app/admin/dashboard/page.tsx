import * as React from 'react';
import { BloomMark } from '@/components/Logo';
import { getResources, getMeetings, getMembers, getContent } from '@/lib/admin-db';
import { SPECIALTIES } from '@/lib/data';
import {
  logout,
  uploadResource,
  editResource,
  deleteResource,
  createMeeting,
  editMeeting,
  deleteMeeting,
  addMember,
  deleteMember,
  editContent,
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
  searchParams: Promise<{ saved?: string; edit?: string; editM?: string }>;
}) {
  const [{ saved, edit, editM }, resources, meetings, members, content] = await Promise.all([
    searchParams,
    getResources(),
    getMeetings(),
    getMembers(),
    getContent(),
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

      {/* Nav strip */}
      <div style={{ background: '#2a1c47', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 40px', display: 'flex', gap: 4 }}>
        {[
          { label: 'Resources', href: '#resources' },
          { label: 'Meetings',  href: '#meetings' },
          { label: 'Members',   href: '#members' },
          { label: 'Content',   href: '#content' },
        ].map(({ label, href }) => (
          <a
            key={href}
            href={href}
            style={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: 13,
              fontWeight: 500,
              textDecoration: 'none',
              padding: '10px 14px',
              display: 'inline-block',
              letterSpacing: '-0.01em',
            }}
          >
            {label}
          </a>
        ))}
      </div>

      {saved === '1' && (
        <div style={{ background: '#EAF4EA', borderBottom: '1px solid #b7ddb7', padding: '12px 40px', fontSize: 14, color: '#2d6a2d' }}>
          ✓ Saved — changes may take about a minute to appear on michiganmenopause.com.
        </div>
      )}

      <div style={s.content}>

        {/* ── RESOURCES ── */}
        <div id="resources" style={s.card}>
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
                  <div key={i}>
                    {edit === String(i) ? (
                      <form action={editResource} style={{ padding: '16px 0', borderBottom: '1px solid #ede9f7' }}>
                        <input type="hidden" name="originalTitle" value={r.title} />
                        <div style={s.grid2}>
                          <div style={s.fieldGroup}>
                            <label style={s.label}>Title</label>
                            <input name="title" defaultValue={r.title} required style={s.input} />
                          </div>
                          <div style={s.fieldGroup}>
                            <label style={s.label}>Quarter</label>
                            <input name="quarter" defaultValue={r.quarter} required style={s.input} />
                          </div>
                        </div>
                        <div style={s.grid2}>
                          <div style={s.fieldGroup}>
                            <label style={s.label}>Type</label>
                            <select name="type" defaultValue={r.type} required style={s.input}>
                              {RESOURCE_TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                          </div>
                          <div style={s.fieldGroup}>
                            <label style={s.label}>Citation / date line</label>
                            <input name="citation" defaultValue={r.citation} style={s.input} />
                          </div>
                        </div>
                        <div style={{ ...s.fieldGroup, maxWidth: 200 }}>
                          <label style={s.label}>Section</label>
                          <select name="status" defaultValue={r.status} style={s.input}>
                            <option value="current">This quarter (current)</option>
                            <option value="archive">Archive (past materials)</option>
                          </select>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                          <button type="submit" style={s.submitBtn}>Save changes</button>
                          <a href="/admin/dashboard" style={{ ...s.deleteBtn, color: '#5a5168', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>Cancel</a>
                        </div>
                      </form>
                    ) : (
                      <div style={s.row}>
                        <div>
                          <span style={{ fontWeight: 500, fontSize: 14 }}>{r.title}</span>
                          <span style={{ marginLeft: 10, fontFamily: 'var(--font-plex-mono), monospace', fontSize: 11, color: '#7a6e8a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {r.quarter} · {r.type} · {r.status}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          <a href={`/admin/dashboard?edit=${i}`} style={{ ...s.deleteBtn, color: '#5a5168', textDecoration: 'none' }}>Edit</a>
                          <form action={deleteResource}>
                            <input type="hidden" name="title" value={r.title} />
                            {r.url && <input type="hidden" name="url" value={r.url} />}
                            <button type="submit" style={s.deleteBtn}>Delete</button>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── MEETINGS ── */}
        <div id="meetings" style={s.card}>
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
                  <div key={i}>
                    {editM === m.id ? (
                      <form action={editMeeting} encType="multipart/form-data" style={{ padding: '20px 0', borderBottom: '1px solid #ede9f7' }}>
                        <input type="hidden" name="id" value={m.id} />
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16, color: '#1F1535' }}>
                          Editing: {m.quarter} — {m.month} {m.day}, {m.year}
                        </div>

                        {/* Topic */}
                        <div style={s.grid2}>
                          <div style={s.fieldGroup}>
                            <label style={s.label}>Topic</label>
                            <input name="topic" defaultValue={m.topic ?? ''} style={s.input} placeholder="Gastrointestinal disorders in midlife women" />
                          </div>
                          <div style={s.fieldGroup}>
                            <label style={s.label}>Presenter</label>
                            <input name="topicPresenter" defaultValue={m.topicPresenter ?? ''} style={s.input} placeholder="Dr. Eva Alsheik" />
                          </div>
                        </div>
                        <div style={s.fieldGroup}>
                          <label style={s.label}>Speaker website URL <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(links their name on the site)</span></label>
                          <input name="speakerUrl" defaultValue={m.speakerUrl ?? ''} style={s.input} placeholder="https://drevaalsheikomd.com" />
                        </div>

                        {/* Speaker photo */}
                        <div style={s.fieldGroup}>
                          <label style={s.label}>
                            Speaker photo
                            {m.speakerPhoto && (
                              <span style={{ marginLeft: 8, fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#2d6a2d' }}>
                                — photo on file, upload to replace
                              </span>
                            )}
                          </label>
                          {m.speakerPhoto && (
                            <img
                              src={`/api/img?url=${encodeURIComponent(m.speakerPhoto)}`}
                              alt="Current speaker photo"
                              style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #d8d3e8', marginBottom: 8, display: 'block' }}
                            />
                          )}
                          <input name="speakerPhoto" type="file" accept="image/*" style={{ ...s.input, padding: '8px 14px' }} />
                        </div>

                        <div style={s.divider} />

                        {/* Article */}
                        <div style={s.fieldGroup}>
                          <label style={s.label}>Article title</label>
                          <input name="articleTitle" defaultValue={m.articleTitle ?? ''} style={s.input} placeholder="Gut-brain axis and menopausal symptoms" />
                        </div>
                        <div style={s.grid2}>
                          <div style={s.fieldGroup}>
                            <label style={s.label}>
                              Article PDF
                              {m.articleUrl && (
                                <span style={{ marginLeft: 8, fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#2d6a2d' }}>
                                  — PDF on file, upload to replace
                                </span>
                              )}
                            </label>
                            <input name="articlePdf" type="file" accept=".pdf" style={{ ...s.input, padding: '8px 14px' }} />
                          </div>
                          <div style={s.fieldGroup}>
                            <label style={s.label}>
                              Article cover image
                              {m.articleThumb && (
                                <span style={{ marginLeft: 8, fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#2d6a2d' }}>
                                  — image on file, upload to replace
                                </span>
                              )}
                            </label>
                            {m.articleThumb && (
                              <img
                                src={`/api/img?url=${encodeURIComponent(m.articleThumb)}`}
                                alt="Current article cover"
                                style={{ width: 36, height: 48, objectFit: 'cover', borderRadius: 3, border: '1.5px solid #d8d3e8', marginBottom: 8, display: 'block' }}
                              />
                            )}
                            <input name="articleThumb" type="file" accept="image/*" style={{ ...s.input, padding: '8px 14px' }} />
                          </div>
                        </div>

                        {/* RSVP */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer', marginBottom: 16 }}>
                          <input type="checkbox" name="rsvpOpen" defaultChecked={m.rsvpOpen} />
                          RSVP open
                        </label>

                        <div style={{ display: 'flex', gap: 8 }}>
                          <button type="submit" style={s.submitBtn}>Save meeting</button>
                          <a href="/admin/dashboard#meetings" style={{ ...s.deleteBtn, color: '#5a5168', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>Cancel</a>
                        </div>

                        {/* Social image preview (reflects saved state) */}
                        <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid #ede9f7' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span style={{ ...s.label, marginBottom: 0 }}>Social image preview <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(reflects saved state)</span></span>
                            <a
                              href={`/api/og?id=${m.id}`}
                              download={`mmc-${m.id}-social.png`}
                              style={{ ...s.submitBtn, textDecoration: 'none', fontSize: 13, padding: '8px 16px' }}
                            >
                              Download PNG →
                            </a>
                          </div>
                          <img
                            src={`/api/og?id=${m.id}`}
                            alt="Social media image preview"
                            style={{ width: '100%', borderRadius: 8, border: '1px solid #ede9f7', display: 'block' }}
                          />
                        </div>
                      </form>
                    ) : (
                      <div style={s.row}>
                        <div>
                          <span style={{ fontWeight: 500, fontSize: 14 }}>{m.quarter}</span>
                          <span style={{ marginLeft: 10, fontSize: 13, color: '#7a6e8a' }}>
                            {m.month} {m.day}, {m.year}
                          </span>
                          {m.topic && (
                            <span style={{ marginLeft: 10, fontSize: 12, color: '#9B6FFF', fontFamily: 'var(--font-plex-mono), monospace', letterSpacing: '0.04em' }}>
                              {m.topic.length > 40 ? m.topic.slice(0, 40) + '…' : m.topic}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          <a href={`/admin/dashboard?editM=${m.id}#meetings`} style={{ ...s.deleteBtn, color: '#5a5168', textDecoration: 'none' }}>Edit</a>
                          <a href={`/api/og?id=${m.id}`} target="_blank" rel="noopener noreferrer" style={{ ...s.deleteBtn, color: '#6D3BE4', textDecoration: 'none' }}>Social ↗</a>
                          <form action={deleteMeeting}>
                            <input type="hidden" name="id" value={m.id} />
                            <button type="submit" style={s.deleteBtn}>Delete</button>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── MEMBERS ── */}
        <div id="members" style={s.card}>
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

        {/* ── SITE CONTENT ── */}
        <div id="content" style={s.card}>
          <h2 style={s.sectionTitle}>Site Content</h2>
          <form action={editContent}>

            {/* Home */}
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#5a5168', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 16px', fontFamily: 'var(--font-plex-mono), monospace' }}>Home</h3>
            <div style={s.fieldGroup}>
              <label style={s.label}>Hero eyebrow</label>
              <input name="home_hero_eyebrow" defaultValue={content.home_hero_eyebrow} style={s.input} />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Hero lede</label>
              <textarea name="home_hero_lede" defaultValue={content.home_hero_lede} rows={4} style={{ ...s.input, resize: 'vertical' }} />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Hero tagline</label>
              <input name="home_hero_tagline" defaultValue={content.home_hero_tagline} style={s.input} />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Mission lede</label>
              <textarea name="home_mission_lede" defaultValue={content.home_mission_lede} rows={3} style={{ ...s.input, resize: 'vertical' }} />
            </div>
            <div style={{ ...s.fieldGroup, marginBottom: 28 }}>
              <label style={s.label}>Membership text</label>
              <textarea name="home_membership_text" defaultValue={content.home_membership_text} rows={3} style={{ ...s.input, resize: 'vertical' }} />
            </div>

            <div style={s.divider} />

            {/* Meetings */}
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#5a5168', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 16px', fontFamily: 'var(--font-plex-mono), monospace' }}>Meetings</h3>
            <div style={s.fieldGroup}>
              <label style={s.label}>Header lede</label>
              <textarea name="meetings_header_lede" defaultValue={content.meetings_header_lede} rows={3} style={{ ...s.input, resize: 'vertical' }} />
            </div>
            <div style={{ ...s.fieldGroup, marginBottom: 28 }}>
              <label style={s.label}>Past meetings note</label>
              <input name="meetings_past_note" defaultValue={content.meetings_past_note} style={s.input} />
            </div>

            <p style={{ fontSize: 12, fontFamily: 'var(--font-plex-mono), monospace', color: '#7a6e8a', margin: '0 0 14px', letterSpacing: '0.04em' }}>THE CADENCE — each season has a headline and a sub-note</p>
            {([
              { season: 'Spring', noteKey: 'cadence_spring_note', asideKey: 'cadence_spring_aside' },
              { season: 'Summer', noteKey: 'cadence_summer_note', asideKey: 'cadence_summer_aside' },
              { season: 'Fall',   noteKey: 'cadence_fall_note',   asideKey: 'cadence_fall_aside' },
              { season: 'Winter', noteKey: 'cadence_winter_note', asideKey: 'cadence_winter_aside' },
            ] as const).map(({ season, noteKey, asideKey }) => (
              <div key={season} style={{ ...s.grid2, marginBottom: 12 }}>
                <div style={s.fieldGroup}>
                  <label style={s.label}>{season} — headline</label>
                  <input name={noteKey} defaultValue={content[noteKey]} style={s.input} />
                </div>
                <div style={{ ...s.fieldGroup, marginBottom: 0 }}>
                  <label style={s.label}>{season} — sub-note</label>
                  <input name={asideKey} defaultValue={content[asideKey]} style={s.input} />
                </div>
              </div>
            ))}
            <div style={{ marginBottom: 28 }} />

            <div style={s.divider} />

            {/* Resources */}
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#5a5168', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 16px', fontFamily: 'var(--font-plex-mono), monospace' }}>Resources</h3>
            <div style={{ ...s.fieldGroup, marginBottom: 28 }}>
              <label style={s.label}>Header lede</label>
              <textarea name="resources_header_lede" defaultValue={content.resources_header_lede} rows={3} style={{ ...s.input, resize: 'vertical' }} />
            </div>

            <div style={s.divider} />

            {/* Members */}
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#5a5168', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 16px', fontFamily: 'var(--font-plex-mono), monospace' }}>Members</h3>
            <div style={s.fieldGroup}>
              <label style={s.label}>Header lede</label>
              <textarea name="members_header_lede" defaultValue={content.members_header_lede} rows={3} style={{ ...s.input, resize: 'vertical' }} />
            </div>
            <div style={{ ...s.fieldGroup, marginBottom: 28 }}>
              <label style={s.label}>Opt-in note</label>
              <textarea name="members_optin_note" defaultValue={content.members_optin_note} rows={3} style={{ ...s.input, resize: 'vertical' }} />
            </div>

            <div style={s.divider} />

            {/* Leadership & Board */}
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#5a5168', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 16px', fontFamily: 'var(--font-plex-mono), monospace' }}>Leadership &amp; Board</h3>
            <div style={s.fieldGroup}>
              <label style={s.label}>Header lede</label>
              <textarea name="leadership_header_lede" defaultValue={content.leadership_header_lede} rows={3} style={{ ...s.input, resize: 'vertical' }} />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Governance note</label>
              <textarea name="leadership_governance" defaultValue={content.leadership_governance} rows={3} style={{ ...s.input, resize: 'vertical' }} />
            </div>
            <div style={s.grid2}>
              <div style={s.fieldGroup}>
                <label style={s.label}>CTA link text</label>
                <input name="leadership_cta_label" defaultValue={content.leadership_cta_label} style={s.input} placeholder="Reach out to Dr. Leff" />
              </div>
              <div style={{ ...s.fieldGroup, marginBottom: 28 }}>
                <label style={s.label}>CTA link URL</label>
                <input name="leadership_cta_url" defaultValue={content.leadership_cta_url} style={s.input} placeholder="mailto:drleff@drcarrieleff.com" />
              </div>
            </div>

            <div style={s.divider} />

            {/* Submit a Case */}
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#5a5168', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 16px', fontFamily: 'var(--font-plex-mono), monospace' }}>Submit a Case</h3>
            <div style={s.fieldGroup}>
              <label style={s.label}>Header lede</label>
              <textarea name="submit_header_lede" defaultValue={content.submit_header_lede} rows={3} style={{ ...s.input, resize: 'vertical' }} />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>What to include <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(one item per line)</span></label>
              <textarea name="submit_what_to_include" defaultValue={content.submit_what_to_include} rows={5} style={{ ...s.input, resize: 'vertical' }} />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>What happens next <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(one item per line)</span></label>
              <textarea name="submit_what_happens_next" defaultValue={content.submit_what_happens_next} rows={4} style={{ ...s.input, resize: 'vertical' }} />
            </div>
            <div style={{ ...s.fieldGroup, marginBottom: 24 }}>
              <label style={s.label}>Membership reminder</label>
              <textarea name="submit_membership_reminder" defaultValue={content.submit_membership_reminder} rows={3} style={{ ...s.input, resize: 'vertical' }} />
            </div>

            <button type="submit" style={s.submitBtn}>Save content</button>
          </form>
        </div>

      </div>
    </div>
  );
}
