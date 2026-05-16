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
  if (!apiKey) return { skipped: true };

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
      return { ok: false, reason: `Resend ${res.status}: ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : "Unknown error" };
  }
}
