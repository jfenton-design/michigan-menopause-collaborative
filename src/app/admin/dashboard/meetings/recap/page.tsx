import * as React from 'react';
import { getMeetings } from '@/lib/admin-db';
import { EmailTemplateBuilder } from '../../EmailTemplateBuilder';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { MeetingsTabs } from '@/components/admin/MeetingsTabs';
import { s } from '@/components/admin/formStyles';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Recap Email · MMC Admin' };

export default async function MeetingsRecapPage() {
  const meetings = await getMeetings();

  return (
    <div style={s.page}>
      <AdminHeader active="meetings" />
      <MeetingsTabs active="recap" />

      <div style={s.content}>
        <div style={s.card}>
          <h2 style={s.sectionTitle}>Meeting Reminder Email</h2>
          <p style={{ fontSize: 14, color: '#7a6e8a', marginTop: -12, marginBottom: 20 }}>
            Build a branded reminder for an upcoming meeting, then copy it straight into a Gmail compose window.
          </p>
          <EmailTemplateBuilder meetings={meetings} />
        </div>
      </div>
    </div>
  );
}
