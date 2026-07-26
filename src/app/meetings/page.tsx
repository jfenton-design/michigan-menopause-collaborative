import type { Metadata } from "next";
import { MeetingCard } from "@/components/MeetingCard";
import { PageHeader, SectionHeading } from "@/components/PageHeader";
import { getMeetings, getContent } from "@/lib/admin-db";

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const allMeetings = await getMeetings();
  const nextMeeting = allMeetings.find(m => m.rsvpOpen) ?? allMeetings[0];
  return {
    title: "Meetings",
    openGraph: nextMeeting
      ? { images: [{ url: `/api/og?id=${nextMeeting.id}`, width: 1080, height: 1080 }] }
      : undefined,
  };
}

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
        {nextMeeting && <MeetingCard meeting={nextMeeting} variant="hero" />}
        <div style={{ marginTop: 80 }}>
          {upcoming.slice(1).map((m) => (
            <MeetingCard key={m.id} meeting={m} variant="compact" />
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
