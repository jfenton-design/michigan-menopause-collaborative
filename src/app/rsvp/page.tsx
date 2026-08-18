import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { RsvpForm } from "./RsvpForm";
import { NEXT_MEETING, type Meeting } from "@/lib/data";
import { getMeetings } from "@/lib/admin-db";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ meeting?: string }>;

/**
 * Meeting links across the site (and in the admin reminder email) carry
 * `?meeting=<id>`. Honour it when it points at a real, still-upcoming meeting;
 * otherwise fall back to whichever meeting currently has RSVP open.
 */
async function resolveMeeting(
  requestedId?: string,
): Promise<{ meeting: Meeting; isDefault: boolean }> {
  const all = await getMeetings().catch(() => [] as Meeting[]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isUpcoming = (m: Meeting) => {
    const d = new Date(`${m.month} ${m.day}, ${m.year}`);
    return isNaN(d.getTime()) || d >= today;
  };

  const fallback =
    all.find((m) => m.rsvpOpen) ?? all.find(isUpcoming) ?? all[0] ?? NEXT_MEETING;

  const requested = requestedId ? all.find((m) => m.id === requestedId) : undefined;
  if (requested && isUpcoming(requested) && requested.id !== fallback.id) {
    return { meeting: requested, isDefault: false };
  }
  return { meeting: fallback, isDefault: true };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { meeting } = await searchParams;
  const { meeting: selected } = await resolveMeeting(meeting);
  return {
    title: "RSVP",
    description: `RSVP for the next Michigan Menopause Collaborative meeting — ${selected.quarter}, ${selected.month} ${selected.day}.`,
  };
}

export default async function RsvpPage({ searchParams }: { searchParams: SearchParams }) {
  const { meeting: requestedId } = await searchParams;
  const { meeting: selected, isDefault: isDefaultMeeting } = await resolveMeeting(requestedId);

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
          <RsvpForm defaultMeeting={selected.id} />

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
                {isDefaultMeeting ? "The next meeting" : "This meeting"}
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
