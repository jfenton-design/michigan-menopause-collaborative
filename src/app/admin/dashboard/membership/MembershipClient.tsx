'use client';
import * as React from 'react';
import type { Meeting } from '@/lib/data';
import type { CheckinMember } from '@/lib/checkin-data';
import { BloomMark } from '@/components/Logo';
import { uploadCheckinPhoto } from '../checkin/actions';
import { syncRsvpsFromSheet, persistRoster } from './actions';
import styles from './membership.module.css';

/* ---------------------------------------------------------------- helpers */

const BLOB_ORIGIN = 'https://bfbwrnmnnw2zzg0c.private.blob.vercel-storage.com/';

/** Downscale + JPEG-compress a chosen photo before upload (mirrors Check-In). */
function downscaleImage(file: File, maxDim: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width: w, height: h } = img;
        const scale = Math.min(1, maxDim / Math.max(w, h));
        w = Math.round(w * scale);
        h = Math.round(h * scale);
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        c.getContext('2d')!.drawImage(img, 0, 0, w, h);
        c.toBlob(b => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/jpeg', 0.82);
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Private blob photos must go through the /api/img proxy (auth token);
 *  anything else (data URI, absolute http from elsewhere) renders directly. */
function photoSrc(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith(BLOB_ORIGIN)) return `/api/img?url=${encodeURIComponent(url)}`;
  return url;
}

function initials(m: CheckinMember): string {
  const a = (m.first || '').trim()[0] || '';
  const b = (m.last || '').trim()[0] || '';
  return (a + b).toUpperCase() || '?';
}
function fullName(m: CheckinMember): string {
  return [m.prefix, m.first, m.last].filter(Boolean).join(' ').trim() || '(no name)';
}
function metaLine(m: CheckinMember): string {
  return [m.cred, m.spec, m.practice].map(x => (x || '').trim()).filter(Boolean).join(' · ');
}
function hay(m: CheckinMember): string {
  return [m.first, m.last, m.prefix, m.cred, m.spec, m.practice, m.email, m.phone, m.ptype].join(' ').toLowerCase();
}
function attended(m: CheckinMember, id: string) { return m.seasons?.[id] === 'in'; }
function attendedCount(m: CheckinMember): number {
  return Object.values(m.seasons ?? {}).filter(v => v === 'in').length;
}
function sortByName(roster: CheckinMember[]): CheckinMember[] {
  return [...roster].sort((a, b) => (a.last || '').localeCompare(b.last || '') || (a.first || '').localeCompare(b.first || ''));
}
function meetingDate(mt: Meeting): string {
  return [mt.weekday, `${mt.month} ${mt.day}`, mt.year].filter(v => v && v !== '—').join(', ');
}
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
function blankMember(id: string): CheckinMember {
  return { id, prefix: '', first: '', last: '', cred: '', mscp: '', ptype: '', spec: '', practice: '', email: '', phone: '', notes: '', consent: '', seasons: {}, rsvp: {}, edited: true };
}

const PREFIX_OPTS = ['', 'Dr.', 'Ms.', 'Mrs.', 'Mr.', 'Mx.'];
const PTYPE_OPTS = ['', 'Physician', 'NP', 'PA', 'PT', 'Therapist', 'Nutrition', 'Other'];
const MSCP_OPTS = ['', 'Certified', 'In progress', 'No'];
const SPEC_OPTS = ['', 'OB/GYN', 'Family Medicine', 'Internal Medicine', 'Dermatology', 'Endocrine', 'Surgery', 'Therapy', 'Nutrition', 'Breast', 'Heme/Onc', 'Nephrology', 'Urology', 'Sexual Health', 'GI', 'PT', 'Other'];
const EDIT_FIELDS: Array<{ k: keyof CheckinMember; label: string; type: 'text' | 'select' | 'email' | 'tel'; half?: boolean; opts?: string[] }> = [
  { k: 'prefix', label: 'Prefix', type: 'select', half: true, opts: PREFIX_OPTS },
  { k: 'cred', label: 'Credentials', type: 'text', half: true },
  { k: 'first', label: 'First name', type: 'text', half: true },
  { k: 'last', label: 'Last name', type: 'text', half: true },
  { k: 'email', label: 'Email', type: 'email' },
  { k: 'phone', label: 'Phone', type: 'tel' },
  { k: 'practice', label: 'Practice', type: 'text' },
  { k: 'spec', label: 'Specialty', type: 'select', half: true, opts: SPEC_OPTS },
  { k: 'ptype', label: 'Provider type', type: 'select', half: true, opts: PTYPE_OPTS },
  { k: 'mscp', label: 'MSCP status', type: 'select', opts: MSCP_OPTS },
];

/** A member is anyone who has attended at least one meeting (currently the
 *  first two events — we don't charge yet, so attendance = membership). */
function isMember(m: CheckinMember): boolean {
  return attendedCount(m) > 0;
}
/** Shown in the directory / membership PDF unless explicitly opted out. */
function shownInDirectory(m: CheckinMember): boolean {
  return (m.consent || '').trim().toLowerCase() !== 'no';
}

function esc(s: unknown): string {
  return String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
}

/** Self-contained, print-optimized HTML for the branded member directory PDF. */
function buildDirectoryHtml(members: CheckinMember[], generatedOn: string): string {
  const LOGO = 'https://michiganmenopause.com/assets/mmc-logo.png';
  const rows = members.map((m, i) => {
    const name = [m.prefix, m.first, m.last].filter(Boolean).join(' ').trim() || '—';
    return `<tr>
      <td class="num">${i + 1}</td>
      <td class="name">${esc(name)}</td>
      <td>${esc(m.cred || '—')}</td>
      <td>${esc(m.spec || m.ptype || '—')}</td>
      <td>${esc(m.practice || '—')}</td>
      <td class="email">${esc(m.email || '—')}</td>
      <td class="phone">${esc(m.phone || '—')}</td>
    </tr>`;
  }).join('');
  const count = members.length;
  return `<!doctype html><html><head><meta charset="utf-8"><title>MMC Member Directory</title>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1F1535; padding: 0 0.5in 60px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .brandbar { display: flex; align-items: center; gap: 14px; padding: 22px 0 14px; border-bottom: 3px solid #6B3FCB; }
  .brandbar img { width: 46px; height: 46px; display: block; }
  .brandbar h1 { font-size: 18px; margin: 0; letter-spacing: -0.01em; }
  .brandbar .sub { font-size: 11px; color: #7A6E96; margin-top: 3px; font-family: 'Courier New', monospace; letter-spacing: 0.08em; text-transform: uppercase; }
  .meta { margin-left: auto; text-align: right; font-size: 11px; color: #7A6E96; line-height: 1.5; }
  .meta strong { color: #6B3FCB; font-size: 15px; }
  table { width: 100%; border-collapse: collapse; margin-top: 18px; font-size: 11px; }
  thead th { text-align: left; background: #F7F4FB; color: #6B3FCB; text-transform: uppercase; letter-spacing: 0.05em; font-size: 9px; padding: 8px; border-bottom: 1.5px solid #E8DEF7; }
  tbody td { padding: 7px 8px; border-bottom: 1px solid #efeaf7; vertical-align: top; }
  tbody tr:nth-child(even) { background: #FAF8FE; }
  .name { font-weight: 600; white-space: nowrap; }
  .num { color: #b3a9c9; width: 22px; }
  .phone { white-space: nowrap; }
  .email { word-break: break-all; }
  .footer { position: fixed; bottom: 0; left: 0; right: 0; display: flex; align-items: center; gap: 10px; font-size: 11px; color: #7A6E96; padding: 8px 0.5in; border-top: 1px solid #E8DEF7; background: #fff; }
  .footer img { width: 22px; height: 22px; display: block; }
  .footer .site { margin-left: auto; color: #6B3FCB; font-weight: bold; text-decoration: none; }
  @media print {
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; }
  }
  @page { size: letter landscape; margin: 0.45in; }
</style></head><body>
  <div class="brandbar">
    <img src="${LOGO}" alt="MMC">
    <div>
      <h1>Michigan Menopause Collaborative</h1>
      <div class="sub">Member Directory</div>
    </div>
    <div class="meta"><strong>${count}</strong> member${count === 1 ? '' : 's'}<br>Generated ${esc(generatedOn)}</div>
  </div>
  <table>
    <thead><tr>
      <th class="num">#</th><th>Name</th><th>Credentials</th><th>Specialty</th><th>Practice</th><th>Email</th><th>Phone</th>
    </tr></thead>
    <tbody>${rows || '<tr><td colspan="7" style="padding:30px;text-align:center;color:#7A6E96">No members to list yet.</td></tr>'}</tbody>
  </table>
  <div class="footer">
    <img src="${LOGO}" alt="">
    <span>Michigan Menopause Collaborative &middot; Midlife women&rsquo;s care, improved together</span>
    <a class="site" href="https://michiganmenopause.com">michiganmenopause.com</a>
  </div>
</body></html>`;
}


/* ------------------------------------------------------------- component */

export function MembershipClient({ initialMeetings, initialRoster }: { initialMeetings: Meeting[]; initialRoster: CheckinMember[] }) {
  const meetings = initialMeetings;
  const [roster, setRoster] = React.useState<CheckinMember[]>(initialRoster);

  const [query, setQuery] = React.useState('');
  const [dirFilter, setDirFilter] = React.useState<'all' | 'attended' | 'mscp' | 'noemail'>('all');
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [pendingNewId, setPendingNewId] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);
  const [syncing, setSyncing] = React.useState(false);
  const [syncMsg, setSyncMsg] = React.useState<{ ok: boolean; text: string } | null>(null);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  }

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(label);
    } catch {
      showToast('Copy failed — select and copy manually');
    }
  }

  async function handleSync() {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await syncRsvpsFromSheet();
      if (res.roster) setRoster(res.roster);
      setSyncMsg({ ok: res.ok, text: res.message });
      showToast(res.ok ? 'RSVPs synced' : 'Sync issue — see details');
    } catch (err) {
      console.error('[membership] sync failed', err);
      setSyncMsg({ ok: false, text: 'Sync failed — check the connection and try again.' });
    } finally {
      setSyncing(false);
    }
  }

  async function handlePhoto(memberId: string, file: File): Promise<void> {
    const blob = await downscaleImage(file, 320);
    const fd = new FormData();
    fd.set('photo', blob, 'photo.jpg');
    const url = await uploadCheckinPhoto(memberId, fd);
    const next = roster.map(m => (m.id === memberId ? { ...m, photo: url, edited: true } : m));
    setRoster(next);
    await persistRoster(next);
    showToast('Photo saved');
  }

  async function handleToggleAttendance(memberId: string, meetingId: string): Promise<void> {
    const next = roster.map(m => {
      if (m.id !== memberId) return m;
      const seasons = { ...m.seasons };
      if (seasons[meetingId] === 'in') delete seasons[meetingId];
      else seasons[meetingId] = 'in';
      return { ...m, seasons, edited: true };
    });
    setRoster(next); // optimistic
    try {
      await persistRoster(next);
      showToast('Attendance updated');
    } catch (err) {
      console.error('[membership] attendance save failed', err);
      showToast('Saved on screen, but not persisted (check connection)');
    }
  }

  async function handleSaveDetails(memberId: string, patch: Partial<CheckinMember>): Promise<void> {
    const next = roster.map(m => (m.id === memberId ? { ...m, ...patch, edited: true } : m));
    setRoster(next);
    if (memberId === pendingNewId) setPendingNewId(null);
    try {
      await persistRoster(next);
      showToast('Saved');
    } catch (err) {
      console.error('[membership] save details failed', err);
      showToast('Saved on screen, but not persisted (check connection)');
    }
  }

  async function handleDeleteContact(memberId: string): Promise<void> {
    const next = roster.filter(m => m.id !== memberId);
    setRoster(next);
    setSelectedId(null);
    setPendingNewId(null);
    try {
      await persistRoster(next);
      showToast('Contact removed');
    } catch (err) {
      console.error('[membership] delete failed', err);
      showToast('Removed on screen, but not persisted (check connection)');
    }
  }

  function handleAddContact() {
    const id = 'new' + Math.random().toString(36).slice(2, 10);
    setRoster([...roster, blankMember(id)]);
    setPendingNewId(id);
    setSelectedId(id);
  }

  /** Close the drawer; discard an unsaved brand-new contact. */
  function closeDrawer() {
    if (selectedId && selectedId === pendingNewId) {
      setRoster(roster.filter(m => m.id !== selectedId));
    }
    setPendingNewId(null);
    setSelectedId(null);
  }

  async function handleToggleDirectory(memberId: string): Promise<void> {
    const next = roster.map(m => (m.id === memberId ? { ...m, consent: shownInDirectory(m) ? 'No' : 'Yes', edited: true } : m));
    setRoster(next);
    try {
      await persistRoster(next);
      showToast('Directory visibility updated');
    } catch (err) {
      console.error('[membership] directory toggle failed', err);
      showToast('Saved on screen, but not persisted (check connection)');
    }
  }

  function handleDownloadPdf() {
    const members = sortByName(roster).filter(m => isMember(m) && shownInDirectory(m));
    const generatedOn = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const html = buildDirectoryHtml(members, generatedOn);
    // Print via a hidden iframe with srcdoc (popup-safe and no contentWindow
    // timing races), then open the browser's print → Save-as-PDF dialog.
    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    iframe.onload = () => {
      const win = iframe.contentWindow;
      if (!win) { iframe.remove(); return; }
      const cleanup = () => setTimeout(() => iframe.remove(), 1500);
      win.onafterprint = cleanup;
      try {
        win.focus();
        setTimeout(() => win.print(), 300); // small delay lets the logo images load
      } catch {
        cleanup();
      }
      setTimeout(cleanup, 60000); // fallback if dismissed without an event
    };
    iframe.srcdoc = html;
    document.body.appendChild(iframe);
    showToast('Opening print dialog — choose “Save as PDF”');
  }

  /* directory list */
  const dirList = sortByName(roster).filter(m => {
    if (query && !hay(m).includes(query)) return false;
    switch (dirFilter) {
      case 'attended': return attendedCount(m) > 0;
      case 'mscp': return (m.mscp || '').toLowerCase() === 'certified';
      case 'noemail': return !(m.email || '').trim();
      default: return true;
    }
  });

  const selected = selectedId ? roster.find(m => m.id === selectedId) ?? null : null;

  const mscpCount = roster.filter(m => (m.mscp || '').toLowerCase() === 'certified').length;
  const withEmail = roster.filter(m => (m.email || '').trim()).length;
  const memberCount = roster.filter(m => isMember(m) && shownInDirectory(m)).length;

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div className={styles.hrow}>
          <div className={styles.brand}>
            <BloomMark dim={32} ink="white" accent="#9B6FFF" />
            <div>
              <h1 className={styles.title}>MMC Admin Panel</h1>
              <p className={styles.sub}>Membership</p>
            </div>
          </div>
        </div>
        <div className={styles.navTabs}>
          <a href="/admin/dashboard" className={cx(styles.navTab, styles.backlink)}>← Dashboard</a>
          <span className={cx(styles.navTab, styles.navTabActive)}>Directory</span>
        </div>
      </header>

      <div className={styles.content}>
        <>
            <div className={styles.panel} style={{ padding: '18px 22px', marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <h2 className={styles.panelTitle} style={{ fontSize: 16 }}>Google Sheet RSVPs</h2>
                  <p className={styles.panelSub}>Pull the latest RSVPs from your public RSVP form into this roster. Matches people by email, fills in blanks, and adds anyone new — it never overwrites what you&apos;ve already got.</p>
                </div>
                <button className={cx(styles.btn, styles.btnBrand)} onClick={handleSync} disabled={syncing} style={syncing ? { opacity: 0.6, cursor: 'wait' } : undefined}>
                  {syncing ? 'Syncing…' : '⟳ Sync RSVPs'}
                </button>
              </div>
              {syncMsg && (
                <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, fontSize: 13, background: syncMsg.ok ? '#EAF4EA' : '#FDECEA', color: syncMsg.ok ? '#2d6a2d' : '#a3352a', border: `1px solid ${syncMsg.ok ? '#b7ddb7' : '#f0c2bb'}` }}>
                  {syncMsg.ok ? '✓ ' : '⚠ '}{syncMsg.text}
                </div>
              )}
            </div>

            <div className={styles.stats}>
              <div className={styles.stat}><div className={styles.statNum}>{roster.length}</div><div className={styles.statLabel}>Members &amp; guests</div></div>
              <div className={cx(styles.stat, styles.statRsvp)}><div className={styles.statNum}>{mscpCount}</div><div className={styles.statLabel}>MSCP certified</div></div>
              <div className={cx(styles.stat, styles.statIn)}><div className={styles.statNum}>{withEmail}</div><div className={styles.statLabel}>With email on file</div></div>
            </div>

            <div className={styles.tools}>
              <div className={styles.search}>
                <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
                <input value={query} onChange={e => setQuery(e.target.value.trim().toLowerCase())} type="search" placeholder="Search name, practice, specialty, email…" />
              </div>
              <button className={cx(styles.btn, styles.btnGhost)} onClick={handleDownloadPdf} title="Download the current member directory as a branded PDF">⤓ Download PDF ({memberCount})</button>
              <button className={cx(styles.btn, styles.btnBrand)} onClick={handleAddContact}>＋ New contact</button>
            </div>

            <div className={styles.filters}>
              {([
                { k: 'all', label: 'All' },
                { k: 'attended', label: 'Has attended' },
                { k: 'mscp', label: 'MSCP certified' },
                { k: 'noemail', label: 'Missing email' },
              ] as const).map(f => (
                <button key={f.k} className={cx(styles.chip, dirFilter === f.k && styles.chipActive)} onClick={() => setDirFilter(f.k)}>{f.label}</button>
              ))}
            </div>

            <div className={styles.grid}>
              {dirList.length === 0 ? (
                <div className={styles.empty}>No one matches. Try a different search or filter.</div>
              ) : dirList.map(m => {
                const src = photoSrc(m.photo);
                const nAtt = attendedCount(m);
                return (
                  <button key={m.id} className={styles.mcard} onClick={() => setSelectedId(m.id)}>
                    <div className={styles.avatar}>{src ? <img src={src} alt="" /> : initials(m)}</div>
                    <div className={styles.mbody}>
                      <p className={styles.mname}>{fullName(m)}{m.cred && <span className={styles.mcred}>{m.cred}</span>}</p>
                      <p className={styles.mmeta}>{metaLine(m) || '—'}</p>
                      <div className={styles.mtags}>
                        {m.leadership && <span className={cx(styles.tag, styles.tagAccent)}>LEADERSHIP</span>}
                        {nAtt > 0 && <span className={cx(styles.tag, styles.tagIn)}>{nAtt} MEETING{nAtt > 1 ? 'S' : ''}</span>}
                        {(m.mscp || '').toLowerCase() === 'certified' && <span className={cx(styles.tag, styles.tagAccent)}>MSCP</span>}
                        {!(m.email || '').trim() && <span className={cx(styles.tag, styles.tagMuted)}>NO EMAIL</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
        </>
      </div>

      {selected && (
        <ProfileDrawer
          key={selected.id}
          member={selected}
          meetings={meetings}
          startEditing={selected.id === pendingNewId}
          onClose={closeDrawer}
          onCopy={copyText}
          onPhoto={handlePhoto}
          onToggleAttendance={handleToggleAttendance}
          onSaveDetails={handleSaveDetails}
          onDelete={handleDeleteContact}
          onToggleDirectory={handleToggleDirectory}
        />
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}

/* ------------------------------------------------------- profile drawer */

function ProfileDrawer({ member, meetings, startEditing, onClose, onCopy, onPhoto, onToggleAttendance, onSaveDetails, onDelete, onToggleDirectory }: {
  member: CheckinMember;
  meetings: Meeting[];
  startEditing?: boolean;
  onClose: () => void;
  onCopy: (t: string, l: string) => void;
  onPhoto: (memberId: string, file: File) => Promise<void>;
  onToggleAttendance: (memberId: string, meetingId: string) => void;
  onSaveDetails: (memberId: string, patch: Partial<CheckinMember>) => void;
  onDelete: (memberId: string) => void;
  onToggleDirectory: (memberId: string) => void;
}) {
  const src = photoSrc(member.photo);
  const nAtt = attendedCount(member);
  const email = (member.email || '').trim();
  const phone = (member.phone || '').trim();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [editing, setEditing] = React.useState(!!startEditing);
  const [form, setForm] = React.useState<CheckinMember>(member);
  const isNewRef = React.useRef(!!startEditing);

  function field<K extends keyof CheckinMember>(k: K, v: CheckinMember[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }
  function saveDetails() {
    onSaveDetails(member.id, {
      prefix: form.prefix, first: form.first, last: form.last, cred: form.cred,
      email: (form.email || '').trim(), phone: (form.phone || '').trim(), practice: form.practice,
      spec: form.spec, ptype: form.ptype, mscp: form.mscp, consent: form.consent, notes: form.notes,
      leadership: !!form.leadership,
      leadershipTitle: (form.leadershipTitle || '').trim(),
      leadershipBio: (form.leadershipBio || '').trim(),
      leadershipLinkLabel: (form.leadershipLinkLabel || '').trim(),
      leadershipLinkUrl: (form.leadershipLinkUrl || '').trim(),
    });
    isNewRef.current = false;
    setEditing(false);
  }
  function cancelEdit() {
    if (isNewRef.current) { onClose(); return; } // discard an abandoned new contact
    setForm(member);
    setEditing(false);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await onPhoto(member.id, file);
    } catch (err) {
      console.error('[membership] photo upload failed', err);
      alert('Photo upload failed — check the connection and try again.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  const infoItems: Array<[string, string]> = [
    ['Provider type', member.ptype || '—'],
    ['Specialty', member.spec || '—'],
    ['MSCP', member.mscp || '—'],
    ['Practice', member.practice || '—'],
  ];

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.drawer}>
        <div className={styles.dhead}>
          <button type="button" className={cx(styles.avatar, styles.photobtn, src && styles.hasPhoto)} onClick={() => fileRef.current?.click()} title={src ? 'Replace photo' : 'Upload photo'}>
            {src ? <img src={src} alt="" /> : initials(member)}
            <span className={styles.cam}>{uploading ? '…' : '📷'}</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFile} />
          <div>
            <h2 className={styles.dHeadName}>{fullName(editing ? form : member)}</h2>
            <p className={styles.dHeadCred}>{[(editing ? form : member).cred, (editing ? form : member).practice].filter(Boolean).join(' · ') || '—'}</p>
          </div>
          <button className={styles.close} onClick={onClose}>×</button>
        </div>

        <div className={styles.dbody}>
          {editing ? (
            <>
              <div className={styles.dsection}>
                <p className={styles.dsectionLabel}>Contact &amp; details</p>
                <div className={styles.editGrid}>
                  {EDIT_FIELDS.map(f => (
                    <div key={f.k} className={cx(styles.editField, f.half && styles.editHalf)}>
                      <label className={styles.editLabel}>{f.label}</label>
                      {f.type === 'select' ? (
                        <select className={styles.editInput} value={String(form[f.k] ?? '')} onChange={e => field(f.k, e.target.value as never)}>
                          {(f.opts || []).map(o => <option key={o} value={o}>{o || '—'}</option>)}
                        </select>
                      ) : (
                        <input className={styles.editInput} type={f.type} value={String(form[f.k] ?? '')} onChange={e => field(f.k, e.target.value as never)} placeholder={f.label} autoFocus={f.k === 'first'} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.dsection}>
                <p className={styles.dsectionLabel}>Show in directory</p>
                <div className={styles.seg2}>
                  <button type="button" className={cx(styles.segBtn, (form.consent || '').toLowerCase() !== 'no' && styles.segBtnOn)} onClick={() => field('consent', 'Yes')}>Shown</button>
                  <button type="button" className={cx(styles.segBtn, (form.consent || '').toLowerCase() === 'no' && styles.segBtnNo)} onClick={() => field('consent', 'No')}>Hidden</button>
                </div>
              </div>

              <div className={styles.dsection}>
                <div className={styles.dirRow}>
                  <div style={{ minWidth: 0 }}>
                    <p className={styles.dsectionLabel} style={{ margin: 0 }}>Show as Leadership</p>
                    <p className={styles.dirNote}>Feature this person on the public Leadership page.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={!!form.leadership}
                    className={cx(styles.switch, form.leadership && styles.switchOn)}
                    onClick={() => field('leadership', !form.leadership)}
                    title={form.leadership ? 'Shown on Leadership — click to remove' : 'Not shown on Leadership — click to add'}
                  >
                    <span className={styles.knob} />
                  </button>
                </div>
                {form.leadership && (
                  <div className={styles.editGrid} style={{ marginTop: 14 }}>
                    <div className={styles.editField}>
                      <label className={styles.editLabel}>Leadership title / role at MMC</label>
                      <input className={styles.editInput} type="text" value={form.leadershipTitle || ''} onChange={e => field('leadershipTitle', e.target.value)} placeholder="President" />
                    </div>
                    <div className={styles.editField}>
                      <label className={styles.editLabel}>Bio / responsibilities</label>
                      <textarea className={styles.editInput} style={{ resize: 'vertical' }} rows={4} value={form.leadershipBio || ''} onChange={e => field('leadershipBio', e.target.value)} placeholder="Shown under their name on the Leadership page — a short bio or what they oversee for MMC." />
                    </div>
                    <div className={cx(styles.editField, styles.editHalf)}>
                      <label className={styles.editLabel}>Link label</label>
                      <input className={styles.editInput} type="text" value={form.leadershipLinkLabel || ''} onChange={e => field('leadershipLinkLabel', e.target.value)} placeholder="DrCarrieLeff.com" />
                    </div>
                    <div className={cx(styles.editField, styles.editHalf)}>
                      <label className={styles.editLabel}>Link URL</label>
                      <input className={styles.editInput} type="text" value={form.leadershipLinkUrl || ''} onChange={e => field('leadershipLinkUrl', e.target.value)} placeholder="https://drcarrieleff.com" />
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.dsection}>
                <p className={styles.dsectionLabel}>Notes</p>
                <textarea className={styles.editInput} style={{ resize: 'vertical' }} rows={3} value={form.notes || ''} onChange={e => field('notes', e.target.value)} placeholder="Anything to remember about this person…" />
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <button className={cx(styles.btn, styles.btnBrand)} onClick={saveDetails}>Save ✓</button>
                <button className={cx(styles.btn, styles.btnGhost)} onClick={cancelEdit}>Cancel</button>
                {!isNewRef.current && (
                  <button className={styles.deleteLink} onClick={() => { if (confirm(`Remove ${fullName(member)} from the roster?`)) onDelete(member.id); }}>Delete contact</button>
                )}
              </div>
            </>
          ) : (
            <>
          <button className={cx(styles.btn, styles.btnGhost)} style={{ marginBottom: 18 }} onClick={() => { setForm(member); setEditing(true); }}>✎ Edit contact &amp; details</button>

          {/* directory membership */}
          <div className={styles.dsection}>
            <div className={styles.dirRow}>
              <div style={{ minWidth: 0 }}>
                <p className={styles.dsectionLabel} style={{ margin: 0 }}>Show in directory</p>
                <p className={styles.dirNote}>{isMember(member) ? 'Member — has attended an event' : 'Not a member yet (no events attended)'}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={shownInDirectory(member)}
                className={cx(styles.switch, shownInDirectory(member) && styles.switchOn)}
                onClick={() => onToggleDirectory(member.id)}
                title={shownInDirectory(member) ? 'Currently in the directory — click to hide' : 'Hidden from the directory — click to show'}
              >
                <span className={styles.knob} />
              </button>
            </div>
          </div>

          {/* contact */}
          <div className={styles.dsection}>
            <p className={styles.dsectionLabel}>Contact</p>
            <div className={styles.contactRow}>
              <span className={styles.contactVal}>{email ? <a href={`mailto:${email}`}>{email}</a> : <span style={{ color: '#b09' }}>No email on file</span>}</span>
              {email && <button className={styles.miniCopy} onClick={() => onCopy(email, 'Copied email')}>Copy</button>}
            </div>
            <div className={styles.contactRow}>
              <span className={styles.contactVal}>{phone ? <a href={`tel:${phone}`}>{phone}</a> : <span style={{ color: '#9a90ac' }}>No phone on file</span>}</span>
              {phone && <button className={styles.miniCopy} onClick={() => onCopy(phone, 'Copied phone')}>Copy</button>}
            </div>
          </div>

          {/* details */}
          <div className={styles.dsection}>
            <p className={styles.dsectionLabel}>Details</p>
            <div className={styles.infoGrid}>
              {infoItems.map(([k, v]) => (
                <div key={k} className={styles.infoItem}>
                  <div className={styles.infoKey}>{k}</div>
                  <div className={styles.infoValue}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* attendance */}
          <div className={styles.dsection}>
            <p className={styles.dsectionLabel}>Attendance — {nAtt} meeting{nAtt === 1 ? '' : 's'} attended</p>
            <p className={styles.attendHint}>Tap a meeting to record whether this person attended — handy for meetings held before online check-in.</p>
            <div className={styles.timeline}>
              {meetings.map(mt => {
                const inn = attended(member, mt.id);
                const rv = member.rsvp?.[mt.id];
                const rsvpText = rv === true ? "RSVP'd yes" : rv === 'maybe' ? 'RSVP: maybe' : rv === false ? 'RSVP: declined' : '';
                return (
                  <div key={mt.id} className={styles.tItem}>
                    <span className={cx(styles.tDot, inn ? styles.tDotIn : rv ? styles.tDotRsvp : styles.tDotNo)} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className={styles.tMeeting}>{mt.quarter}</p>
                      <p className={styles.tDate}>{[meetingDate(mt) || '—', rsvpText].filter(Boolean).join(' · ')}</p>
                    </div>
                    <button
                      type="button"
                      className={cx(styles.attendToggle, inn && styles.attendToggleOn)}
                      onClick={() => onToggleAttendance(member.id, mt.id)}
                      title={inn ? 'Click to un-mark attendance' : 'Click to mark as attended'}
                    >
                      {inn ? '✓ Attended' : 'Mark attended'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* notes */}
          {member.notes && (
            <div className={styles.dsection}>
              <p className={styles.dsectionLabel}>Notes</p>
              <div className={styles.notesBox}>{member.notes}</div>
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
