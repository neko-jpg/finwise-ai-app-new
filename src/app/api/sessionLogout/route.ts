import { NextResponse } from 'next/server';
import { applyCorsHeaders, optionsResponse } from '@/lib/cors';

export async function OPTIONS(req: Request) {
  return optionsResponse(req);
}

export async function POST(req: Request) {
  const res = NextResponse.json({ ok: true });

  // Invalidate the session cookie.
  res.cookies.set('__session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return applyCorsHeaders(res, req);
}
