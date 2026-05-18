import { put, head } from '@vercel/blob';
import { RESOURCES, MEMBERS, PAST_MEETINGS, UPCOMING_MEETINGS } from './data';
import type { Resource, Member, Meeting } from './data';

/** Construct a private blob URL directly from the token (avoids eventually-consistent list()). */
function blobUrl(pathname: string): string | null {
  const token = process.env.BLOB_READ_WRITE_TOKEN ?? '';
  // Token format: vercel_blob_rw_{STORE_ID}_{SECRET}
  const match = token.match(/vercel_blob_rw_([A-Za-z0-9]+)_/);
  if (!match?.[1]) return null;
  return `https://${match[1]}.public.blob.vercel-storage.com/${pathname}`;
}

async function readData<T>(pathname: string, fallback: T): Promise<T> {
  try {
    const url = blobUrl(pathname);
    if (url) {
      try {
        const info = await head(url);
        const res = await fetch(info.downloadUrl, { cache: 'no-store' });
        if (res.ok) return res.json() as Promise<T>;
      } catch {
        // head() throws if blob doesn't exist — that's fine, return fallback below
      }
    }
  } catch (err) {
    console.error('[admin-db] readData failed for', pathname, err);
  }
  return fallback;
}

async function writeData(pathname: string, data: unknown): Promise<void> {
  try {
    await put(pathname, JSON.stringify(data), {
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } catch (err) {
    console.error('[admin-db] writeData failed for', pathname, err);
    throw err;
  }
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
