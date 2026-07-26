import * as React from 'react';
import { getMeetings } from '@/lib/admin-db';
import { getCheckinRoster } from '@/lib/checkin-db';
import { EmailTemplateBuilder } from '../../EmailTemplateBuilder';
import { RecapEmailBuilder } from '@/components/admin/RecapEmailBuilder';
import { SocialAssets } from '@/components/admin/SocialAssets';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { MeetingsTabs } from '@/components/admin/MeetingsTabs';
import { s } from '@/components/admin/formStyles';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Emails / Social · MMC Admin' };

export default async function MeetingsEmailsSocialPage() {
  const [meetings, roster] = await Promise.all([getMeetings(), getCheckinRoster()]);

  // Attendee emails per meeting (checked in = seasons[id] === 'in'), so the
  // recap builder's "Copy recipients" works outside the Check-In flow.
  const emailsByMeeting: Record<string, string[]> = {};
  for (const m of meetings) {
    emailsByMeeting[m.id] = roster
      .filter(p => p.seasons?.[m.id] === 'in' && (p.email || '').trim())
      .map(p => p.email.trim());
  }

  return (
    <div style={s.page}>
      <AdminHeader active="meetings" />
      <MeetingsTabs active="recap" />

      <div style={s.content}>
        {/* Reminder email */}
        <div style={s.card}>
          <h2 style={s.sectionTitle}>Reminder email</h2>
          <p style={{ fontSize: 14, color: '#7a6e8a', marginTop: -12, marginBottom: 20 }}>
            A branded reminder for an upcoming meeting — build it, then copy it straight into a Gmail compose window.
          </p>
          <EmailTemplateBuilder meetings={meetings} />
        </div>

        {/* Recap email */}
        <div style={s.card}>
          <h2 style={s.sectionTitle}>Recap email</h2>
          <p style={{ fontSize: 14, color: '#7a6e8a', marginTop: -12, marginBottom: 20 }}>
            A thank-you to send after a meeting. Recipients are pulled from who
            you checked in, so you can copy them straight into Bcc.
          </p>
          <RecapEmailBuilder meetings={meetings} emailsByMeeting={emailsByMeeting} />
        </div>

        {/* Social assets */}
        <div style={s.card}>
          <h2 style={s.sectionTitle}>Social assets</h2>
          <p style={{ fontSize: 14, color: '#7a6e8a', marginTop: -12, marginBottom: 20 }}>
            Square (1080×1080) images for Instagram, LinkedIn, etc. — one text
            card and one that leads with the group photo.
          </p>
          <SocialAssets meetings={meetings} />
        </div>
      </div>
    </div>
  );
}
