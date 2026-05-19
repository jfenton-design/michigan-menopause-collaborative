'use server';
import { put, del } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getMeetings, saveMeetings, getResources, saveResources, getMembers, saveMembers, getContent, saveContent } from '@/lib/admin-db';
import type { Meeting, Resource, Member, SiteContent } from '@/lib/data';

// LOGOUT
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('mmc-admin-session');
  redirect('/admin');
}

// RESOURCES
export async function uploadResource(formData: FormData) {
  const file = formData.get('file') as File;
  const title = formData.get('title') as string;
  const quarter = formData.get('quarter') as string;
  const type = formData.get('type') as string;
  const citation = formData.get('citation') as string;

  let url: string | undefined;
  if (file && file.size > 0) {
    try {
      const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const blob = await put(`mmc/pdfs/${slug}.pdf`, file, {
        access: 'private',
        contentType: 'application/pdf',
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      url = blob.url;
      console.log('[uploadResource] PDF uploaded:', url);
    } catch (err) {
      console.error('[uploadResource] PDF upload failed — saving resource without PDF:', err);
    }
  }

  const resources = await getResources();
  const updated = resources.map(r => r.status === 'current' ? { ...r, status: 'archive' as const } : r);
  const newResource: Resource = { quarter, type, title, citation, status: 'current', url };
  await saveResources([newResource, ...updated]);
  revalidatePath('/resources');
  revalidatePath('/admin/dashboard');
  redirect('/admin/dashboard?saved=1');
}

export async function editResource(formData: FormData) {
  const originalTitle = formData.get('originalTitle') as string;
  const title = formData.get('title') as string;
  const quarter = formData.get('quarter') as string;
  const type = formData.get('type') as string;
  const citation = formData.get('citation') as string;
  const status = formData.get('status') as 'current' | 'archive';

  const resources = await getResources();
  await saveResources(resources.map(r =>
    r.title === originalTitle ? { ...r, title, quarter, type, citation, status } : r
  ));
  revalidatePath('/resources');
  redirect('/admin/dashboard?saved=1');
}

export async function deleteResource(formData: FormData) {
  const title = formData.get('title') as string;
  const url = formData.get('url') as string | null;
  if (url) {
    try { await del(url); } catch { /* ignore if already gone */ }
  }
  const resources = await getResources();
  await saveResources(resources.filter(r => r.title !== title));
  revalidatePath('/resources');
  redirect('/admin/dashboard?saved=1');
}

// MEETINGS
export async function createMeeting(formData: FormData) {
  const quarter = formData.get('quarter') as string;
  const weekday = formData.get('weekday') as string;
  const month = formData.get('month') as string;
  const day = formData.get('day') as string;
  const year = formData.get('year') as string;
  const time = formData.get('time') as string;
  const location = formData.get('location') as string;
  const locationShort = formData.get('locationShort') as string;
  const rsvpOpen = formData.get('rsvpOpen') === 'on';
  const showKarmanos = formData.get('showKarmanos') === 'on';
  const id = `${quarter.toLowerCase().replace(/\s+/g, '-')}`;

  const meeting: Meeting = { id, quarter, weekday, month, day, year, time, location, locationShort, rsvpOpen, showKarmanos };
  const meetings = await getMeetings();
  await saveMeetings([meeting, ...meetings]);
  revalidatePath('/meetings');
  redirect('/admin/dashboard?saved=1');
}

export async function deleteMeeting(formData: FormData) {
  const id = formData.get('id') as string;
  const meetings = await getMeetings();
  await saveMeetings(meetings.filter(m => m.id !== id));
  revalidatePath('/meetings');
  redirect('/admin/dashboard?saved=1');
}

// MEMBERS
export async function addMember(formData: FormData) {
  const name = formData.get('name') as string;
  const credentials = formData.get('credentials') as string;
  const specialty = formData.get('specialty') as string;
  const location = formData.get('location') as string;
  const practice = formData.get('practice') as string;

  const member: Member = { name, credentials, specialty, location, practice };
  const members = await getMembers();
  await saveMembers([...members, member]);
  revalidatePath('/members');
  redirect('/admin/dashboard?saved=1');
}

export async function deleteMember(formData: FormData) {
  const name = formData.get('name') as string;
  const members = await getMembers();
  await saveMembers(members.filter(m => m.name !== name));
  revalidatePath('/members');
  redirect('/admin/dashboard?saved=1');
}

// SITE CONTENT
export async function editContent(formData: FormData) {
  const current = await getContent();
  const updated: SiteContent = { ...current };
  for (const key of Object.keys(current) as Array<keyof SiteContent>) {
    const val = formData.get(key);
    if (typeof val === 'string') updated[key] = val;
  }
  await saveContent(updated);
  revalidatePath('/');
  revalidatePath('/meetings');
  revalidatePath('/resources');
  revalidatePath('/members');
  revalidatePath('/leadership');
  revalidatePath('/submit-a-case');
  redirect('/admin/dashboard?saved=1');
}
