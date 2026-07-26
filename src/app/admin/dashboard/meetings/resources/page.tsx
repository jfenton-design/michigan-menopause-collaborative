import * as React from 'react';
import { getResources, getContent } from '@/lib/admin-db';
import { uploadResource, editResource, deleteResource, editContent } from '../../actions';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { MeetingsTabs } from '@/components/admin/MeetingsTabs';
import { SavedBanner } from '@/components/admin/SavedBanner';
import { s } from '@/components/admin/formStyles';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Resources · MMC Admin' };

const RESOURCE_TYPES = ['Meeting notes', 'Article', 'Reference', 'Handout', 'Other'];
const REDIRECT_TO = '/admin/dashboard/meetings/resources';

export default async function MeetingsResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; edit?: string }>;
}) {
  const [{ saved, edit }, resources, content] = await Promise.all([
    searchParams,
    getResources(),
    getContent(),
  ]);

  return (
    <div style={s.page}>
      <AdminHeader active="meetings" />
      <MeetingsTabs active="resources" />
      <SavedBanner show={saved === '1'} />

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
                          <a href="/admin/dashboard/meetings/resources" style={{ ...s.deleteBtn, color: '#5a5168', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>Cancel</a>
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
                          <a href={`/admin/dashboard/meetings/resources?edit=${i}`} style={{ ...s.deleteBtn, color: '#5a5168', textDecoration: 'none' }}>Edit</a>
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

        {/* ── RESOURCES PAGE COPY ── */}
        <div style={s.card}>
          <h2 style={s.sectionTitle}>Resources page copy</h2>
          <p style={{ fontSize: 14, color: '#7a6e8a', marginTop: -12, marginBottom: 20 }}>
            The wording on the public <strong>/resources</strong> page.
          </p>
          <form action={editContent}>
            <input type="hidden" name="redirectTo" value={REDIRECT_TO} />
            <div style={{ ...s.fieldGroup, marginBottom: 24 }}>
              <label style={s.label}>Header lede</label>
              <textarea name="resources_header_lede" defaultValue={content.resources_header_lede} rows={3} style={{ ...s.input, resize: 'vertical' }} />
            </div>
            <button type="submit" style={s.submitBtn}>Save resources copy</button>
          </form>
        </div>

      </div>
    </div>
  );
}
