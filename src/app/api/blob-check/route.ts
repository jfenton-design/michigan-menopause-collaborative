import { put, head } from '@vercel/blob';

export const dynamic = 'force-dynamic';

// Temporary diagnostic endpoint
export async function GET(req: Request) {
  const url = new URL(req.url);
  const auth = req.headers.get('x-diag-key') ?? url.searchParams.get('key');
  if (auth !== 'mmc-debug-2026') {
    return Response.json({ error: 'forbidden' }, { status: 403 });
  }

  const results: Record<string, unknown> = {};

  // 1. Write a known value
  const testData = { items: ['alpha', 'beta', 'gamma'], ts: Date.now() };
  try {
    const r = await put('mmc/diag-test.json', JSON.stringify(testData), {
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    results.step1_putUrl = r.url;

    // 2. head() → get downloadUrl → fetch content
    try {
      const h = await head(r.url);
      results.step2_headDownloadUrl = h.downloadUrl?.slice(0, 100) + '…';

      const fetchRes = await fetch(h.downloadUrl, { cache: 'no-store' });
      results.step2_fetchStatus = fetchRes.status;
      if (fetchRes.ok) {
        const body = await fetchRes.json();
        results.step2_fetchBody = body;
        results.step2_roundTripOk = JSON.stringify(body) === JSON.stringify(testData);
      } else {
        results.step2_fetchBody = await fetchRes.text();
      }
    } catch (e) {
      results.step2_error = String(e);
    }
  } catch (e) {
    results.step1_error = String(e);
  }

  // 3. Test head() + fetch on resources.json
  const resourcesUrl = 'https://bfbwrnmnnw2zzg0c.private.blob.vercel-storage.com/mmc/resources.json';
  try {
    const h = await head(resourcesUrl);
    const fetchRes = await fetch(h.downloadUrl, { cache: 'no-store' });
    results.step3_resourcesFetchStatus = fetchRes.status;
    if (fetchRes.ok) {
      const body = await fetchRes.json();
      results.step3_resourcesCount = Array.isArray(body) ? body.length : 'not-array';
      results.step3_resourcesTitles = Array.isArray(body) ? body.map((r: {title: string}) => r.title) : body;
    } else {
      results.step3_resourcesFetchBody = await fetchRes.text();
    }
  } catch (e) {
    results.step3_error = String(e);
  }

  return Response.json(results, { status: 200 });
}
