import { ImageResponse } from 'next/og';
import { type NextRequest } from 'next/server';
import { UPCOMING_MEETINGS, PAST_MEETINGS } from '@/lib/data';
import type { Meeting } from '@/lib/data';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PETAL_PATH =
  'M 0 -56 C 6 -52 9 -44 8 -39 C 7 -35 4 -32 0 -32 ' +
  'C -4 -32 -7 -35 -8 -39 C -9 -44 -6 -52 0 -56 Z';
const PETAL_ANGLES = [0, 60, 120, 180, 240, 300];

// Cache fonts across warm requests — loaded from public/fonts/ (Node.js fs, WOFF format; Satori supports WOFF but not WOFF2)
let _reg: ArrayBuffer | null = null;
let _bold: ArrayBuffer | null = null;

async function loadFonts() {
  if (!_reg || !_bold) {
    const regBuf = readFileSync(join(process.cwd(), 'public/fonts/Inter-Regular.woff'));
    const boldBuf = readFileSync(join(process.cwd(), 'public/fonts/Inter-Bold.woff'));
    _reg = regBuf.buffer.slice(regBuf.byteOffset, regBuf.byteOffset + regBuf.byteLength) as ArrayBuffer;
    _bold = boldBuf.buffer.slice(boldBuf.byteOffset, boldBuf.byteOffset + boldBuf.byteLength) as ArrayBuffer;
  }
  return { reg: _reg!, bold: _bold! };
}

function toDataImg(buf: Buffer, mime = 'image/png') {
  return `data:${mime};base64,${buf.toString('base64')}`;
}

export async function GET(req: NextRequest) {
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

  // Load fonts
  const { reg, bold } = await loadFonts();

  // Speaker photo → base64 data URL (from private blob)
  let speakerSrc: string | null = null;
  if (meeting.speakerPhoto) {
    try {
      const { head } = await import('@vercel/blob');
      const info = await head(meeting.speakerPhoto);
      const res = await fetch(info.downloadUrl);
      const buf = await res.arrayBuffer();
      const mime = res.headers.get('content-type') ?? 'image/jpeg';
      speakerSrc = `data:${mime};base64,${Buffer.from(buf).toString('base64')}`;
    } catch { /* ignore if photo not yet uploaded */ }
  }

  // Karmanos photo → base64 from public assets (Node.js fs, not available on edge)
  let karmanosSrc: string | null = null;
  if (meeting.showKarmanos !== false) {
    try {
      const p = join(process.cwd(), 'public/assets/danialle-karmanos.png');
      if (existsSync(p)) karmanosSrc = toDataImg(readFileSync(p));
    } catch { /* ignore */ }
  }

  const topic = meeting.topic ?? `${meeting.quarter} Meeting`;
  const topicSize = topic.length > 80 ? 42 : topic.length > 60 ? 50 : topic.length > 40 ? 58 : 68;
  const hasSpeaker = !!(speakerSrc || meeting.topicPresenter);

  // Initials fallback for speaker avatar
  const initials = (meeting.topicPresenter ?? '')
    .replace(/^Dr\.?\s*/i, '')
    .split(' ')
    .map((w: string) => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const dateStr = meeting.day !== '—'
    ? `${meeting.weekday !== 'Date TBD' ? meeting.weekday + ', ' : ''}${meeting.month} ${meeting.day}, ${meeting.year}`
    : `${meeting.year} — Date TBD`;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1080,
          background: '#1F1535',
          display: 'flex',
          flexDirection: 'column',
          padding: '64px 72px',
          fontFamily: 'Inter',
          color: 'white',
        }}
      >

        {/* ── HEADER: logo + quarter badge ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* BloomMark at 72px — "MMC" overlaid as HTML (Satori doesn't support SVG <text>) */}
            <div style={{ position: 'relative', width: 72, height: 72, marginRight: 20, flexShrink: 0, display: 'flex' }}>
              <svg width="72" height="72" viewBox="-65 -65 130 130">
                {PETAL_ANGLES.map(a => (
                  <path key={a} d={PETAL_PATH} fill="#9B6FFF" transform={`rotate(${a})`} />
                ))}
                <circle r="30" fill="none" stroke="white" strokeWidth="1.8" />
              </svg>
              <div style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 700,
                color: 'white',
                letterSpacing: '-0.5px',
              }}>
                MMC
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ display: 'flex', fontSize: 15, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>
                MICHIGAN MENOPAUSE
              </span>
              <span style={{ display: 'flex', fontSize: 15, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>
                COLLABORATIVE
              </span>
            </div>
          </div>
          <div
            style={{
              background: 'rgba(155,111,255,0.18)',
              border: '1.5px solid rgba(155,111,255,0.45)',
              borderRadius: 100,
              padding: '10px 24px',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.09em',
              color: '#B491FF',
              display: 'flex',
            }}
          >
            {meeting.quarter.toUpperCase()}
          </div>
        </div>

        {/* Hairline */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', marginBottom: 52 }} />

        {/* ── TOPIC + DATE ── */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <span style={{ display: 'flex', fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(155,111,255,0.85)', marginBottom: 20 }}>
            UPCOMING MEETING
          </span>
          <span style={{ display: 'flex', fontSize: topicSize, fontWeight: 700, lineHeight: 1.15, color: 'white', marginBottom: 32 }}>
            {topic}
          </span>
          <span style={{ display: 'flex', fontSize: 20, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
            {dateStr}
          </span>
          <span style={{ display: 'flex', fontSize: 20, color: 'rgba(255,255,255,0.6)' }}>
            {meeting.time}
          </span>
        </div>

        {/* ── SPEAKER (horizontal row) ── */}
        {hasSpeaker && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 44, marginBottom: 44 }}>
            {speakerSrc ? (
              <img
                src={speakerSrc}
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid rgba(155,111,255,0.5)',
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: '50%',
                  background: 'rgba(155,111,255,0.14)',
                  border: '3px solid rgba(155,111,255,0.38)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 30,
                  fontWeight: 700,
                  color: '#9B6FFF',
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
            )}
            {meeting.topicPresenter && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ display: 'flex', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
                  PRESENTING
                </span>
                <span style={{ display: 'flex', fontSize: 24, fontWeight: 700, color: 'white' }}>
                  {meeting.topicPresenter}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Hairline */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', marginBottom: 28 }} />

        {/* ── FOOTER: Karmanos photo LEFT of location text ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {karmanosSrc && meeting.showKarmanos !== false && (
            <img
              src={karmanosSrc}
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid rgba(255,255,255,0.18)',
                flexShrink: 0,
              }}
            />
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ display: 'flex', fontSize: 17, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: 5 }}>
              {meeting.locationShort}
            </span>
            {meeting.showKarmanos !== false && (
              <span style={{ display: 'flex', fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
                With special thanks to Danialle Karmanos for hosting
              </span>
            )}
          </div>
        </div>

      </div>
    ),
    {
      width: 1080,
      height: 1080,
      fonts: [
        { name: 'Inter', data: reg, weight: 400, style: 'normal' },
        { name: 'Inter', data: bold, weight: 700, style: 'normal' },
      ],
    }
  );
}
