'use client';
import * as React from 'react';
import type { Meeting } from '@/lib/data';
import type { CheckinMember, RsvpValue } from '@/lib/checkin-data';
import { persistRoster, uploadCheckinPhoto } from './actions';

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
function isNoShow(m: CheckinMember, session: string) { return statusOf(m, session) === 'noshow'; }
function rsvpVal(m: CheckinMember, session: string): RsvpValue | undefined { return m.rsvp?.[session]; }
function rsvpYes(m: CheckinMember, session: string) { return rsvpVal(m, session) === true; }
function rsvpNo(m: CheckinMember, session: string) { return rsvpVal(m, session) === false; }
function rsvpMaybe(m: CheckinMember, session: string) { return rsvpVal(m, session) === 'maybe'; }
function isWalkin(m: CheckinMember, session: string) {
  return isIn(m, session) && !rsvpYes(m, session) && !rsvpMaybe(m, session);
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

const CHECKIN_FILTERS = [
  { key: 'expected', label: 'Expected' },
  { key: 'in', label: 'Checked In' },
  { key: 'walkin', label: 'Walk-ins' },
  { key: 'noshow', label: 'No-show' },
  { key: 'notyet', label: 'Not Arrived' },
] as const;
const MEMBERS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'yes', label: 'RSVP Yes' },
  { key: 'maybe', label: 'RSVP Maybe' },
  { key: 'no', label: 'RSVP No' },
  { key: 'undecided', label: 'Undecided' },
  { key: 'flag', label: 'Needs Update' },
] as const;

type View = 'checkin' | 'members' | 'events';
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
  const [view, setView] = React.useState<View>('checkin');
  const [filter, setFilter] = React.useState<string>('expected');
  const [query, setQuery] = React.useState('');
  const [sheet, setSheet] = React.useState<SheetState>(null);
  const [toast, setToast] = React.useState<string | null>(null);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const persistQueue = React.useRef<Promise<void>>(Promise.resolve());
  const [guestQuery, setGuestQuery] = React.useState('');

  const meetings = initialMeetings;

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

  function switchView(v: View) {
    setView(v);
    setFilter(v === 'checkin' ? 'expected' : 'all');
    setQuery('');
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

  function addNewMember() {
    const nm = blankMember(newTempId());
    commitRoster([...roster, nm]);
    setSheet({ mode: 'edit', memberId: nm.id });
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

  function matchesCheckin(m: CheckinMember): boolean {
    if (query && !hay(m).includes(query)) return false;
    switch (filter) {
      case 'in': return isIn(m, session);
      case 'walkin': return isWalkin(m, session);
      case 'noshow': return isNoShow(m, session);
      case 'notyet': return (rsvpYes(m, session) || rsvpMaybe(m, session)) && !isIn(m, session) && !isNoShow(m, session);
      case 'expected': return rsvpYes(m, session) || rsvpMaybe(m, session);
      default: return true;
    }
  }
  function matchesMembers(m: CheckinMember): boolean {
    if (query && !hay(m).includes(query)) return false;
    switch (filter) {
      case 'yes': return rsvpYes(m, session);
      case 'maybe': return rsvpMaybe(m, session);
      case 'no': return rsvpNo(m, session);
      case 'undecided': return rsvpVal(m, session) === undefined;
      case 'flag': return !!m.edited;
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

  const shownCheckin = view === 'checkin' ? sortedMembers(roster).filter(matchesCheckin) : [];
  const shownMembers = view === 'members' ? sortedMembers(roster).filter(matchesMembers) : [];

  const expectedCount = roster.filter(m => rsvpYes(m, session) || rsvpMaybe(m, session)).length;
  const inCount = roster.filter(m => isIn(m, session)).length;
  const walkCount = roster.filter(m => isWalkin(m, session)).length;
  const noShowCount = roster.filter(m => isNoShow(m, session)).length;

  const sheetMember = sheet?.mode === 'edit' ? roster.find(m => m.id === sheet.memberId) ?? null : null;

  return (
    <div className="wrap">
      <header>
        <div className="hrow">
          <div>
            <h1 className="title">MMC Admin — Check-In</h1>
            <p className="sub">Michigan Menopause Collaborative</p>
          </div>
          <div className="sessionwrap">
            <label htmlFor="session">Session</label>
            <select id="session" value={session} onChange={e => setSession(e.target.value)}>
              {meetings.map(mt => (
                <option key={mt.id} value={mt.id}>{meetingLabel(mt)}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="navtabs">
          <button className={view === 'checkin' ? 'navtab active' : 'navtab'} onClick={() => switchView('checkin')}>Check-In</button>
          <button className={view === 'members' ? 'navtab active' : 'navtab'} onClick={() => switchView('members')}>Members</button>
          <button className={view === 'events' ? 'navtab active' : 'navtab'} onClick={() => switchView('events')}>Events</button>
        </div>
        <div className="tools">
          {(view === 'checkin' || view === 'members') && (
            <div className="search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
              <input value={query} onChange={e => setQuery(e.target.value.trim().toLowerCase())} type="search" placeholder="Search name, practice, specialty…" />
            </div>
          )}
          <button className="btn btn-ghost" onClick={exportCsv}>⤓ Export</button>
        </div>
      </header>

      {view === 'checkin' && (
        <div className="stats">
          <div className="stat"><div className="n">{expectedCount}</div><div className="l">Expected</div></div>
          <div className="stat inx"><div className="n">{inCount}</div><div className="l">Checked In</div></div>
          <div className="stat walk"><div className="n">{walkCount}</div><div className="l">Walk-ins</div></div>
          <div className="stat nox"><div className="n">{noShowCount}</div><div className="l">No-show</div></div>
        </div>
      )}

      {(view === 'checkin' || view === 'members') && (
        <div className="filters">
          {(view === 'checkin' ? CHECKIN_FILTERS : MEMBERS_FILTERS).map(f => (
            <button key={f.key} className={filter === f.key ? 'chip active' : 'chip'} onClick={() => setFilter(f.key)}>{f.label}</button>
          ))}
        </div>
      )}

      <div className="list">
        {view === 'checkin' && (shownCheckin.length === 0 ? (
          <div className="empty">No one matches. Try a different search or filter.</div>
        ) : shownCheckin.map(m => {
          const st = statusOf(m, session);
          const mark = st === 'in' ? '✓' : st === 'noshow' ? '✕' : '';
          return (
            <div key={m.id} className={'card' + (st === 'in' ? ' in' : st === 'noshow' ? ' noshow' : '')} onClick={() => (st === '' ? quickCheckIn(m.id) : setSheet({ mode: 'edit', memberId: m.id }))}>
              <div className="avatar">{m.photo ? <img src={m.photo} alt="" /> : initials(m)}</div>
              <div className="cbody">
                <p className="cname">
                  {fullName(m)}
                  {m.cred && <span className="cred">{m.cred}</span>}
                  {rsvpYes(m, session) && <span className="rsvpbadge">RSVP&apos;d</span>}
                  {rsvpMaybe(m, session) && <span className="maybebadge">Maybe</span>}
                  {isWalkin(m, session) && <span className="walkbadge">Walk-in</span>}
                </p>
                <p className="cmeta">{metaLine(m) || '—'}{m.notes ? ' · 📝' : ''}</p>
              </div>
              <div className="cstatus">
                <div className="checkmark">{mark}</div>
                <button className="editbtn" onClick={e => { e.stopPropagation(); setSheet({ mode: 'edit', memberId: m.id }); }}>✎</button>
              </div>
            </div>
          );
        }))}

        {view === 'members' && (shownMembers.length === 0 ? (
          <div className="empty">No one matches. Try a different search or filter.</div>
        ) : shownMembers.map(m => {
          const rv = rsvpVal(m, session);
          return (
            <div key={m.id} className="card" onClick={() => setSheet({ mode: 'edit', memberId: m.id })}>
              <div className="avatar">{m.photo ? <img src={m.photo} alt="" /> : initials(m)}</div>
              <div className="cbody">
                <p className="cname">
                  {fullName(m)}
                  {m.cred && <span className="cred">{m.cred}</span>}
                  {isIn(m, session) && <span className="dir">✓ in this session</span>}
                  {m.edited && <span className="flag">updated</span>}
                </p>
                <p className="cmeta">{metaLine(m) || '—'}</p>
              </div>
              <div className="miniseg" onClick={e => e.stopPropagation()}>
                <button className={rv === true ? 'yes-on' : ''} onClick={() => setRsvp(m.id, true)}>Yes</button>
                <button className={rv === 'maybe' ? 'maybe-on' : ''} onClick={() => setRsvp(m.id, 'maybe')}>Maybe</button>
                <button className={rv === false ? 'no-on' : ''} onClick={() => setRsvp(m.id, false)}>No</button>
              </div>
            </div>
          );
        }))}

        {view === 'events' && meetings.map(mt => (
          <div key={mt.id} className={'eventcard' + (mt.id === session ? ' current' : '')}>
            <div className="eventtag">{mt.id === session ? 'Selected session' : meetingLabel(mt)}</div>
            <h3>{meetingLabel(mt)}</h3>
            <p className="eventdate">{mt.weekday}, {mt.month} {mt.day}, {mt.year} · {mt.time}</p>
            <p className="eventloc">{mt.location}</p>
            {mt.topic && <p className="eventtopic">{mt.topic}{mt.topicPresenter ? ` — ${mt.topicPresenter}` : ''}</p>}
            <p className="eventmeta">
              {roster.filter(m => m.rsvp?.[mt.id] === true).length} RSVP&apos;d yes
              {roster.filter(m => m.rsvp?.[mt.id] === 'maybe').length > 0 && ` · ${roster.filter(m => m.rsvp?.[mt.id] === 'maybe').length} maybe`}
            </p>
          </div>
        ))}
      </div>

      {view !== 'events' && (
        <button className="fab" onClick={() => (view === 'checkin' ? setSheet({ mode: 'guestSearch' }) : addNewMember())}>
          {view === 'checkin' ? '⚑ Register Guest' : '＋ Add Member'}
        </button>
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

      {toast && <div className="toast show">{toast}</div>}

      <style jsx>{`
        .wrap { font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; background: var(--paper,#F7F4FB); color: var(--ink,#1F1535); min-height: 100vh; }
        header { position: sticky; top: 0; z-index: 20; background: var(--accent,#6B3FCB); color: #fff; padding: 14px 16px; box-shadow: 0 2px 12px rgba(31,21,53,.18); }
        .hrow { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .title { font-size: 20px; font-weight: 700; margin: 0; letter-spacing: .2px; }
        .sub { font-size: 13px; opacity: .9; margin: 2px 0 0; }
        .sessionwrap { margin-left: auto; display: flex; align-items: center; gap: 8px; }
        .sessionwrap label { font-size: 13px; opacity: .9; }
        select#session { font-size: 16px; font-weight: 600; padding: 9px 12px; border-radius: 10px; border: none; background: #fff; color: var(--accent-2,#4F2C9E); min-height: 42px; }
        .navtabs { display: flex; gap: 6px; margin-top: 12px; background: rgba(255,255,255,.16); padding: 5px; border-radius: 14px; }
        .navtab { flex: 1; border: none; background: transparent; color: rgba(255,255,255,.85); padding: 11px 8px; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; min-height: 42px; }
        .navtab.active { background: #fff; color: var(--accent-2,#4F2C9E); }
        .tools { display: flex; gap: 10px; margin-top: 12px; align-items: center; flex-wrap: wrap; }
        .search { flex: 1; min-width: 180px; position: relative; }
        .search input { width: 100%; font-size: 17px; padding: 12px 14px 12px 40px; border-radius: 12px; border: none; background: rgba(255,255,255,.95); color: var(--ink,#1F1535); min-height: 46px; box-sizing: border-box; }
        .search svg { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); opacity: .5; }
        .btn { border: none; border-radius: 12px; padding: 12px 16px; font-size: 16px; font-weight: 600; cursor: pointer; min-height: 46px; display: inline-flex; align-items: center; gap: 7px; }
        .btn-ghost { background: rgba(255,255,255,.9); color: var(--accent-2,#4F2C9E); }
        .stats { display: flex; gap: 10px; padding: 12px 16px 0; flex-wrap: wrap; }
        .stat { background: #fff; border-radius: 14px; padding: 12px 16px; box-shadow: 0 2px 10px rgba(31,21,53,.08); flex: 1; min-width: 110px; text-align: center; }
        .stat .n { font-size: 26px; font-weight: 800; color: var(--accent-2,#4F2C9E); line-height: 1; }
        .stat.inx .n { color: #1f9d6b; }
        .stat.nox .n { color: #c0392b; }
        .stat.walk .n { color: #c9761f; }
        .stat .l { font-size: 12px; color: var(--ink-soft,#7A6E96); margin-top: 4px; text-transform: uppercase; letter-spacing: .4px; }
        .filters { display: flex; gap: 8px; padding: 12px 16px 4px; flex-wrap: wrap; }
        .chip { border: 1px solid var(--rule,#E8DEF7); background: #fff; color: var(--ink-soft,#7A6E96); border-radius: 999px; padding: 8px 15px; font-size: 14px; font-weight: 600; cursor: pointer; min-height: 40px; }
        .chip.active { background: var(--accent,#6B3FCB); color: #fff; border-color: var(--accent,#6B3FCB); }
        .list { display: grid; grid-template-columns: repeat(auto-fill,minmax(340px,1fr)); gap: 12px; padding: 16px 16px 110px; max-width: 1400px; margin: 0 auto; }
        .card { background: #fff; border-radius: 16px; padding: 14px 16px; box-shadow: 0 2px 10px rgba(31,21,53,.08); display: flex; align-items: center; gap: 14px; cursor: pointer; border: 2px solid transparent; }
        .card.in { border-color: #1f9d6b; background: linear-gradient(0deg,#e2f5ec,#fff 60%); }
        .card.noshow { border-color: #e7b4ad; background: linear-gradient(0deg,#fbeae7,#fff 60%); }
        .card.noshow .checkmark { background: #c0392b; border-color: #c0392b; color: #fff; }
        .dir { font-size: 12px; font-weight: 700; color: #1f9d6b; background: #e2f5ec; padding: 2px 7px; border-radius: 6px; }
        .rsvpbadge { font-size: 12px; font-weight: 700; color: var(--accent-2,#4F2C9E); background: var(--accent-soft,#D9C9F4); padding: 2px 7px; border-radius: 6px; }
        .maybebadge, .walkbadge { font-size: 12px; font-weight: 700; color: #c9761f; background: #fbefe0; padding: 2px 7px; border-radius: 6px; }
        .avatar { width: 52px; height: 52px; border-radius: 50%; background: var(--accent-soft,#D9C9F4); color: var(--accent-2,#4F2C9E); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 19px; flex-shrink: 0; overflow: hidden; }
        .card.in .avatar { background: #1f9d6b; color: #fff; }
        .avatar :global(img) { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .miniseg { display: flex; gap: 5px; }
        .miniseg button { border: 1.5px solid var(--rule,#E8DEF7); background: #fff; color: var(--ink-soft,#7A6E96); border-radius: 8px; padding: 8px 12px; font-size: 13px; font-weight: 700; cursor: pointer; min-height: 36px; }
        .miniseg button.yes-on { background: #1f9d6b; border-color: #1f9d6b; color: #fff; }
        .miniseg button.maybe-on { background: #c9761f; border-color: #c9761f; color: #fff; }
        .miniseg button.no-on { background: #c0392b; border-color: #c0392b; color: #fff; }
        .empty { text-align: center; color: var(--ink-soft,#7A6E96); padding: 60px 20px; font-size: 16px; grid-column: 1/-1; }
        .cbody { flex: 1; min-width: 0; }
        .cname { font-size: 18px; font-weight: 700; margin: 0; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .cred { font-size: 13px; font-weight: 600; color: var(--accent-2,#4F2C9E); background: var(--accent-soft,#D9C9F4); padding: 2px 8px; border-radius: 6px; }
        .cmeta { font-size: 14px; color: var(--ink-soft,#7A6E96); margin: 3px 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .flag { font-size: 12px; color: #c9761f; font-weight: 700; background: #fbefe0; padding: 2px 7px; border-radius: 6px; }
        .cstatus { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .checkmark { width: 44px; height: 44px; border-radius: 50%; border: 2px solid var(--rule,#E8DEF7); display: flex; align-items: center; justify-content: center; font-size: 22px; color: transparent; }
        .card.in .checkmark { background: #1f9d6b; border-color: #1f9d6b; color: #fff; }
        .editbtn { width: 30px; height: 30px; border-radius: 50%; border: none; background: #efeef3; color: var(--ink-soft,#7A6E96); font-size: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .eventcard { background: #fff; border-radius: 18px; padding: 22px; box-shadow: 0 2px 10px rgba(31,21,53,.08); border: 2px solid transparent; }
        .eventcard.current { border-color: var(--accent,#6B3FCB); }
        .eventtag { font-size: 12px; font-weight: 700; color: var(--accent-2,#4F2C9E); text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px; }
        .eventcard h3 { margin: 0 0 8px; font-size: 22px; }
        .eventdate { font-weight: 700; margin: 0 0 2px; }
        .eventloc { color: var(--ink-soft,#7A6E96); margin: 0 0 10px; white-space: pre-line; }
        .eventtopic { margin: 0 0 10px; font-style: italic; }
        .eventmeta { margin: 0; font-size: 14px; color: var(--accent-2,#4F2C9E); font-weight: 700; }
        .fab { position: fixed; right: 18px; bottom: 18px; z-index: 30; background: var(--accent,#6B3FCB); color: #fff; border: none; border-radius: 999px; padding: 16px 22px; font-size: 17px; font-weight: 700; box-shadow: 0 6px 20px rgba(107,63,203,.4); cursor: pointer; }
        .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: var(--ink,#1F1535); color: #fff; padding: 13px 22px; border-radius: 999px; font-weight: 600; z-index: 80; box-shadow: 0 4px 20px rgba(0,0,0,.25); font-size: 15px; }
        @media (max-width: 480px) { .list { grid-template-columns: 1fr; } .sub { display: none; } }
      `}</style>
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
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet">
        <div className="sheethead"><h2>Register Guest</h2><button className="close" onClick={onClose}>×</button></div>
        <div className="form">
          <div className="field">
            <label>Search the directory first</label>
            <input autoFocus value={query} onChange={e => onQueryChange(e.target.value)} type="search" placeholder="Name, practice, specialty…" />
          </div>
          <div>
            {matches.length === 0 ? (
              <div className="emptyRow">No matches — register as a new guest below.</div>
            ) : matches.map(m => (
              <div key={m.id} className="guestrow" onClick={() => onSelectExisting(m.id)}>
                <div className="avatar">{m.photo ? <img src={m.photo} alt="" /> : initials(m)}</div>
                <div className="cbody"><p className="cname">{fullName(m)}</p><p className="cmeta">{metaLine(m) || '—'}</p></div>
                {isIn(m, session) && <span className="dir">already in</span>}
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-brand" onClick={onNewGuest}>＋ Not listed — register new guest</button>
        </div>
      </div>
      <style jsx>{`
        .overlay { position: fixed; inset: 0; background: rgba(31,21,53,.5); z-index: 50; display: flex; align-items: flex-end; justify-content: center; }
        .sheet { background: var(--paper,#F7F4FB); width: 100%; max-width: 640px; max-height: 94vh; overflow-y: auto; border-radius: 22px 22px 0 0; padding-bottom: 20px; }
        .sheethead { position: sticky; top: 0; background: var(--accent,#6B3FCB); color: #fff; padding: 18px 20px; border-radius: 22px 22px 0 0; display: flex; align-items: center; gap: 14px; z-index: 2; }
        .sheethead h2 { margin: 0; font-size: 21px; font-weight: 700; }
        .close { margin-left: auto; background: rgba(255,255,255,.2); border: none; color: #fff; width: 40px; height: 40px; border-radius: 50%; font-size: 22px; cursor: pointer; line-height: 1; }
        .form { padding: 16px 20px; }
        .field { margin-bottom: 14px; }
        .field label { display: block; font-size: 13px; font-weight: 700; color: var(--ink-soft,#7A6E96); margin-bottom: 5px; text-transform: uppercase; letter-spacing: .4px; }
        .field input { width: 100%; font-size: 17px; padding: 13px 14px; border-radius: 12px; border: 1.5px solid var(--rule,#E8DEF7); background: #fff; color: var(--ink,#1F1535); min-height: 50px; box-sizing: border-box; }
        .btn-brand { background: var(--accent-2,#4F2C9E); color: #fff; width: 100%; justify-content: center; margin-top: 14px; border: none; border-radius: 12px; padding: 12px 16px; font-size: 16px; font-weight: 600; cursor: pointer; min-height: 46px; display: flex; align-items: center; }
        .guestrow { display: flex; align-items: center; gap: 12px; padding: 12px 8px; border-bottom: 1px solid var(--rule,#E8DEF7); cursor: pointer; }
        .guestrow:active { background: var(--accent-soft,#D9C9F4); }
        .emptyRow { padding: 20px 8px; color: var(--ink-soft,#7A6E96); }
        .avatar { width: 44px; height: 44px; border-radius: 50%; background: var(--accent-soft,#D9C9F4); color: var(--accent-2,#4F2C9E); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; flex-shrink: 0; overflow: hidden; }
        .avatar :global(img) { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .cbody { flex: 1; min-width: 0; }
        .cname { font-size: 16px; font-weight: 700; margin: 0; }
        .cmeta { font-size: 13px; color: var(--ink-soft,#7A6E96); margin: 2px 0 0; }
        .dir { font-size: 12px; font-weight: 700; color: #1f9d6b; background: #e2f5ec; padding: 2px 7px; border-radius: 6px; flex-shrink: 0; }
      `}</style>
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
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet">
        <div className="sheethead">
          <div className="avatar photobtn" onClick={() => fileRef.current?.click()}>
            {form.photo ? <img src={form.photo} alt="" /> : initials(form)}
            <span className="cam">{uploading ? '…' : '📷'}</span>
          </div>
          <h2>{fullName(form) || 'New attendee'}</h2>
          <button className="close" onClick={onClose}>×</button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handlePhoto} />
        <div className="form">
          <div className="seglabel">Check-in status</div>
          <div className="seg">
            <button type="button" className={pendingStatus === '' ? 'act-neutral' : ''} onClick={() => setPendingStatus('')}>Not yet</button>
            <button type="button" className={pendingStatus === 'in' ? 'act-in' : ''} onClick={() => setPendingStatus('in')}>✓ Checked in</button>
            <button type="button" className={pendingStatus === 'noshow' ? 'act-no' : ''} onClick={() => setPendingStatus('noshow')}>✕ No-show</button>
          </div>

          <div className="seglabel">RSVP</div>
          <div className="seg">
            <button type="button" className={pendingRsvp === '' ? 'act-neutral' : ''} onClick={() => setPendingRsvp('')}>Undecided</button>
            <button type="button" className={pendingRsvp === 'yes' ? 'act-in' : ''} onClick={() => setPendingRsvp('yes')}>Yes</button>
            <button type="button" className={pendingRsvp === 'maybe' ? 'act-warn' : ''} onClick={() => setPendingRsvp('maybe')}>Maybe</button>
            <button type="button" className={pendingRsvp === 'no' ? 'act-no' : ''} onClick={() => setPendingRsvp('no')}>No</button>
          </div>

          <div className="grid2">
            {FIELDS.map(f => (
              <div key={f.k} className={'field' + (f.half ? ' half' : '')}>
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

          <div className="seglabel">Consent to be listed in directory</div>
          <div className="seg">
            <button type="button" className={form.consent === 'Yes' ? 'act-in' : ''} onClick={() => field('consent', form.consent === 'Yes' ? '' : 'Yes')}>Yes</button>
            <button type="button" className={form.consent === 'No' ? 'act-no' : ''} onClick={() => field('consent', form.consent === 'No' ? '' : 'No')}>No</button>
          </div>

          <div className="seglabel">Notes</div>
          <textarea value={form.notes || ''} onChange={e => field('notes', e.target.value)} placeholder="Anything to remember about this person…" />

          <div className="hint">Shared by check-in corrections, member edits, new members, and guest registration — synced live to the rest of the team.</div>
        </div>
        <div className="actions">
          <button className="btn btn-danger" onClick={onDelete}>Delete</button>
          <button className="btn btn-in" onClick={save}>Save ✓</button>
        </div>
      </div>
      <style jsx>{`
        .overlay { position: fixed; inset: 0; background: rgba(31,21,53,.5); z-index: 50; display: flex; align-items: flex-end; justify-content: center; }
        .sheet { background: var(--paper,#F7F4FB); width: 100%; max-width: 640px; max-height: 94vh; overflow-y: auto; border-radius: 22px 22px 0 0; padding-bottom: 20px; }
        .sheethead { position: sticky; top: 0; background: var(--accent,#6B3FCB); color: #fff; padding: 18px 20px; border-radius: 22px 22px 0 0; display: flex; align-items: center; gap: 14px; z-index: 2; }
        .sheethead h2 { margin: 0; font-size: 21px; font-weight: 700; }
        .close { margin-left: auto; background: rgba(255,255,255,.2); border: none; color: #fff; width: 40px; height: 40px; border-radius: 50%; font-size: 22px; cursor: pointer; line-height: 1; }
        .avatar { width: 56px; height: 56px; border-radius: 50%; background: rgba(255,255,255,.25); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 21px; flex-shrink: 0; overflow: hidden; position: relative; }
        .avatar :global(img) { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .photobtn { cursor: pointer; }
        .cam { position: absolute; right: -2px; bottom: -2px; width: 22px; height: 22px; border-radius: 50%; background: #fff; color: var(--accent-2,#4F2C9E); display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 1px 4px rgba(0,0,0,.3); }
        .form { padding: 16px 20px; }
        .seglabel { font-size: 13px; font-weight: 700; color: var(--ink-soft,#7A6E96); margin: 16px 0 6px; text-transform: uppercase; letter-spacing: .4px; }
        .seg { display: flex; gap: 6px; background: #e9e6f1; padding: 5px; border-radius: 14px; }
        .seg button { flex: 1; border: none; background: transparent; padding: 12px 6px; border-radius: 10px; font-size: 15px; font-weight: 700; color: var(--ink-soft,#7A6E96); cursor: pointer; min-height: 46px; }
        .seg button.act-in { background: #1f9d6b; color: #fff; }
        .seg button.act-no { background: #c0392b; color: #fff; }
        .seg button.act-warn { background: #c9761f; color: #fff; }
        .seg button.act-neutral { background: #fff; color: var(--ink,#1F1535); box-shadow: 0 2px 10px rgba(31,21,53,.08); }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
        .grid2 .field:not(.half) { grid-column: 1 / -1; }
        .field label { display: block; font-size: 13px; font-weight: 700; color: var(--ink-soft,#7A6E96); margin-bottom: 5px; text-transform: uppercase; letter-spacing: .4px; }
        .field input, .field select { width: 100%; font-size: 17px; padding: 13px 14px; border-radius: 12px; border: 1.5px solid var(--rule,#E8DEF7); background: #fff; color: var(--ink,#1F1535); min-height: 50px; box-sizing: border-box; }
        textarea { width: 100%; font-size: 17px; padding: 13px 14px; border-radius: 12px; border: 1.5px solid var(--rule,#E8DEF7); background: #fff; color: var(--ink,#1F1535); min-height: 80px; font-family: inherit; resize: vertical; box-sizing: border-box; }
        .hint { font-size: 13px; color: var(--ink-soft,#7A6E96); margin: 10px 0 14px; }
        .actions { display: flex; gap: 10px; padding: 4px 20px 0; }
        .btn { flex: 1; justify-content: center; border: none; border-radius: 12px; padding: 12px 16px; font-size: 16px; font-weight: 600; cursor: pointer; min-height: 46px; display: flex; align-items: center; }
        .btn-in { background: #1f9d6b; color: #fff; }
        .btn-danger { background: #fbeae7; color: #c0392b; }
      `}</style>
    </div>
  );
}
