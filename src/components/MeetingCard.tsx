import Link from "next/link";
import Image from "next/image";
import type { Meeting } from "@/lib/data";

type Variant = "hero" | "compact" | "default";

export function MeetingCard({
  meeting,
  variant = "default",
  isPast = false,
}: {
  meeting: Meeting;
  variant?: Variant;
  isPast?: boolean;
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
          {meeting.topic && (
            <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 12 }}>
              {meeting.speakerPhoto && (
                <img
                  src={`/api/img?url=${encodeURIComponent(meeting.speakerPhoto)}`}
                  alt={meeting.topicPresenter ?? "Speaker"}
                  style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", objectPosition: "center 15%", flexShrink: 0, border: "1px solid var(--rule)" }}
                />
              )}
              <div>
                <div style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)" }}>{meeting.topic}</div>
                {meeting.topicPresenter && (
                  <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4 }}>{meeting.topicPresenter}</div>
                )}
              </div>
            </div>
          )}
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
            <Link href="/submit-a-case" className="btn btn--ghost">
              Submit a case
            </Link>
          </div>

          {/* Discussion article */}
          {meeting.articleTitle && (
            <ArticleCard meeting={meeting} />
          )}

          {/* Venue host thank-you */}
          {meeting.showKarmanos !== false && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginTop: 8,
                padding: "14px 16px",
                background: "var(--paper-2)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <Image
                src="/assets/danialle-karmanos.png"
                alt="Danialle Karmanos"
                width={96}
                height={96}
                style={{ borderRadius: "50%", objectFit: "cover", objectPosition: "center 5%", flexShrink: 0 }}
              />
              <p style={{ margin: 0, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
                Thanks to{" "}
                <strong style={{ color: "var(--ink)" }}>Danialle Karmanos</strong>{" "}
                for donating the use of her space for our gathering!
              </p>
            </div>
          )}
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    const hasExtra = !!(meeting.topic || meeting.articleTitle);
    return (
      <article
        style={{
          padding: "24px 0",
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "120px 1fr auto", gap: 32, alignItems: "center" }}>
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
            <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 6 }}>
              {meeting.weekday} · {meeting.time} · {meeting.locationShort}
            </div>
            {meeting.topic && (
              <div style={{ marginTop: 8, fontSize: 14, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8 }}>
                {meeting.speakerPhoto && (
                  <img
                    src={`/api/img?url=${encodeURIComponent(meeting.speakerPhoto)}`}
                    alt={meeting.topicPresenter ?? "Speaker"}
                    style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover", objectPosition: "center 15%", flexShrink: 0, border: "1px solid var(--rule)" }}
                  />
                )}
                <span>
                  <span style={{ fontWeight: 500 }}>{meeting.topic}</span>
                  {meeting.topicPresenter && (
                    <span style={{ color: "var(--ink-soft)" }}> · {meeting.topicPresenter}</span>
                  )}
                </span>
              </div>
            )}
          </div>
          {!isPast && (meeting.rsvpOpen ? (
            <Link href={`/rsvp?meeting=${meeting.id}`} className="btn btn--ghost" style={{ alignSelf: "center" }}>
              RSVP →
            </Link>
          ) : (
            <span className="eyebrow" style={{ alignSelf: "center" }}>RSVP soon</span>
          ))}
        </div>

        {hasExtra && meeting.articleTitle && (
          <div style={{ marginTop: 14, paddingLeft: 152 }}>
            <ArticleCard meeting={meeting} />
          </div>
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

/* --- Article card --- */
function ArticleCard({ meeting }: { meeting: Meeting }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "14px 18px",
        background: "var(--paper-2)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--rule)",
      }}
    >
      {meeting.articleThumb ? (
        <img
          src={`/api/img?url=${encodeURIComponent(meeting.articleThumb)}`}
          alt=""
          style={{ width: 44, height: 58, objectFit: "cover", borderRadius: 4, flexShrink: 0, border: "1px solid var(--rule)" }}
        />
      ) : (
        <svg width="44" height="58" viewBox="0 0 44 58" fill="none" style={{ flexShrink: 0 }}>
          <rect x="1" y="1" width="42" height="56" rx="3" fill="white" stroke="var(--rule-strong)" strokeWidth="1.5"/>
          <path d="M30 1v9a2 2 0 002 2h10" stroke="var(--rule-strong)" strokeWidth="1.5"/>
          <rect x="8" y="20" width="20" height="1.5" rx="0.75" fill="var(--rule-strong)"/>
          <rect x="8" y="25" width="28" height="1.5" rx="0.75" fill="var(--rule-strong)"/>
          <rect x="8" y="30" width="28" height="1.5" rx="0.75" fill="var(--rule-strong)"/>
          <rect x="8" y="35" width="22" height="1.5" rx="0.75" fill="var(--rule-strong)"/>
          <rect x="8" y="40" width="26" height="1.5" rx="0.75" fill="var(--rule-strong)"/>
        </svg>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.08em", color: "var(--accent)", fontFamily: "var(--font-mono)", textTransform: "uppercase", marginBottom: 5 }}>
          Discussion article
        </div>
        <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.3, color: "var(--ink)" }}>
          {meeting.articleTitle}
        </div>
      </div>
      {meeting.articleUrl && (
        <a
          href={`/api/pdf?url=${encodeURIComponent(meeting.articleUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Download article"
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "var(--accent-subtle, rgba(109,59,228,0.08))",
            color: "var(--accent)",
            transition: "background 0.15s",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M9 2v9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M5.5 8l3.5 3.5L12.5 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 15h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </a>
      )}
    </div>
  );
}

/* --- ICS data URL --- */
function icsHref(m: Meeting): string {
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

  // Format as local date string with TZID=America/New_York so calendar
  // apps honour Eastern time regardless of the user's device timezone.
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmtLocal = (yr: number, mo: number, d: number, hr: number, min: number) =>
    `${yr}${pad(mo + 1)}${pad(d)}T${pad(hr)}${pad(min)}00`;

  const dtstamp = (() => {
    const n = new Date();
    return `${n.getUTCFullYear()}${pad(n.getUTCMonth()+1)}${pad(n.getUTCDate())}T${pad(n.getUTCHours())}${pad(n.getUTCMinutes())}${pad(n.getUTCSeconds())}Z`;
  })();

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Michigan Menopause Collaborative//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    // Minimal VTIMEZONE block for America/New_York
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

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}
