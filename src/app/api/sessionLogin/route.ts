import { NextResponse } from "next/server";
import { auth } from "@/server/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();
    // 5 days
    const expiresIn = 1000 * 60 * 60 * 24 * 5;
    const sessionCookie = await auth().createSessionCookie(idToken, { expiresIn });
    const res = NextResponse.json({ ok: true });
    res.cookies.set("__session", sessionCookie, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: "lax", path: "/" });
    return res;
  } catch (error) {
    console.error("Session login error:", error);
    return NextResponse.json({ ok: false, error: "Failed to create session" }, { status: 401 });
  }
}
