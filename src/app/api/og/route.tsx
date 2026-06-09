import { ImageResponse } from 'next/og';
import { type NextRequest } from 'next/server';
import { UPCOMING_MEETINGS, PAST_MEETINGS } from '@/lib/data';
import type { Meeting } from '@/lib/data';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

  // MMC logo PNG (pre-rendered from icon.svg so Satori gets a real image)
  let logoSrc: string | null = null;
  try {
    const p = join(process.cwd(), 'public/assets/mmc-logo.png');
    if (existsSync(p)) logoSrc = toDataImg(readFileSync(p));
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
      <div style={{ width: 1080, height: 1080, display: 'flex', flexDirection: 'column', fontFamily: 'Inter' }}>

        {/* ── UPPER LIGHT SECTION ── */}
        <div style={{ background: PAPER, display: 'flex', flexDirection: 'column', flex: 1, padding: '56px 72px 48px' }}>

          {/* HEADER: big mark + name + quarter */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 52 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              {logoSrc && (
                <img src={logoSrc} width={88} height={88} style={{ flexShrink: 0 }} />
              )}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ display: 'flex', fontSize: 19, fontWeight: 700, letterSpacing: '0.06em', color: INK, lineHeight: 1.4 }}>MICHIGAN MENOPAUSE</span>
                <span style={{ display: 'flex', fontSize: 19, fontWeight: 700, letterSpacing: '0.06em', color: INK, lineHeight: 1.4 }}>COLLABORATIVE</span>
              </div>
            </div>
            <div style={{
              background: ACCENT, borderRadius: 8, padding: '10px 24px',
              fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: 'white', display: 'flex',
            }}>
              {meeting.quarter.toUpperCase()}
            </div>
          </div>

          {/* EYEBROW */}
          <span style={{ display: 'flex', fontSize: 12, fontWeight: 700, letterSpacing: '0.22em', color: ACCENT, marginBottom: 20 }}>
            UPCOMING MEETING
          </span>

          {/* TOPIC — massive */}
          <span style={{ display: 'flex', fontSize: topicSize, fontWeight: 700, lineHeight: 1.08, color: INK, flex: 1 }}>
            {topic}
          </span>

          {/* SPEAKER ROW */}
          {hasSpeaker && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 36 }}>
              {speakerSrc ? (
                <img src={speakerSrc} style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: `4px solid ${ACCENT}`, flexShrink: 0 }} />
              ) : (
                <div style={{
                  width: 96, height: 96, borderRadius: '50%', flexShrink: 0,
                  background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32, fontWeight: 700, color: 'white',
                }}>{initials}</div>
              )}
              {meeting.topicPresenter && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ display: 'flex', fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', color: ACCENT, marginBottom: 8 }}>PRESENTING</span>
                  <span style={{ display: 'flex', fontSize: 28, fontWeight: 700, color: INK }}>{meeting.topicPresenter}</span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* ── DARK BOTTOM BAND — date / location / karmanos ── */}
        <div style={{
          background: INK, display: 'flex', alignItems: 'center',
          padding: '32px 72px', gap: 0,
        }}>
          {/* Date + time */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <span style={{ display: 'flex', fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 6 }}>{dateStr}</span>
            <span style={{ display: 'flex', fontSize: 18, color: 'rgba(255,255,255,0.55)' }}>{meeting.time}</span>
          </div>
          {/* Vertical rule */}
          <div style={{ width: 1, height: 64, background: 'rgba(255,255,255,0.18)', flexShrink: 0, marginRight: 48, marginLeft: 0 }} />
          {/* Location + karmanos */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {karmanosSrc && meeting.showKarmanos !== false && (
              <img src={karmanosSrc} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.25)', flexShrink: 0 }} />
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ display: 'flex', fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 4 }}>{meeting.locationShort}</span>
              {meeting.showKarmanos !== false && (
                <span style={{ display: 'flex', fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Hosted by Danialle Karmanos</span>
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
        { name: 'Inter', data: reg, weight: 400, style: 'normal' },
        { name: 'Inter', data: bold, weight: 700, style: 'normal' },
      ],
    }
  );
}
