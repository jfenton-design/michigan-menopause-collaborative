import type { Member } from "@/lib/data";

export function MemberRow({ m }: { m: Member }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 2.2fr) minmax(0, 1.6fr) minmax(0, 1.4fr) auto",
        gap: 24,
        padding: "20px 0",
        borderBottom: "1px solid var(--rule)",
        alignItems: "center",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 22,
            lineHeight: 1.1,
            color: "var(--ink)",
          }}
        >
          {m.name}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "var(--ink-soft)",
            marginTop: 4,
            fontFamily: "var(--font-mono)",
          }}
        >
          {m.credentials}
        </div>
      </div>
      <div style={{ fontSize: 14, color: "var(--ink-2)" }}>{m.specialty}</div>
      <div style={{ fontSize: 14, color: "var(--ink-soft)" }}>{m.location}</div>
      <a
        href={`https://${m.practice}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: 13,
          textDecoration: "none",
          color: "var(--accent)",
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.04em",
        }}
      >
        {m.practice} →
      </a>
    </div>
  );
}
