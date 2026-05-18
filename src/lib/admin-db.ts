import { put, list } from '@vercel/blob';
import { RESOURCES, MEMBERS, PAST_MEETINGS, UPCOMING_MEETINGS } from './data';
import type { Resource, Member, Meeting } from './data';

async function readData<T>(pathname: string, fallback: T): Promise<T> {
  try {
    const { blobs } = await list({ prefix: pathname });
    const exact = blobs.find(b => b.pathname === pathname);
    if (!exact) return fallback;
    const res = await fetch(exact.url, { cache: 'no-store' });
    if (!res.ok) return fallback;
    return res.json() as Promise<T>;
  } catch {
    return fallback;
  }
}

async function writeData(pathname: string, data: unknown): Promise<void> {
  await put(pathname, JSON.stringify(data), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  });
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
