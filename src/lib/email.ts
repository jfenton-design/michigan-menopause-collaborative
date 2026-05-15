import { CONTACT_EMAIL, SITE_URL } from "./data";

/**
 * Deliver a submission notification via Resend (https://resend.com).
 * If RESEND_API_KEY is unset, this is a no-op and returns `{ skipped: true }`.
 *
 * Uses the bare REST API so we don't pull in the resend SDK as a dependency.
 */
export async function sendNotification(args: {
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<{ ok: true } | { ok: false; reason: string } | { skipped: true }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { skipped: true };

  const from = process.env.RESEND_FROM ?? `notifications@${SITE_URL}`;
  const to = process.env.NOTIFY_EMAIL ?? CONTACT_EMAIL;

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
        text: args.text,
        reply_to: args.replyTo,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      return { ok: false, reason: `Resend ${res.status}: ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "Unknown email error",
    };
  }
}
