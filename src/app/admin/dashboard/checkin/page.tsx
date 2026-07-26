import { redirect } from 'next/navigation';

// Check-In moved under Meetings. Keep old bookmarks working.
export default function LegacyCheckinRedirect() {
  redirect('/admin/dashboard/meetings/checkin');
}
