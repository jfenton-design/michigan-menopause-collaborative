"use server";

import { after } from "next/server";
import { appendSubmission } from "@/lib/storage";
import { appendRsvp } from "@/lib/sheets";
import { sendNotification, sendConfirmation } from "@/lib/email";
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

  // Primary store — await so we can confirm it succeeded
  try {
    await appendRsvp(payload);
  } catch {
    return { status: "error", message: "We couldn't save your RSVP. Please email drleff@drcarrieleff.com." };
  }

  // Background work — `after()` defers until after the response is sent,
  // but (critically on serverless) keeps the lambda alive until these
  // promises resolve. `void` alone caused fetches to be killed mid-flight.
  after(async () => {
    try {
      await appendSubmission({ kind: "rsvp", receivedAt: new Date().toISOString(), payload });
    } catch (err) {
      console.error("[rsvp] appendSubmission failed:", err);
    }

    await sendNotification({
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

    // Send confirmation to attendee (with .ics) — only if they're coming
    if (attending) {
      await sendConfirmation({ to: email, name, meeting });
    }
  });

  return { status: "ok", meetingLabel, attending };
}
