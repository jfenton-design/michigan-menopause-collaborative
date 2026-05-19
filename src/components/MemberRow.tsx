import type { Member } from "@/lib/data";

function practiceDisplay(practice: string): { href: string; label: string } {
  const href = practice.startsWith("http") ? practice : `https://${practice}`;
  try {
    const label = new URL(href).hostname.replace(/^www\./, "");
    return { href, label };
  } catch {
    return { href, label: practice };
  }
}

export function MemberRow({ m }: { m: Member }) {
  const { href, label } = practiceDisplay(m.practice);
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
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="dir-row__link"
      >
        {label} →
      </a>
    </div>
  );
}
