'use client';

import * as React from 'react';
import type { Meeting } from '@/lib/data';

const NAVY = '#1F1535';
const ACCENT = '#6B3FCB';
const PAPER = '#F7F4FB';
const PAPER_2 = '#E8DEF7';
const INK_SOFT = '#7A6E96';
const LOGO_URL = 'https://michiganmenopause.com/assets/mmc-logo.png';
const RSVP_URL = 'https://michiganmenopause.com/rsvp';

function articlePdfUrl(m: Meeting): string | null {
  if (!m.articleUrl) return null;
  return `https://michiganmenopause.com/api/pdf?url=${encodeURIComponent(m.articleUrl)}`;
}

function defaultSubject(m: Meeting): string {
  return `Reminder: MMC ${m.quarter} meeting is coming up`;
}

function defaultIntro(m: Meeting): string {
  const base = `Hi — a quick reminder that our next Michigan Menopause Collaborative meeting is coming up. Details are below`;
  return m.articleUrl
    ? `${base}, along with the discussion article for this session — please give it a read beforehand.`
    : `${base}.`;
}

function buildEmailHtml(args: {
  subject: string;
  intro: string;
  meeting: Meeting;
  includeRsvp: boolean;
  includeArticle: boolean;
}): string {
  const { subject, intro, meeting: m, includeRsvp, includeArticle } = args;
  const dateStr = `${m.weekday}, ${m.month} ${m.day}, ${m.year}`;
  const locationHtml = m.location.split('\n').join('<br>');
  const introHtml = intro.split('\n').join('<br>');
  const pdfUrl = articlePdfUrl(m);

  const topicRow = m.topic
    ? `<tr>
        <td style="padding:8px 14px 8px 0;color:${INK_SOFT};font-size:13px;white-space:nowrap;vertical-align:top;font-family:Arial,Helvetica,sans-serif">Topic</td>
        <td style="padding:8px 0;font-size:14px;color:${NAVY};font-family:Arial,Helvetica,sans-serif">${m.topic}${m.topicPresenter ? ` — ${m.topicPresenter}` : ''}</td>
      </tr>`
    : '';

  const rsvpButton = includeRsvp
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:26px"><tr><td>
        <a href="${RSVP_URL}" style="display:inline-block;background:${ACCENT};color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;padding:12px 26px;border-radius:8px">RSVP for this meeting &rarr;</a>
      </td></tr></table>`
    : '';

  const articleSection =
    includeArticle && m.articleTitle
      ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:22px;background:${PAPER};border:1px solid ${PAPER_2};border-radius:10px">
          <tr>
            <td style="padding:18px 20px">
              <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${ACCENT};margin-bottom:8px">Discussion article</div>
              <div style="font-size:15px;font-weight:bold;color:${NAVY};font-family:Arial,Helvetica,sans-serif;margin-bottom:${pdfUrl ? '14' : '0'}px">${m.articleTitle}</div>
              ${
                pdfUrl
                  ? `<a href="${pdfUrl}" style="display:inline-block;background:#ffffff;color:${ACCENT};text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;padding:9px 18px;border-radius:8px;border:1.5px solid ${ACCENT}">Download PDF &rarr;</a>`
                  : ''
              }
            </td>
          </tr>
        </table>`
      : '';

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${PAPER};font-family:Arial,Helvetica,sans-serif"><tr><td align="center" style="padding:24px 12px">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid ${PAPER_2}">
    <tr>
      <td style="background:#ffffff;padding:26px 32px 22px">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="padding-right:12px"><img src="${LOGO_URL}" width="40" height="40" alt="MMC" style="display:block"></td>
          <td style="color:${NAVY};font-size:16px;font-weight:bold;font-family:Arial,Helvetica,sans-serif;letter-spacing:-0.2px">Michigan Menopause Collaborative</td>
        </tr></table>
      </td>
    </tr>
    <tr><td style="background:${ACCENT};height:4px;line-height:4px;font-size:0">&nbsp;</td></tr>
    <tr>
      <td style="padding:32px">
        <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${ACCENT};margin-bottom:10px">MMC &middot; ${m.quarter} Meeting</div>
        <h2 style="margin:0 0 16px;font-size:21px;font-weight:bold;color:${NAVY};font-family:Arial,Helvetica,sans-serif">${subject}</h2>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:${NAVY};font-family:Arial,Helvetica,sans-serif">${introHtml}</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid ${PAPER_2};padding-top:4px">
          <tr>
            <td style="padding:12px 14px 8px 0;color:${INK_SOFT};font-size:13px;white-space:nowrap;vertical-align:top;font-family:Arial,Helvetica,sans-serif">Date</td>
            <td style="padding:12px 0 8px;font-size:14px;color:${NAVY};font-family:Arial,Helvetica,sans-serif">${dateStr}</td>
          </tr>
          <tr>
            <td style="padding:8px 14px 8px 0;color:${INK_SOFT};font-size:13px;white-space:nowrap;vertical-align:top;font-family:Arial,Helvetica,sans-serif">Time</td>
            <td style="padding:8px 0;font-size:14px;color:${NAVY};font-family:Arial,Helvetica,sans-serif">${m.time} Eastern</td>
          </tr>
          <tr>
            <td style="padding:8px 14px 8px 0;color:${INK_SOFT};font-size:13px;white-space:nowrap;vertical-align:top;font-family:Arial,Helvetica,sans-serif">Location</td>
            <td style="padding:8px 0;font-size:14px;color:${NAVY};font-family:Arial,Helvetica,sans-serif">${locationHtml}</td>
          </tr>
          ${topicRow}
        </table>
        ${articleSection}
        ${rsvpButton}
      </td>
    </tr>
    <tr>
      <td style="padding:18px 32px;border-top:1px solid ${PAPER_2};font-size:12px;color:${INK_SOFT};font-family:Arial,Helvetica,sans-serif">
        Michigan Menopause Collaborative &middot; michiganmenopause.com
      </td>
    </tr>
  </table>
</td></tr></table>`;
}

function buildPlainText(args: {
  subject: string;
  intro: string;
  meeting: Meeting;
  includeRsvp: boolean;
  includeArticle: boolean;
}): string {
  const { intro, meeting: m, includeRsvp, includeArticle } = args;
  const dateStr = `${m.weekday}, ${m.month} ${m.day}, ${m.year}`;
  const pdfUrl = articlePdfUrl(m);
  return [
    intro,
    '',
    `Date: ${dateStr}`,
    `Time: ${m.time} Eastern`,
    `Location: ${m.location.replace(/\n/g, ', ')}`,
    m.topic ? `Topic: ${m.topic}${m.topicPresenter ? ` — ${m.topicPresenter}` : ''}` : '',
    includeArticle && m.articleTitle ? `Discussion article: ${m.articleTitle}` : '',
    includeArticle && pdfUrl ? `Download: ${pdfUrl}` : '',
    '',
    includeRsvp ? `RSVP: ${RSVP_URL}` : '',
    '',
    'Michigan Menopause Collaborative · michiganmenopause.com',
  ]
    .filter(Boolean)
    .join('\n');
}

export function EmailTemplateBuilder({ meetings }: { meetings: Meeting[] }) {
  const initialMeeting = meetings[0];

  const [meetingId, setMeetingId] = React.useState(initialMeeting?.id ?? '');
  const [subject, setSubject] = React.useState(initialMeeting ? defaultSubject(initialMeeting) : '');
  const [intro, setIntro] = React.useState(initialMeeting ? defaultIntro(initialMeeting) : '');
  const [includeRsvp, setIncludeRsvp] = React.useState(initialMeeting?.rsvpOpen ?? true);
  const [includeArticle, setIncludeArticle] = React.useState(!!initialMeeting?.articleUrl);
  const [copyStatus, setCopyStatus] = React.useState<'idle' | 'copied' | 'failed'>('idle');
  const [subjectCopyStatus, setSubjectCopyStatus] = React.useState<'idle' | 'copied'>('idle');

  const previewRef = React.useRef<HTMLDivElement>(null);

  const meeting = meetings.find(m => m.id === meetingId) ?? initialMeeting;

  function handleMeetingChange(id: string) {
    const m = meetings.find(mm => mm.id === id);
    setMeetingId(id);
    if (m) {
      setSubject(defaultSubject(m));
      setIntro(defaultIntro(m));
      setIncludeRsvp(m.rsvpOpen ?? true);
      setIncludeArticle(!!m.articleUrl);
    }
  }

  const html = meeting ? buildEmailHtml({ subject, intro, meeting, includeRsvp, includeArticle }) : '';
  const text = meeting ? buildPlainText({ subject, intro, meeting, includeRsvp, includeArticle }) : '';
  const pdfUrl = meeting ? articlePdfUrl(meeting) : null;

  async function handleCopy() {
    setCopyStatus('idle');
    try {
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
      // Fallback: select the rendered preview and use the browser's own copy command.
      const node = previewRef.current;
      if (!node) {
        setCopyStatus('failed');
        return;
      }
      const range = document.createRange();
      range.selectNodeContents(node);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      try {
        const ok = document.execCommand('copy');
        setCopyStatus(ok ? 'copied' : 'failed');
      } catch {
        setCopyStatus('failed');
      }
      sel?.removeAllRanges();
    }
  }

  async function handleCopySubject() {
    try {
      await navigator.clipboard.writeText(subject);
      setSubjectCopyStatus('copied');
    } catch {
      setSubjectCopyStatus('idle');
    }
  }

  React.useEffect(() => {
    if (copyStatus === 'copied') {
      const t = setTimeout(() => setCopyStatus('idle'), 2500);
      return () => clearTimeout(t);
    }
  }, [copyStatus]);

  React.useEffect(() => {
    if (subjectCopyStatus === 'copied') {
      const t = setTimeout(() => setSubjectCopyStatus('idle'), 2500);
      return () => clearTimeout(t);
    }
  }, [subjectCopyStatus]);

  const label: React.CSSProperties = {
    fontFamily: 'var(--font-plex-mono), monospace',
    fontSize: 11,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#5a5168',
    display: 'block',
    marginBottom: 6,
  };
  const input: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #d8d3e8',
    borderRadius: 8,
    fontSize: 15,
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  if (!meeting) {
    return <p style={{ color: '#7a6e8a', fontSize: 14 }}>Add a meeting first to build an invite email.</p>;
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={label}>Meeting</label>
          <select value={meetingId} onChange={e => handleMeetingChange(e.target.value)} style={input}>
            {meetings.map(m => (
              <option key={m.id} value={m.id}>
                {m.quarter} — {m.month} {m.day}, {m.year}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={label}>Subject line</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={subject} onChange={e => setSubject(e.target.value)} style={input} />
            <button
              type="button"
              onClick={handleCopySubject}
              style={{
                background: 'none',
                border: '1.5px solid #d8d3e8',
                borderRadius: 8,
                padding: '0 14px',
                fontSize: 13,
                color: '#5a5168',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {subjectCopyStatus === 'copied' ? 'Copied ✓' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={label}>Intro message</label>
        <textarea
          value={intro}
          onChange={e => setIntro(e.target.value)}
          rows={3}
          style={{ ...input, resize: 'vertical' }}
        />
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer', marginBottom: 12 }}>
        <input type="checkbox" checked={includeRsvp} onChange={e => setIncludeRsvp(e.target.checked)} />
        Include RSVP button
      </label>

      {meeting.articleTitle && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer', marginBottom: 20 }}>
          <input type="checkbox" checked={includeArticle} onChange={e => setIncludeArticle(e.target.checked)} />
          Include discussion article ({meeting.articleTitle})
        </label>
      )}

      <div style={{ marginBottom: 16, padding: '14px 18px', background: '#F5F3FB', borderRadius: 8, fontSize: 13, color: '#5a5168', lineHeight: 1.5 }}>
        Click <strong>Copy email</strong>, then open a new message in Gmail, click into the body, and paste (Cmd/Ctrl+V).
        The formatting, colors, and logo will carry over. If the paste ever looks off, click inside the preview below,
        select all (Cmd/Ctrl+A), and copy (Cmd/Ctrl+C) instead.
        {pdfUrl && (
          <>
            {' '}A <strong>Download PDF</strong> button is built into the email itself, so attendees can grab the
            article without you attaching anything. If you&apos;d rather send it as a real Gmail attachment,{' '}
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#6D3BE4', fontWeight: 500 }}>
              download the PDF here
            </a>{' '}
            first, then attach it in Gmail with the paperclip icon.
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            background: '#6D3BE4',
            color: 'white',
            padding: '10px 22px',
            borderRadius: 8,
            border: 'none',
            fontSize: 15,
            cursor: 'pointer',
            fontWeight: 500,
            fontFamily: 'inherit',
          }}
        >
          {copyStatus === 'copied' ? 'Copied ✓' : 'Copy email'}
        </button>
        {copyStatus === 'failed' && (
          <span style={{ fontSize: 13, color: '#c0392b' }}>
            Couldn&apos;t copy automatically — select the preview below and press Cmd/Ctrl+C.
          </span>
        )}
      </div>

      <label style={label}>Preview</label>
      <div
        ref={previewRef}
        contentEditable
        suppressContentEditableWarning
        style={{ border: '1.5px solid #d8d3e8', borderRadius: 8, overflow: 'hidden', cursor: 'text' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
