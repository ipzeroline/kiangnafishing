import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { execute, queryOne, transaction, uid } from "@/lib/db";

async function requireStaff() {
  const user = await getSessionUser();
  return user && (user.role === "STAFF" || user.role === "ADMIN") ? user : null;
}

export async function POST(req: Request) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: "เฉพาะเจ้าหน้าที่ที่ได้รับสิทธิ์เท่านั้น" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const memberId = String(body.memberId || "");
  const creditDelta = Math.trunc(Number(body.creditDelta || 0));
  const pointsDelta = Math.trunc(Number(body.pointsDelta || 0));
  const note = String(body.note || "").trim();

  if (!memberId) return NextResponse.json({ error: "กรุณาเลือกสมาชิก" }, { status: 400 });
  if (creditDelta === 0 && pointsDelta === 0) return NextResponse.json({ error: "กรุณากำหนดเครดิตหรือแต้มที่ต้องการปรับ" }, { status: 400 });
  if (!note || note.length < 4) return NextResponse.json({ error: "กรุณากรอกเหตุผลอย่างน้อย 4 ตัวอักษร" }, { status: 400 });
  if (Math.abs(creditDelta) > 100000 || Math.abs(pointsDelta) > 100000) {
    return NextResponse.json({ error: "ยอดปรับต่อครั้งสูงเกินกำหนด" }, { status: 400 });
  }

  const member = await queryOne<{ id: string; walletBalance: number; points: number }>(
    "SELECT id, walletBalance, points FROM users WHERE id=? AND role='MEMBER' AND status='ACTIVE'",
    [memberId]
  );
  if (!member) return NextResponse.json({ error: "ไม่พบสมาชิกที่ใช้งานอยู่" }, { status: 404 });
  if (member.walletBalance + creditDelta < 0) return NextResponse.json({ error: "เครดิตคงเหลือไม่พอสำหรับการหักยอด" }, { status: 400 });
  if (member.points + pointsDelta < 0) return NextResponse.json({ error: "แต้มคงเหลือไม่พอสำหรับการหักยอด" }, { status: 400 });

  await transaction(async (db) => {
    await execute(
      "UPDATE users SET walletBalance=walletBalance+?, points=points+? WHERE id=?",
      [creditDelta, pointsDelta, member.id],
      db
    );
    const type = creditDelta !== 0 && pointsDelta === 0 ? "CREDIT_ADJUST" : "POINT_ADJUST";
    await execute(
      "INSERT INTO member_ledger (id, userId, actorUserId, type, creditDelta, pointsDelta, note, refType, refId) VALUES (?,?,?,?,?,?,?,?,?)",
      [uid(), member.id, staff.id, type, creditDelta, pointsDelta, note, "manual_adjustment", staff.id],
      db
    );
    if (creditDelta !== 0) {
      await execute("INSERT INTO transactions (id, userId, type, amount, note) VALUES (?,?,?,?,?)", [
        uid(), member.id, "ADJUSTMENT", creditDelta, note,
      ], db);
    }
    await execute(
      "INSERT INTO audit_logs (id, actorUserId, action, targetType, targetId, detail) VALUES (?,?,?,?,?,JSON_OBJECT('creditDelta', ?, 'pointsDelta', ?, 'note', ?))",
      [uid(), staff.id, "MEMBER_BALANCE_ADJUST", "users", member.id, creditDelta, pointsDelta, note],
      db
    );
  });

  return NextResponse.json({ ok: true });
}
