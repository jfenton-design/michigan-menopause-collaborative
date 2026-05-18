import { put, head } from '@vercel/blob';

export const dynamic = 'force-dynamic';

// Temporary diagnostic endpoint — will be removed after debugging
export async function GET(req: Request) {
  const auth = req.headers.get('x-diag-key');
  if (auth !== 'mmc-debug-2026') {
    return Response.json({ error: 'forbidden' }, { status: 403 });
  }

  const results: Record<string, unknown> = {};

  // 1. Write a test blob and capture the real URL
  try {
    const r = await put('mmc/diag-test.json', '{"ok":true}', {
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    results.putUrl = r.url;
    results.putDownloadUrl = r.downloadUrl?.slice(0, 80) + '…';

    // 2. head() using the URL returned by put()
    try {
      const h = await head(r.url);
      results.headViaRealUrl = 'OK — ' + h.url;
    } catch (e) {
      results.headViaRealUrl = 'FAILED: ' + String(e);
    }
  } catch (e) {
    results.putError = String(e);
  }

  // 3. head() using my hardcoded URL
  const hardcoded = 'https://BFbwRnMNNW2zzg0c.public.blob.vercel-storage.com/mmc/resources.json';
  try {
    const h = await head(hardcoded);
    results.headViaHardcoded = 'OK — ' + h.url;
  } catch (e) {
    results.headViaHardcoded = 'FAILED: ' + String(e);
  }

  // 4. Token prefix (safe to log — not the secret)
  const token = process.env.BLOB_READ_WRITE_TOKEN ?? '';
  results.tokenPrefix = token.slice(0, 30) + '…';

  return Response.json(results, { status: 200 });
}
