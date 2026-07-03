import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { execute } from "@/lib/db";

export async function PUT(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (user.role !== "MEMBER") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const alias = String(body.alias || "").trim();
  if (name.length < 2) return NextResponse.json({ error: "กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร" }, { status: 400 });
  if (alias.length > 80) return NextResponse.json({ error: "นามแฝงยาวเกินไป" }, { status: 400 });

  await execute("UPDATE users SET name=?, alias=? WHERE id=?", [name, alias || null, user.id]);
  return NextResponse.json({ ok: true });
}
