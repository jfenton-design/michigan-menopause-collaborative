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

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return new Response('Missing ?id', { status: 400 });

    // Try blob-stored meeting data first, fall back to static
    let meeting: Meeting | undefined;
    try {
      const { getMeetings } = await import('@/lib/admin-db');
      meeting = (await getMeetings()).find(m => m.id === id);
    } catch { /* no blob token in local dev */ }
    if (!meeting) {
      meeting = [...UPCOMING_MEETINGS, ...PAST_MEETINGS].find(m => m.id === id);
    }
    if (!meeting) return new Response('Meeting not found', { status: 404 });

    // Load fonts from jsDelivr CDN (WOFF — Satori rejects WOFF2)
    const { reg, med, bold } = await loadFonts();

    // Speaker photo → base64 data URL (from private Vercel Blob)
    let speakerSrc: string | null = null;
    if (meeting.speakerPhoto) {
      try {
        const { head } = await import('@vercel/blob');
        const info = await head(meeting.speakerPhoto);
        const res = await fetch(info.downloadUrl);
        if (res.ok) {
          const mime = res.headers.get('content-type') ?? 'image/jpeg';
          speakerSrc = toDataImg(await res.arrayBuffer(), mime);
        }
      } catch { /* ignore — photo not uploaded yet or no token */ }
    }

    // Karmanos headshot → fetch from live site
    let karmanosSrc: string | null = null;
    if (meeting.showKarmanos !== false) {
      try {
        const res = await fetch(`${SITE}/assets/danialle-karmanos.png`);
        if (res.ok) karmanosSrc = toDataImg(await res.arrayBuffer());
      } catch { /* ignore */ }
    }

    // MMC logo → fetch from live site
    let logoSrc: string | null = null;
    try {
      const res = await fetch(`${SITE}/assets/mmc-logo.png`);
      if (res.ok) logoSrc = toDataImg(await res.arrayBuffer());
    } catch { /* ignore */ }

    const topic = meeting.topic ?? `${meeting.quarter} Meeting`;
    const topicSize = topic.length > 90 ? 52 : topic.length > 65 ? 62 : topic.length > 45 ? 74 : 88;
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

    // Brand tokens
    const INK    = '#1F1535';
    const ACCENT = '#6D3BE4';
    const PAPER  = '#F6F2EB';

    return new ImageResponse(
      (
        <div style={{ width: 1080, height: 1080, display: 'flex', flexDirection: 'column', fontFamily: 'DM Sans' }}>

          {/* ── UPPER LIGHT SECTION ── */}
          <div style={{ background: PAPER, display: 'flex', flexDirection: 'column', flex: 1, padding: '56px 72px 48px', position: 'relative' }}>

            {/* WATERMARK — large faded BloomMark, petals + circle, no text */}
            <div style={{ position: 'absolute', right: -140, bottom: -140, display: 'flex', opacity: 0.08 }}>
              <svg width="820" height="820" viewBox="-65 -65 130 130">
                {PETAL_ANGLES.map(a => (
                  <path key={a} d={PETAL_PATH} fill={ACCENT} transform={`rotate(${a})`} />
                ))}
                <circle r="30" fill="none" stroke={ACCENT} strokeWidth="1.5" />
              </svg>
            </div>

            {/* HEADER: big mark + name + quarter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 52 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                {logoSrc && (
                  <img src={logoSrc} width={88} height={88} style={{ flexShrink: 0 }} />
                )}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ display: 'flex', fontSize: 19, fontWeight: 500, letterSpacing: '-0.01em', color: INK, lineHeight: 1.4 }}>Michigan Menopause</span>
                  <span style={{ display: 'flex', fontSize: 19, fontWeight: 500, letterSpacing: '-0.01em', color: INK, lineHeight: 1.4 }}>Collaborative</span>
                </div>
              </div>
              <div style={{
                background: ACCENT, borderRadius: 8, padding: '10px 24px',
                fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: 'white', display: 'flex',
              }}>
                {meeting.quarter.toUpperCase()}
              </div>
            </div>

            {/* TAGLINE */}
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: 31, fontWeight: 700, color: INK, lineHeight: 1.25, marginBottom: 32 }}>
              <span style={{ display: 'flex' }}>Join the clinicians elevating the care of midlife women</span>
              <span style={{ display: 'flex' }}>in Southeast Michigan.</span>
            </div>

            {/* UPCOMING MEETING block — centered in remaining space */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>

              {/* EYEBROW */}
              <span style={{ display: 'flex', fontSize: 16, fontWeight: 700, letterSpacing: '0.18em', color: ACCENT, marginBottom: 24 }}>
                UPCOMING MEETING
              </span>

              {/* TOPIC — massive */}
              <span style={{ display: 'flex', fontSize: topicSize, fontWeight: 700, lineHeight: 1.08, color: INK, marginBottom: 32 }}>
                {topic}
              </span>

              {/* SPEAKER — directly under title */}
              {hasSpeaker && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  {speakerSrc ? (
                    <img src={speakerSrc} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', border: `3px solid ${ACCENT}`, flexShrink: 0 }} />
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

            {/* LEARN MORE — bottom right above dark strip */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <span style={{ display: 'flex', fontSize: 22, fontWeight: 700, color: ACCENT }}>
                michiganmenopause.com
              </span>
            </div>

          </div>

          {/* ── DARK BOTTOM BAND — date / location / karmanos ── */}
          <div style={{
            background: INK, display: 'flex', alignItems: 'center',
            padding: '32px 72px', gap: 0,
          }}>
            {/* Date + time */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <span style={{ display: 'flex', fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 6 }}>{dateStr}</span>
              <span style={{ display: 'flex', fontSize: 20, color: 'white' }}>{meeting.time}</span>
            </div>
            {/* Vertical rule */}
            <div style={{ width: 1, height: 64, background: 'rgba(255,255,255,0.18)', flexShrink: 0, marginRight: 48, marginLeft: 0 }} />
            {/* Location + karmanos */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              {karmanosSrc && meeting.showKarmanos !== false && (
                <img src={karmanosSrc} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', border: '2px solid rgba(255,255,255,0.25)', flexShrink: 0 }} />
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
