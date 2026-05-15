"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

const LINKS = [
  { href: "/",                label: "Mission" },
  { href: "/meetings",        label: "Meetings" },
  { href: "/leadership",      label: "Leadership" },
  { href: "/members",         label: "Members" },
  { href: "/resources",       label: "Resources" },
  { href: "/submit-a-case",   label: "Submit a case" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="nav">
      <div className="nav__inner">
        <Link href="/" className="nav__brand" aria-label="Michigan Menopause Collaborative — home">
          <Logo size="md" />
        </Link>
        <div className="nav__links">
          {LINKS.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className="nav__link"
                aria-current={active ? "page" : undefined}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
