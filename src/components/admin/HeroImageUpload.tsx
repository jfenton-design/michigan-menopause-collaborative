'use client';
import * as React from 'react';
import { s } from '@/components/admin/formStyles';

// Leaders can pick a photo up to this size; we downscale it in the browser
// before upload. Vercel caps Server Action request bodies at ~4.5 MB, so a
// large phone photo sent as-is would 413 — resizing to a web-sized hero keeps
// us safely under that and produces a correctly-sized image for the homepage.
const MAX_SRC_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_WIDTH = 2000;                 // recommended hero width
const JPEG_QUALITY = 0.85;

function sizeMb(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1);
}

// Decode → downscale (never upscale) → re-encode as JPEG. Runs entirely in the
// browser, honouring EXIF orientation.
async function downscaleToJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    const scale = Math.min(1, MAX_WIDTH / bitmap.width);
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob: Blob | null = await new Promise(res => canvas.toBlob(res, 'image/jpeg', JPEG_QUALITY));
    if (!blob) throw new Error('Image encoding failed');
    return blob;
  } finally {
    bitmap.close?.();
  }
}

/**
 * Hero-image uploader. Optimises the chosen photo in the browser (downscale +
 * JPEG re-encode) before handing it to the uploadHeroImage server action, so
 * any image up to 10 MB uploads cleanly instead of hitting Vercel's ~4.5 MB
 * Server Action body limit.
 */
export function HeroImageUpload({
  action,
}: {
  action: (formData: FormData) => void | Promise<void>;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setError(file && file.size > MAX_SRC_BYTES ? `That image is ${sizeMb(file.size)} MB — please use one under 10 MB.` : null);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) { setError('Choose an image first.'); return; }
    if (file.size > MAX_SRC_BYTES) { setError(`That image is ${sizeMb(file.size)} MB — please use one under 10 MB.`); return; }

    setBusy(true);
    setError(null);
    try {
      const optimized = await downscaleToJpeg(file);
      const fd = new FormData();
      fd.append('heroImage', optimized, 'home.jpg');
      // Server action stores the image and redirects back with ?saved=1.
      await action(fd);
    } catch {
      setError('Sorry — that image couldn’t be processed. Try a JPEG or PNG.');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ flex: 1, minWidth: 240 }}>
      <div style={s.fieldGroup}>
        <label style={s.label}>Upload a new hero image</label>
        <input
          ref={inputRef}
          name="heroImage"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          disabled={busy}
          onChange={onChange}
          style={{ ...s.input, padding: '8px 14px' }}
        />
        {error && <p style={{ color: '#c0392b', fontSize: 13, margin: '8px 0 0' }}>{error}</p>}
      </div>
      <button
        type="submit"
        disabled={busy || !!error}
        style={{ ...s.submitBtn, ...(busy || error ? { opacity: 0.6, cursor: 'not-allowed' } : null) }}
      >
        {busy ? 'Uploading…' : 'Upload hero image'}
      </button>
    </form>
  );
}
