import { readData, writeData } from './admin-db';
import { CHECKIN_SEED } from './checkin-data';
import type { CheckinMember } from './checkin-data';

// Members for whom we already have a headshot in /public/assets. Applied at
// read time as a default only — an uploaded photo always wins. Keyed by
// lowercased "first last".
const DEFAULT_PHOTOS: Record<string, string> = {
  'amy heeringa': '/assets/dr-heeringa.png',
  'carrie leff': '/assets/dr-leff.png',
  'eva alsheik': '/assets/eva-alsheik.png',
};

export async function getCheckinRoster(): Promise<CheckinMember[]> {
  const roster = await readData<CheckinMember[]>('mmc/checkin-roster.json', CHECKIN_SEED);
  return roster.map(m => {
    if ((m.photo || '').trim()) return m;
    const key = `${(m.first || '').trim()} ${(m.last || '').trim()}`.toLowerCase();
    const def = DEFAULT_PHOTOS[key];
    return def ? { ...m, photo: def } : m;
  });
}

export async function saveCheckinRoster(roster: CheckinMember[]): Promise<void> {
  await writeData('mmc/checkin-roster.json', roster);
}
