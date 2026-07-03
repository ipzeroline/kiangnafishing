import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { execute, queryOne, uid } from "@/lib/db";

async function requireAdmin() {
  const user = await getSessionUser();
  return user?.role === "ADMIN" ? user : null;
}

function clean(body: Record<string, unknown>) {
  return {
    levelId: String(body.levelId || ""),
    levelNo: Math.max(1, Math.floor(Number(body.levelNo || 1))),
    name: String(body.name || "").trim(),
    symbol: String(body.symbol || "").trim(),
    minScore: Math.max(0, Math.floor(Number(body.minScore || 0))),
    color: String(body.color || "#135a66").trim(),
    benefit: String(body.benefit || "").trim(),
    isSpecial: body.isSpecial ? 1 : 0,
    status: body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
  };
}

function validate(payload: ReturnType<typeof clean>) {
  if (payload.levelNo > 99) return "เลข Level สูงเกินกำหนด";
  if (payload.name.length < 2) return "กรุณากรอกชื่อ Level";
  if (payload.symbol.length < 2) return "กรุณากรอกสัญลักษณ์";
  if (!/^#[0-9a-fA-F]{6}$/.test(payload.color)) return "สีต้องเป็น HEX เช่น #135a66";
  return "";
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "เฉพาะผู้ดูแลระบบเท่านั้น" }, { status: 403 });
  const payload = clean(await req.json().catch(() => ({})));
  const error = validate(payload);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const existing = await queryOne<{ id: string }>("SELECT id FROM ranking_levels WHERE levelNo=?", [payload.levelNo]);
  if (existing) return NextResponse.json({ error: "เลข Level นี้มีอยู่แล้ว" }, { status: 409 });

  const id = uid();
  await execute(
    "INSERT INTO ranking_levels (id, levelNo, name, symbol, minScore, color, benefit, isSpecial, status) VALUES (?,?,?,?,?,?,?,?,?)",
    [id, payload.levelNo, payload.name, payload.symbol, payload.minScore, payload.color, payload.benefit, payload.isSpecial, payload.status]
  );
  await execute(
    "INSERT INTO audit_logs (id, actorUserId, action, targetType, targetId, detail) VALUES (?,?,?,?,?,JSON_OBJECT('levelNo', ?, 'name', ?))",
    [uid(), admin.id, "RANKING_LEVEL_CREATE", "ranking_levels", id, payload.levelNo, payload.name]
  );
  return NextResponse.json({ ok: true, id });
}

export async function PUT(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "เฉพาะผู้ดูแลระบบเท่านั้น" }, { status: 403 });
  const payload = clean(await req.json().catch(() => ({})));
  if (!payload.levelId) return NextResponse.json({ error: "ไม่พบ Level" }, { status: 400 });
  const error = validate(payload);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const level = await queryOne<{ id: string }>("SELECT id FROM ranking_levels WHERE id=?", [payload.levelId]);
  if (!level) return NextResponse.json({ error: "ไม่พบ Level" }, { status: 404 });
  const owner = await queryOne<{ id: string }>("SELECT id FROM ranking_levels WHERE levelNo=? AND id<>?", [payload.levelNo, level.id]);
  if (owner) return NextResponse.json({ error: "เลข Level นี้มีอยู่แล้ว" }, { status: 409 });

  await execute(
    "UPDATE ranking_levels SET levelNo=?, name=?, symbol=?, minScore=?, color=?, benefit=?, isSpecial=?, status=? WHERE id=?",
    [payload.levelNo, payload.name, payload.symbol, payload.minScore, payload.color, payload.benefit, payload.isSpecial, payload.status, level.id]
  );
  await execute(
    "INSERT INTO audit_logs (id, actorUserId, action, targetType, targetId, detail) VALUES (?,?,?,?,?,JSON_OBJECT('levelNo', ?, 'name', ?, 'status', ?))",
    [uid(), admin.id, "RANKING_LEVEL_UPDATE", "ranking_levels", level.id, payload.levelNo, payload.name, payload.status]
  );
  return NextResponse.json({ ok: true });
}
