import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const res = NextResponse.json({ ok: true });
    // Clear the session cookie by setting its expiration to a past date
    res.cookies.set("__session", "", { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: "lax", path: "/", expires: new Date(0) });
    return res;
  } catch (error) {
    console.error("Session logout error:", error);
    return NextResponse.json({ ok: false, error: "Failed to logout" }, { status: 500 });
  }
}
