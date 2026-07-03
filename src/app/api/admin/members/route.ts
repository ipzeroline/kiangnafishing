import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { execute, queryOne, uid } from "@/lib/db";

async function requireStaff() {
  const user = await getSessionUser();
  return user && (user.role === "STAFF" || user.role === "ADMIN") ? user : null;
}

export async function PUT(req: Request) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const memberId = String(body.memberId || "");
  const name = String(body.name || "").trim();
  const alias = String(body.alias || "").trim();
  const status = body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE";
  const profileNote = String(body.profileNote || "").trim();

  if (!memberId) return NextResponse.json({ error: "ไม่พบสมาชิก" }, { status: 400 });
  if (name.length < 2) return NextResponse.json({ error: "กรุณากรอกชื่อสมาชิก" }, { status: 400 });

  const member = await queryOne<{ id: string }>("SELECT id FROM users WHERE id=? AND role='MEMBER'", [memberId]);
  if (!member) return NextResponse.json({ error: "ไม่พบสมาชิก" }, { status: 404 });

  await execute("UPDATE users SET name=?, alias=?, status=?, profileNote=? WHERE id=?", [
    name,
    alias || null,
    status,
    profileNote || null,
    member.id,
  ]);
  await execute(
    "INSERT INTO audit_logs (id, actorUserId, action, targetType, targetId, detail) VALUES (?,?,?,?,?,JSON_OBJECT('status', ?))",
    [uid(), staff.id, "MEMBER_PROFILE_UPDATE", "users", member.id, status]
  );
  return NextResponse.json({ ok: true });
}
