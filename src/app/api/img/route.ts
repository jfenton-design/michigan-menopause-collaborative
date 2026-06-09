import { head } from '@vercel/blob';
import { type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const BLOB_ORIGIN = 'https://bfbwrnmnnw2zzg0c.private.blob.vercel-storage.com/';

export async function GET(req: NextRequest) {
  const blobUrl = req.nextUrl.searchParams.get('url');

  if (!blobUrl || !blobUrl.startsWith(BLOB_ORIGIN)) {
    return new Response('Invalid or missing URL', { status: 400 });
  }

  try {
    const info = await head(blobUrl);
    const file = await fetch(info.downloadUrl, {
      headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN ?? ''}` },
    });

    if (!file.ok) {
      return new Response('Image not found', { status: 404 });
    }

    const contentType = file.headers.get('Content-Type') ?? 'image/jpeg';

    return new Response(file.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return new Response('Image not found', { status: 404 });
  }
}
