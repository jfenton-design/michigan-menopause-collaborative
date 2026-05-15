"use server";

import { appendSubmission } from "@/lib/storage";
import { sendNotification } from "@/lib/email";

export type CaseFormState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; message: string };

export async function submitCase(
  _prev: CaseFormState,
  formData: FormData,
): Promise<CaseFormState> {
  const get = (k: string) => (formData.get(k) ?? "").toString().trim();

  // Honeypot — bots fill hidden fields, humans don't.
  if (get("website")) return { status: "ok" };

  const name = get("name");
  const credentials = get("credentials");
  const email = get("email");
  const phone = get("phone");
  const targetMeeting = get("targetMeeting");
  const summary = get("summary");
  const question = get("question");

  if (!name || !email || !summary) {
    return {
      status: "error",
      message: "Please include at least your name, email, and a case summary.",
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "That email address doesn't look right." };
  }

  const payload = { name, credentials, email, phone, targetMeeting, summary, question };

  try {
    await appendSubmission({
      kind: "case",
      receivedAt: new Date().toISOString(),
      payload,
    });
  } catch (err) {
    return {
      status: "error",
      message:
        "We couldn't save your submission. Please email us at hello@michiganmenopause.com.",
    };
  }

  await sendNotification({
    subject: `Case submission — ${name}`,
    replyTo: email,
    text: [
      `Name: ${name}`,
      `Credentials: ${credentials}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Target meeting: ${targetMeeting}`,
      ``,
      `Case summary:`,
      summary,
      ``,
      `Question for the room:`,
      question,
    ].join("\n"),
  });

  return { status: "ok" };
}
