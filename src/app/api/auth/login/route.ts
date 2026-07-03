import { NextResponse } from "next/server";
import { findUserByUsername } from "@/lib/db";
import { makeSessionValue, SESSION_COOKIE } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";

export async function POST(req: Request) {
  const { username, password } = await req.json().catch(() => ({}));

  const login = String(username || "").trim().toLowerCase();
  const pass = String(password || "");
  if (!login || !pass) {
    return NextResponse.json({ error: "กรอก username และ password" }, { status: 400 });
  }
  const user = await findUserByUsername(login);
  if (!user || user.role === "MEMBER" || user.status !== "ACTIVE" || !verifyPassword(pass, user.passwordHash)) {
    return NextResponse.json({ error: "username หรือ password ไม่ถูกต้อง" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true, role: user.role });
  res.cookies.set(SESSION_COOKIE, makeSessionValue(user.id), {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 12,
  });
  return res;
}
