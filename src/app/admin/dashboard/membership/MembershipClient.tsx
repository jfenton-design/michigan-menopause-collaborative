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
function rsvpYes(m: CheckinMember, id: string) { return m.rsvp?.[id] === true; }
function rsvpMaybe(m: CheckinMember, id: string) { return m.rsvp?.[id] === 'maybe'; }
function isExpected(m: CheckinMember, id: string) { return rsvpYes(m, id) || rsvpMaybe(m, id); }
function isWalkin(m: CheckinMember, id: string) { return attended(m, id) && !isExpected(m, id); }

const MONTH_INDEX: Record<string, number> = {
  Jan: 0, January: 0, Feb: 1, February: 1, Mar: 2, March: 2, Apr: 3, April: 3, May: 4,
  Jun: 5, June: 5, Jul: 6, July: 6, Aug: 7, August: 7, Sep: 8, Sept: 8, September: 8,
  Oct: 9, October: 9, Nov: 10, November: 10, Dec: 11, December: 11,
};
function meetingHasPassed(mt: Meeting): boolean {
  const mi = MONTH_INDEX[(mt.month || '').trim()];
  const day = parseInt(mt.day, 10);
  const year = parseInt(mt.year, 10);
  if (mi === undefined || Number.isNaN(day) || Number.isNaN(year)) return false;
  return new Date(year, mi, day, 23, 59, 59, 999).getTime() < Date.now();
}
/** No-shows count only once the meeting is over AND check-in was actually used. */
function noShowActiveFor(mt: Meeting, roster: CheckinMember[]): boolean {
  return meetingHasPassed(mt) && roster.some(m => attended(m, mt.id));
}
function isNoShow(m: CheckinMember, id: string) { return isExpected(m, id) && !attended(m, id); }
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

type Audience = 'in' | 'rsvp' | 'both';

/* ------------------------------------------------------------- component */

export function MembershipClient({ initialMeetings, initialRoster }: { initialMeetings: Meeting[]; initialRoster: CheckinMember[] }) {
  const meetings = initialMeetings;
  const [roster, setRoster] = React.useState<CheckinMember[]>(initialRoster);

  const [view, setView] = React.useState<'directory' | 'meeting'>('directory');
  const [query, setQuery] = React.useState('');
  const [dirFilter, setDirFilter] = React.useState<'all' | 'attended' | 'mscp' | 'noemail'>('all');
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);
  const [syncing, setSyncing] = React.useState(false);
  const [syncMsg, setSyncMsg] = React.useState<{ ok: boolean; text: string } | null>(null);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // default the meeting view to the meeting with the most check-ins (the one
  // most likely to be "the most recent meeting"), falling back to the first.
  const defaultMeetingId = React.useMemo(() => {
    let best = meetings[0]?.id ?? '';
    let bestN = -1;
    for (const mt of meetings) {
      const n = roster.filter(m => attended(m, mt.id)).length;
      if (n > bestN) { bestN = n; best = mt.id; }
    }
    return best;
  }, [meetings, roster]);
  const [meetingId, setMeetingId] = React.useState(defaultMeetingId);

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
  const meeting = meetings.find(m => m.id === meetingId) ?? meetings[0];

  const mscpCount = roster.filter(m => (m.mscp || '').toLowerCase() === 'certified').length;
  const withEmail = roster.filter(m => (m.email || '').trim()).length;

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
          <a href="/admin/dashboard/checkin" className={styles.navTab}>Check-In</a>
          <button className={cx(styles.navTab, view === 'directory' && styles.navTabActive)} onClick={() => setView('directory')}>Directory</button>
          <button className={cx(styles.navTab, view === 'meeting' && styles.navTabActive)} onClick={() => setView('meeting')}>By Meeting</button>
        </div>
      </header>

      <div className={styles.content}>
        {view === 'directory' && (
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
        )}

        {view === 'meeting' && meeting && (
          <MeetingView
            meeting={meeting}
            meetings={meetings}
            roster={roster}
            meetingId={meetingId}
            onMeetingChange={setMeetingId}
            onCopy={copyText}
            onSelectMember={setSelectedId}
          />
        )}
      </div>

      {selected && (
        <ProfileDrawer
          member={selected}
          meetings={meetings}
          onClose={() => setSelectedId(null)}
          onCopy={copyText}
          onPhoto={handlePhoto}
          onToggleAttendance={handleToggleAttendance}
        />
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}

/* ---------------------------------------------------------- meeting view */

function audienceMembers(roster: CheckinMember[], id: string, audience: Audience): CheckinMember[] {
  return sortByName(roster).filter(m => {
    const inn = attended(m, id);
    const yes = rsvpYes(m, id);
    if (audience === 'in') return inn;
    if (audience === 'rsvp') return yes;
    return inn || yes;
  });
}

function MeetingView({
  meeting, meetings, roster, meetingId, onMeetingChange, onCopy, onSelectMember,
}: {
  meeting: Meeting;
  meetings: Meeting[];
  roster: CheckinMember[];
  meetingId: string;
  onMeetingChange: (id: string) => void;
  onCopy: (text: string, label: string) => void;
  onSelectMember: (id: string) => void;
}) {
  const [audience, setAudience] = React.useState<Audience>('in');

  const inCount = roster.filter(m => attended(m, meetingId)).length;
  const rsvpCount = roster.filter(m => rsvpYes(m, meetingId)).length;
  const walkCount = roster.filter(m => isWalkin(m, meetingId)).length;
  const noShowActive = noShowActiveFor(meeting, roster);
  const noShowCount = noShowActive ? roster.filter(m => isNoShow(m, meetingId)).length : 0;

  const people = audienceMembers(roster, meetingId, audience);
  const emails = people.map(m => (m.email || '').trim()).filter(Boolean);
  const missing = people.length - emails.length;

  const audienceLabel = audience === 'in' ? 'checked in' : audience === 'rsvp' ? "RSVP'd yes" : "checked in or RSVP'd yes";

  return (
    <>
      <div className={styles.tools}>
        <select className={styles.select} value={meetingId} onChange={e => onMeetingChange(e.target.value)}>
          {meetings.map(mt => (
            <option key={mt.id} value={mt.id}>{mt.quarter} — {mt.month} {mt.day}{mt.year ? `, ${mt.year}` : ''}</option>
          ))}
        </select>
      </div>

      <div className={styles.stats}>
        <div className={cx(styles.stat, styles.statRsvp)}><div className={styles.statNum}>{rsvpCount}</div><div className={styles.statLabel}>RSVP&apos;d yes</div></div>
        <div className={cx(styles.stat, styles.statIn)}><div className={styles.statNum}>{inCount}</div><div className={styles.statLabel}>Checked in</div></div>
        <div className={styles.stat}><div className={styles.statNum}>{walkCount}</div><div className={styles.statLabel}>Walk-ins</div></div>
        <div className={styles.stat}><div className={styles.statNum} style={{ color: noShowActive ? '#c0392b' : '#c9c2d6' }}>{noShowActive ? noShowCount : '—'}</div><div className={styles.statLabel} title="RSVP'd yes but didn't check in">No-shows</div></div>
      </div>

      {/* Copy emails */}
      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Copy attendee emails</h2>
            <p className={styles.panelSub}>Grab everyone {audienceLabel} for {meeting.quarter}, ready to paste into Gmail&apos;s To or Bcc field.</p>
          </div>
        </div>

        <div className={styles.audience}>
          <span className={styles.audLabel}>Audience</span>
          <div className={styles.seg}>
            <button className={cx(audience === 'in' && styles.segOn)} onClick={() => setAudience('in')}>Checked in ({inCount})</button>
            <button className={cx(audience === 'rsvp' && styles.segOn)} onClick={() => setAudience('rsvp')}>RSVP&apos;d yes ({rsvpCount})</button>
            <button className={cx(audience === 'both' && styles.segOn)} onClick={() => setAudience('both')}>Both</button>
          </div>
        </div>

        <div className={styles.copyRow}>
          <button
            className={cx(styles.btn, styles.btnBrand)}
            disabled={emails.length === 0}
            style={emails.length === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
            onClick={() => onCopy(emails.join(', '), `Copied ${emails.length} email${emails.length === 1 ? '' : 's'}`)}
          >
            ⧉ Copy {emails.length} email{emails.length === 1 ? '' : 's'}
          </button>
          {missing > 0 && (
            <span className={styles.copyNote}>{missing} {audienceLabel} {missing === 1 ? 'has' : 'have'} no email on file — add it in Check-In.</span>
          )}
        </div>

        <div className={styles.attendList}>
          {people.length === 0 ? (
            <div className={styles.empty} style={{ padding: '30px 20px' }}>No one {audienceLabel} for this meeting yet.</div>
          ) : people.map(m => {
            const src = photoSrc(m.photo);
            const email = (m.email || '').trim();
            return (
              <div key={m.id} className={styles.arow}>
                <button className={styles.avatar} onClick={() => onSelectMember(m.id)} style={{ border: 'none', cursor: 'pointer' }}>
                  {src ? <img src={src} alt="" /> : initials(m)}
                </button>
                <div>
                  <p className={styles.aname}>{fullName(m)}</p>
                  <p className={styles.ameta}>{[m.cred, m.spec].filter(Boolean).join(' · ') || '—'}</p>
                </div>
                <span className={cx(styles.aemail, !email && styles.aemailNone)}>{email || 'no email'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recap email builder */}
      <RecapEmail meeting={meeting} emails={emails} audienceLabel={audienceLabel} onCopy={onCopy} />
    </>
  );
}

/* ------------------------------------------------------- recap email */

const NAVY = '#1F1535';
const ACCENT = '#6B3FCB';
const PAPER = '#F7F4FB';
const PAPER_2 = '#E8DEF7';
const INK_SOFT = '#7A6E96';
const LOGO_URL = 'https://michiganmenopause.com/assets/mmc-logo.png';

function defaultRecapSubject(m: Meeting): string {
  return `Thank you — recap from our ${m.quarter} meeting`;
}
function defaultRecapIntro(m: Meeting): string {
  const topic = m.topic ? ` on ${m.topic.charAt(0).toLowerCase() + m.topic.slice(1)}` : '';
  return (
    `Thank you for joining us at the Michigan Menopause Collaborative ${m.quarter} meeting${topic}. ` +
    `It was a rich discussion, and we're grateful for the expertise each of you brought to the room.\n\n` +
    `A few highlights and follow-ups from the evening:`
  );
}

function buildRecapHtml(m: Meeting, subject: string, intro: string, bullets: string[]): string {
  const introHtml = intro.split('\n').map(l => l || '&nbsp;').join('<br>');
  const bulletList = bullets.filter(b => b.trim()).length
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:20px">${bullets
        .filter(b => b.trim())
        .map(
          b =>
            `<tr><td style="padding:6px 0;vertical-align:top;width:22px;color:${ACCENT};font-size:15px;font-family:Arial,Helvetica,sans-serif">•</td><td style="padding:6px 0;font-size:15px;line-height:1.55;color:${NAVY};font-family:Arial,Helvetica,sans-serif">${b}</td></tr>`,
        )
        .join('')}</table>`
    : '';

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${PAPER};font-family:Arial,Helvetica,sans-serif"><tr><td align="center" style="padding:24px 12px">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid ${PAPER_2}">
    <tr>
      <td style="background:#ffffff;padding:26px 32px 22px">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="padding-right:12px"><img src="${LOGO_URL}" width="40" height="40" alt="MMC" style="display:block;width:40px;height:40px"></td>
          <td style="color:${NAVY};font-size:16px;font-weight:bold;font-family:Arial,Helvetica,sans-serif;letter-spacing:-0.2px">Michigan Menopause Collaborative</td>
        </tr></table>
      </td>
    </tr>
    <tr><td style="background:${ACCENT};height:4px;line-height:4px;font-size:0">&nbsp;</td></tr>
    <tr>
      <td style="padding:32px">
        <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${ACCENT};margin-bottom:10px">${m.quarter} Meeting &middot; Recap</div>
        <h2 style="margin:0 0 16px;font-size:21px;font-weight:bold;color:${NAVY};font-family:Arial,Helvetica,sans-serif">${subject}</h2>
        <p style="margin:0;font-size:15px;line-height:1.6;color:${NAVY};font-family:Arial,Helvetica,sans-serif">${introHtml}</p>
        ${bulletList}
        <p style="margin:26px 0 0;font-size:15px;line-height:1.6;color:${NAVY};font-family:Arial,Helvetica,sans-serif">Warmly,<br>Dr. Carrie Leff<br><span style="color:${INK_SOFT};font-size:14px">President, Michigan Menopause Collaborative</span></p>
      </td>
    </tr>
    <tr>
      <td style="padding:22px 32px;border-top:1px solid ${PAPER_2};background:${PAPER}">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
          <td style="vertical-align:middle;padding-right:12px"><img src="${LOGO_URL}" width="36" height="36" alt="" style="display:block;width:36px;height:36px;border-radius:7px;opacity:0.95"></td>
          <td style="vertical-align:middle">
            <div style="font-size:13px;font-weight:bold;color:${NAVY};font-family:Arial,Helvetica,sans-serif">Michigan Menopause Collaborative</div>
            <div style="font-size:12px;color:${INK_SOFT};font-family:Arial,Helvetica,sans-serif">Midlife women&rsquo;s care, improved together</div>
          </td>
          <td style="vertical-align:middle;text-align:right"><a href="https://michiganmenopause.com" style="color:${ACCENT};font-size:13px;font-weight:bold;text-decoration:none;font-family:Arial,Helvetica,sans-serif">michiganmenopause.com</a></td>
        </tr></table>
      </td>
    </tr>
  </table>
</td></tr></table>`;
}

function RecapEmail({ meeting, emails, audienceLabel, onCopy }: { meeting: Meeting; emails: string[]; audienceLabel: string; onCopy: (t: string, l: string) => void }) {
  const [subject, setSubject] = React.useState(defaultRecapSubject(meeting));
  const [intro, setIntro] = React.useState(defaultRecapIntro(meeting));
  const [bulletsText, setBulletsText] = React.useState('');
  const [copyStatus, setCopyStatus] = React.useState<'idle' | 'copied' | 'failed'>('idle');
  const previewRef = React.useRef<HTMLDivElement>(null);

  // reset copy when meeting changes
  React.useEffect(() => {
    setSubject(defaultRecapSubject(meeting));
    setIntro(defaultRecapIntro(meeting));
  }, [meeting]);

  React.useEffect(() => {
    if (copyStatus === 'copied' || copyStatus === 'failed') {
      const t = setTimeout(() => setCopyStatus('idle'), 2500);
      return () => clearTimeout(t);
    }
  }, [copyStatus]);

  const bullets = bulletsText.split('\n').map(b => b.trim()).filter(Boolean);
  const html = buildRecapHtml(meeting, subject, intro, bullets);

  async function handleCopyEmail() {
    try {
      const text = [intro, '', ...bullets.map(b => `• ${b}`), '', 'Warmly,', 'Dr. Carrie Leff', 'President, Michigan Menopause Collaborative', '', 'Michigan Menopause Collaborative · michiganmenopause.com'].join('\n');
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([text], { type: 'text/plain' }),
          }),
        ]);
        setCopyStatus('copied');
        return;
      }
      throw new Error('ClipboardItem unsupported');
    } catch {
      const node = previewRef.current;
      if (!node) { setCopyStatus('failed'); return; }
      const range = document.createRange();
      range.selectNodeContents(node);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      try {
        const ok = document.execCommand('copy');
        setCopyStatus(ok ? 'copied' : 'failed');
      } catch { setCopyStatus('failed'); }
      sel?.removeAllRanges();
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <div>
          <h2 className={styles.panelTitle}>Recap email</h2>
          <p className={styles.panelSub}>A branded thank-you for the {meeting.quarter} attendees. Edit, copy, and paste into Gmail.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
        <div>
          <label className={styles.emailLabel}>Subject line</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className={styles.emailInput} value={subject} onChange={e => setSubject(e.target.value)} />
            <button className={styles.miniCopy} style={{ padding: '0 14px' }} onClick={() => onCopy(subject, 'Copied subject')}>Copy</button>
          </div>
        </div>
        <div>
          <label className={styles.emailLabel}>Opening message</label>
          <textarea className={styles.emailInput} style={{ resize: 'vertical' }} rows={4} value={intro} onChange={e => setIntro(e.target.value)} />
        </div>
        <div>
          <label className={styles.emailLabel}>Highlights / follow-ups <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>(one bullet per line — leave blank to omit)</span></label>
          <textarea className={styles.emailInput} style={{ resize: 'vertical' }} rows={4} value={bulletsText} onChange={e => setBulletsText(e.target.value)} placeholder={'Meeting notes are posted on the Resources page\nNext meeting: Fall 2026, aligned with the Menopause Society conference\nHave a case to present? Submit it at michiganmenopause.com'} />
        </div>
      </div>

      <div className={styles.helpBox} style={{ marginTop: 18 }}>
        <strong>Two-click send:</strong> click <strong>Copy email</strong> below, open a new Gmail message, and paste (Cmd/Ctrl+V) into the body — the header, colors, and logo carry over.
        For recipients, use <strong>Copy {emails.length} email{emails.length === 1 ? '' : 's'}</strong> above and paste into the <strong>Bcc</strong> field so attendees don&apos;t see each other&apos;s addresses.
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
        <button className={cx(styles.btn, styles.btnBrand)} onClick={handleCopyEmail}>
          {copyStatus === 'copied' ? 'Copied ✓' : 'Copy email'}
        </button>
        <button
          className={cx(styles.btn, styles.btnGhost)}
          disabled={emails.length === 0}
          style={emails.length === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
          onClick={() => onCopy(emails.join(', '), `Copied ${emails.length} recipient${emails.length === 1 ? '' : 's'}`)}
        >
          ⧉ Copy {emails.length} recipient{emails.length === 1 ? '' : 's'} ({audienceLabel})
        </button>
        {copyStatus === 'failed' && <span style={{ fontSize: 13, color: '#c0392b' }}>Couldn&apos;t copy — select the preview and press Cmd/Ctrl+C.</span>}
      </div>

      <label className={styles.emailLabel}>Preview</label>
      <div ref={previewRef} contentEditable suppressContentEditableWarning className={styles.emailPreview} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

/* ------------------------------------------------------- profile drawer */

function ProfileDrawer({ member, meetings, onClose, onCopy, onPhoto, onToggleAttendance }: { member: CheckinMember; meetings: Meeting[]; onClose: () => void; onCopy: (t: string, l: string) => void; onPhoto: (memberId: string, file: File) => Promise<void>; onToggleAttendance: (memberId: string, meetingId: string) => void }) {
  const src = photoSrc(member.photo);
  const nAtt = attendedCount(member);
  const email = (member.email || '').trim();
  const phone = (member.phone || '').trim();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

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
    ['Directory consent', member.consent || '—'],
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
          <button type="button" className={cx(styles.avatar, styles.photobtn)} onClick={() => fileRef.current?.click()} title="Upload or replace photo">
            {src ? <img src={src} alt="" /> : initials(member)}
            <span className={styles.cam}>{uploading ? '…' : '📷'}</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFile} />
          <div>
            <h2 className={styles.dHeadName}>{fullName(member)}</h2>
            <p className={styles.dHeadCred}>{[member.cred, member.practice].filter(Boolean).join(' · ') || '—'}</p>
          </div>
          <button className={styles.close} onClick={onClose}>×</button>
        </div>

        <div className={styles.dbody}>
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

          <a
            href="/admin/dashboard/checkin"
            className={cx(styles.btn, styles.btnGhost)}
            style={{ textDecoration: 'none', display: 'inline-flex' }}
          >
            ✎ Edit in Check-In
          </a>
        </div>
      </div>
    </div>
  );
}
