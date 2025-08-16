import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = await cookies();
  // Invalidate the session cookie by setting a new one with a past expiration date.
  cookieStore.set('__session', '', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
  });
  return NextResponse.json({ ok: true }, { status: 200 });
}
