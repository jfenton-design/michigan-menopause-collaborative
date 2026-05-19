import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PersonCard } from "@/components/PersonCard";
import { FOUNDING_MEMBERS, LEADERSHIP } from "@/lib/data";
import { getContent } from "@/lib/admin-db";

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: "Leadership" };

export default async function LeadershipPage() {
  const content = await getContent();
  return (
    <>
      <PageHeader
        eyebrow="Leadership & board"
        title={<>The people <em>holding the room</em>.</>}
        lede={content.leadership_header_lede}
      />

      <section className="page section" style={{ paddingTop: 24 }}>
        {LEADERSHIP.map((p) => (
          <PersonCard key={p.role} p={p} />
        ))}

        {/* Founding Members */}
        <div style={{ marginTop: 64, borderTop: "1px solid var(--rule-strong)", paddingTop: 32 }}>
          <div className="eyebrow" style={{ marginBottom: 24 }}>Founding members</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {FOUNDING_MEMBERS.map((m) => (
              <a
                key={m.name}
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  padding: "10px 18px",
                  background: "var(--paper-2)",
                  borderRadius: "var(--radius-md)",
                  fontSize: 15,
                  color: "var(--ink)",
                  textDecoration: "none",
                  fontWeight: 500,
                  border: "1px solid var(--rule)",
                }}
              >
                {m.name}
              </a>
            ))}
          </div>
        </div>

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
            {content.leadership_governance}{" "}
            {content.leadership_cta_label && content.leadership_cta_url && (
              <><a href={content.leadership_cta_url} style={{ color: "var(--accent)" }}>
                {content.leadership_cta_label}
              </a>.</>
            )}
          </p>
        </div>
      </section>
    </>
  );
}
