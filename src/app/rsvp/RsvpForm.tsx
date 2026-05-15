"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitRsvp, type RsvpFormState } from "./actions";
import { RSVP_MEETING_OPTIONS } from "@/lib/data";

const initial: RsvpFormState = { status: "idle" };

export function RsvpForm({ defaultMeeting }: { defaultMeeting: string }) {
  const [state, action] = useActionState(submitRsvp, initial);

  if (state.status === "ok") {
    return (
      <div className="notice" role="status" aria-live="polite" style={{ marginTop: 24 }}>
        <div className="eyebrow" style={{ marginBottom: 10, color: "var(--accent)" }}>
          {state.attending ? "RSVP confirmed" : "Thanks for letting us know"}
        </div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 28,
            lineHeight: 1.1,
            marginBottom: 12,
          }}
        >
          {state.attending ? "We'll see you there." : "We'll catch you next quarter."}
        </div>
        <p style={{ margin: 0, color: "var(--ink-2)" }}>
          {state.attending ? (
            <>
              You&apos;re on the list for{" "}
              <strong style={{ color: "var(--ink)" }}>{state.meetingLabel}</strong>.
              We&apos;ll send a calendar invite and the reading list a week before.
            </>
          ) : (
            <>
              Noted for {state.meetingLabel}. Reading list and notes will still be
              shared with members afterwards.
            </>
          )}
        </p>
      </div>
    );
  }

  return (
    <form
      action={action}
      style={{
        display: "grid",
        gap: 24,
        paddingTop: 24,
        borderTop: "1px solid var(--rule-strong)",
      }}
    >
      <div className="eyebrow">RSVP form</div>

      {state.status === "error" && (
        <div className="error" role="alert">{state.message}</div>
      )}

      {/* honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }}
        aria-hidden="true"
      />

      <div className="field">
        <label htmlFor="rsvp-meeting">Meeting</label>
        <select id="rsvp-meeting" name="meeting" required defaultValue={defaultMeeting}>
          {RSVP_MEETING_OPTIONS.map((m) => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="rsvp-attending">Will you attend?</label>
        <select id="rsvp-attending" name="attending" defaultValue="yes">
          <option value="yes">Yes — I&apos;ll be there</option>
          <option value="maybe">Tentative</option>
          <option value="no">Not this time</option>
        </select>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="rsvp-name">Your name</label>
          <input id="rsvp-name" name="name" required placeholder="Dr. Firstname Lastname" />
        </div>
        <div className="field">
          <label htmlFor="rsvp-credentials">Credentials</label>
          <input id="rsvp-credentials" name="credentials" placeholder="MD · NCMP" />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="rsvp-email">Email</label>
          <input
            id="rsvp-email"
            name="email"
            type="email"
            required
            placeholder="you@practice.com"
          />
        </div>
        <div className="field">
          <label htmlFor="rsvp-phone">Phone (optional)</label>
          <input id="rsvp-phone" name="phone" placeholder="(248) 555-0100" />
        </div>
      </div>

      <div className="field">
        <label htmlFor="rsvp-practice">Practice / affiliation</label>
        <input id="rsvp-practice" name="practice" placeholder="Royal Oak Internal Medicine, etc." />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="rsvp-guests">Bringing guests?</label>
          <select id="rsvp-guests" name="guestCount" defaultValue="0">
            <option value="0">Just me</option>
            <option value="1">+1 guest</option>
            <option value="2">+2 guests</option>
            <option value="3">+3 guests</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="rsvp-guest-names">Guest names (if any)</label>
          <input id="rsvp-guest-names" name="guestNames" placeholder="Dr. A. Patel, Dr. M. Chen" />
        </div>
      </div>

      <div className="field">
        <label htmlFor="rsvp-dietary">Dietary needs / accessibility</label>
        <input id="rsvp-dietary" name="dietary" placeholder="Vegetarian, gluten-free, step-free entry, etc." />
      </div>

      <div className="field">
        <label htmlFor="rsvp-notes">Anything else for the host?</label>
        <textarea id="rsvp-notes" name="notes" rows={3} placeholder="Optional — questions for the room, expected arrival, etc." />
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
        <SubmitBtn />
        <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>
          Confirmation by email · reading list a week prior.
        </span>
      </div>
    </form>
  );
}

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn--accent" disabled={pending}>
      {pending ? "Sending…" : "Confirm RSVP →"}
    </button>
  );
}
