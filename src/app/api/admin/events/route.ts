import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { execute, queryOne, uid } from "@/lib/db";

async function requireStaff() {
  const user = await getSessionUser();
  return user && (user.role === "STAFF" || user.role === "ADMIN") ? user : null;
}

function clean(body: Record<string, unknown>) {
  const rewardType = ["NONE", "CREDIT", "POINTS", "BOTH"].includes(String(body.rewardType)) ? String(body.rewardType) : "NONE";
  return {
    eventId: String(body.eventId || ""),
    title: String(body.title || "").trim(),
    description: String(body.description || "").trim(),
    startDate: String(body.startDate || ""),
    endDate: String(body.endDate || ""),
    status: ["DRAFT", "ACTIVE", "FINISHED", "CANCELLED"].includes(String(body.status)) ? String(body.status) : "DRAFT",
    rewardType,
    creditReward: Math.max(0, Math.floor(Number(body.creditReward || 0))),
    pointReward: Math.max(0, Math.floor(Number(body.pointReward || 0))),
  };
}

function validate(payload: ReturnType<typeof clean>) {
  if (payload.title.length < 3) return "กรุณากรอกชื่อ Event";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(payload.endDate)) return "กรุณาเลือกวันที่ให้ถูกต้อง";
  if (payload.endDate < payload.startDate) return "วันที่สิ้นสุดต้องไม่น้อยกว่าวันเริ่มต้น";
  if ((payload.rewardType === "CREDIT" || payload.rewardType === "BOTH") && payload.creditReward <= 0) return "กรุณากำหนดเครดิตรางวัล";
  if ((payload.rewardType === "POINTS" || payload.rewardType === "BOTH") && payload.pointReward <= 0) return "กรุณากำหนดแต้มรางวัล";
  return "";
}

export async function POST(req: Request) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: "เฉพาะเจ้าหน้าที่ที่ได้รับสิทธิ์เท่านั้น" }, { status: 403 });
  const payload = clean(await req.json().catch(() => ({})));
  const error = validate(payload);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const id = uid();
  await execute(
    "INSERT INTO events (id, title, description, startDate, endDate, status, rewardType, creditReward, pointReward, createdBy) VALUES (?,?,?,?,?,?,?,?,?,?)",
    [id, payload.title, payload.description, payload.startDate, payload.endDate, payload.status, payload.rewardType, payload.creditReward, payload.pointReward, staff.id]
  );
  await execute(
    "INSERT INTO audit_logs (id, actorUserId, action, targetType, targetId, detail) VALUES (?,?,?,?,?,JSON_OBJECT('title', ?, 'status', ?))",
    [uid(), staff.id, "EVENT_CREATE", "events", id, payload.title, payload.status]
  );
  return NextResponse.json({ ok: true, id });
}

export async function PUT(req: Request) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: "เฉพาะเจ้าหน้าที่ที่ได้รับสิทธิ์เท่านั้น" }, { status: 403 });
  const payload = clean(await req.json().catch(() => ({})));
  if (!payload.eventId) return NextResponse.json({ error: "ไม่พบ Event" }, { status: 400 });
  const error = validate(payload);
  if (error) return NextResponse.json({ error }, { status: 400 });
  const event = await queryOne<{ id: string }>("SELECT id FROM events WHERE id=?", [payload.eventId]);
  if (!event) return NextResponse.json({ error: "ไม่พบ Event" }, { status: 404 });

  await execute(
    "UPDATE events SET title=?, description=?, startDate=?, endDate=?, status=?, rewardType=?, creditReward=?, pointReward=? WHERE id=?",
    [payload.title, payload.description, payload.startDate, payload.endDate, payload.status, payload.rewardType, payload.creditReward, payload.pointReward, event.id]
  );
  await execute(
    "INSERT INTO audit_logs (id, actorUserId, action, targetType, targetId, detail) VALUES (?,?,?,?,?,JSON_OBJECT('title', ?, 'status', ?))",
    [uid(), staff.id, "EVENT_UPDATE", "events", event.id, payload.title, payload.status]
  );
  return NextResponse.json({ ok: true });
}
