import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { execute, queryOne, transaction, uid } from "@/lib/db";
import { dateKeyBKK } from "@/lib/date";

async function requireStaff() {
  const user = await getSessionUser();
  return user && (user.role === "STAFF" || user.role === "ADMIN") ? user : null;
}

export async function POST(req: Request) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: "เฉพาะเจ้าหน้าที่ที่ได้รับสิทธิ์เท่านั้น" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const code = String(body.code || "").trim().toUpperCase();
  const memberCode = String(body.memberCode || "").trim().toUpperCase();
  if (!code || !memberCode) return NextResponse.json({ error: "กรอกรหัสสมาชิกและรหัสคูปอง" }, { status: 400 });

  const today = dateKeyBKK();
  const member = await queryOne<{ id: string; status: string }>("SELECT id, status FROM users WHERE memberCode=? AND role='MEMBER'", [memberCode]);
  if (!member) return NextResponse.json({ error: "ไม่พบสมาชิก" }, { status: 404 });
  if (member.status !== "ACTIVE") return NextResponse.json({ error: "สมาชิกถูกปิดใช้งาน" }, { status: 403 });

  const coupon = await queryOne<{
    id: string; code: string; title: string; rewardType: string; creditAmount: number; pointsAmount: number;
    usageLimit: number; usedCount: number; perMemberLimit: number; startDate: string; endDate: string; status: string;
  }>("SELECT * FROM coupons WHERE code=?", [code]);
  if (!coupon) return NextResponse.json({ error: "ไม่พบคูปอง" }, { status: 404 });
  if (coupon.status !== "ACTIVE") return NextResponse.json({ error: "คูปองไม่ได้เปิดใช้งาน" }, { status: 403 });
  if (today < coupon.startDate || today > coupon.endDate) return NextResponse.json({ error: "คูปองอยู่นอกช่วงใช้งาน" }, { status: 403 });
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) return NextResponse.json({ error: "คูปองถูกใช้ครบจำนวนแล้ว" }, { status: 409 });

  const used = await queryOne<{ c: number }>(
    "SELECT COUNT(*) c FROM coupon_redemptions WHERE couponId=? AND userId=?",
    [coupon.id, member.id]
  );
  if ((used?.c ?? 0) >= coupon.perMemberLimit) return NextResponse.json({ error: "สมาชิกใช้คูปองนี้ครบสิทธิ์แล้ว" }, { status: 409 });

  await transaction(async (db) => {
    const redemptionId = uid();
    await execute("UPDATE coupons SET usedCount=usedCount+1 WHERE id=?", [coupon.id], db);
    await execute(
      "UPDATE users SET walletBalance=walletBalance+?, points=points+? WHERE id=?",
      [coupon.creditAmount, coupon.pointsAmount, member.id],
      db
    );
    await execute(
      "INSERT INTO coupon_redemptions (id, couponId, userId, actorUserId, creditAmount, pointsAmount) VALUES (?,?,?,?,?,?)",
      [redemptionId, coupon.id, member.id, staff.id, coupon.creditAmount, coupon.pointsAmount],
      db
    );
    await execute(
      "INSERT INTO member_ledger (id, userId, actorUserId, type, creditDelta, pointsDelta, note, refType, refId) VALUES (?,?,?,?,?,?,?,?,?)",
      [uid(), member.id, staff.id, "COUPON_REWARD", coupon.creditAmount, coupon.pointsAmount, `แลกคูปอง ${coupon.code}`, "coupon_redemptions", redemptionId],
      db
    );
    if (coupon.creditAmount > 0) {
      await execute("INSERT INTO transactions (id, userId, type, amount, note) VALUES (?,?,?,?,?)", [
        uid(), member.id, "REWARD", coupon.creditAmount, `คูปอง ${coupon.code}: ${coupon.title}`,
      ], db);
    }
    await execute(
      "INSERT INTO audit_logs (id, actorUserId, action, targetType, targetId, detail) VALUES (?,?,?,?,?,JSON_OBJECT('memberCode', ?, 'code', ?, 'credit', ?, 'points', ?))",
      [uid(), staff.id, "COUPON_REDEEM", "coupons", coupon.id, memberCode, coupon.code, coupon.creditAmount, coupon.pointsAmount],
      db
    );
  });

  return NextResponse.json({ ok: true });
}
