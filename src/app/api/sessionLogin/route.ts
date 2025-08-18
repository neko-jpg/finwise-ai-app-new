import { NextResponse, type NextRequest } from 'next/server';
import { createSessionCookie } from '@/lib/firebase/admin';
import { applyCorsHeaders, optionsResponse } from "@/lib/cors";

export async function OPTIONS(req: Request) {
  return optionsResponse(req);
}

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
        return NextResponse.json({ success: false, error: 'idToken is required' }, { status: 400 });
    }

    const { sessionCookie, expiresIn } = await createSessionCookie(idToken);

    const res = NextResponse.json({ success: true });
    res.cookies.set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn / 1000, // maxAge is in seconds
      path: '/',
    });

    return applyCorsHeaders(res, request);

  } catch (error) {
    console.error('Failed to create session:', error);
    const res = NextResponse.json({ success: false, error: 'Failed to create session' }, { status: 401 });
    return applyCorsHeaders(res, request);
  }
}
