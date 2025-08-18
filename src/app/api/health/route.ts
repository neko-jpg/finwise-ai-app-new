import { NextResponse } from 'next/server';
import { applyCorsHeaders } from '@/lib/cors';

export async function GET(req: Request) {
  const res = NextResponse.json({ ok: true, ts: Date.now() });
  return applyCorsHeaders(res, req);
}
