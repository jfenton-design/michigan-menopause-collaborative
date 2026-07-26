import * as React from 'react';
import { getContent } from '@/lib/admin-db';
import { editContent } from '../actions';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { SavedBanner } from '@/components/admin/SavedBanner';
import { s } from '@/components/admin/formStyles';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Website Content · MMC Admin' };

const REDIRECT_TO = '/admin/dashboard/content';

export default async function WebsiteContentPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ saved }, content] = await Promise.all([searchParams, getContent()]);

  return (
    <div style={s.page}>
      <AdminHeader active="content" />
      <SavedBanner show={saved === '1'} />

      <div style={s.content}>
        <div style={s.card}>
          <h2 style={s.sectionTitle}>Website Content</h2>
          <p style={{ fontSize: 14, color: '#7a6e8a', marginTop: -12, marginBottom: 20 }}>
            The copy on the public site. Meeting and resource page copy lives under{' '}
            <strong>Meetings</strong>.
          </p>

          <form action={editContent}>
            <input type="hidden" name="redirectTo" value={REDIRECT_TO} />

            {/* Home */}
            <h3 style={s.subheading}>Home</h3>
            <div style={s.fieldGroup}>
              <label style={s.label}>Hero eyebrow</label>
              <input name="home_hero_eyebrow" defaultValue={content.home_hero_eyebrow} style={s.input} />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Hero lede</label>
              <textarea name="home_hero_lede" defaultValue={content.home_hero_lede} rows={4} style={{ ...s.input, resize: 'vertical' }} />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Hero tagline</label>
              <input name="home_hero_tagline" defaultValue={content.home_hero_tagline} style={s.input} />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Mission lede</label>
              <textarea name="home_mission_lede" defaultValue={content.home_mission_lede} rows={3} style={{ ...s.input, resize: 'vertical' }} />
            </div>
            <div style={{ ...s.fieldGroup, marginBottom: 28 }}>
              <label style={s.label}>Membership text</label>
              <textarea name="home_membership_text" defaultValue={content.home_membership_text} rows={3} style={{ ...s.input, resize: 'vertical' }} />
            </div>

            <div style={s.divider} />

            {/* Leadership & Board */}
            <h3 style={s.subheading}>Leadership &amp; Board</h3>
            <div style={s.fieldGroup}>
              <label style={s.label}>Header lede</label>
              <textarea name="leadership_header_lede" defaultValue={content.leadership_header_lede} rows={3} style={{ ...s.input, resize: 'vertical' }} />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Governance note</label>
              <textarea name="leadership_governance" defaultValue={content.leadership_governance} rows={3} style={{ ...s.input, resize: 'vertical' }} />
            </div>
            <div style={s.grid2}>
              <div style={s.fieldGroup}>
                <label style={s.label}>CTA link text</label>
                <input name="leadership_cta_label" defaultValue={content.leadership_cta_label} style={s.input} placeholder="Reach out to Dr. Leff" />
              </div>
              <div style={{ ...s.fieldGroup, marginBottom: 28 }}>
                <label style={s.label}>CTA link URL</label>
                <input name="leadership_cta_url" defaultValue={content.leadership_cta_url} style={s.input} placeholder="mailto:drleff@drcarrieleff.com" />
              </div>
            </div>

            <div style={s.divider} />

            {/* Submit a Case */}
            <h3 style={s.subheading}>Submit a Case</h3>
            <div style={s.fieldGroup}>
              <label style={s.label}>Header lede</label>
              <textarea name="submit_header_lede" defaultValue={content.submit_header_lede} rows={3} style={{ ...s.input, resize: 'vertical' }} />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>What to include <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(one item per line)</span></label>
              <textarea name="submit_what_to_include" defaultValue={content.submit_what_to_include} rows={5} style={{ ...s.input, resize: 'vertical' }} />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>What happens next <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(one item per line)</span></label>
              <textarea name="submit_what_happens_next" defaultValue={content.submit_what_happens_next} rows={4} style={{ ...s.input, resize: 'vertical' }} />
            </div>
            <div style={{ ...s.fieldGroup, marginBottom: 24 }}>
              <label style={s.label}>Membership reminder</label>
              <textarea name="submit_membership_reminder" defaultValue={content.submit_membership_reminder} rows={3} style={{ ...s.input, resize: 'vertical' }} />
            </div>

            <button type="submit" style={s.submitBtn}>Save content</button>
          </form>
        </div>
      </div>
    </div>
  );
}
