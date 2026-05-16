import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { RsvpForm } from "./RsvpForm";
import { NEXT_MEETING, RSVP_MEETING_OPTIONS, UPCOMING_MEETINGS } from "@/lib/data";

export const metadata: Metadata = {
  title: "RSVP",
  description: `RSVP for the next Michigan Menopause Collaborative meeting — ${NEXT_MEETING.quarter}, ${NEXT_MEETING.month} ${NEXT_MEETING.day}.`,
};

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function RsvpPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const requested = (Array.isArray(params.meeting) ? params.meeting[0] : params.meeting) || "";
  const validIds = new Set(RSVP_MEETING_OPTIONS.map((m) => m.id));
  const defaultMeeting = validIds.has(requested) ? requested : NEXT_MEETING.id;
  const selected =
    UPCOMING_MEETINGS.find((m) => m.id === defaultMeeting) ?? NEXT_MEETING;

  return (
    <>
      <PageHeader
        eyebrow={`RSVP · ${selected.quarter}`}
        title={
          <>
            Save your seat <em>at the table</em>.
          </>
        }
        lede="Quarterly meetings are intentionally small and in-person. RSVP a week ahead so we can confirm refreshments and seating with our host."
      />

      <section className="page section" style={{ paddingTop: 24 }}>
        <div
          className="page-split"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)",
            gap: 80,
            alignItems: "start",
          }}
        >
          <RsvpForm defaultMeeting={defaultMeeting} />

          <aside
            style={{
              paddingTop: 24,
              borderTop: "1px solid var(--rule-strong)",
              display: "grid",
              gap: 32,
            }}
          >
            <div>
              <div className="eyebrow" style={{ marginBottom: 14 }}>
                The next meeting
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  fontSize: 56,
                  lineHeight: 0.96,
                  letterSpacing: "var(--display-spacing)",
                  color: "var(--ink)",
                }}
              >
                {selected.month}{" "}
                <span style={{ color: "var(--accent)" }}>{selected.day}</span>
              </div>
              <div
                style={{
                  marginTop: 8,
                  color: "var(--ink-2)",
                  fontFamily: "var(--font-display)",
                  fontSize: 18,
                }}
              >
                {selected.weekday} · {selected.time}
              </div>
            </div>

            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Location</div>
              <div style={{ fontSize: 16, lineHeight: 1.5, color: "var(--ink-2)" }}>
                {selected.location.split("\n").map((l, i) => (
                  <div key={i}>{l}</div>
                ))}
              </div>
            </div>

            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>
                Article of the month
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, lineHeight: 1.3 }}>
                {selected.article}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--ink-soft)",
                  marginTop: 4,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {selected.articleCitation}
              </div>
            </div>

            <div
              style={{
                background: "var(--paper-2)",
                padding: 20,
                borderRadius: "var(--radius-md)",
                fontSize: 14,
                color: "var(--ink-2)",
              }}
            >
              <strong style={{ color: "var(--ink)" }}>Open to licensed practitioners.</strong>{" "}
              Members and invited guests welcome. No vendors, no fees — off the record.
              Not a member yet?{" "}
              <Link href="/" style={{ color: "var(--accent)" }}>
                Read the mission
              </Link>
              .
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
