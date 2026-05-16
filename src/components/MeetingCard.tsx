import Link from "next/link";
import type { Meeting } from "@/lib/data";

type Variant = "hero" | "compact" | "default";

export function MeetingCard({
  meeting,
  variant = "default",
}: {
  meeting: Meeting;
  variant?: Variant;
}) {
  if (variant === "hero") {
    return (
      <article
        className="meeting-hero"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: 56,
          alignItems: "start",
          borderTop: "1px solid var(--rule-strong)",
          paddingTop: 40,
        }}
      >
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>The next meeting</div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: "var(--display-weight)",
              fontSize: "clamp(40px, 5.4vw, 88px)",
              lineHeight: 0.96,
              letterSpacing: "var(--display-spacing)",
              color: "var(--ink)",
            }}
          >
            {meeting.month} <span style={{ color: "var(--accent)" }}>{meeting.day}</span>
          </div>
          <div
            style={{
              marginTop: 10,
              fontFamily: "var(--font-display)",
              fontSize: 22,
              color: "var(--ink-2)",
            }}
          >
            {meeting.weekday} · {meeting.time}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 24 }}>
            <span className="pill">{meeting.quarter}</span>
            <span className="pill pill--ghost">In person</span>
            <span className="pill pill--ghost">Members + invited guests</span>
          </div>
        </div>

        <div style={{ display: "grid", gap: 28 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Location</div>
            <div style={{ fontSize: 18, lineHeight: 1.45 }}>
              {meeting.location.split("\n").map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Article of the month</div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 24,
                lineHeight: 1.2,
                color: "var(--ink)",
                maxWidth: "32ch",
              }}
            >
              {meeting.article}
            </div>
            <div
              style={{
                fontSize: 14,
                color: "var(--ink-soft)",
                marginTop: 6,
                fontStyle: "italic",
              }}
            >
              {meeting.articleCitation}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 4 }}>
            <Link href={`/rsvp?meeting=${meeting.id}`} className="btn">
              RSVP →
            </Link>
            <a
              href={icsHref(meeting)}
              className="btn btn--ghost"
              download={`mmc-${meeting.id}.ics`}
            >
              Add to calendar
            </a>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article
        style={{
          display: "grid",
          gridTemplateColumns: "120px 1fr auto",
          gap: 32,
          alignItems: "center",
          padding: "24px 0",
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: "var(--display-weight)",
              fontSize: 42,
              lineHeight: 0.92,
              color: "var(--ink)",
            }}
          >
            {meeting.day}
          </div>
          <div className="eyebrow" style={{ marginTop: 6 }}>
            {meeting.month} · {meeting.year}
          </div>
        </div>
        <div>
          <div className="eyebrow" style={{ marginBottom: 6, color: "var(--accent)" }}>
            {meeting.quarter}
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              lineHeight: 1.2,
              maxWidth: "44ch",
            }}
          >
            {meeting.article}
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 6 }}>
            {meeting.weekday} · {meeting.time} · {meeting.locationShort}
          </div>
        </div>
        {meeting.rsvpOpen ? (
          <Link href={`/rsvp?meeting=${meeting.id}`} className="btn btn--ghost" style={{ alignSelf: "center" }}>
            RSVP →
          </Link>
        ) : (
          <span className="eyebrow" style={{ alignSelf: "center" }}>RSVP soon</span>
        )}
      </article>
    );
  }

  return (
    <article className="card" style={{ display: "grid", gap: 14 }}>
      <div className="eyebrow">{meeting.quarter}</div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: "var(--display-weight)",
          fontSize: 48,
          lineHeight: 0.95,
        }}
      >
        {meeting.month} {meeting.day}
      </div>
      <div style={{ color: "var(--ink-2)" }}>
        {meeting.weekday} · {meeting.time}
      </div>
      <div style={{ fontSize: 14, color: "var(--ink-soft)" }}>{meeting.locationShort}</div>
    </article>
  );
}

/* --- ICS data URL --- */
function icsHref(m: Meeting): string {
  // Best-effort .ics for known concrete meetings; for TBD dates returns a #.
  if (m.day === "—") return "#";
  const monthIdx: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, July: 6, Aug: 7, Sep: 8, Sept: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const mi = monthIdx[m.month];
  if (mi === undefined) return "#";
  const day = parseInt(m.day, 10);
  const year = parseInt(m.year, 10);
  if (Number.isNaN(day) || Number.isNaN(year)) return "#";

  // 6:30 PM ET → 18:30 local. Encoding without timezone — calendar apps treat as floating.
  const start = new Date(year, mi, day, 18, 30, 0);
  const end = new Date(year, mi, day, 20, 0, 0);
  const fmt = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Michigan Menopause Collaborative//EN",
    "BEGIN:VEVENT",
    `UID:${m.id}@michiganmenopause.com`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:MMC ${m.quarter} — ${m.article}`,
    `LOCATION:${m.location.replace(/\n/g, ", ")}`,
    `DESCRIPTION:${m.articleCitation}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}
