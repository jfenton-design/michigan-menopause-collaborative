import type { Person } from "@/lib/data";

export function PersonCard({ p }: { p: Person }) {
  return (
    <div className="person-card">
      <div className="placeholder-stripes person-card__portrait">
        portrait · {p.name.split(" ")[1] || p.name}
      </div>
      <div className="person-card__body">
        <div className="eyebrow" style={{ marginBottom: 12, color: "var(--accent)" }}>
          {p.role}
        </div>
        <h3
          className="display person-card__name"
        >
          {p.name}
        </h3>
        <div style={{ fontSize: 14, color: "var(--ink-soft)", marginTop: 8, fontFamily: "var(--font-mono)" }}>
          {p.credentials}
        </div>
        {p.bio && (
          <p style={{ marginTop: 22, fontSize: 17, lineHeight: 1.55, color: "var(--ink-2)", maxWidth: "52ch" }}>
            {p.bio}
          </p>
        )}
      </div>
    </div>
  );
}
