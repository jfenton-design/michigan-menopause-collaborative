"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { submitCase, type CaseFormState } from "./actions";
import { UPCOMING_MEETINGS } from "@/lib/data";

const initial: CaseFormState = { status: "idle" };

export function CaseForm() {
  const [state, action] = useActionState(submitCase, initial);

  useEffect(() => {
    if (state.status === "ok") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state.status]);

  if (state.status === "ok") {
    return (
      <div
        className="notice"
        style={{ marginTop: 24 }}
        role="status"
        aria-live="polite"
      >
        <div className="eyebrow" style={{ marginBottom: 10, color: "var(--accent)" }}>
          Thank you
        </div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 26,
            lineHeight: 1.1,
            marginBottom: 10,
          }}
        >
          Your case is in front of us.
        </div>
        <p style={{ margin: 0, color: "var(--ink-2)" }}>
          Dr. Leff will be in touch within two weeks regarding the selection.
          Submissions are reviewed quarterly.
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
      <div className="eyebrow">Submission form</div>

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

      <div className="field-row">
        <div className="field">
          <label htmlFor="case-name">Your name</label>
          <input id="case-name" name="name" required placeholder="Dr. Firstname Lastname" />
        </div>
        <div className="field">
          <label htmlFor="case-credentials">Credentials</label>
          <input id="case-credentials" name="credentials" placeholder="MD · MSCP" />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="case-email">Email</label>
          <input
            id="case-email"
            name="email"
            type="email"
            required
            placeholder="you@practice.com"
          />
        </div>
        <div className="field">
          <label htmlFor="case-phone">Phone</label>
          <input id="case-phone" name="phone" placeholder="(248) 555-0100" />
        </div>
      </div>

      <div className="field">
        <label htmlFor="case-target">Target meeting</label>
        <select id="case-target" name="targetMeeting" defaultValue={UPCOMING_MEETINGS[0].id}>
          {UPCOMING_MEETINGS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.quarter} — {m.month} {m.day}
            </option>
          ))}
          <option value="any">No preference</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="case-summary">Case summary (de-identified)</label>
        <textarea
          id="case-summary"
          name="summary"
          required
          rows={8}
          placeholder="A high-level summary. Two to three paragraphs is plenty. Please omit identifying details — we'll request what's needed if your case is selected."
        />
      </div>

      <div className="field">
        <label htmlFor="case-question">What you&apos;re hoping the room weighs in on</label>
        <textarea
          id="case-question"
          name="question"
          rows={4}
          placeholder="The specific question, the fork in the road, the literature you've already been through…"
        />
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
        <SubmitButton />
        <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>Replies within two weeks.</span>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn--accent" disabled={pending}>
      {pending ? "Submitting…" : "Submit for review →"}
    </button>
  );
}
