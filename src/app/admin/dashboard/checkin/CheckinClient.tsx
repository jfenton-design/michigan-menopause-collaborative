'use client';
import * as React from 'react';
import type { Meeting } from '@/lib/data';
import type { CheckinMember, RsvpValue } from '@/lib/checkin-data';
import { BloomMark } from '@/components/Logo';
import { persistRoster, uploadCheckinPhoto } from './actions';
import styles from './checkin.module.css';
import guestStyles from './guestSearch.module.css';
import sheetStyles from './editSheet.module.css';

/* ---------------------------------------------------------------- helpers */

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
function statusOf(m: CheckinMember, session: string): '' | 'in' | 'noshow' {
  const v = m.seasons?.[session];
  if (v === 'in') return 'in';
  if (v === 'noshow') return 'noshow';
  return '';
}
function isIn(m: CheckinMember, session: string) { return statusOf(m, session) === 'in'; }
function rsvpVal(m: CheckinMember, session: string): RsvpValue | undefined { return m.rsvp?.[session]; }
function rsvpYes(m: CheckinMember, session: string) { return rsvpVal(m, session) === true; }
function rsvpNo(m: CheckinMember, session: string) { return rsvpVal(m, session) === false; }
function rsvpMaybe(m: CheckinMember, session: string) { return rsvpVal(m, session) === 'maybe'; }
function isWalkin(m: CheckinMember, session: string) {
  return isIn(m, session) && !rsvpYes(m, session) && !rsvpMaybe(m, session);
}
function isExpected(m: CheckinMember, session: string) {
  return rsvpYes(m, session) || rsvpMaybe(m, session);
}
const MONTH_INDEX: Record<string, number> = {
  Jan: 0, January: 0, Feb: 1, February: 1, Mar: 2, March: 2, Apr: 3, April: 3, May: 4,
  Jun: 5, June: 5, Jul: 6, July: 6, Aug: 7, August: 7, Sep: 8, Sept: 8, September: 8,
  Oct: 9, October: 9, Nov: 10, November: 10, Dec: 11, December: 11,
};
/** True once a meeting's day is fully over. Undated/TBD meetings are never "passed". */
function meetingHasPassed(mt?: Meeting): boolean {
  if (!mt) return false;
  const mi = MONTH_INDEX[(mt.month || '').trim()];
  const day = parseInt(mt.day, 10);
  const year = parseInt(mt.year, 10);
  if (mi === undefined || Number.isNaN(day) || Number.isNaN(year)) return false;
  return new Date(year, mi, day, 23, 59, 59, 999).getTime() < Date.now();
}
/** Display status folds an *automatic* no-show into the picture: when a meeting
 *  is genuinely over, anyone who RSVP'd yes/maybe but never checked in counts as
 *  a no-show — without Dr. Leff having to mark each one by hand. The caller
 *  decides when that auto-rule is safe to apply (`noShowActive`): only once the
 *  date has passed, RSVP is closed, AND at least one person was actually checked
 *  in (otherwise check-in simply wasn't run and nobody is a "no-show" yet). */
function displayStatus(m: CheckinMember, session: string, noShowActive: boolean): '' | 'in' | 'noshow' {
  if (isIn(m, session)) return 'in';
  if (statusOf(m, session) === 'noshow') return 'noshow';
  if (noShowActive && isExpected(m, session)) return 'noshow';
  return '';
}
/** Is the automatic no-show rule safe to apply for this meeting? Only once the
 *  meeting day is over AND at least one person was actually checked in — with no
 *  check-ins, check-in simply wasn't run and nobody is a "no-show" yet. */
function noShowActiveFor(mt: Meeting | undefined, roster: CheckinMember[]): boolean {
  if (!mt) return false;
  if (!meetingHasPassed(mt)) return false;         // hasn't happened yet
  return roster.some(m => isIn(m, mt.id));          // check-in was actually used
}
function blankMember(id: string): CheckinMember {
  return { id, prefix: '', first: '', last: '', cred: '', mscp: '', ptype: '', spec: '', practice: '', email: '', phone: '', notes: '', consent: '', seasons: {}, rsvp: {}, edited: true };
}
function meetingLabel(mt: Meeting): string {
  return mt.quarter;
}
function sortedMembers(roster: CheckinMember[]): CheckinMember[] {
  return [...roster].sort((a, b) => (a.last || '').localeCompare(b.last || '') || (a.first || '').localeCompare(b.first || ''));
}
function newTempId(): string {
  return 'new' + Math.random().toString(36).slice(2, 10);
}
function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

const FIELDS: Array<{ k: keyof CheckinMember; label: string; type: 'text' | 'select' | 'email' | 'tel'; half?: boolean; opts?: string[] }> = [
  { k: 'prefix', label: 'Prefix', type: 'select', opts: ['', 'Dr.', 'Ms.', 'Mrs.', 'Mr.', 'Mx.'] },
  { k: 'first', label: 'First name', type: 'text', half: true },
  { k: 'last', label: 'Last name', type: 'text', half: true },
  { k: 'cred', label: 'Credentials', type: 'text' },
  { k: 'mscp', label: 'MSCP status', type: 'select', opts: ['', 'Certified', 'In progress', 'No'] },
  { k: 'ptype', label: 'Provider type', type: 'select', half: true, opts: ['', 'Physician', 'NP', 'PA', 'PT', 'Therapist', 'Nutrition', 'Other'] },
  { k: 'spec', label: 'Specialty', type: 'select', half: true, opts: ['', 'OB/GYN', 'Family Medicine', 'Internal Medicine', 'Dermatology', 'Endocrine', 'Surgery', 'Therapy', 'Nutrition', 'Breast', 'Heme/Onc', 'Nephrology', 'Urology', 'Sexual Health', 'Other'] },
  { k: 'practice', label: 'Practice', type: 'text' },
  { k: 'email', label: 'Email', type: 'email' },
  { k: 'phone', label: 'Phone', type: 'tel' },
];

const FILTERS = [
  { key: 'expected', label: 'Expected' },
  { key: 'in', label: 'Checked In' },
  { key: 'walkin', label: 'Walk-ins' },
  { key: 'noshow', label: 'No-show' },
  { key: 'notyet', label: 'Not Arrived' },
  { key: 'all', label: 'All' },
  { key: 'no', label: 'RSVP No' },
  { key: 'undecided', label: 'Undecided' },
] as const;

type View = 'roster' | 'events';
type SheetState =
  | { mode: 'edit'; memberId: string }
  | { mode: 'guestSearch' }
  | null;

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

/* ------------------------------------------------------------- component */

export function CheckinClient({ initialMeetings, initialRoster }: { initialMeetings: Meeting[]; initialRoster: CheckinMember[] }) {
  const [roster, setRoster] = React.useState<CheckinMember[]>(initialRoster);
  const [session, setSession] = React.useState<string>(initialMeetings[0]?.id ?? '');
  const [view, setView] = React.useState<View>('events');
  const [filter, setFilter] = React.useState<string>('expected');
  const [query, setQuery] = React.useState('');
  const [sheet, setSheet] = React.useState<SheetState>(null);
  const [toast, setToast] = React.useState<string | null>(null);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const persistQueue = React.useRef<Promise<void>>(Promise.resolve());
  const [guestQuery, setGuestQuery] = React.useState('');

  const meetings = initialMeetings;
  const sessionMeeting = meetings.find(mt => mt.id === session);
  const noShowActive = noShowActiveFor(sessionMeeting, roster);

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1900);
  }

  function commitRoster(next: CheckinMember[]) {
    setRoster(next);
    persistQueue.current = persistQueue.current
      .then(() => persistRoster(next))
      .catch(err => {
        console.error('[checkin] persist failed', err);
        showToast('Save failed — check connection and try again');
      });
  }

  function updateMember(id: string, patch: Partial<CheckinMember>) {
    commitRoster(roster.map(m => (m.id === id ? { ...m, ...patch } : m)));
  }

  function quickCheckIn(id: string) {
    const m = roster.find(x => x.id === id);
    if (!m) return;
    updateMember(id, { seasons: { ...m.seasons, [session]: 'in' } });
    showToast('✓ ' + fullName(m) + (rsvpYes(m, session) ? ' checked in' : ' checked in (walk-in)'));
  }

  function setRsvp(id: string, val: RsvpValue) {
    const m = roster.find(x => x.id === id);
    if (!m) return;
    const next = { ...m.rsvp };
    if (next[session] === val) delete next[session];
    else next[session] = val;
    updateMember(id, { rsvp: next });
  }

  function registerExisting(id: string) {
    const m = roster.find(x => x.id === id);
    if (!m) return;
    updateMember(id, { seasons: { ...m.seasons, [session]: 'in' } });
    setSheet({ mode: 'edit', memberId: id });
  }

  function registerNewGuest() {
    const nm = blankMember(newTempId());
    nm.seasons[session] = 'in';
    commitRoster([...roster, nm]);
    setSheet({ mode: 'edit', memberId: nm.id });
  }

  function removeMember(id: string) {
    const m = roster.find(x => x.id === id);
    if (!m) return;
    if (!confirm('Remove ' + fullName(m) + ' from the roster?')) return;
    commitRoster(roster.filter(x => x.id !== id));
    setSheet(null);
    showToast('Removed');
  }

  function matchesRoster(m: CheckinMember): boolean {
    if (query && !hay(m).includes(query)) return false;
    switch (filter) {
      case 'in': return isIn(m, session);
      case 'walkin': return isWalkin(m, session);
      case 'noshow': return displayStatus(m, session, noShowActive) === 'noshow';
      case 'notyet': return isExpected(m, session) && !isIn(m, session) && displayStatus(m, session, noShowActive) !== 'noshow';
      case 'expected': return rsvpYes(m, session) || rsvpMaybe(m, session);
      case 'no': return rsvpNo(m, session);
      case 'undecided': return rsvpVal(m, session) === undefined;
      default: return true;
    }
  }

  function exportCsv() {
    const cols: Array<[keyof CheckinMember, string]> = [
      ['prefix', 'Prefix'], ['first', 'First Name'], ['last', 'Last Name'], ['cred', 'Credentials'],
      ['mscp', 'MSCP'], ['ptype', 'Provider Type'], ['spec', 'Specialty'], ['practice', 'Practice'],
      ['email', 'Email'], ['phone', 'Phone'],
    ];
    const seasonCols = meetings.flatMap(mt => [meetingLabel(mt) + ' RSVP', meetingLabel(mt) + ' Check-in']);
    const head = [...cols.map(c => c[1]), ...seasonCols, 'Directory Consent', 'Notes', 'Info Updated', 'Photo'];
    const rsvpCell = (v: RsvpValue | undefined) => (v === true ? 'Yes' : v === 'maybe' ? 'Maybe' : v === false ? 'No' : '');
    const checkinCell = (v: string | undefined) => (v === 'in' ? 'X' : v === 'noshow' ? 'No-show' : '');
    const rows = [head];
    sortedMembers(roster).forEach(m => {
      const row: string[] = cols.map(c => String(m[c[0]] ?? ''));
      meetings.forEach(mt => {
        row.push(rsvpCell(m.rsvp?.[mt.id]));
        row.push(checkinCell(m.seasons?.[mt.id]));
      });
      row.push(m.consent || '');
      row.push(m.notes || '');
      row.push(m.edited ? 'YES' : '');
      row.push(m.photo ? 'YES' : '');
      rows.push(row);
    });
    const csv = rows.map(r => r.map(v => (/[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v)).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `MMC_checkin_${session}_${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    showToast('Exported CSV');
  }

  const shown = view === 'roster' ? sortedMembers(roster).filter(matchesRoster) : [];

  const expectedCount = roster.filter(m => rsvpYes(m, session) || rsvpMaybe(m, session)).length;
  const inCount = roster.filter(m => isIn(m, session)).length;
  const walkCount = roster.filter(m => isWalkin(m, session)).length;
  const noShowCount = roster.filter(m => displayStatus(m, session, noShowActive) === 'noshow').length;

  const sheetMember = sheet?.mode === 'edit' ? roster.find(m => m.id === sheet.memberId) ?? null : null;

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div className={styles.hrow}>
          <div className={styles.brand}>
            <BloomMark dim={32} ink="white" accent="#9B6FFF" />
            <div>
              <h1 className={styles.title}>MMC Admin Panel</h1>
              <p className={styles.sub}>Check-In</p>
            </div>
          </div>
          <div className={styles.sessionWrap}>
            <label htmlFor="session">Session</label>
            <select id="session" className={styles.sessionSelect} value={session} onChange={e => setSession(e.target.value)}>
              {meetings.map(mt => (
                <option key={mt.id} value={mt.id}>{meetingLabel(mt)}</option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles.navTabs}>
          <a href="/admin/dashboard" className={cx(styles.navTab, styles.backlink)}>← Dashboard</a>
          <button className={cx(styles.navTab, view === 'roster' && styles.navTabActive)} onClick={() => setView('roster')}>Roster</button>
          <button className={cx(styles.navTab, view === 'events' && styles.navTabActive)} onClick={() => setView('events')}>Events</button>
          <a href="/admin/dashboard/membership" className={styles.navTab}>Membership</a>
        </div>
      </header>

      <div className={styles.content}>
        {view === 'roster' && (
          <div className={styles.tools}>
            <div className={styles.search}>
              <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
              <input value={query} onChange={e => setQuery(e.target.value.trim().toLowerCase())} type="search" placeholder="Search name, practice, specialty…" />
            </div>
            <button className={cx(styles.btn, styles.btnGhost)} onClick={exportCsv}>⤓ Export CSV</button>
          </div>
        )}

        {view === 'roster' && (
          <div className={styles.stats}>
            <div className={styles.stat}><div className={styles.statNum}>{expectedCount}</div><div className={styles.statLabel}>Expected</div></div>
            <div className={cx(styles.stat, styles.statInx)}><div className={styles.statNum}>{inCount}</div><div className={styles.statLabel}>Checked In</div></div>
            <div className={cx(styles.stat, styles.statWalk)}><div className={styles.statNum}>{walkCount}</div><div className={styles.statLabel}>Walk-ins</div></div>
            <div className={cx(styles.stat, styles.statNox)}><div className={styles.statNum}>{noShowCount}</div><div className={styles.statLabel}>No-show</div></div>
          </div>
        )}

        {view === 'roster' && (
          <div className={styles.filters}>
            {FILTERS.map(f => (
              <button key={f.key} className={cx(styles.chip, filter === f.key && styles.chipActive)} onClick={() => setFilter(f.key)}>{f.label}</button>
            ))}
          </div>
        )}

        <div className={styles.list}>
          {view === 'roster' && (shown.length === 0 ? (
            <div className={styles.empty}>No one matches. Try a different search or filter.</div>
          ) : shown.map(m => {
            const st = displayStatus(m, session, noShowActive);
            const mark = st === 'in' ? '✓' : st === 'noshow' ? '✕' : '';
            const rv = rsvpVal(m, session);
            return (
              <div key={m.id} className={cx(styles.card, st === 'in' && styles.in, st === 'noshow' && styles.noshow)}>
                <div className={styles.ctop} onClick={() => (st === '' ? quickCheckIn(m.id) : setSheet({ mode: 'edit', memberId: m.id }))}>
                  <div className={styles.avatar}>{m.photo ? <img src={m.photo} alt="" /> : initials(m)}</div>
                  <div className={styles.cbody}>
                    <p className={styles.cname}>{fullName(m)}{m.cred && <span className={styles.cred}>{m.cred}</span>}</p>
                    <p className={styles.cmeta}>{metaLine(m) || '—'}{m.notes ? ' · 📝' : ''}</p>
                  </div>
                  <div className={styles.cstatus}>
                    <div className={styles.checkmark}>{mark}</div>
                    <button className={styles.editBtn} onClick={e => { e.stopPropagation(); setSheet({ mode: 'edit', memberId: m.id }); }}>✎</button>
                  </div>
                </div>
                <div className={styles.cbottom}>
                  <div className={styles.ctags}>
                    {rsvpYes(m, session) && <span className={cx(styles.tag, styles.tagAccent)}>RSVP&apos;D</span>}
                    {rsvpMaybe(m, session) && <span className={cx(styles.tag, styles.tagWarn)}>MAYBE</span>}
                    {isWalkin(m, session) && <span className={cx(styles.tag, styles.tagWarn)}>WALK-IN</span>}
                  </div>
                  <div className={styles.miniseg}>
                    <button className={rv === true ? styles.yesOn : ''} onClick={() => setRsvp(m.id, true)}>Yes</button>
                    <button className={rv === 'maybe' ? styles.maybeOn : ''} onClick={() => setRsvp(m.id, 'maybe')}>Maybe</button>
                    <button className={rv === false ? styles.noOn : ''} onClick={() => setRsvp(m.id, false)}>No</button>
                  </div>
                </div>
              </div>
            );
          }))}

          {view === 'events' && meetings.map(mt => {
            const yes = roster.filter(m => m.rsvp?.[mt.id] === true).length;
            const maybe = roster.filter(m => m.rsvp?.[mt.id] === 'maybe').length;
            const ins = roster.filter(m => isIn(m, mt.id)).length;
            const walks = roster.filter(m => isWalkin(m, mt.id)).length;
            const active = noShowActiveFor(mt, roster);
            const noshows = active ? roster.filter(m => displayStatus(m, mt.id, true) === 'noshow').length : 0;
            return (
              <div
                key={mt.id}
                className={cx(styles.eventCard, mt.id === session && styles.current)}
                onClick={() => setSession(mt.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.eventTag}>{mt.id === session ? 'SELECTED SESSION' : meetingLabel(mt).toUpperCase()}</div>
                <h3>{meetingLabel(mt)}</h3>
                <p className={styles.eventDate}>{mt.weekday}, {mt.month} {mt.day}, {mt.year} · {mt.time}</p>
                <p className={styles.eventLoc}>{mt.location}</p>
                {mt.topic && <p className={styles.eventTopic}>{mt.topic}{mt.topicPresenter ? ` — ${mt.topicPresenter}` : ''}</p>}
                <div className={styles.eventStats}>
                  <span><strong>{yes}</strong> RSVP&apos;d yes</span>
                  {maybe > 0 && <span><strong>{maybe}</strong> maybe</span>}
                  <span><strong>{ins}</strong> check-in{ins === 1 ? '' : 's'}</span>
                  <span><strong>{walks}</strong> walk-in{walks === 1 ? '' : 's'}</span>
                  {active
                    ? <span className={styles.eventNoshow} title="RSVP'd yes but didn't check in"><strong>{noshows}</strong> no-show{noshows === 1 ? '' : 's'}</span>
                    : <span className={styles.eventPending} title="No-shows are tallied once the meeting is over and check-in has been used">no-shows: pending</span>}
                </div>
                <button
                  type="button"
                  className={cx(styles.btn, styles.btnGhost)}
                  style={{ marginTop: 14 }}
                  onClick={e => { e.stopPropagation(); setSession(mt.id); setFilter('in'); setView('roster'); }}
                >
                  View check-ins →
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {view === 'roster' && (
        <button className={styles.fab} onClick={() => setSheet({ mode: 'guestSearch' })}>⚑ Register Guest</button>
      )}

      {sheet?.mode === 'guestSearch' && (
        <GuestSearchSheet
          roster={roster}
          session={session}
          query={guestQuery}
          onQueryChange={setGuestQuery}
          onClose={() => { setSheet(null); setGuestQuery(''); }}
          onSelectExisting={id => { registerExisting(id); setGuestQuery(''); }}
          onNewGuest={() => { registerNewGuest(); setGuestQuery(''); }}
        />
      )}

      {sheetMember && (
        <EditSheet
          member={sheetMember}
          session={session}
          onClose={() => setSheet(null)}
          onSave={patch => { updateMember(sheetMember.id, patch); setSheet(null); showToast('Saved'); }}
          onDelete={() => removeMember(sheetMember.id)}
        />
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}

/* --------------------------------------------------------- guest search */

function GuestSearchSheet({
  roster, session, query, onQueryChange, onClose, onSelectExisting, onNewGuest,
}: {
  roster: CheckinMember[];
  session: string;
  query: string;
  onQueryChange: (q: string) => void;
  onClose: () => void;
  onSelectExisting: (id: string) => void;
  onNewGuest: () => void;
}) {
  const q = query.trim().toLowerCase();
  const matches = sortedMembers(roster).filter(m => !q || hay(m).includes(q)).slice(0, 40);
  return (
    <div className={guestStyles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={guestStyles.sheet}>
        <div className={guestStyles.sheethead}><BloomMark dim={26} ink="white" accent="#9B6FFF" /><h2>Register Guest</h2><button className={guestStyles.close} onClick={onClose}>×</button></div>
        <div className={guestStyles.form}>
          <div className={guestStyles.field}>
            <label>Search the directory first</label>
            <input autoFocus value={query} onChange={e => onQueryChange(e.target.value)} type="search" placeholder="Name, practice, specialty…" />
          </div>
          <button type="button" className={guestStyles.btnBrandTop} onClick={onNewGuest}>＋ Not listed — register new guest</button>
          <div>
            {matches.length === 0 ? (
              <div className={guestStyles.emptyRow}>No matches — register as a new guest below.</div>
            ) : matches.map(m => (
              <div key={m.id} className={guestStyles.guestrow} onClick={() => onSelectExisting(m.id)}>
                <div className={guestStyles.avatar}>{m.photo ? <img src={m.photo} alt="" /> : initials(m)}</div>
                <div className={guestStyles.cbody}><p className={guestStyles.cname}>{fullName(m)}</p><p className={guestStyles.cmeta}>{metaLine(m) || '—'}</p></div>
                {isIn(m, session) && <span className={guestStyles.tag}>ALREADY IN</span>}
              </div>
            ))}
          </div>
          <button type="button" className={guestStyles.btnBrand} onClick={onNewGuest}>＋ Not listed — register new guest</button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ edit sheet */

function EditSheet({
  member, session, onClose, onSave, onDelete,
}: {
  member: CheckinMember;
  session: string;
  onClose: () => void;
  onSave: (patch: Partial<CheckinMember>) => void;
  onDelete: () => void;
}) {
  const [form, setForm] = React.useState<CheckinMember>(member);
  const [pendingStatus, setPendingStatus] = React.useState<'' | 'in' | 'noshow'>(statusOf(member, session));
  const rv = rsvpVal(member, session);
  const [pendingRsvp, setPendingRsvp] = React.useState<'' | 'yes' | 'maybe' | 'no'>(rv === true ? 'yes' : rv === 'maybe' ? 'maybe' : rv === false ? 'no' : '');
  const [uploading, setUploading] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  function field<K extends keyof CheckinMember>(k: K, v: CheckinMember[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const blob = await downscaleImage(file, 240);
      const fd = new FormData();
      fd.set('photo', blob, 'photo.jpg');
      const url = await uploadCheckinPhoto(member.id, fd);
      field('photo', url);
    } catch (err) {
      console.error('[checkin] photo upload failed', err);
      alert('Photo upload failed — check connection and try again.');
    } finally {
      setUploading(false);
    }
  }

  function save() {
    const seasons = { ...form.seasons };
    if (pendingStatus === '') delete seasons[session]; else seasons[session] = pendingStatus;
    const rsvp = { ...form.rsvp };
    if (pendingRsvp === '') delete rsvp[session];
    else rsvp[session] = pendingRsvp === 'maybe' ? 'maybe' : pendingRsvp === 'yes';
    const infoKeys: Array<keyof CheckinMember> = ['prefix', 'first', 'last', 'cred', 'mscp', 'ptype', 'spec', 'practice', 'email', 'phone'];
    const edited = form.edited || infoKeys.some(k => (member[k] || '') !== (form[k] || ''));
    onSave({ ...form, seasons, rsvp, edited });
  }

  return (
    <div className={sheetStyles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={sheetStyles.sheet}>
        <div className={sheetStyles.sheethead}>
          <div className={cx(sheetStyles.avatar, sheetStyles.photobtn)} onClick={() => fileRef.current?.click()}>
            {form.photo ? <img src={form.photo} alt="" /> : initials(form)}
            <span className={sheetStyles.cam}>{uploading ? '…' : '📷'}</span>
          </div>
          <h2>{fullName(form) || 'New attendee'}</h2>
          <button className={sheetStyles.close} onClick={onClose}>×</button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handlePhoto} />
        <div className={sheetStyles.form}>
          <div className={sheetStyles.seglabel}>Check-in status</div>
          <div className={sheetStyles.seg}>
            <button type="button" className={pendingStatus === '' ? sheetStyles.actNeutral : ''} onClick={() => setPendingStatus('')}>Not yet</button>
            <button type="button" className={pendingStatus === 'in' ? sheetStyles.actIn : ''} onClick={() => setPendingStatus('in')}>✓ Checked in</button>
            <button type="button" className={pendingStatus === 'noshow' ? sheetStyles.actNo : ''} onClick={() => setPendingStatus('noshow')}>✕ No-show</button>
          </div>

          <div className={sheetStyles.seglabel}>RSVP</div>
          <div className={sheetStyles.seg}>
            <button type="button" className={pendingRsvp === '' ? sheetStyles.actNeutral : ''} onClick={() => setPendingRsvp('')}>Undecided</button>
            <button type="button" className={pendingRsvp === 'yes' ? sheetStyles.actIn : ''} onClick={() => setPendingRsvp('yes')}>Yes</button>
            <button type="button" className={pendingRsvp === 'maybe' ? sheetStyles.actWarn : ''} onClick={() => setPendingRsvp('maybe')}>Maybe</button>
            <button type="button" className={pendingRsvp === 'no' ? sheetStyles.actNo : ''} onClick={() => setPendingRsvp('no')}>No</button>
          </div>

          <div className={sheetStyles.grid2}>
            {FIELDS.map(f => (
              <div key={f.k} className={cx(sheetStyles.field, f.half && sheetStyles.half)}>
                <label>{f.label}</label>
                {f.type === 'select' ? (
                  <select value={String(form[f.k] ?? '')} onChange={e => field(f.k, e.target.value as never)}>
                    {(f.opts || []).map(o => <option key={o} value={o}>{o || '—'}</option>)}
                  </select>
                ) : (
                  <input type={f.type} value={String(form[f.k] ?? '')} onChange={e => field(f.k, e.target.value as never)} placeholder={f.label} />
                )}
              </div>
            ))}
          </div>

          <div className={sheetStyles.seglabel}>Consent to be listed in directory</div>
          <div className={sheetStyles.seg}>
            <button type="button" className={form.consent === 'Yes' ? sheetStyles.actIn : ''} onClick={() => field('consent', form.consent === 'Yes' ? '' : 'Yes')}>Yes</button>
            <button type="button" className={form.consent === 'No' ? sheetStyles.actNo : ''} onClick={() => field('consent', form.consent === 'No' ? '' : 'No')}>No</button>
          </div>

          <div className={sheetStyles.seglabel}>Notes</div>
          <textarea className={sheetStyles.textarea} value={form.notes || ''} onChange={e => field('notes', e.target.value)} placeholder="Anything to remember about this person…" />

          <div className={sheetStyles.hint}>Shared by check-in corrections, RSVP updates, new members, and guest registration — synced live to the rest of the team.</div>
        </div>
        <div className={sheetStyles.actions}>
          <button className={cx(sheetStyles.btn, sheetStyles.btnDanger)} onClick={onDelete}>Delete</button>
          <button className={cx(sheetStyles.btn, sheetStyles.btnIn)} onClick={save}>Save ✓</button>
        </div>
      </div>
    </div>
  );
}
