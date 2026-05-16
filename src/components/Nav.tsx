"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const LINKS = [
  { href: "/#mission",      label: "Mission" },
  { href: "/meetings",      label: "Meetings" },
  { href: "/leadership",    label: "Leadership" },
  { href: "/members",       label: "Members" },
  { href: "/resources",     label: "Resources" },
  { href: "/submit-a-case", label: "Submit a case" },
];

function isActive(href: string, pathname: string) {
  if (href === "/#mission") return pathname === "/";
  return pathname.startsWith(href);
}

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <nav className="nav">
        <div className="nav__inner">
          <Link href="/" className="nav__brand" aria-label="Michigan Menopause Collaborative — home">
            <Logo size="md" />
          </Link>

          {/* Desktop links */}
          <div className="nav__links">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="nav__link"
                aria-current={isActive(l.href, pathname) ? "page" : undefined}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Hamburger — mobile only */}
          <button
            className="nav__hamburger"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                <line x1="3" y1="3" x2="19" y2="19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="19" y1="3" x2="3" y2="19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                <line x1="3" y1="6"  x2="19" y2="6"  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="3" y1="16" x2="19" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="nav__drawer" aria-label="Navigation menu">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="nav__drawer-link"
              aria-current={isActive(l.href, pathname) ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/rsvp"
            className="btn btn--accent nav__drawer-rsvp"
            onClick={() => setOpen(false)}
          >
            RSVP for next meeting →
          </Link>
        </div>
      )}

      {/* Overlay */}
      {open && (
        <div
          className="nav__overlay"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
