import * as React from 'react';
import { getMeetings } from '@/lib/admin-db';
import { getCheckinRoster } from '@/lib/checkin-db';
import { CheckinClient } from './CheckinClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Check-In · MMC Admin' };

export default async function CheckinPage() {
  const [meetings, roster] = await Promise.all([getMeetings(), getCheckinRoster()]);
  return <CheckinClient initialMeetings={meetings} initialRoster={roster} />;
}
