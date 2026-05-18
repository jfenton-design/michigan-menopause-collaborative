import type { Metadata } from "next";
import { PageHeader, SectionHeading } from "@/components/PageHeader";
import { getResources } from "@/lib/admin-db";

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: "Resources" };

export default async function ResourcesPage() {
  const allResources = await getResources();
  const current = allResources.filter((r) => r.status === "current");
  const archive = allResources.filter((r) => r.status === "archive");

  return (
    <>
      <PageHeader
        eyebrow="Resources"
        title={<>Documents and <em>meeting materials</em>.</>}
        lede="Clinical references, meeting notes, and shared documents for collaborative members. Materials are posted here after each meeting."
      />

      <section className="page section" style={{ paddingTop: 24 }}>
        <SectionHeading eyebrow="This quarter" title="Recently posted" />
        {current.map((r, i) => (
          <article
            key={i}
            style={{
              paddingTop: 24,
              borderTop: "1px solid var(--rule-strong)",
            }}
          >
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
                <span className="pill">{r.quarter}</span>
                <span className="pill pill--ghost">{r.type}</span>
              </div>
              <h3
                className="display"
                style={{
                  margin: 0,
                  fontSize: "clamp(28px, 3.4vw, 44px)",
                  lineHeight: 1.05,
                  maxWidth: "22ch",
                }}
              >
                {r.title}
              </h3>
              <div
                style={{
                  fontSize: 14,
                  color: "var(--ink-soft)",
                  marginTop: 16,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {r.citation}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
                {r.url ? (
                  <a href={r.url} className="btn btn--ghost" target="_blank" rel="noopener noreferrer">
                    Download PDF
                  </a>
                ) : (
                  <span className="btn btn--ghost" aria-disabled="true" style={{ opacity: 0.6, pointerEvents: "none" }}>
                    Members only
                  </span>
                )}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="page section">
        <SectionHeading eyebrow="Archive" title="Past materials" />
        <div style={{ display: "grid", gap: 0 }}>
          {archive.map((r, i) => (
            <article
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr auto",
                gap: 32,
                alignItems: "center",
                padding: "24px 0",
                borderBottom: "1px solid var(--rule)",
              }}
            >
              <div>
                <div className="eyebrow" style={{ color: "var(--accent)" }}>
                  {r.quarter}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--ink-soft)",
                    marginTop: 6,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {r.type}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 22,
                    lineHeight: 1.2,
                    maxWidth: "54ch",
                  }}
                >
                  {r.title}
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 6 }}>
                  {r.citation}
                </div>
              </div>
              {r.url ? (
                <a href={r.url} className="btn btn--ghost" target="_blank" rel="noopener noreferrer">
                  Download PDF
                </a>
              ) : (
                <span
                  className="btn btn--ghost"
                  aria-disabled="true"
                  style={{ opacity: 0.55, pointerEvents: "none" }}
                >
                  Members only
                </span>
              )}
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
