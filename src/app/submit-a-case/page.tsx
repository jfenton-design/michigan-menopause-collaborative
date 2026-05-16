import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { CaseForm } from "./CaseForm";

export const metadata: Metadata = { title: "Submit a case" };

export default function SubmitPage() {
  return (
    <>
      <PageHeader
        eyebrow="Submit a case"
        title={<>The hardest case <em>in your week</em>.</>}
        lede="Submit a de-identified case for consideration at an upcoming meeting. Selected cases are presented by the submitter — typically 10 minutes, followed by group discussion."
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
                <li>The clinical question that keeps the case interesting</li>
                <li>A high-level history — no PHI, no chart screenshots</li>
                <li>What has and hasn&apos;t worked so far</li>
                <li>Where the literature has felt thin or contradictory</li>
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
                <li>Dr. Leff and the board review submissions quarterly.</li>
                <li>Selected submitters present their case in person — 10 minutes.</li>
                <li>The room discusses for 30 minutes; a written summary is archived.</li>
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
              Case submission is open to all licensed medical practitioners — you do not
              need to be a current member to submit, but presenters are typically
              members or invited guests.
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
