import { redirect } from 'next/navigation';

// The admin is organized into three components — Website Content, Membership,
// and Meetings. The bare dashboard lands on Meetings (the most-used screen).
export default function DashboardPage() {
  redirect('/admin/dashboard/meetings');
}
