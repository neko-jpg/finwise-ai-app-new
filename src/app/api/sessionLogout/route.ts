import { NextResponse, type NextRequest } from 'next/server';
import { revokeRefreshTokens } from '@/lib/firebase/admin';
import { applyCorsHeaders, optionsResponse } from "@/lib/cors";

export async function OPTIONS(req: Request) {
  return optionsResponse(req);
}

export async function POST(request: NextRequest) {
    const sessionCookie = request.cookies.get('session')?.value;

    if (sessionCookie) {
        await revokeRefreshTokens(sessionCookie);
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set('session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0,
        path: '/',
        expires: new Date(0),
    });

    return applyCorsHeaders(res, request);
}
