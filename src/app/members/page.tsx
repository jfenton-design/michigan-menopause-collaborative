import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Directory } from "@/components/Directory";
import { getMembers, getContent } from "@/lib/admin-db";

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: "Members" };

export default async function MembersPage() {
  const [members, content] = await Promise.all([getMembers(), getContent()]);

  return (
    <>
      <PageHeader
        eyebrow="Member directory"
        title={<>Practitioners <em>across the practice</em>.</>}
        lede={content.members_header_lede}
      />

      <section className="page section" style={{ paddingTop: 24 }}>
        <Directory members={members} />

        <div
          style={{
            marginTop: 56,
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.4fr)",
            gap: 64,
          }}
        >
          <div className="eyebrow">Opt-in note</div>
          <p style={{ margin: 0, color: "var(--ink-2)", maxWidth: "54ch" }}>
            {content.members_optin_note}
          </p>
        </div>
      </section>
    </>
  );
}
