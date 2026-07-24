/**
 * Google Sheets append helper — no googleapis dependency.
 * Uses a service account JWT + the Sheets REST API v4.
 *
 * Required env vars:
 *   GOOGLE_SERVICE_ACCOUNT_KEY  — full service-account JSON (stringified)
 *   GOOGLE_SHEET_ID             — spreadsheet ID from the URL
 *
 * The sheet must have two tabs named exactly:
 *   "RSVPs"   — for RSVP submissions
 *   "Cases"   — for case submissions
 *
 * Share the sheet with the service account's client_email (Editor access).
 */

import crypto from "node:crypto";

// ---------- auth ----------

async function getAccessToken(): Promise<string | null> {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;

  let key: {
    client_email: string;
    private_key: string;
  };
  try {
    key = JSON.parse(raw);
  } catch {
    console.error("[sheets] GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON");
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  const header  = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = b64url(JSON.stringify({
    iss:   key.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud:   "https://oauth2.googleapis.com/token",
    exp:   now + 3600,
    iat:   now,
  }));

  const sigInput = `${header}.${payload}`;
  const sign = crypto.createSign("SHA256");
  sign.update(sigInput);
  const sig = sign.sign(key.private_key, "base64url");
  const jwt = `${sigInput}.${sig}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    console.error("[sheets] Token exchange failed:", await res.text());
    return null;
  }

  const data = (await res.json()) as { access_token?: string };
  return data.access_token ?? null;
}

function b64url(str: string): string {
  return Buffer.from(str).toString("base64url");
}

// ---------- append ----------

async function appendRows(tab: string, rows: string[][]): Promise<void> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) return;

  const token = await getAccessToken();
  if (!token) return;

  const range = encodeURIComponent(`${tab}!A1`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ values: rows }),
  });

  if (!res.ok) {
    console.error("[sheets] Append failed:", await res.text());
  }
}

// ---------- public helpers ----------

export function sheetUrl(): string | null {
  const id = process.env.GOOGLE_SHEET_ID;
  return id ? `https://docs.google.com/spreadsheets/d/${id}` : null;
}

export async function appendRsvp(p: Record<string, unknown>): Promise<void> {
  await appendRows("RSVPs", [[
    new Date().toISOString(),
    String(p.meetingLabel  ?? ""),
    String(p.attendingRaw  ?? "yes"),
    String(p.name          ?? ""),
    String(p.credentials   ?? ""),
    String(p.email         ?? ""),
    String(p.phone         ?? ""),
    String(p.practice      ?? ""),
    String(p.guestCount    ?? "0"),
    String(p.guestNames    ?? ""),
    String(p.dietary       ?? ""),
    String(p.notes         ?? ""),
  ]]);
}

// ---------- read RSVPs (for roster sync) ----------

export type SheetRsvp = {
  timestamp: string;
  meetingLabel: string;
  attendingRaw: string;
  name: string;
  credentials: string;
  email: string;
  phone: string;
  practice: string;
  guestCount: string;
  guestNames: string;
  dietary: string;
  notes: string;
};

/** Reads the "RSVPs" tab (same schema appendRsvp writes). Returns [] when the
 *  sheet/service-account isn't configured. Skips a header row if present. */
export async function readRsvps(): Promise<SheetRsvp[]> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) return [];
  const token = await getAccessToken();
  if (!token) return [];

  const range = encodeURIComponent("RSVPs!A1:L");
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("[sheets] read RSVPs failed:", await res.text());
    return [];
  }

  const data = (await res.json()) as { values?: string[][] };
  const rows = data.values ?? [];
  const out: SheetRsvp[] = [];
  for (const r of rows) {
    const [
      timestamp = "", meetingLabel = "", attendingRaw = "", name = "",
      credentials = "", email = "", phone = "", practice = "",
      guestCount = "", guestNames = "", dietary = "", notes = "",
    ] = r;
    // skip header row(s)
    if (/^timestamp$/i.test(timestamp.trim()) || /^name$/i.test(name.trim())) continue;
    if (!name.trim() && !email.trim()) continue;
    out.push({
      timestamp, meetingLabel, attendingRaw, name, credentials, email,
      phone, practice, guestCount, guestNames, dietary, notes,
    });
  }
  return out;
}

export async function appendCase(p: Record<string, unknown>): Promise<void> {
  await appendRows("Cases", [[
    new Date().toISOString(),
    String(p.name          ?? ""),
    String(p.credentials   ?? ""),
    String(p.email         ?? ""),
    String(p.phone         ?? ""),
    String(p.targetMeeting ?? ""),
    String(p.summary       ?? ""),
    String(p.question      ?? ""),
  ]]);
}
