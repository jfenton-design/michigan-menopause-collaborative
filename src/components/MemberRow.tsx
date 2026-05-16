import type { Member } from "@/lib/data";

export function MemberRow({ m }: { m: Member }) {
  return (
    <div className="dir-row">
      <div className="dir-row__name">
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, lineHeight: 1.2, color: "var(--ink)" }}>
          {m.name}
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 3, fontFamily: "var(--font-mono)" }}>
          {m.credentials}
        </div>
      </div>
      <div className="dir-row__specialty">{m.specialty}</div>
      <div className="dir-row__location">{m.location}</div>
      <a
        href={`https://${m.practice}`}
        target="_blank"
        rel="noopener noreferrer"
        className="dir-row__link"
      >
        {m.practice} →
      </a>
    </div>
  );
}
