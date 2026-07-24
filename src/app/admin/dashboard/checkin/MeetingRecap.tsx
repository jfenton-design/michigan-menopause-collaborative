'use client';
import * as React from 'react';
import type { Meeting } from '@/lib/data';

const NAVY = '#1F1535';
const ACCENT = '#6B3FCB';
const PAPER = '#F7F4FB';
const PAPER_2 = '#E8DEF7';
const INK_SOFT = '#7A6E96';
const LOGO_URL = 'https://michiganmenopause.com/assets/mmc-logo.png';

function defaultRecapSubject(m: Meeting): string {
  return `Thank you — recap from our ${m.quarter} meeting`;
}
function defaultRecapIntro(m: Meeting): string {
  const topic = m.topic ? ` on ${m.topic.charAt(0).toLowerCase() + m.topic.slice(1)}` : '';
  return (
    `Thank you for joining us at the Michigan Menopause Collaborative ${m.quarter} meeting${topic}. ` +
    `It was a rich discussion, and we're grateful for the expertise each of you brought to the room.\n\n` +
    `A few highlights and follow-ups from the evening:`
  );
}

function buildRecapHtml(m: Meeting, subject: string, intro: string, bullets: string[]): string {
  const introHtml = intro.split('\n').map(l => l || '&nbsp;').join('<br>');
  const bulletList = bullets.filter(b => b.trim()).length
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:20px">${bullets
        .filter(b => b.trim())
        .map(
          b =>
            `<tr><td style="padding:6px 0;vertical-align:top;width:22px;color:${ACCENT};font-size:15px;font-family:Arial,Helvetica,sans-serif">•</td><td style="padding:6px 0;font-size:15px;line-height:1.55;color:${NAVY};font-family:Arial,Helvetica,sans-serif">${b}</td></tr>`,
        )
        .join('')}</table>`
    : '';

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${PAPER};font-family:Arial,Helvetica,sans-serif"><tr><td align="center" style="padding:24px 12px">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid ${PAPER_2}">
    <tr>
      <td style="background:#ffffff;padding:26px 32px 22px">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="padding-right:12px"><img src="${LOGO_URL}" width="40" height="40" alt="MMC" style="display:block;width:40px;height:40px"></td>
          <td style="color:${NAVY};font-size:16px;font-weight:bold;font-family:Arial,Helvetica,sans-serif;letter-spacing:-0.2px">Michigan Menopause Collaborative</td>
        </tr></table>
      </td>
    </tr>
    <tr><td style="background:${ACCENT};height:4px;line-height:4px;font-size:0">&nbsp;</td></tr>
    <tr>
      <td style="padding:32px">
        <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${ACCENT};margin-bottom:10px">${m.quarter} Meeting &middot; Recap</div>
        <h2 style="margin:0 0 16px;font-size:21px;font-weight:bold;color:${NAVY};font-family:Arial,Helvetica,sans-serif">${subject}</h2>
        <p style="margin:0;font-size:15px;line-height:1.6;color:${NAVY};font-family:Arial,Helvetica,sans-serif">${introHtml}</p>
        ${bulletList}
        <p style="margin:26px 0 0;font-size:15px;line-height:1.6;color:${NAVY};font-family:Arial,Helvetica,sans-serif">Warmly,<br>Dr. Carrie Leff<br><span style="color:${INK_SOFT};font-size:14px">President, Michigan Menopause Collaborative</span></p>
      </td>
    </tr>
    <tr>
      <td style="padding:22px 32px;border-top:1px solid ${PAPER_2};background:${PAPER}">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
          <td style="vertical-align:middle;padding-right:12px"><img src="${LOGO_URL}" width="36" height="36" alt="" style="display:block;width:36px;height:36px;border-radius:7px;opacity:0.95"></td>
          <td style="vertical-align:middle">
            <div style="font-size:13px;font-weight:bold;color:${NAVY};font-family:Arial,Helvetica,sans-serif">Michigan Menopause Collaborative</div>
            <div style="font-size:12px;color:${INK_SOFT};font-family:Arial,Helvetica,sans-serif">Midlife women&rsquo;s care, improved together</div>
          </td>
          <td style="vertical-align:middle;text-align:right"><a href="https://michiganmenopause.com" style="color:${ACCENT};font-size:13px;font-weight:bold;text-decoration:none;font-family:Arial,Helvetica,sans-serif">michiganmenopause.com</a></td>
        </tr></table>
      </td>
    </tr>
  </table>
</td></tr></table>`;
}

const label: React.CSSProperties = { fontFamily: 'var(--font-plex-mono), monospace', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5a5168', display: 'block', marginBottom: 6 };
const input: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1.5px solid #d8d3e8', borderRadius: 8, fontSize: 15, fontFamily: 'inherit', boxSizing: 'border-box' };
const brandBtn: React.CSSProperties = { background: '#6D3BE4', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', minHeight: 42 };
const ghostBtn: React.CSSProperties = { background: '#fff', border: '1.5px solid #d8d3e8', color: '#5a5168', borderRadius: 8, padding: '10px 18px', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', minHeight: 42 };
const miniCopy: React.CSSProperties = { border: '1.5px solid #d8d3e8', background: '#fff', color: '#5a5168', borderRadius: 8, padding: '0 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' };

/** Branded recap-email builder for a meeting's attendees. `emails` is the
 *  currently-selected audience (used for the recipient-copy convenience). */
export function MeetingRecap({ meeting, emails, onCopy }: { meeting: Meeting; emails: string[]; onCopy: (t: string, l: string) => void }) {
  const [subject, setSubject] = React.useState(defaultRecapSubject(meeting));
  const [intro, setIntro] = React.useState(defaultRecapIntro(meeting));
  const [bulletsText, setBulletsText] = React.useState('');
  const [copyStatus, setCopyStatus] = React.useState<'idle' | 'copied' | 'failed'>('idle');
  const previewRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setSubject(defaultRecapSubject(meeting));
    setIntro(defaultRecapIntro(meeting));
  }, [meeting]);

  React.useEffect(() => {
    if (copyStatus === 'copied' || copyStatus === 'failed') {
      const t = setTimeout(() => setCopyStatus('idle'), 2500);
      return () => clearTimeout(t);
    }
  }, [copyStatus]);

  const bullets = bulletsText.split('\n').map(b => b.trim()).filter(Boolean);
  const html = buildRecapHtml(meeting, subject, intro, bullets);

  async function handleCopyEmail() {
    try {
      const text = [intro, '', ...bullets.map(b => `• ${b}`), '', 'Warmly,', 'Dr. Carrie Leff', 'President, Michigan Menopause Collaborative', '', 'Michigan Menopause Collaborative · michiganmenopause.com'].join('\n');
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([text], { type: 'text/plain' }),
          }),
        ]);
        setCopyStatus('copied');
        return;
      }
      throw new Error('ClipboardItem unsupported');
    } catch {
      const node = previewRef.current;
      if (!node) { setCopyStatus('failed'); return; }
      const range = document.createRange();
      range.selectNodeContents(node);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      try {
        const ok = document.execCommand('copy');
        setCopyStatus(ok ? 'copied' : 'failed');
      } catch { setCopyStatus('failed'); }
      sel?.removeAllRanges();
    }
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: '22px 24px', marginTop: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 4px', color: '#1F1535' }}>Recap email</h2>
      <p style={{ fontSize: 13, color: '#7a6e8a', margin: '0 0 16px' }}>A branded thank-you for the {meeting.quarter} attendees. Edit, copy, and paste into Gmail.</p>

      <div style={{ display: 'grid', gap: 16 }}>
        <div>
          <label style={label}>Subject line</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input style={input} value={subject} onChange={e => setSubject(e.target.value)} />
            <button style={miniCopy} onClick={() => onCopy(subject, 'Copied subject')}>Copy</button>
          </div>
        </div>
        <div>
          <label style={label}>Opening message</label>
          <textarea style={{ ...input, resize: 'vertical' }} rows={4} value={intro} onChange={e => setIntro(e.target.value)} />
        </div>
        <div>
          <label style={label}>Highlights / follow-ups <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>(one bullet per line — leave blank to omit)</span></label>
          <textarea style={{ ...input, resize: 'vertical' }} rows={4} value={bulletsText} onChange={e => setBulletsText(e.target.value)} placeholder={'Meeting notes are posted on the Resources page\nNext meeting: Fall 2026, aligned with the Menopause Society conference\nHave a case to present? Submit it at michiganmenopause.com'} />
        </div>
      </div>

      <div style={{ marginTop: 18, padding: '14px 18px', background: '#F5F3FB', borderRadius: 8, fontSize: 13, color: '#5a5168', lineHeight: 1.55 }}>
        <strong>Two-click send:</strong> click <strong>Copy email</strong> below, open a new Gmail message, and paste (Cmd/Ctrl+V) into the body — the header, colors, and logo carry over.
        For recipients, use <strong>Copy {emails.length} recipient{emails.length === 1 ? '' : 's'}</strong> and paste into the <strong>Bcc</strong> field so attendees don&apos;t see each other&apos;s addresses.
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', margin: '16px 0 18px' }}>
        <button style={brandBtn} onClick={handleCopyEmail}>{copyStatus === 'copied' ? 'Copied ✓' : 'Copy email'}</button>
        <button
          style={emails.length === 0 ? { ...ghostBtn, opacity: 0.5, cursor: 'not-allowed' } : ghostBtn}
          disabled={emails.length === 0}
          onClick={() => onCopy(emails.join(', '), `Copied ${emails.length} recipient${emails.length === 1 ? '' : 's'}`)}
        >
          ⧉ Copy {emails.length} recipient{emails.length === 1 ? '' : 's'}
        </button>
        {copyStatus === 'failed' && <span style={{ fontSize: 13, color: '#c0392b' }}>Couldn&apos;t copy — select the preview and press Cmd/Ctrl+C.</span>}
      </div>

      <label style={label}>Preview</label>
      <div ref={previewRef} contentEditable suppressContentEditableWarning style={{ border: '1.5px solid #d8d3e8', borderRadius: 8, overflow: 'hidden', cursor: 'text' }} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
