import { readData, writeData } from './admin-db';
import { CHECKIN_SEED } from './checkin-data';
import type { CheckinMember } from './checkin-data';

export async function getCheckinRoster(): Promise<CheckinMember[]> {
  return readData<CheckinMember[]>('mmc/checkin-roster.json', CHECKIN_SEED);
}

export async function saveCheckinRoster(roster: CheckinMember[]): Promise<void> {
  await writeData('mmc/checkin-roster.json', roster);
}
