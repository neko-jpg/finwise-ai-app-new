import { NextResponse } from "next/server";
import { auth } from "@/server/firebaseAdmin";
import { applyCorsHeaders, optionsResponse } from "@/lib/cors";

export async function OPTIONS(req: Request) {
  return optionsResponse(req);
}

export async function POST(req: Request) {
  let res: NextResponse;
  try {
    const { idToken } = await req.json();
    // 5 days
    const expiresIn = 1000 * 60 * 60 * 24 * 5;
    const sessionCookie = await auth().createSessionCookie(idToken, { expiresIn });
    res = NextResponse.json({ ok: true });
    const fiveDaysInSeconds = 60 * 60 * 24 * 5;
    res.cookies.set("__session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax",
      path: "/",
      maxAge: fiveDaysInSeconds,
    });
  } catch (error) {
    console.error("Session login error:", error);
    res = NextResponse.json(
      { ok: false, error: "Failed to create session" },
      { status: 401 }
    );
  }
  return applyCorsHeaders(res, req);
}
