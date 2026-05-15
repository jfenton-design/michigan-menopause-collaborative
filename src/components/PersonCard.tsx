import type { Person } from "@/lib/data";

export function PersonCard({ p, large = false }: { p: Person; large?: boolean }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: large ? "minmax(220px, 280px) 1fr" : "1fr",
        gap: large ? 40 : 20,
        padding: large ? "32px 0" : "24px 0",
        borderTop: "1px solid var(--rule-strong)",
      }}
    >
      <div
        className="placeholder-stripes"
        style={{
          aspectRatio: large ? "4/5" : "1/1",
          minHeight: large ? 320 : 180,
        }}
      >
        portrait · {p.name.split(" ")[1] || p.name}
      </div>
      <div>
        <div className="eyebrow" style={{ marginBottom: 12, color: "var(--accent)" }}>
          {p.role}
        </div>
        <h3
          className="display"
          style={{
            margin: 0,
            fontSize: large ? "clamp(32px, 3.6vw, 52px)" : 26,
            lineHeight: 1,
          }}
        >
          {p.name}
        </h3>
        <div
          style={{
            fontSize: 14,
            color: "var(--ink-soft)",
            marginTop: 8,
            fontFamily: "var(--font-mono)",
          }}
        >
          {p.credentials}
        </div>
        {p.bio && (
          <p
            style={{
              marginTop: 22,
              fontSize: large ? 17 : 15,
              lineHeight: 1.55,
              color: "var(--ink-2)",
              maxWidth: "52ch",
            }}
          >
            {p.bio}
          </p>
        )}
      </div>
    </div>
  );
}
