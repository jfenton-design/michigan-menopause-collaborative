'use server';
import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { saveCheckinRoster } from '@/lib/checkin-db';
import type { CheckinMember } from '@/lib/checkin-data';

export async function persistRoster(roster: CheckinMember[]): Promise<void> {
  await saveCheckinRoster(roster);
  revalidatePath('/admin/dashboard/checkin');
}

export async function uploadCheckinPhoto(memberId: string, formData: FormData): Promise<string> {
  const file = formData.get('photo') as File;
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const blob = await put(`mmc/checkin-photos/${memberId}.${ext}`, file, {
    access: 'private',
    contentType: file.type || 'image/jpeg',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return blob.url;
}
