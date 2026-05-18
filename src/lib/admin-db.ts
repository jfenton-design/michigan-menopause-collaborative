import { put, head } from '@vercel/blob';
import { RESOURCES, MEMBERS, PAST_MEETINGS, UPCOMING_MEETINGS } from './data';
import type { Resource, Member, Meeting } from './data';

// Private blob store base URL — confirmed via diagnostic endpoint.
// Store ID is lowercase; private stores use .private. not .public.
const BLOB_BASE = 'https://bfbwrnmnnw2zzg0c.private.blob.vercel-storage.com';

function blobUrl(pathname: string): string {
  return `${BLOB_BASE}/${pathname}`;
}

async function readData<T>(pathname: string, fallback: T): Promise<T> {
  const url = blobUrl(pathname);
  try {
    const info = await head(url);
    const res = await fetch(info.downloadUrl, { cache: 'no-store' });
    if (res.ok) return res.json() as Promise<T>;
    console.error('[admin-db] fetch downloadUrl failed', res.status, pathname);
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;
    if (status === 404) {
      // Blob doesn't exist yet — first run, use fallback
    } else {
      console.error('[admin-db] head() error for', url, err);
    }
  }
  return fallback;
}

async function writeData(pathname: string, data: unknown): Promise<void> {
  const result = await put(pathname, JSON.stringify(data), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  console.log('[admin-db] wrote', result.url);
}

export async function getResources(): Promise<Resource[]> {
  return readData<Resource[]>('mmc/resources.json', RESOURCES);
}

export async function saveResources(resources: Resource[]): Promise<void> {
  await writeData('mmc/resources.json', resources);
}

export async function getMeetings(): Promise<Meeting[]> {
  const fallback = [...UPCOMING_MEETINGS, ...PAST_MEETINGS];
  return readData<Meeting[]>('mmc/meetings.json', fallback);
}

export async function saveMeetings(meetings: Meeting[]): Promise<void> {
  await writeData('mmc/meetings.json', meetings);
}

export async function getMembers(): Promise<Member[]> {
  return readData<Member[]>('mmc/members.json', MEMBERS);
}

export async function saveMembers(members: Member[]): Promise<void> {
  await writeData('mmc/members.json', members);
}
