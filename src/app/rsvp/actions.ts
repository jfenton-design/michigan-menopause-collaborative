"use server";

import { appendSubmission } from "@/lib/storage";
import { appendRsvp } from "@/lib/sheets";
import { sendNotification } from "@/lib/email";
import { UPCOMING_MEETINGS } from "@/lib/data";

export type RsvpFormState =
  | { status: "idle" }
  | { status: "ok"; meetingLabel: string; attending: boolean }
  | { status: "error"; message: string };

export async function submitRsvp(
  _prev: RsvpFormState,
  formData: FormData,
): Promise<RsvpFormState> {
  const get = (k: string) => (formData.get(k) ?? "").toString().trim();

  // Honeypot
  if (get("website")) {
    return { status: "ok", meetingLabel: "", attending: true };
  }

  const meetingId = get("meeting");
  const name = get("name");
  const email = get("email");
  const credentials = get("credentials");
  const practice = get("practice");
  const phone = get("phone");
  const guestCount = parseInt(get("guestCount") || "0", 10) || 0;
  const guestNames = get("guestNames");
  const dietary = get("dietary");
  const notes = get("notes");
  const attendingRaw = get("attending"); // "yes" | "no" | "maybe"
  const attending = attendingRaw !== "no";

  const meeting = UPCOMING_MEETINGS.find((m) => m.id === meetingId);
  if (!meeting) {
    return { status: "error", message: "Please choose which meeting you're RSVPing for." };
  }
  if (!name) return { status: "error", message: "Please include your name." };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Please include a valid email address." };
  }
  if (guestCount < 0 || guestCount > 5) {
    return { status: "error", message: "Guest count should be between 0 and 5." };
  }

  const meetingLabel = `${meeting.quarter} — ${meeting.month} ${meeting.day}, ${meeting.year}`;

  const payload = {
    meetingId, meetingLabel, attendingRaw,
    name, credentials, email, phone, practice,
    guestCount, guestNames, dietary, notes,
  };

  try {
    await appendSubmission({ kind: "rsvp", receivedAt: new Date().toISOString(), payload });
  } catch {
    return { status: "error", message: "We couldn't save your RSVP. Please email drleff@drcarrieleff.com." };
  }

  // Fire-and-forget — don't block the response on these
  void appendRsvp(payload);

  void sendNotification({
    subject: `RSVP — ${name} — ${meetingLabel} (${attendingRaw || "yes"})`,
    title: `New RSVP — ${meetingLabel}`,
    replyTo: email,
    rows: [
      { label: "Meeting",     value: meetingLabel },
      { label: "Attending",   value: attendingRaw || "yes" },
      { label: "Name",        value: name },
      { label: "Credentials", value: credentials },
      { label: "Email",       value: email },
      { label: "Phone",       value: phone },
      { label: "Practice",    value: practice },
      { label: "Guests",      value: String(guestCount) },
      { label: "Guest names", value: guestNames },
      { label: "Dietary",     value: dietary },
      { label: "Notes",       value: notes },
    ],
  });

  return { status: "ok", meetingLabel, attending };
}
