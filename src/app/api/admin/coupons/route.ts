import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { execute, queryOne, uid } from "@/lib/db";

async function requireStaff() {
  const user = await getSessionUser();
  return user && (user.role === "STAFF" || user.role === "ADMIN") ? user : null;
}

function cleanCode(value: unknown) {
  return String(value || "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
}

function clean(body: Record<string, unknown>) {
  const rewardType = ["CREDIT", "POINTS", "BOTH"].includes(String(body.rewardType)) ? String(body.rewardType) : "POINTS";
  return {
    couponId: String(body.couponId || ""),
    code: cleanCode(body.code),
    title: String(body.title || "").trim(),
    description: String(body.description || "").trim(),
    rewardType,
    creditAmount: Math.max(0, Math.floor(Number(body.creditAmount || 0))),
    pointsAmount: Math.max(0, Math.floor(Number(body.pointsAmount || 0))),
    usageLimit: Math.max(0, Math.floor(Number(body.usageLimit || 0))),
    perMemberLimit: Math.max(1, Math.floor(Number(body.perMemberLimit || 1))),
    startDate: String(body.startDate || ""),
    endDate: String(body.endDate || ""),
    status: body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
  };
}

function validate(payload: ReturnType<typeof clean>) {
  if (!/^[A-Z0-9_-]{4,32}$/.test(payload.code)) return "รหัสคูปองต้องเป็น A-Z, 0-9, _ หรือ - ความยาว 4-32 ตัว";
  if (payload.title.length < 3) return "กรุณากรอกชื่อคูปอง";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(payload.endDate)) return "กรุณาเลือกวันที่ให้ถูกต้อง";
  if (payload.endDate < payload.startDate) return "วันที่สิ้นสุดต้องไม่น้อยกว่าวันเริ่มต้น";
  if ((payload.rewardType === "CREDIT" || payload.rewardType === "BOTH") && payload.creditAmount <= 0) return "กรุณากำหนดเครดิตรางวัล";
  if ((payload.rewardType === "POINTS" || payload.rewardType === "BOTH") && payload.pointsAmount <= 0) return "กรุณากำหนดแต้มรางวัล";
  return "";
}

export async function POST(req: Request) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: "เฉพาะเจ้าหน้าที่ที่ได้รับสิทธิ์เท่านั้น" }, { status: 403 });
  const payload = clean(await req.json().catch(() => ({})));
  const error = validate(payload);
  if (error) return NextResponse.json({ error }, { status: 400 });
  const existing = await queryOne<{ id: string }>("SELECT id FROM coupons WHERE code=?", [payload.code]);
  if (existing) return NextResponse.json({ error: "รหัสคูปองนี้มีอยู่แล้ว" }, { status: 409 });

  const id = uid();
  await execute(
    "INSERT INTO coupons (id, code, title, description, rewardType, creditAmount, pointsAmount, usageLimit, perMemberLimit, startDate, endDate, status, createdBy) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [id, payload.code, payload.title, payload.description, payload.rewardType, payload.creditAmount, payload.pointsAmount, payload.usageLimit, payload.perMemberLimit, payload.startDate, payload.endDate, payload.status, staff.id]
  );
  await execute(
    "INSERT INTO audit_logs (id, actorUserId, action, targetType, targetId, detail) VALUES (?,?,?,?,?,JSON_OBJECT('code', ?, 'status', ?))",
    [uid(), staff.id, "COUPON_CREATE", "coupons", id, payload.code, payload.status]
  );
  return NextResponse.json({ ok: true, id });
}

export async function PUT(req: Request) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: "เฉพาะเจ้าหน้าที่ที่ได้รับสิทธิ์เท่านั้น" }, { status: 403 });
  const payload = clean(await req.json().catch(() => ({})));
  if (!payload.couponId) return NextResponse.json({ error: "ไม่พบคูปอง" }, { status: 400 });
  const error = validate(payload);
  if (error) return NextResponse.json({ error }, { status: 400 });
  const coupon = await queryOne<{ id: string }>("SELECT id FROM coupons WHERE id=?", [payload.couponId]);
  if (!coupon) return NextResponse.json({ error: "ไม่พบคูปอง" }, { status: 404 });
  const owner = await queryOne<{ id: string }>("SELECT id FROM coupons WHERE code=? AND id<>?", [payload.code, coupon.id]);
  if (owner) return NextResponse.json({ error: "รหัสคูปองนี้มีอยู่แล้ว" }, { status: 409 });

  await execute(
    "UPDATE coupons SET code=?, title=?, description=?, rewardType=?, creditAmount=?, pointsAmount=?, usageLimit=?, perMemberLimit=?, startDate=?, endDate=?, status=? WHERE id=?",
    [payload.code, payload.title, payload.description, payload.rewardType, payload.creditAmount, payload.pointsAmount, payload.usageLimit, payload.perMemberLimit, payload.startDate, payload.endDate, payload.status, coupon.id]
  );
  await execute(
    "INSERT INTO audit_logs (id, actorUserId, action, targetType, targetId, detail) VALUES (?,?,?,?,?,JSON_OBJECT('code', ?, 'status', ?))",
    [uid(), staff.id, "COUPON_UPDATE", "coupons", coupon.id, payload.code, payload.status]
  );
  return NextResponse.json({ ok: true });
}
