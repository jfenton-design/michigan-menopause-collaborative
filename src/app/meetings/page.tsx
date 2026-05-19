import type { Metadata } from "next";
import { MeetingCard } from "@/components/MeetingCard";
import { PageHeader, SectionHeading } from "@/components/PageHeader";
import { getMeetings, getContent } from "@/lib/admin-db";

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: "Meetings" };

export default async function MeetingsPage() {
  const [allMeetings, content] = await Promise.all([getMeetings(), getContent()]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = allMeetings
    .filter((m) => {
      const d = new Date(`${m.month} ${m.day}, ${m.year}`);
      return !isNaN(d.getTime()) && d >= today;
    })
    .sort(
      (a, b) =>
        new Date(`${a.month} ${a.day}, ${a.year}`).getTime() -
        new Date(`${b.month} ${b.day}, ${b.year}`).getTime()
    );

  const past = allMeetings
    .filter((m) => {
      const d = new Date(`${m.month} ${m.day}, ${m.year}`);
      return !isNaN(d.getTime()) && d < today;
    })
    .sort(
      (a, b) =>
        new Date(`${b.month} ${b.day}, ${b.year}`).getTime() -
        new Date(`${a.month} ${a.day}, ${a.year}`).getTime()
    );

  const nextMeeting = upcoming[0] ?? past[0];

  return (
    <>
      <PageHeader
        eyebrow="Quarterly meetings"
        title={
          <>
            One case. <em>Every time.</em>
            <br />
            Four times a year.
          </>
        }
        lede={content.meetings_header_lede}
      />

      <section className="page section" style={{ paddingTop: 24 }}>
        <SectionHeading eyebrow="Upcoming" title="On the calendar" />
        {nextMeeting && <MeetingCard meeting={nextMeeting} variant="hero" />}
        <div style={{ marginTop: 80 }}>
          {upcoming.slice(1).map((m) => (
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
          className="grid-4"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 24,
          }}
        >
          {[
            { season: "Spring", month: "April", note: content.cadence_spring_note, aside: content.cadence_spring_aside },
            { season: "Summer", month: "July",  note: content.cadence_summer_note, aside: content.cadence_summer_aside },
            { season: "Fall",   month: "Sept",  note: content.cadence_fall_note,   aside: content.cadence_fall_aside },
            { season: "Winter", month: "Jan",   note: content.cadence_winter_note, aside: content.cadence_winter_aside },
          ].map((q) => (
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
        {past.map((m) => (
          <MeetingCard key={m.id} meeting={m} variant="compact" isPast />
        ))}
        <div style={{ marginTop: 24, fontSize: 13, color: "var(--ink-soft)" }}>
          {content.meetings_past_note}
        </div>
      </section>
    </>
  );
}
