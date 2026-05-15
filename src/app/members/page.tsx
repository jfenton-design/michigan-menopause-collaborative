import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Directory } from "@/components/Directory";

export const metadata: Metadata = { title: "Members" };

export default function MembersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Member directory"
        title={<>Practitioners <em>across the practice</em>.</>}
        lede="A multidisciplinary list of members who have opted to be publicly visible. Inclusion is not a referral or endorsement — it is a statement that this physician shares our standard of care."
      />

      <section className="page section" style={{ paddingTop: 24 }}>
        <Directory />

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
            Membership in the collaborative is open to licensed medical practitioners.
            Inclusion in this public directory is at each member&apos;s discretion — some
            members participate without listing publicly.
          </p>
        </div>
      </section>
    </>
  );
}
