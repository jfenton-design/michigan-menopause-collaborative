/**
 * Resend email notification helper.
 *
 * Required env vars:
 *   RESEND_API_KEY   — from resend.com
 *   RESEND_FROM      — verified sender, e.g. noreply@michiganmenopause.com
 *                      (use onboarding@resend.dev while testing on free plan)
 *   NOTIFY_EMAIL     — recipient; defaults to drleff@drcarrieleff.com
 *                      set to jacob@cairnadvisory.co for testing
 *
 * No-op when RESEND_API_KEY is unset.
 */

import { sheetUrl } from "./sheets";

// ---------- ICS builder ----------

type MeetingSnapshot = {
  id: string;
  quarter: string;
  month: string;
  day: string;
  year: string;
  location: string;
  weekday: string;
  time: string;
};

export function buildIcs(m: MeetingSnapshot): string {
  const monthIdx: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, July: 6, Aug: 7, Sep: 8, Sept: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const mi = monthIdx[m.month];
  if (mi === undefined || m.day === "—") return "";
  const day = parseInt(m.day, 10);
  const year = parseInt(m.year, 10);
  if (Number.isNaN(day) || Number.isNaN(year)) return "";

  const pad = (n: number) => String(n).padStart(2, "0");
  const fmtLocal = (yr: number, mo: number, d: number, hr: number, min: number) =>
    `${yr}${pad(mo + 1)}${pad(d)}T${pad(hr)}${pad(min)}00`;
  const n = new Date();
  const dtstamp = `${n.getUTCFullYear()}${pad(n.getUTCMonth()+1)}${pad(n.getUTCDate())}T${pad(n.getUTCHours())}${pad(n.getUTCMinutes())}${pad(n.getUTCSeconds())}Z`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Michigan Menopause Collaborative//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE",
    "TZID:America/New_York",
    "BEGIN:STANDARD",
    "DTSTART:19671029T020000",
    "RRULE:FREQ=YEARLY;BYDAY=1SU;BYMONTH=11",
    "TZOFFSETFROM:-0400",
    "TZOFFSETTO:-0500",
    "TZNAME:EST",
    "END:STANDARD",
    "BEGIN:DAYLIGHT",
    "DTSTART:19870405T020000",
    "RRULE:FREQ=YEARLY;BYDAY=2SU;BYMONTH=3",
    "TZOFFSETFROM:-0500",
    "TZOFFSETTO:-0400",
    "TZNAME:EDT",
    "END:DAYLIGHT",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:${m.id}@michiganmenopause.com`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;TZID=America/New_York:${fmtLocal(year, mi, day, 18, 30)}`,
    `DTEND;TZID=America/New_York:${fmtLocal(year, mi, day, 20, 0)}`,
    `SUMMARY:MMC ${m.quarter} Meeting`,
    `LOCATION:${m.location.replace(/\n/g, ", ")}`,
    `DESCRIPTION:Michigan Menopause Collaborative — ${m.quarter}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

const DEFAULT_NOTIFY = "drleff@drcarrieleff.com";

function htmlRow(label: string, value: string | undefined) {
  if (!value) return "";
  return `
    <tr>
      <td style="padding:6px 12px 6px 0;color:#7A6E96;font-size:13px;white-space:nowrap;vertical-align:top">${label}</td>
      <td style="padding:6px 0;font-size:14px;color:#1F1535">${value.replace(/\n/g, "<br>")}</td>
    </tr>`;
}

function buildHtml(args: {
  title: string;
  rows: Array<{ label: string; value: string | undefined }>;
  sheetLink: string | null;
}): string {
  const rowsHtml = args.rows.map((r) => htmlRow(r.label, r.value)).join("");
  const sheetSection = args.sheetLink
    ? `<p style="margin:24px 0 0">
        <a href="${args.sheetLink}" style="background:#6B3FCB;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:500">
          View in Google Sheets →
        </a>
       </p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F4FB;font-family:system-ui,-apple-system,sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 24px -8px rgba(31,21,53,.12)">
    <div style="background:#1F1535;padding:28px 32px">
      <div style="display:inline-flex;align-items:center;gap:10px">
        <svg width="28" height="28" viewBox="-65 -65 130 130" xmlns="http://www.w3.org/2000/svg">
          ${[0,60,120,180,240,300].map(a =>
            `<path d="M 0 -56 C 6 -52 9 -44 8 -39 C 7 -35 4 -32 0 -32 C -4 -32 -7 -35 -8 -39 C -9 -44 -6 -52 0 -56 Z" fill="#8A65E0" transform="rotate(${a})"/>`
          ).join("")}
          <circle r="30" fill="none" stroke="#F7F4FB" stroke-width="1.8"/>
          <text y="6.5" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="600" font-size="19" letter-spacing="-0.5" fill="#F7F4FB">MMC</text>
        </svg>
        <span style="color:#F7F4FB;font-size:14px;font-weight:500;letter-spacing:-0.01em">Michigan Menopause Collaborative</span>
      </div>
    </div>
    <div style="padding:32px">
      <h2 style="margin:0 0 24px;font-size:22px;font-weight:600;color:#1F1535;letter-spacing:-0.02em">${args.title}</h2>
      <table style="border-collapse:collapse;width:100%">
        ${rowsHtml}
      </table>
      ${sheetSection}
    </div>
    <div style="padding:20px 32px;border-top:1px solid #E8DEF7;font-size:12px;color:#7A6E96">
      Michigan Menopause Collaborative · michiganmenopause.com
    </div>
  </div>
</body>
</html>`;
}

export async function sendNotification(args: {
  subject: string;
  title: string;
  rows: Array<{ label: string; value: string | undefined }>;
  replyTo?: string;
}): Promise<{ ok: true } | { ok: false; reason: string } | { skipped: true }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] sendNotification skipped — RESEND_API_KEY is unset or empty");
    return { skipped: true };
  }

  const from = process.env.RESEND_FROM ?? "onboarding@resend.dev";
  const to   = process.env.NOTIFY_EMAIL ?? DEFAULT_NOTIFY;
  const link = sheetUrl();

  const html = buildHtml({ title: args.title, rows: args.rows, sheetLink: link });

  // Plain-text fallback
  const text = [
    args.title,
    "",
    ...args.rows
      .filter((r) => r.value)
      .map((r) => `${r.label}: ${r.value}`),
    "",
    link ? `Google Sheet: ${link}` : "",
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject: args.subject,
        html,
        text,
        reply_to: args.replyTo,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      const reason = `Resend ${res.status}: ${body.slice(0, 200)}`;
      console.error(`[email] sendNotification failed — from=${from} to=${to} :: ${reason}`);
      return { ok: false, reason };
    }
    const data = (await res.json().catch(() => ({}))) as { id?: string };
    const id = data.id ?? "(no-id)";
    console.info(`[email] sendNotification ok id=${id} from=${from} to=${to} subject="${args.subject}"`);
    return { ok: true };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "Unknown error";
    console.error(`[email] sendNotification threw — from=${from} to=${to} :: ${reason}`);
    return { ok: false, reason };
  }
}

// ---------- RSVP confirmation to attendee ----------

export async function sendConfirmation(args: {
  to: string;
  name: string;
  meeting: MeetingSnapshot;
}): Promise<{ ok: true } | { ok: false; reason: string } | { skipped: true }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[email] sendConfirmation skipped — RESEND_API_KEY is unset or empty (would-be to=${args.to})`);
    return { skipped: true };
  }

  const from = process.env.RESEND_FROM ?? "onboarding@resend.dev";
  const { meeting: m, name, to } = args;

  const dateStr = `${m.weekday}, ${m.month} ${m.day}, ${m.year}`;
  const locationLines = m.location.split("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F4FB;font-family:system-ui,-apple-system,sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 24px -8px rgba(31,21,53,.12)">
    <div style="background:#1F1535;padding:28px 32px">
      <div style="display:inline-flex;align-items:center;gap:10px">
        <svg width="28" height="28" viewBox="-65 -65 130 130" xmlns="http://www.w3.org/2000/svg">
          ${[0,60,120,180,240,300].map(a =>
            `<path d="M 0 -56 C 6 -52 9 -44 8 -39 C 7 -35 4 -32 0 -32 C -4 -32 -7 -35 -8 -39 C -9 -44 -6 -52 0 -56 Z" fill="#8A65E0" transform="rotate(${a})"/>`
          ).join("")}
          <circle r="30" fill="none" stroke="#F7F4FB" stroke-width="1.8"/>
          <text y="6.5" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="600" font-size="19" letter-spacing="-0.5" fill="#F7F4FB">MMC</text>
        </svg>
        <span style="color:#F7F4FB;font-size:14px;font-weight:500;letter-spacing:-0.01em">Michigan Menopause Collaborative</span>
      </div>
    </div>
    <div style="padding:32px">
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#1F1535;letter-spacing:-0.02em">You&rsquo;re confirmed for ${m.quarter}</h2>
      <p style="margin:0 0 28px;font-size:15px;color:#7A6E96">Hi ${name} — we have you down for the upcoming meeting.</p>
      <table style="border-collapse:collapse;width:100%">
        <tr>
          <td style="padding:6px 12px 6px 0;color:#7A6E96;font-size:13px;white-space:nowrap;vertical-align:top">Date</td>
          <td style="padding:6px 0;font-size:14px;color:#1F1535">${dateStr}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px 6px 0;color:#7A6E96;font-size:13px;white-space:nowrap;vertical-align:top">Time</td>
          <td style="padding:6px 0;font-size:14px;color:#1F1535">${m.time} Eastern</td>
        </tr>
        <tr>
          <td style="padding:6px 12px 6px 0;color:#7A6E96;font-size:13px;white-space:nowrap;vertical-align:top">Location</td>
          <td style="padding:6px 0;font-size:14px;color:#1F1535">${locationLines.join("<br>")}</td>
        </tr>
      </table>
      <p style="margin:28px 0 0;font-size:13px;color:#7A6E96">A calendar file is attached — open it to add this event to your calendar.</p>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #E8DEF7;font-size:12px;color:#7A6E96">
      Michigan Menopause Collaborative · michiganmenopause.com
    </div>
  </div>
</body>
</html>`;

  const text = [
    `You're confirmed for MMC ${m.quarter}`,
    "",
    `Hi ${name} — we have you down for the upcoming meeting.`,
    "",
    `Date:     ${dateStr}`,
    `Time:     ${m.time} Eastern`,
    `Location: ${m.location.replace(/\n/g, ", ")}`,
    "",
    "A calendar file is attached — open it to add this event to your calendar.",
    "",
    "Michigan Menopause Collaborative · michiganmenopause.com",
  ].join("\n");

  const ics = buildIcs(m);
  const attachments = ics
    ? [{ filename: `mmc-${m.id}.ics`, content: Buffer.from(ics).toString("base64") }]
    : [];

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject: `MMC ${m.quarter} — you're confirmed`,
        html,
        text,
        attachments,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      const reason = `Resend ${res.status}: ${body.slice(0, 200)}`;
      console.error(`[email] sendConfirmation failed — from=${from} to=${to} :: ${reason}`);
      return { ok: false, reason };
    }
    const data = (await res.json().catch(() => ({}))) as { id?: string };
    const id = data.id ?? "(no-id)";
    console.info(`[email] sendConfirmation ok id=${id} from=${from} to=${to} meeting=${m.quarter}`);
    return { ok: true };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "Unknown error";
    console.error(`[email] sendConfirmation threw — from=${from} to=${to} :: ${reason}`);
    return { ok: false, reason };
  }
}
