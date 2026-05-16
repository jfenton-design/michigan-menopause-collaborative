import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PersonCard } from "@/components/PersonCard";
import { CONTACT_EMAIL, LEADERSHIP } from "@/lib/data";

export const metadata: Metadata = { title: "Leadership" };

export default function LeadershipPage() {
  return (
    <>
      <PageHeader
        eyebrow="Leadership & board"
        title={<>The people <em>holding the room</em>.</>}
        lede="An informal board oversees programming, member admissions, and the planned transition to 501(c)(3) status. Additional officers join as the collaborative grows."
      />

      <section className="page section" style={{ paddingTop: 24 }}>
        {LEADERSHIP.map((p) => (
          <PersonCard key={p.role} p={p} />
        ))}

        <div
          className="grid-2"
          style={{
            marginTop: 56,
            borderTop: "1px solid var(--rule-strong)",
            paddingTop: 32,
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.4fr)",
            gap: 64,
          }}
        >
          <div className="eyebrow">A note on governance</div>
          <p style={{ margin: 0, color: "var(--ink-2)", maxWidth: "54ch" }}>
            The collaborative operates informally in 2026. As we transition to
            501(c)(3) status, the board will expand to include a treasurer and two
            at-large director seats elected by the membership. Interested in standing?{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--accent)" }}>
              Reach out to Dr. Leff
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
