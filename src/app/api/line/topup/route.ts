import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { execute, uid } from "@/lib/db";
import { getAmountFor } from "@/lib/wallet";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "MEMBER") return NextResponse.json({ error: "ต้องเปิดผ่าน LINE OA" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const payAmount = Math.floor(Number(body.payAmount || 0));
  if (![100, 300, 500, 1000, 2000].includes(payAmount)) {
    return NextResponse.json({ error: "ยอดเติมเงินไม่ถูกต้อง" }, { status: 400 });
  }
  const getAmount = getAmountFor(payAmount);
  const id = uid();
  await execute("INSERT INTO topups (id, userId, payAmount, getAmount, status) VALUES (?,?,?,?, 'PENDING')", [
    id,
    user.id,
    payAmount,
    getAmount,
  ]);
  await execute(
    "INSERT INTO audit_logs (id, actorUserId, action, targetType, targetId, detail) VALUES (?,?,?,?,?,JSON_OBJECT('payAmount', ?, 'getAmount', ?))",
    [uid(), user.id, "LINE_TOPUP_REQUEST", "topups", id, payAmount, getAmount]
  );
  return NextResponse.json({ ok: true, topupId: id, payAmount, getAmount });
}
