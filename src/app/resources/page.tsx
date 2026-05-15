import type { Metadata } from "next";
import { PageHeader, SectionHeading } from "@/components/PageHeader";
import { RESOURCES } from "@/lib/data";

export const metadata: Metadata = { title: "Resources" };

export default function ResourcesPage() {
  const current = RESOURCES.filter((r) => r.status === "current");
  const archive = RESOURCES.filter((r) => r.status === "archive");

  return (
    <>
      <PageHeader
        eyebrow="Resources"
        title={<>The reading list, <em>the case archive</em>.</>}
        lede="Each quarter pairs a recent paper with a member-submitted case. Materials are posted here before each meeting and archived after."
      />

      <section className="page section" style={{ paddingTop: 24 }}>
        <SectionHeading eyebrow="This quarter" title="Currently in circulation" />
        {current.map((r, i) => (
          <article
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
              gap: 64,
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
                <span className="btn" aria-disabled="true" style={{ opacity: 0.6, pointerEvents: "none" }}>
                  PDF — coming soon
                </span>
                <span className="btn btn--ghost" aria-disabled="true" style={{ opacity: 0.6, pointerEvents: "none" }}>
                  Discussion guide
                </span>
              </div>
            </div>
            <div className="placeholder-stripes" style={{ aspectRatio: "4/5" }}>
              paper preview
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
              <span
                className="btn btn--ghost"
                aria-disabled="true"
                style={{ opacity: 0.55, pointerEvents: "none" }}
              >
                Members only
              </span>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
