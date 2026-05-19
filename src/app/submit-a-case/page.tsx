import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { CaseForm } from "./CaseForm";
import { getContent } from "@/lib/admin-db";

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: "Submit a case" };

export default async function SubmitPage() {
  const content = await getContent();
  return (
    <>
      <PageHeader
        eyebrow="Submit a case"
        title={<>The hardest case <em>in your week</em>.</>}
        lede={content.submit_header_lede}
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
          <CaseForm />

          <aside
            style={{
              paddingTop: 24,
              borderTop: "1px solid var(--rule-strong)",
              display: "grid",
              gap: 32,
            }}
          >
            <div>
              <div className="eyebrow" style={{ marginBottom: 10 }}>What to include</div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  color: "var(--ink-2)",
                  display: "grid",
                  gap: 8,
                }}
              >
                {content.submit_what_to_include.split('\n').map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="eyebrow" style={{ marginBottom: 10 }}>What happens next</div>
              <ol
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  color: "var(--ink-2)",
                  display: "grid",
                  gap: 8,
                }}
              >
                {content.submit_what_happens_next.split('\n').map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>
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
              <strong style={{ color: "var(--ink)" }}>Membership reminder.</strong>{" "}
              {content.submit_membership_reminder}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
