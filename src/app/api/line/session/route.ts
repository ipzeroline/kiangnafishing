import { NextResponse } from "next/server";
import { makeSessionValue, SESSION_COOKIE } from "@/lib/auth";
import { upsertLineMember, verifyLineIdToken, type LineProfile } from "@/lib/line";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  let profile: LineProfile | null = null;
  const idToken = String(body.idToken || "");
  if (idToken) profile = await verifyLineIdToken(idToken);

  if (!profile && process.env.NODE_ENV !== "production") {
    const userId = String(body.userId || "");
    if (userId) {
      profile = {
        userId,
        displayName: String(body.displayName || "LINE Member"),
        pictureUrl: body.pictureUrl ? String(body.pictureUrl) : undefined,
      };
    }
  }

  if (!profile) {
    return NextResponse.json({ error: "ยืนยันตัวตน LINE ไม่สำเร็จ" }, { status: 401 });
  }

  const user = await upsertLineMember(profile);
  const res = NextResponse.json({
    ok: true,
    memberCode: user.memberCode,
    name: user.alias || user.name,
    walletBalance: user.walletBalance,
    points: user.points,
  });
  res.cookies.set(SESSION_COOKIE, makeSessionValue(user.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
