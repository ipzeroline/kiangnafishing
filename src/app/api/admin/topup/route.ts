import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { execute, queryOne, transaction, uid } from "@/lib/db";

export async function POST(req: Request) {
  const staff = await getSessionUser();
  if (!staff || (staff.role !== "STAFF" && staff.role !== "ADMIN")) {
    return NextResponse.json({ error: "เฉพาะเจ้าหน้าที่ที่ได้รับสิทธิ์เท่านั้น" }, { status: 403 });
  }
  const { topupId, action } = await req.json().catch(() => ({}));
  const t = await queryOne<{ id: string; userId: string; payAmount: number; getAmount: number }>(
    "SELECT * FROM topups WHERE id = ? AND status = 'PENDING'",
    [topupId]
  );
  if (!t) return NextResponse.json({ error: "ไม่พบรายการหรือดำเนินการไปแล้ว" }, { status: 404 });

  if (action === "reject") {
    await execute("UPDATE topups SET status = 'REJECTED' WHERE id = ?", [t.id]);
    await execute(
      "INSERT INTO audit_logs (id, actorUserId, action, targetType, targetId) VALUES (?,?,?,?,?)",
      [uid(), staff.id, "TOPUP_REJECT", "topups", t.id]
    );
    return NextResponse.json({ ok: true });
  }
  await transaction(async (db) => {
    await execute("UPDATE topups SET status = 'APPROVED' WHERE id = ?", [t.id], db);
    await execute("UPDATE users SET walletBalance = walletBalance + ? WHERE id = ?", [t.getAmount, t.userId], db);
    await execute("INSERT INTO transactions (id, userId, type, amount, note) VALUES (?,?,?,?,?)", [
      uid(),
      t.userId,
      "TOPUP",
      t.getAmount,
      `เติมเงิน ${t.payAmount} บาท ได้รับ ${t.getAmount} บาท`,
    ], db);
    await execute(
      "INSERT INTO member_ledger (id, userId, actorUserId, type, creditDelta, pointsDelta, note, refType, refId) VALUES (?,?,?,?,?,?,?,?,?)",
      [uid(), t.userId, staff.id, "TOPUP", t.getAmount, 0, `อนุมัติเติมเงิน ${t.payAmount} บาท`, "topups", t.id],
      db
    );
    await execute(
      "INSERT INTO audit_logs (id, actorUserId, action, targetType, targetId, detail) VALUES (?,?,?,?,?,JSON_OBJECT('getAmount', ?))",
      [uid(), staff.id, "TOPUP_APPROVE", "topups", t.id, t.getAmount],
      db
    );
  });
  return NextResponse.json({ ok: true });
}
