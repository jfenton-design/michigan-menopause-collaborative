import type { Metadata } from "next";
import { MeetingCard } from "@/components/MeetingCard";
import { PageHeader, SectionHeading } from "@/components/PageHeader";
import {
  NEXT_MEETING,
  PAST_MEETINGS,
  QUARTERLY_CADENCE,
  UPCOMING_MEETINGS,
} from "@/lib/data";

export const metadata: Metadata = { title: "Meetings" };

export default function MeetingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Quarterly meetings"
        title={
          <>
            One paper. <em>One case.</em>
            <br />
            Four times a year.
          </>
        }
        lede="We meet in person across the four seasons — fall, winter, spring, summer. Each meeting orbits a recent paper and a member-submitted case. Two hours. No vendors. Off the record."
      />

      <section className="page section" style={{ paddingTop: 24 }}>
        <SectionHeading eyebrow="Upcoming" title="On the calendar" />
        <MeetingCard meeting={NEXT_MEETING} variant="hero" />
        <div style={{ marginTop: 80 }}>
          {UPCOMING_MEETINGS.slice(1).map((m) => (
            <MeetingCard key={m.id} meeting={m} variant="compact" />
          ))}
        </div>
      </section>

      <section className="page section">
        <SectionHeading
          eyebrow="The cadence"
          title="A rhythm built around the year"
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 24,
          }}
        >
          {QUARTERLY_CADENCE.map((q) => (
            <div
              key={q.season}
              style={{ borderTop: "1px solid var(--rule-strong)", paddingTop: 20 }}
            >
              <div className="eyebrow" style={{ color: "var(--accent)" }}>
                {q.season}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 34,
                  lineHeight: 1,
                  marginTop: 10,
                }}
              >
                {q.month}
              </div>
              <div style={{ marginTop: 14, fontSize: 15 }}>{q.note}</div>
              <div style={{ marginTop: 6, fontSize: 13, color: "var(--ink-soft)" }}>
                {q.aside}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="page section">
        <SectionHeading
          eyebrow="Past meetings"
          title="The collaborative, looking back"
        />
        {PAST_MEETINGS.map((m) => (
          <MeetingCard key={m.id} meeting={m} variant="compact" />
        ))}
        <div style={{ marginTop: 24, fontSize: 13, color: "var(--ink-soft)" }}>
          Members may request notes from past meetings via the Resources page.
        </div>
      </section>
    </>
  );
}
