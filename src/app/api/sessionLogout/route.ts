import { NextResponse } from "next/server";
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const res = NextResponse.redirect(new URL('/marketing', request.url));

  res.cookies.set({
    name: "__session",
    value: "",
    path: "/",
    maxAge: -1,
  });

  return res;
}

export async function POST(req: Request) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("__session", "", { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: "lax", path: "/", expires: new Date(0) });
  return res;
}
