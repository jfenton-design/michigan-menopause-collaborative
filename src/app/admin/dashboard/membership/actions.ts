'use server';

import { revalidatePath } from 'next/cache';
import { getCheckinRoster, saveCheckinRoster } from '@/lib/checkin-db';
import { getMeetings } from '@/lib/admin-db';
import { readRsvps } from '@/lib/sheets';
import type { CheckinMember, RsvpValue } from '@/lib/checkin-data';

const PREFIX_RE = /^(dr|ms|mrs|mr|mx)\.?$/i;

function parseName(full: string): { prefix: string; first: string; last: string } {
  const tokens = full.trim().split(/\s+/).filter(Boolean);
  let prefix = '';
  if (tokens.length > 1 && PREFIX_RE.test(tokens[0])) {
    prefix = tokens.shift()!.replace(/\.?$/, '.');
  }
  const first = tokens.shift() ?? '';
  const last = tokens.join(' ');
  return { prefix, first, last };
}

function nameKey(first: string, last: string): string {
  return `${first} ${last}`.trim().toLowerCase();
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 42);
}

function attendingToRsvp(raw: string): RsvpValue {
  const v = raw.trim().toLowerCase();
  if (v === 'no' || v === 'false' || v === 'n' || v === 'not attending') return false;
  if (v === 'maybe') return 'maybe';
  return true; // "yes", "", or anything else defaults to attending
}

export type SyncResult = {
  ok: boolean;
  message: string;
  added: number;
  updated: number;
  rsvpsApplied: number;
  unmatchedMeeting: number;
  totalRows: number;
  roster?: CheckinMember[];
};

/**
 * Pulls RSVPs from the public Google Sheet ("RSVPs" tab) into the check-in
 * roster. Matches people by email first, then by name. The sheet is treated as
 * the source of truth for RSVP status; contact fields are only *filled in* when
 * the roster is missing them (never overwritten). Unknown people are added.
 * Re-running is idempotent — already-synced RSVPs report as up to date.
 */
export async function syncRsvpsFromSheet(): Promise<SyncResult> {
  const [roster, meetings, rows] = await Promise.all([
    getCheckinRoster(),
    getMeetings(),
    readRsvps(),
  ]);

  if (rows.length === 0) {
    return {
      ok: false,
      message:
        'No RSVP rows found. Check that the "RSVPs" tab exists and that GOOGLE_SHEET_ID / the service account are configured in the environment.',
      added: 0, updated: 0, rsvpsApplied: 0, unmatchedMeeting: 0, totalRows: 0,
    };
  }

  // meeting label ("<quarter> — <month> <day>, <year>") → meeting id, by quarter
  const quarterToId = new Map<string, string>();
  for (const m of meetings) quarterToId.set(m.quarter.trim().toLowerCase(), m.id);
  function resolveMeetingId(label: string): string | null {
    const q = label.split('—')[0].trim().toLowerCase();
    if (q && quarterToId.has(q)) return quarterToId.get(q)!;
    const lower = label.toLowerCase();
    for (const m of meetings) {
      if (lower.includes(m.quarter.trim().toLowerCase())) return m.id;
    }
    return null;
  }

  // working copy — deep-clone the mutable maps so we never touch the originals
  const next: CheckinMember[] = roster.map(m => ({
    ...m,
    seasons: { ...m.seasons },
    rsvp: { ...m.rsvp },
  }));

  const byEmail = new Map<string, CheckinMember>();
  const byName = new Map<string, CheckinMember>();
  for (const m of next) {
    const e = (m.email || '').trim().toLowerCase();
    if (e) byEmail.set(e, m);
    byName.set(nameKey(m.first, m.last), m);
  }

  // dedupe: latest submission per (person, meeting) wins — rows are append-order
  type Row = (typeof rows)[number] & { meetingId: string };
  const deduped = new Map<string, Row>();
  let unmatchedMeeting = 0;
  for (const row of rows) {
    const meetingId = resolveMeetingId(row.meetingLabel || '');
    if (!meetingId) { unmatchedMeeting++; continue; }
    const p = parseName(row.name || '');
    const personKey = (row.email || '').trim().toLowerCase() || nameKey(p.first, p.last);
    if (!personKey) continue;
    deduped.set(`${personKey}|${meetingId}`, { ...row, meetingId });
  }

  let added = 0;
  let updated = 0;
  let rsvpsApplied = 0;

  for (const row of deduped.values()) {
    const email = (row.email || '').trim();
    const emailLc = email.toLowerCase();
    const parsed = parseName(row.name || '');
    const key = nameKey(parsed.first, parsed.last);
    const val = attendingToRsvp(row.attendingRaw || '');

    const member = (emailLc && byEmail.get(emailLc)) || byName.get(key) || null;

    if (member) {
      let changed = false;
      if (member.rsvp[row.meetingId] !== val) {
        member.rsvp[row.meetingId] = val;
        rsvpsApplied++;
        changed = true;
      }
      // fill blanks only — never overwrite existing roster data
      if (!(member.email || '').trim() && email) {
        member.email = email;
        if (emailLc) byEmail.set(emailLc, member);
        changed = true;
      }
      if (!(member.phone || '').trim() && (row.phone || '').trim()) { member.phone = row.phone.trim(); changed = true; }
      if (!(member.practice || '').trim() && (row.practice || '').trim()) { member.practice = row.practice.trim(); changed = true; }
      if (!(member.cred || '').trim() && (row.credentials || '').trim()) { member.cred = row.credentials.trim(); changed = true; }
      if (changed) updated++;
    } else {
      const noteParts: string[] = [];
      if ((row.dietary || '').trim()) noteParts.push(`Dietary: ${row.dietary.trim()}`);
      if ((row.guestNames || '').trim()) noteParts.push(`Guests: ${row.guestNames.trim()}`);
      else if (parseInt(row.guestCount || '0', 10) > 0) noteParts.push(`Bringing ${row.guestCount} guest(s)`);
      if ((row.notes || '').trim()) noteParts.push(row.notes.trim());

      const id = 'imp-' + (slug(email) || slug(row.name) || key.replace(/\s+/g, '-'));
      const nm: CheckinMember = {
        id,
        prefix: parsed.prefix,
        first: parsed.first,
        last: parsed.last,
        cred: (row.credentials || '').trim(),
        mscp: '',
        ptype: '',
        spec: '',
        practice: (row.practice || '').trim(),
        email,
        phone: (row.phone || '').trim(),
        notes: noteParts.join(' · '),
        consent: '',
        seasons: {},
        rsvp: { [row.meetingId]: val },
        edited: true,
      };
      next.push(nm);
      if (emailLc) byEmail.set(emailLc, nm);
      byName.set(key, nm);
      added++;
      rsvpsApplied++;
    }
  }

  if (added === 0 && updated === 0) {
    return {
      ok: true,
      message: `Already up to date — checked ${deduped.size} RSVP${deduped.size === 1 ? '' : 's'}, nothing new to import.`,
      added, updated, rsvpsApplied, unmatchedMeeting, totalRows: rows.length,
      roster: next,
    };
  }

  try {
    await saveCheckinRoster(next);
  } catch (err) {
    console.error('[membership] saveCheckinRoster failed', err);
    return {
      ok: false,
      message: `Read ${rows.length} RSVP${rows.length === 1 ? '' : 's'} and prepared ${added} new / ${updated} updated, but saving to the roster failed (is BLOB_READ_WRITE_TOKEN set?). Nothing was persisted.`,
      added, updated, rsvpsApplied, unmatchedMeeting, totalRows: rows.length,
    };
  }

  revalidatePath('/admin/dashboard/membership');
  revalidatePath('/admin/dashboard/checkin');

  const bits = [`${added} added`, `${updated} updated`, `${rsvpsApplied} RSVP${rsvpsApplied === 1 ? '' : 's'} applied`];
  if (unmatchedMeeting) bits.push(`${unmatchedMeeting} row${unmatchedMeeting === 1 ? '' : 's'} skipped (unrecognized meeting)`);
  return {
    ok: true,
    message: bits.join(' · '),
    added, updated, rsvpsApplied, unmatchedMeeting, totalRows: rows.length,
    roster: next,
  };
}

/** Persist the roster after a Membership-side edit (photo, retroactive
 *  attendance, etc.). Same store the Check-In tool writes to. */
export async function persistRoster(roster: CheckinMember[]): Promise<void> {
  await saveCheckinRoster(roster);
  revalidatePath('/admin/dashboard/membership');
  revalidatePath('/admin/dashboard/checkin');
}
