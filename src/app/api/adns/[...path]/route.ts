import { NextRequest, NextResponse } from 'next/server';

const INDEXER_URL = process.env.ADNS_INDEXER_URL ?? 'http://localhost:42069';
const PROXY_SECRET = process.env.ADNS_INDEXER_PROXY_SECRET ?? '';

// Read-only endpoints the browser is allowed to reach through this proxy.
const ALLOWED_PREFIXES = [
  'health',
  'stats',
  'names',
  'bindings',
  'registrations',
  'renewals',
  'transfers',
  'admin-events',
];

function isAllowed(path: string): boolean {
  return ALLOWED_PREFIXES.includes(path.split('/')[0]);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const joined = path.join('/');
  if (!isAllowed(joined)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const upstreamUrl = new URL(`${INDEXER_URL}/api/${joined}`);
  req.nextUrl.searchParams.forEach((value, key) => {
    upstreamUrl.searchParams.set(key, value);
  });

  try {
    const res = await fetch(upstreamUrl.toString(), {
      headers: {
        'x-adns-proxy-secret': PROXY_SECRET,
        accept: 'application/json',
      },
      cache: 'no-store',
    });
    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: {
        'content-type': res.headers.get('content-type') ?? 'application/json',
      },
    });
  } catch {
    // Indexer unreachable — clients fall back to direct contract reads.
    return NextResponse.json({ error: 'Indexer unavailable' }, { status: 502 });
  }
}
