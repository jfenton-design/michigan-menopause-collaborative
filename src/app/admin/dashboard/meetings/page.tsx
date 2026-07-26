import * as React from 'react';
import { getMeetings } from '@/lib/admin-db';
import { createMeeting, editMeeting, deleteMeeting } from '../actions';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { MeetingsTabs } from '@/components/admin/MeetingsTabs';
import { SavedBanner } from '@/components/admin/SavedBanner';
import { AddMeetingModal } from '@/components/admin/AddMeetingModal';
import { s } from '@/components/admin/formStyles';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Meetings · MMC Admin' };

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default async function MeetingsSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; editM?: string }>;
}) {
  const [{ saved, editM }, meetings] = await Promise.all([
    searchParams,
    getMeetings(),
  ]);

  return (
    <div style={s.page}>
      <AdminHeader active="meetings" />
      <MeetingsTabs active="schedule" />
      <SavedBanner show={saved === '1'} />

      <div style={s.content}>

        {/* ── MEETINGS ── */}
        <div id="meetings" style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 4 }}>
            <h2 style={{ ...s.sectionTitle, margin: 0 }}>Meetings</h2>
            <AddMeetingModal action={createMeeting} />
          </div>

          {meetings.length === 0 ? (
            <p style={{ fontSize: 14, color: '#7a6e8a', marginTop: 16 }}>
              No meetings yet — use <strong>Add meeting</strong> to create the first one.
            </p>
          ) : (
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

                        {/* Date / logistics */}
                        <div style={s.grid2}>
                          <div style={s.fieldGroup}>
                            <label style={s.label}>Quarter</label>
                            <input name="quarter" defaultValue={m.quarter} required style={s.input} />
                          </div>
                          <div style={s.fieldGroup}>
                            <label style={s.label}>Weekday</label>
                            <select name="weekday" defaultValue={m.weekday} style={s.input}>
                              {WEEKDAYS.map(d => <option key={d}>{d}</option>)}
                            </select>
                          </div>
                        </div>
                        <div style={s.grid2}>
                          <div style={s.fieldGroup}>
                            <label style={s.label}>Month</label>
                            <select name="month" defaultValue={m.month} style={s.input}>
                              {MONTHS.map(mo => <option key={mo}>{mo}</option>)}
                            </select>
                          </div>
                          <div style={s.grid2}>
                            <div style={s.fieldGroup}>
                              <label style={s.label}>Day</label>
                              <input name="day" type="number" min={1} max={31} defaultValue={m.day} style={s.input} />
                            </div>
                            <div style={s.fieldGroup}>
                              <label style={s.label}>Year</label>
                              <input name="year" type="number" min={2024} max={2040} defaultValue={m.year} style={s.input} />
                            </div>
                          </div>
                        </div>
                        <div style={s.fieldGroup}>
                          <label style={s.label}>Time</label>
                          <input name="time" defaultValue={m.time} style={s.input} />
                        </div>
                        <div style={s.fieldGroup}>
                          <label style={s.label}>Location (full)</label>
                          <textarea name="location" defaultValue={m.location} rows={2} style={{ ...s.input, resize: 'vertical' }} />
                        </div>
                        <div style={s.fieldGroup}>
                          <label style={s.label}>Location (short)</label>
                          <input name="locationShort" defaultValue={m.locationShort} style={s.input} />
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer', marginBottom: 16 }}>
                          <input type="checkbox" name="showKarmanos" defaultChecked={m.showKarmanos !== false} />
                          Show Karmanos venue credit
                        </label>

                        <div style={s.divider} />

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
                          <a href="/admin/dashboard/meetings#meetings" style={{ ...s.deleteBtn, color: '#5a5168', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>Cancel</a>
                        </div>

                        {/* Social image previews (reflect saved state) — two variants */}
                        <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid #ede9f7' }}>
                          <span style={{ ...s.label }}>Social images <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(reflect saved state)</span></span>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {([
                              { key: 'default', label: 'Text card', qs: '' },
                              { key: 'photo', label: 'Photo card', qs: '&variant=photo' },
                            ] as const).map(v => (
                              <div key={v.key}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                  <span style={{ fontSize: 12, fontWeight: 600, color: '#5a5168' }}>{v.label}</span>
                                  <a
                                    href={`/api/og?id=${m.id}${v.qs}`}
                                    download={`mmc-${m.id}-${v.key}-social.png`}
                                    style={{ ...s.submitBtn, textDecoration: 'none', fontSize: 12, padding: '6px 12px' }}
                                  >
                                    Download →
                                  </a>
                                </div>
                                <img
                                  src={`/api/og?id=${m.id}${v.qs}`}
                                  alt={`${v.label} social image preview`}
                                  style={{ width: '100%', borderRadius: 8, border: '1px solid #ede9f7', display: 'block' }}
                                />
                              </div>
                            ))}
                          </div>
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
                          <a href={`/admin/dashboard/meetings?editM=${m.id}#meetings`} style={{ ...s.deleteBtn, color: '#5a5168', textDecoration: 'none' }}>Edit</a>
                          <a href={`/api/og?id=${m.id}`} target="_blank" rel="noopener noreferrer" style={{ ...s.deleteBtn, color: '#6D3BE4', textDecoration: 'none' }}>Social ↗</a>
                          <a href={`/api/og?id=${m.id}&variant=photo`} target="_blank" rel="noopener noreferrer" style={{ ...s.deleteBtn, color: '#6D3BE4', textDecoration: 'none' }}>Photo ↗</a>
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

      </div>
    </div>
  );
}
