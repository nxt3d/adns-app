import { NextRequest, NextResponse } from 'next/server';

// Server-side ONLY. Never NEXT_PUBLIC_ — this URL carries the Alchemy API key
// and must never reach the browser bundle.
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // never cache RPC

export async function POST(req: NextRequest) {
  if (!MAINNET_RPC_URL) {
    return NextResponse.json({ error: 'RPC not configured' }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'bad body' }, { status: 400 });
  }

  try {
    // wagmi may batch — body can be a single object or an array. Forward as-is.
    const upstream = await fetch(MAINNET_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });

    const data = await upstream.text();
    return new NextResponse(data, {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return NextResponse.json({ error: 'Upstream RPC unavailable' }, { status: 502 });
  }
}
