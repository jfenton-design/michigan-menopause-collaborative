import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PersonCard } from "@/components/PersonCard";
import { FOUNDING_MEMBERS, LEADERSHIP } from "@/lib/data";
import type { Person } from "@/lib/data";
import { getContent } from "@/lib/admin-db";
import { getCheckinRoster } from "@/lib/checkin-db";
import type { CheckinMember } from "@/lib/checkin-data";

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: "Leadership" };

const BLOB_ORIGIN = "https://bfbwrnmnnw2zzg0c.private.blob.vercel-storage.com/";

/** Private blob photos must go through the /api/img proxy (auth token);
 *  local /assets paths and other absolute URLs render directly. */
function photoSrc(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith(BLOB_ORIGIN)) return `/api/img?url=${encodeURIComponent(url)}`;
  return url;
}

/** Roster member flagged "Show as Leadership" → the public Person card shape. */
function toPerson(m: CheckinMember): Person {
  const name = [m.prefix, m.first, m.last].filter(Boolean).join(" ").trim();
  const linkUrl = (m.leadershipLinkUrl || "").trim();
  return {
    role: (m.leadershipTitle || "").trim() || "Board member",
    name,
    credentials: m.cred || "",
    practice: m.practice || "",
    bio: (m.leadershipBio || "").trim(),
    photo: photoSrc(m.photo),
    link: linkUrl
      ? { label: (m.leadershipLinkLabel || "").trim() || linkUrl.replace(/^https?:\/\//, ""), url: linkUrl }
      : undefined,
  };
}

export default async function LeadershipPage() {
  const [content, roster] = await Promise.all([getContent(), getCheckinRoster()]);

  // Leaders are managed from the admin Membership panel ("Show as Leadership").
  // Fall back to the static founding list if none have been flagged yet, so the
  // page is never empty.
  const flagged = roster
    .filter((m) => m.leadership)
    .sort(
      (a, b) =>
        (a.leadershipOrder ?? 999) - (b.leadershipOrder ?? 999) ||
        (a.last || "").localeCompare(b.last || ""),
    );
  const leaders: Person[] = flagged.length > 0 ? flagged.map(toPerson) : LEADERSHIP;

  return (
    <>
      <PageHeader
        eyebrow="Leadership & board"
        title={<>The people <em>holding the room</em>.</>}
        lede={content.leadership_header_lede}
      />

      <section className="page section" style={{ paddingTop: 24 }}>
        {leaders.map((p, i) => (
          <PersonCard key={`${p.role}-${p.name}-${i}`} p={p} />
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
