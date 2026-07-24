import * as React from 'react';
import { getMeetings } from '@/lib/admin-db';
import { getCheckinRoster } from '@/lib/checkin-db';
import { MembershipClient } from './MembershipClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Membership · MMC Admin' };

export default async function MembershipPage() {
  const [meetings, roster] = await Promise.all([getMeetings(), getCheckinRoster()]);
  return <MembershipClient initialMeetings={meetings} initialRoster={roster} />;
}
