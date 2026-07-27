'use client';
import * as React from 'react';
import { s } from '@/components/admin/formStyles';

// Keep this in sync with the advisory copy on the Website Content page.
// The Server Action bodySizeLimit (next.config.mjs) must stay comfortably
// above this so a 10 MB upload isn't rejected at the framework layer.
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Hero-image upload form with a friendly client-side 10 MB guard, so an
 * oversized file gets a clear message here instead of a cryptic server error.
 * Posts to the uploadHeroImage server action passed in by the (server) page.
 */
export function HeroImageUpload({
  action,
}: {
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [error, setError] = React.useState<string | null>(null);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.size > MAX_BYTES) {
      setError(`That image is ${(file.size / (1024 * 1024)).toFixed(1)} MB — please use one under 10 MB.`);
    } else {
      setError(null);
    }
  }

  return (
    <form
      action={action}
      style={{ flex: 1, minWidth: 240 }}
      onSubmit={e => { if (error) e.preventDefault(); }}
    >
      <div style={s.fieldGroup}>
        <label style={s.label}>Upload a new hero image</label>
        <input
          name="heroImage"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          onChange={onChange}
          style={{ ...s.input, padding: '8px 14px' }}
        />
        {error && (
          <p style={{ color: '#c0392b', fontSize: 13, margin: '8px 0 0' }}>{error}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={!!error}
        style={{ ...s.submitBtn, ...(error ? { opacity: 0.5, cursor: 'not-allowed' } : null) }}
      >
        Upload hero image
      </button>
    </form>
  );
}
