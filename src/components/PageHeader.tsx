import * as React from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
};

export function PageHeader({ eyebrow, title, lede }: PageHeaderProps) {
  return (
    <header className="page section" style={{ paddingBottom: 32 }}>
      <div className="eyebrow" style={{ marginBottom: 18 }}>{eyebrow}</div>
      <h1
        className="display"
        style={{
          fontSize: "clamp(40px, 6vw, 76px)",
          margin: 0,
          maxWidth: "18ch",
        }}
      >
        {title}
      </h1>
      {lede && <p className="lede" style={{ marginTop: 24 }}>{lede}</p>}
    </header>
  );
}

type SectionHeadingProps = {
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  action?: React.ReactNode;
};

export function SectionHeading({ eyebrow, title, lede, action }: SectionHeadingProps) {
  return (
    <div
      className="section-heading"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
        gap: 56,
        alignItems: "start",
        marginBottom: 40,
        borderTop: "1px solid var(--rule-strong)",
        paddingTop: 24,
      }}
    >
      <div>
        {eyebrow && <div className="eyebrow" style={{ marginBottom: 14 }}>{eyebrow}</div>}
        <h2
          className="display"
          style={{
            margin: 0,
            fontSize: "clamp(32px, 4vw, 56px)",
            maxWidth: "20ch",
          }}
        >
          {title}
        </h2>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24 }}>
        {lede && <p className="lede" style={{ margin: 0, fontSize: 17 }}>{lede}</p>}
        {action}
      </div>
    </div>
  );
}
