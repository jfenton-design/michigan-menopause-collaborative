import * as React from "react";

type Size = "sm" | "md" | "lg";

const PETAL_PATH =
  "M 0 -56 C 6 -52 9 -44 8 -39 C 7 -35 4 -32 0 -32 " +
  "C -4 -32 -7 -35 -8 -39 C -9 -44 -6 -52 0 -56 Z";

const PETAL_ANGLES = [0, 60, 120, 180, 240, 300] as const;

type LogoProps = {
  size?: Size;
  inverse?: boolean;
};

/**
 * Bloom seal · MMC monogram inside a 6-petal mark.
 * Direction B from the design system.
 */
export function Logo({ size = "md", inverse = false }: LogoProps) {
  const dim = { sm: 32, md: 44, lg: 92 }[size];
  const fs = { sm: 13, md: 15, lg: 28 }[size];
  const ink = inverse ? "var(--paper)" : "var(--ink)";
  const accent = "var(--accent)";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: size === "lg" ? 22 : 14 }}>
      <BloomMark dim={dim} ink={ink} accent={accent} />
      <div style={{ color: ink, lineHeight: 1.1 }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: fs,
            letterSpacing: "-0.02em",
          }}
        >
          Michigan Menopause<br />Collaborative
        </div>
        {size === "lg" && (
          <div
            style={{
              marginTop: 14,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--ink-soft)",
            }}
          >
            A peer network of physicians in southeast Michigan
          </div>
        )}
      </div>
    </div>
  );
}

export function BloomMark({
  dim = 44,
  ink = "var(--ink)",
  accent = "var(--accent)",
}: {
  dim?: number;
  ink?: string;
  accent?: string;
}) {
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="-65 -65 130 130"
      aria-hidden="true"
      style={{ flex: "none" }}
    >
      {PETAL_ANGLES.map((a) => (
        <path key={a} d={PETAL_PATH} fill={accent} transform={`rotate(${a})`} />
      ))}
      <circle r="30" fill="none" stroke={ink} strokeWidth="1.8" />
      <text
        y="6.5"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontWeight="600"
        fontSize="19"
        letterSpacing="-0.5"
        fill={ink}
      >
        MMC
      </text>
    </svg>
  );
}
