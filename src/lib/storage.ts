import { promises as fs } from "node:fs";
import path from "node:path";

// Vercel's filesystem is read-only except /tmp; use that in production.
const DATA_DIR = process.env.VERCEL
  ? "/tmp/mmc-data"
  : path.join(process.cwd(), "data");

export type SubmissionKind = "rsvp" | "case";

export type StoredSubmission = {
  kind: SubmissionKind;
  receivedAt: string;
  payload: Record<string, unknown>;
};

/**
 * Append a JSON-line submission to data/<kind>.jsonl.
 * Created on first call. Used as a local audit log + offline fallback when
 * email delivery is not configured.
 */
export async function appendSubmission(s: StoredSubmission): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const file = path.join(DATA_DIR, `${s.kind}.jsonl`);
  await fs.appendFile(file, JSON.stringify(s) + "\n", "utf8");
}
