import Image from "next/image";
import Link from "next/link";
import { MeetingCard } from "@/components/MeetingCard";
import { SectionHeading } from "@/components/PageHeader";
import { CONTACT_EMAIL, NEXT_MEETING } from "@/lib/data";

const VALUE_PROPS = [
  {
    n: "01",
    t: "Peer-to-peer",
    d: "Clinicians across all disciplines in medicine. One room. Shared experience. Practical discussion about what is working in real patient care.",
  },
  {
    n: "02",
    t: "Evidence-led",
    d: "Each meeting includes a focused topic, discussion of a selected article, and 1–2 member-submitted cases. A place to ask questions, exchange ideas, and continue building expertise in midlife medicine together.",
  },
  {
    n: "03",
    t: "Local",
    d: "We meet in southeast Michigan, in person. Our patients are our neighbors. Our standard of care should reflect that.",
  },
];

export default function HomePage() {
  return (
    <>
      <div className="hero-wrap">
      {/* Hero */}
      <section className="page section hero-text" style={{ paddingTop: 48, paddingBottom: 40 }}>
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
          Join the clinicians <em>elevating</em> the care of midlife women in Southeast Michigan.
        </h1>
        <p className="lede" style={{ marginTop: 32, maxWidth: "56ch" }}>
          The Michigan Menopause Collaborative is a multidisciplinary network for
          clinicians caring for women in midlife. Four meetings a year. One focused
          topic. One article. A real case discussion. A collaborative space to learn,
          connect, and strengthen the care of our patients.
        </p>
        <p className="lede" style={{ marginTop: 16, maxWidth: "56ch", fontStyle: "italic" }}>
          Midlife women&apos;s care, improved together.
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
      <section className="page hero-photo" style={{ paddingTop: 8, paddingBottom: 8 }}>
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
          </div>
        </figure>
      </section>
      </div>

      {/* Mission */}
      <section id="mission" className="page section" style={{ paddingTop: 24 }}>
        <SectionHeading
          eyebrow="The mission"
          title={<>Midlife women&apos;s care, <em>improved together</em>.</>}
          lede="A multidisciplinary community of clinicians dedicated to improving care for women in midlife. Meeting in person four times a year for focused discussion, networking, and collaborative case-based learning."
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 56,
          }}
          className="grid-3"
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

      {/* Next meeting hero */}
      <section className="page section" style={{ paddingTop: 56, paddingBottom: 80 }}>
        <MeetingCard meeting={NEXT_MEETING} variant="hero" />
      </section>

      {/* Membership */}
      <section className="page section" style={{ paddingTop: 0 }}>
        <div
          className="grid-2"
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
              <a href={`mailto:${CONTACT_EMAIL}`} className="btn btn--accent">
                Inquire about joining →
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
