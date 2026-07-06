import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { execute, queryOne, uid } from "@/lib/db";
import { getAmountFor } from "@/lib/wallet";

type PendingTopup = { id: string; payAmount: number; getAmount: number; createdAt: string };

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "MEMBER") return NextResponse.json({ error: "ต้องเปิดผ่าน LINE" }, { status: 401 });
  const pending = await queryOne<PendingTopup>(
    "SELECT id, payAmount, getAmount, createdAt FROM topups WHERE userId=? AND status='PENDING' ORDER BY createdAt DESC LIMIT 1",
    [user.id]
  );
  return NextResponse.json({
    ok: true,
    walletBalance: user.walletBalance,
    points: user.points,
    pending,
  });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "MEMBER") return NextResponse.json({ error: "ต้องเปิดผ่าน LINE" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const payAmount = Math.floor(Number(body.payAmount || 0));
  if (!Number.isFinite(payAmount) || payAmount < 1) {
    return NextResponse.json({ error: "ยอดเติมเงินไม่ถูกต้อง" }, { status: 400 });
  }
  const existing = await queryOne<PendingTopup>(
    "SELECT id, payAmount, getAmount, createdAt FROM topups WHERE userId=? AND status='PENDING' ORDER BY createdAt DESC LIMIT 1",
    [user.id]
  );
  if (existing) {
    return NextResponse.json(
      { error: "มีรายการเติมเงินรออนุมัติอยู่แล้ว กรุณารอเจ้าหน้าที่ตรวจสอบก่อนทำรายการใหม่", pending: existing },
      { status: 409 }
    );
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
