import { ImageResponse } from 'next/og';
import { type NextRequest } from 'next/server';
import { UPCOMING_MEETINGS, PAST_MEETINGS } from '@/lib/data';
import type { Meeting } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

const PETAL_PATH =
  'M 0 -56 C 6 -52 9 -44 8 -39 C 7 -35 4 -32 0 -32 ' +
  'C -4 -32 -7 -35 -8 -39 C -9 -44 -6 -52 0 -56 Z';
const PETAL_ANGLES = [0, 60, 120, 180, 240, 300];

// Font cache — warm across requests in the same Edge instance
let _reg: ArrayBuffer | null = null;
let _bold: ArrayBuffer | null = null;
let _med: ArrayBuffer | null = null;

const JSDELIVR = 'https://cdn.jsdelivr.net/npm/@fontsource/dm-sans@5.1.1/files';
const SITE = 'https://www.michiganmenopause.com';
// Private blob store — matches admin-db.ts BLOB_BASE
const BLOB_BASE = 'https://bfbwrnmnnw2zzg0c.private.blob.vercel-storage.com';

async function fetchBuf(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch failed: ${url} → ${res.status}`);
  return res.arrayBuffer();
}

async function loadFonts() {
  if (!_reg || !_bold || !_med) {
    [_reg, _med, _bold] = await Promise.all([
      fetchBuf(`${JSDELIVR}/dm-sans-latin-400-normal.woff`),
      fetchBuf(`${JSDELIVR}/dm-sans-latin-500-normal.woff`),
      fetchBuf(`${JSDELIVR}/dm-sans-latin-700-normal.woff`),
    ]);
  }
  return { reg: _reg!, med: _med!, bold: _bold! };
}

// ArrayBuffer → base64 data URL (Web API only — no Buffer/Node.js)
function toDataImg(ab: ArrayBuffer, mime = 'image/png'): string {
  const bytes = new Uint8Array(ab);
  let bin = '';
  const CHUNK = 8192;
  for (let i = 0; i < bytes.byteLength; i += CHUNK) {
    bin += String.fromCharCode(...(bytes.subarray(i, i + CHUNK) as unknown as number[]));
  }
  return `data:${mime};base64,${btoa(bin)}`;
}

// Fetch a private Vercel Blob URL directly with Bearer auth.
// This mirrors what @vercel/blob get() does internally (it uses undici.fetch with
// the same auth header). @vercel/blob cannot be imported on Edge runtime because
// it bundles Node.js-only deps (stream, is-buffer, undici).
async function fetchPrivateBlob(blobUrl: string, token: string): Promise<Response> {
  return fetch(blobUrl, { headers: { authorization: `Bearer ${token}` } });
}

// Read a private blob JSON file without the SDK.
async function readBlobJson<T>(pathname: string, fallback: T, token: string): Promise<T> {
  try {
    const res = await fetchPrivateBlob(`${BLOB_BASE}/${pathname}`, token);
    if (!res.ok) return fallback;
    return res.json() as Promise<T>;
  } catch {
    return fallback;
  }
}

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return new Response('Missing ?id', { status: 400 });

    const token = process.env.BLOB_READ_WRITE_TOKEN ?? '';
    const staticAll = [...UPCOMING_MEETINGS, ...PAST_MEETINGS];

    // Fetch meeting data directly from Vercel Blob — no @vercel/blob SDK (not edge-safe)
    let allMeetings = staticAll;
    if (token) {
      const stored = await readBlobJson<Meeting[]>('mmc/meetings.json', staticAll, token);
      // Merge: blob wins on any key it sets; static fills gaps (same logic as admin-db)
      allMeetings = stored.map(m => {
        const def = staticAll.find(s => s.id === m.id);
        return def ? { ...def, ...m } : m;
      });
    }
    const meeting = allMeetings.find(m => m.id === id) ?? staticAll.find(m => m.id === id);
    if (!meeting) return new Response('Meeting not found', { status: 404 });

    // Load fonts from jsDelivr CDN (WOFF — Satori rejects WOFF2)
    const { reg, med, bold } = await loadFonts();

    // Speaker photo → base64 data URL.
    // Private Vercel Blob URLs need bearer auth + token; public URLs and site-relative
    // paths (e.g. "/assets/eva-alsheik.png") are fetched directly so they render without
    // the blob token (works in local dev and prod alike).
    let speakerSrc: string | null = null;
    if (meeting.speakerPhoto) {
      try {
        const photoUrl = meeting.speakerPhoto.startsWith('http')
          ? meeting.speakerPhoto
          : new URL(meeting.speakerPhoto, req.nextUrl.origin).toString();
        const isPrivateBlob = photoUrl.startsWith(BLOB_BASE);
        const imgRes = isPrivateBlob
          ? (token ? await fetchPrivateBlob(photoUrl, token) : null)
          : await fetch(photoUrl);
        if (imgRes && imgRes.ok) {
          const mime = imgRes.headers.get('content-type') ?? 'image/jpeg';
          speakerSrc = toDataImg(await imgRes.arrayBuffer(), mime);
        }
      } catch { /* ignore — photo not accessible */ }
    }

    // Karmanos headshot → fetch from live site
    let karmanosSrc: string | null = null;
    if (meeting.showKarmanos !== false) {
      try {
        const res = await fetch(`${SITE}/assets/danialle-karmanos.png`);
        if (res.ok) karmanosSrc = toDataImg(await res.arrayBuffer());
      } catch { /* ignore */ }
    }

    const topic = meeting.topic ?? '';
    const cTopicSize = topic.length > 64 ? 30 : topic.length > 44 ? 34 : 40;
    const hasSpeaker = !!(speakerSrc || meeting.topicPresenter);

    const initials = (meeting.topicPresenter ?? '')
      .replace(/^Dr\.?\s*/i, '')
      .split(' ')
      .map((w: string) => w[0] ?? '')
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const dateStr = meeting.day !== '—'
      ? `${meeting.weekday !== 'Date TBD' ? meeting.weekday + ', ' : ''}${meeting.month} ${meeting.day}`
      : 'Date TBD';
    const dateLine = meeting.day !== '—' ? `${dateStr} · ${meeting.time}` : dateStr;
    const season = meeting.quarter.split(' ')[0] || meeting.quarter;
    const eyebrowLabel = `${season} Meeting`.toUpperCase();

    // Brand tokens
    const INK    = '#1F1535';
    const ACCENT = '#6D3BE4';
    const PAPER  = '#F6F2EB';

    return new ImageResponse(
      (
        <div style={{ width: 1080, height: 1080, display: 'flex', flexDirection: 'column', fontFamily: 'DM Sans' }}>

          {/* ── UPPER LIGHT SECTION (Option C) ── */}
          <div style={{ background: PAPER, display: 'flex', flexDirection: 'column', flex: 1, padding: '64px 64px 0', position: 'relative' }}>

            {/* WATERMARK — large faded BloomMark, petals + circle, no text */}
            <div style={{ position: 'absolute', right: -140, bottom: -140, display: 'flex', opacity: 0.08 }}>
              <svg width="820" height="820" viewBox="-65 -65 130 130">
                {PETAL_ANGLES.map(a => (
                  <path key={a} d={PETAL_PATH} fill={ACCENT} transform={`rotate(${a})`} />
                ))}
                <circle r="30" fill="none" stroke={ACCENT} strokeWidth="1.5" />
              </svg>
            </div>

            {/* BIG HORIZONTAL LOCKUP — mark + wordmark, upper-left */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 34, marginBottom: 48 }}>
              <div style={{ position: 'relative', width: 204, height: 204, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="204" height="204" viewBox="-65 -65 130 130" style={{ position: 'absolute', top: 0, left: 0, display: 'flex' }}>
                  {PETAL_ANGLES.map(a => (
                    <g key={a} transform={`rotate(${a})`}>
                      <path d={PETAL_PATH} fill={ACCENT} />
                    </g>
                  ))}
                  <circle r="30" fill="none" stroke={INK} strokeWidth="1.8" />
                </svg>
                <span style={{ display: 'flex', position: 'relative', fontSize: 29, fontWeight: 700, color: INK, letterSpacing: '-0.02em' }}>MMC</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ display: 'flex', fontSize: 56, fontWeight: 500, letterSpacing: '-0.02em', color: INK, lineHeight: 1.04 }}>Michigan Menopause</span>
                <span style={{ display: 'flex', fontSize: 56, fontWeight: 500, letterSpacing: '-0.02em', color: INK, lineHeight: 1.04 }}>Collaborative</span>
              </div>
            </div>

            {/* MISSION TAGLINE */}
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: 32, fontWeight: 700, color: INK, lineHeight: 1.3 }}>
              <span style={{ display: 'flex' }}>Join the clinicians elevating the care</span>
              <span style={{ display: 'flex' }}>of midlife women in Southeast Michigan.</span>
            </div>

            {/* MEET BLOCK — date / topic / speaker, stacked top-down */}
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 52 }}>

              {/* SUMMER MEETING + date */}
              <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 34 }}>
                <span style={{ display: 'flex', fontSize: 15, fontWeight: 700, letterSpacing: '0.18em', color: ACCENT, marginBottom: 14 }}>{eyebrowLabel}</span>
                <span style={{ display: 'flex', fontSize: 34, fontWeight: 700, color: INK }}>{dateLine}</span>
              </div>

              {/* FEATURED TOPIC */}
              {meeting.topic && (
                <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 36 }}>
                  <span style={{ display: 'flex', fontSize: 15, fontWeight: 700, letterSpacing: '0.18em', color: ACCENT, marginBottom: 14 }}>FEATURED TOPIC</span>
                  <span style={{ display: 'flex', fontSize: cTopicSize, fontWeight: 700, lineHeight: 1.12, color: INK }}>{topic}</span>
                </div>
              )}

              {/* PRESENTING — speaker */}
              {hasSpeaker && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  {speakerSrc ? (
                    <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: `3px solid ${ACCENT}`, display: 'flex' }}>
                      <img src={speakerSrc} style={{ width: 80, height: 80, objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{
                      width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
                      background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 28, fontWeight: 700, color: 'white',
                    }}>{initials}</div>
                  )}
                  {meeting.topicPresenter && (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ display: 'flex', fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', color: ACCENT, marginBottom: 6 }}>PRESENTING</span>
                      <span style={{ display: 'flex', fontSize: 26, fontWeight: 700, color: INK }}>{meeting.topicPresenter}</span>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* ── DARK BOTTOM BAND — url / location / karmanos ── */}
          <div style={{
            background: INK, display: 'flex', alignItems: 'center',
            padding: '32px 72px',
          }}>
            {/* URL */}
            <div style={{ display: 'flex', flex: 1 }}>
              <span style={{ display: 'flex', fontSize: 24, fontWeight: 700, color: 'white' }}>michiganmenopause.com</span>
            </div>
            {/* Vertical rule */}
            <div style={{ width: 1, height: 64, background: 'rgba(255,255,255,0.18)', flexShrink: 0, marginRight: 48, marginLeft: 0 }} />
            {/* Location + karmanos */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              {karmanosSrc && meeting.showKarmanos !== false && (
                <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(255,255,255,0.25)', display: 'flex' }}>
                  <img src={karmanosSrc} style={{ width: 56, height: 56, objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {meeting.location.split('\n').map((line: string, i: number) => (
                  <span key={i} style={{ display: 'flex', fontSize: i === 0 ? 22 : 18, fontWeight: i === 0 ? 700 : 400, color: 'white', marginBottom: i === 0 ? 5 : 0 }}>{line}</span>
                ))}
                {meeting.showKarmanos !== false && (
                  <span style={{ display: 'flex', fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 8 }}>Thanks to Danialle Karmanos for donating the use of her space for our gathering!</span>
                )}
              </div>
            </div>
          </div>

        </div>
      ),
      {
        width: 1080,
        height: 1080,
        fonts: [
          { name: 'DM Sans', data: reg, weight: 400, style: 'normal' },
          { name: 'DM Sans', data: med, weight: 500, style: 'normal' },
          { name: 'DM Sans', data: bold, weight: 700, style: 'normal' },
        ],
      }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
    console.error('[og] render error:', msg);
    return new Response(`OG error: ${msg}`, { status: 500, headers: { 'content-type': 'text/plain' } });
  }
}
