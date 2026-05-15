import Image from "next/image";
import Link from "next/link";
import { MeetingCard } from "@/components/MeetingCard";
import { SectionHeading } from "@/components/PageHeader";
import { CONTACT_EMAIL, NEXT_MEETING } from "@/lib/data";

const VALUE_PROPS = [
  {
    n: "01",
    t: "Peer-to-peer",
    d: "Practitioners across OB-GYN, endocrinology, cardiology, psychiatry, integrative medicine, nutrition, and pelvic-floor PT — in one room, comparing notes on what's actually working.",
  },
  {
    n: "02",
    t: "Evidence-led",
    d: "Every meeting orbits a recent paper and one member-submitted case. No vendors, no CEUs to chase — just a structured conversation about the state of the literature.",
  },
  {
    n: "03",
    t: "Local",
    d: "We meet in southeast Michigan, in person. Our patients are neighbors. So is our standard of care.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="page section" style={{ paddingTop: 48, paddingBottom: 40 }}>
        <div className="eyebrow" style={{ marginBottom: 22 }}>
          Est. 2026 · Southeast Michigan · A peer society
        </div>
        <h1
          className="display"
          style={{
            margin: 0,
            fontSize: "clamp(40px, 5.5vw, 88px)",
            maxWidth: "20ch",
          }}
        >
          Join the physicians <em>elevating</em> the care of midlife women.
        </h1>
        <p className="lede" style={{ marginTop: 32, maxWidth: "56ch" }}>
          The Michigan Menopause Collaborative is a multidisciplinary peer network for
          licensed medical practitioners in southeast Michigan. Four meetings a year.
          One paper, one case, every time. The conversations our patients deserve.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 36, flexWrap: "wrap" }}>
          <Link href="/meetings" className="btn btn--accent">
            See the next meeting →
          </Link>
          <Link href="/members" className="btn btn--ghost">
            Browse the directory
          </Link>
        </div>
      </section>

      {/* Founding-meeting photograph — editorial anchor */}
      <section className="page" style={{ paddingTop: 8, paddingBottom: 8 }}>
        <figure style={{ margin: 0 }}>
          <div
            style={{
              position: "relative",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              background: "var(--paper-2)",
              boxShadow: "var(--shadow)",
            }}
          >
            <Image
              src="/assets/founding-meeting.jpg"
              alt="Founding meeting of the Michigan Menopause Collaborative — practitioners seated together in a teal-walled Birmingham room, beneath a butterfly painting."
              width={2000}
              height={957}
              priority
              sizes="(max-width: 1240px) 100vw, 1240px"
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                objectFit: "cover",
                objectPosition: "center 35%",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 20,
                bottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 14px",
                background: "rgba(0, 0, 0, 0.55)",
                backdropFilter: "blur(6px)",
                borderRadius: "var(--radius-pill)",
                color: "rgba(255, 255, 255, 0.92)",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: "var(--accent-2)",
                }}
              />
              The room · Spring 2026
            </div>
          </div>
          <figcaption
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.4fr)",
              gap: 56,
              paddingTop: 22,
              marginTop: 18,
              borderTop: "1px solid var(--rule)",
            }}
          >
            <div className="eyebrow">
              The founding meeting · April 2026 · Birmingham, MI
            </div>
            <div
              style={{
                color: "var(--ink-2)",
                fontSize: 15,
                lineHeight: 1.6,
                maxWidth: "62ch",
              }}
            >
              A cross-section of practitioners — OB-GYN, endocrinology, cardiology,
              psychiatry, integrative medicine, nutrition, pelvic-floor PT — in one
              room, over one paper and one case. The collaborative <em>began here</em>.
              It meets four times a year.
            </div>
          </figcaption>
        </figure>
      </section>

      {/* Next meeting hero */}
      <section className="page section" style={{ paddingTop: 56, paddingBottom: 80 }}>
        <MeetingCard meeting={NEXT_MEETING} variant="hero" />
      </section>

      {/* Mission */}
      <section className="page section" style={{ paddingTop: 24 }}>
        <SectionHeading
          eyebrow="The mission"
          title={<>Midlife women&apos;s care, <em>improved together</em>.</>}
          lede="A multidisciplinary community of providers dedicated to women's health — meeting in person, four times a year, around one paper and one case."
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 56,
          }}
        >
          {VALUE_PROPS.map((c) => (
            <div key={c.n}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  letterSpacing: "0.12em",
                  color: "var(--accent)",
                  marginBottom: 14,
                }}
              >
                {c.n}
              </div>
              <h3
                className="display"
                style={{ margin: "0 0 14px", fontSize: 28, lineHeight: 1.1 }}
              >
                {c.t}
              </h3>
              <p style={{ color: "var(--ink-2)", margin: 0, fontSize: 16 }}>{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Article of the month */}
      <section className="page section">
        <SectionHeading
          eyebrow="Article of the month"
          title={<><em>What we&apos;ll be discussing</em> in July</>}
          action={
            <Link href="/resources" className="btn btn--ghost">
              All resources →
            </Link>
          }
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
            gap: 64,
            alignItems: "start",
          }}
        >
          <div>
            <div className="pill" style={{ marginBottom: 24 }}>Summer 2026 · Reading</div>
            <h3
              className="display"
              style={{
                fontSize: "clamp(28px, 3.4vw, 48px)",
                lineHeight: 1.05,
                margin: 0,
                maxWidth: "22ch",
              }}
            >
              {NEXT_MEETING.article}
            </h3>
            <div
              style={{
                fontSize: 14,
                color: "var(--ink-soft)",
                marginTop: 16,
                fontFamily: "var(--font-mono)",
              }}
            >
              {NEXT_MEETING.articleCitation}
            </div>
            <p style={{ marginTop: 28, fontSize: 16, color: "var(--ink-2)", maxWidth: "52ch" }}>
              A long-running cohort, freshly updated. We&apos;ll work through the study
              design, the residual confounders, and what — if anything — changes in
              our exam rooms on Monday morning.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
              <Link href="/resources" className="btn">Reading list</Link>
              <Link href={`/rsvp?meeting=${NEXT_MEETING.id}`} className="btn btn--accent">
                RSVP for July 21 →
              </Link>
            </div>
          </div>
          <div className="placeholder-stripes" style={{ aspectRatio: "4/5", padding: 24 }}>
            paper preview · 14 pages
          </div>
        </div>
      </section>

      {/* Membership */}
      <section className="page section" style={{ paddingTop: 0 }}>
        <div
          style={{
            borderTop: "1px solid var(--rule-strong)",
            paddingTop: 40,
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.4fr)",
            gap: 64,
            alignItems: "start",
          }}
        >
          <div className="eyebrow">Membership</div>
          <div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(24px, 2.4vw, 34px)",
                lineHeight: 1.2,
                margin: 0,
                color: "var(--ink)",
                maxWidth: "32ch",
              }}
            >
              Open to licensed medical practitioners caring for midlife women in
              southeast Michigan. No fees while we operate informally;{" "}
              <em>501(c)(3) status is in development.</em>
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
              <Link href="/submit-a-case" className="btn btn--accent">
                Submit a case →
              </Link>
              <a href={`mailto:${CONTACT_EMAIL}`} className="btn btn--ghost">
                Inquire about joining
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
