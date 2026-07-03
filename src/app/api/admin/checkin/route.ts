import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { verifyEntryCode } from "@/lib/token";
import { execute, findUserById, queryOne, transaction, uid, type User } from "@/lib/db";
import { dateKeyBKK } from "@/lib/date";
import { ENTRY_FEE } from "@/lib/wallet";

export async function POST(req: Request) {
  const staff = await getSessionUser();
  if (!staff || (staff.role !== "STAFF" && staff.role !== "ADMIN")) {
    return NextResponse.json({ error: "เฉพาะเจ้าหน้าที่ที่ได้รับสิทธิ์เท่านั้น" }, { status: 403 });
  }
  const { payload, memberCode } = await req.json().catch(() => ({}));

  let member: User | null = null;
  if (payload) {
    const [userId, code] = String(payload).split(".");
    if (!userId || !code || !verifyEntryCode(userId, code)) {
      return NextResponse.json({ error: "QR ไม่ถูกต้องหรือหมดอายุ ให้สมาชิกรีเฟรชแล้วสแกนใหม่" }, { status: 400 });
    }
    member = await findUserById(userId);
  } else if (memberCode) {
    member = await queryOne<User>("SELECT * FROM users WHERE memberCode = ?", [String(memberCode).toUpperCase()]);
  }
  if (!member) return NextResponse.json({ error: "ไม่พบสมาชิก" }, { status: 404 });

  const dk = dateKeyBKK();
  const already = await queryOne<{ id: string }>("SELECT id FROM checkins WHERE userId = ? AND dateKey = ?", [member.id, dk]);
  if (already) {
    return NextResponse.json({ ok: true, already: true, name: member.name, balance: member.walletBalance,
      message: `${member.name} เช็คอินวันนี้ไปแล้ว ไม่ตัดเงินซ้ำ` });
  }
  if (member.walletBalance < ENTRY_FEE) {
    return NextResponse.json({ error: `${member.name} ยอดเงินไม่พอ (คงเหลือ ${member.walletBalance} บาท) กรุณาเติมเงินก่อน` }, { status: 402 });
  }

  await transaction(async (db) => {
    await execute("UPDATE users SET walletBalance = walletBalance - ?, points = points + 10 WHERE id = ?", [ENTRY_FEE, member.id], db);
    await execute("INSERT INTO checkins (id, userId, dateKey, fee) VALUES (?,?,?,?)", [uid(), member.id, dk, ENTRY_FEE], db);
    await execute("INSERT INTO transactions (id, userId, type, amount, note) VALUES (?,?,?,?,?)", [
      uid(),
      member.id,
      "ENTRY_FEE",
      -ENTRY_FEE,
      `ค่าเข้าบ่อ ${dk}`,
    ], db);
  });

  return NextResponse.json({
    ok: true, name: member.name, fee: ENTRY_FEE,
    balance: member.walletBalance - ENTRY_FEE,
    message: `เช็คอิน ${member.name} สำเร็จ ตัด ${ENTRY_FEE} บาท คงเหลือ ${member.walletBalance - ENTRY_FEE} บาท (+10 แต้ม)`,
  });
}
