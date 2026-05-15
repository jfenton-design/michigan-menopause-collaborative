import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page section">
      <div className="eyebrow" style={{ marginBottom: 18 }}>404 · Not found</div>
      <h1
        className="display"
        style={{ fontSize: "clamp(40px, 6vw, 76px)", margin: 0, maxWidth: "18ch" }}
      >
        That page <em>isn&apos;t in the room</em>.
      </h1>
      <p className="lede" style={{ marginTop: 24 }}>
        The link you followed may have moved. Try the mission page or the meetings calendar.
      </p>
      <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/" className="btn btn--accent">Back to the mission</Link>
        <Link href="/meetings" className="btn btn--ghost">See meetings</Link>
      </div>
    </section>
  );
}
