import Link from "next/link";
import { Logo } from "./Logo";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/data";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <Logo size="md" />
          <p style={{ marginTop: 18 }}>
            A peer collaborative of licensed medical practitioners advancing midlife
            women&apos;s care across southeast Michigan.
          </p>
        </div>
        <div className="footer__col">
          <h4>The Collaborative</h4>
          <ul>
            <li><Link href="/">Mission</Link></li>
            <li><Link href="/leadership">Leadership &amp; Board</Link></li>
            <li><Link href="/members">Member directory</Link></li>
            <li><Link href="/submit-a-case">Submit a case</Link></li>
          </ul>
        </div>
        <div className="footer__col">
          <h4>Contact</h4>
          <ul>
            <li><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
            <li>{SITE_URL}</li>
            <li>Birmingham, MI</li>
          </ul>
        </div>
      </div>
      <div className="footer__inner footer__base">
        <span>© {new Date().getFullYear()} Michigan Menopause Collaborative</span>
        <span>Membership open to licensed medical practitioners</span>
      </div>
    </footer>
  );
}
