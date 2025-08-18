import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppContainer } from "@/components/finwise/app-container";
import { auth } from "@/server/firebaseAdmin";
import { DecodedIdToken } from "firebase-admin/auth";

export const dynamic = "force-dynamic";

async function verifySession(sessionCookie: string | null): Promise<DecodedIdToken | null> {
  if (!sessionCookie) {
    return null;
  }
  try {
    // trueの指定で、セッションが失効しているかもチェック
    return await auth().verifySessionCookie(sessionCookie, true);
  } catch (error) {
    console.error("セッションクッキーの検証に失敗しました:", error);
    return null;
  }
}

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value ?? null;
  const serverUser = await verifySession(sessionCookie);

  if (!serverUser) {
    redirect("/entry");
  }

  return <AppContainer serverUser={serverUser}>{children}</AppContainer>;
}
