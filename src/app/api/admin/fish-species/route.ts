import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { execute, queryOne, uid } from "@/lib/db";

async function requireStaff() {
  const user = await getSessionUser();
  return user && (user.role === "STAFF" || user.role === "ADMIN") ? user : null;
}

function clean(body: Record<string, unknown>) {
  return {
    speciesId: String(body.speciesId || ""),
    name: String(body.name || "").trim(),
    category: String(body.category || "").trim(),
    pointRate: Math.max(0, Math.floor(Number(body.pointRate || 0))),
    minWeightKg: Math.max(0, Number(body.minWeightKg || 0)),
    status: body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
  };
}

function validate(payload: ReturnType<typeof clean>) {
  if (payload.name.length < 2) return "กรุณากรอกชื่อชนิดปลา";
  if (payload.name.length > 120) return "ชื่อชนิดปลายาวเกินไป";
  if (payload.pointRate > 1000) return "แต้มต่อรายการสูงเกินกำหนด";
  if (payload.minWeightKg > 10000) return "น้ำหนักขั้นต่ำสูงเกินกำหนด";
  return "";
}

export async function POST(req: Request) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: "เฉพาะเจ้าหน้าที่ที่ได้รับสิทธิ์เท่านั้น" }, { status: 403 });
  const payload = clean(await req.json().catch(() => ({})));
  const error = validate(payload);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const existing = await queryOne<{ id: string }>("SELECT id FROM fish_species WHERE name=?", [payload.name]);
  if (existing) return NextResponse.json({ error: "ชนิดปลานี้มีอยู่แล้ว" }, { status: 409 });

  const id = uid();
  await execute(
    "INSERT INTO fish_species (id, name, category, pointRate, minWeightKg, status) VALUES (?,?,?,?,?,?)",
    [id, payload.name, payload.category, payload.pointRate, payload.minWeightKg, payload.status]
  );
  await execute(
    "INSERT INTO audit_logs (id, actorUserId, action, targetType, targetId, detail) VALUES (?,?,?,?,?,JSON_OBJECT('name', ?, 'pointRate', ?))",
    [uid(), staff.id, "FISH_SPECIES_CREATE", "fish_species", id, payload.name, payload.pointRate]
  );
  return NextResponse.json({ ok: true, id });
}

export async function PUT(req: Request) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: "เฉพาะเจ้าหน้าที่ที่ได้รับสิทธิ์เท่านั้น" }, { status: 403 });
  const payload = clean(await req.json().catch(() => ({})));
  if (!payload.speciesId) return NextResponse.json({ error: "ไม่พบชนิดปลา" }, { status: 400 });
  const error = validate(payload);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const species = await queryOne<{ id: string }>("SELECT id FROM fish_species WHERE id=?", [payload.speciesId]);
  if (!species) return NextResponse.json({ error: "ไม่พบชนิดปลา" }, { status: 404 });
  const owner = await queryOne<{ id: string }>("SELECT id FROM fish_species WHERE name=? AND id<>?", [payload.name, species.id]);
  if (owner) return NextResponse.json({ error: "ชนิดปลานี้มีอยู่แล้ว" }, { status: 409 });

  await execute(
    "UPDATE fish_species SET name=?, category=?, pointRate=?, minWeightKg=?, status=? WHERE id=?",
    [payload.name, payload.category, payload.pointRate, payload.minWeightKg, payload.status, species.id]
  );
  await execute(
    "INSERT INTO audit_logs (id, actorUserId, action, targetType, targetId, detail) VALUES (?,?,?,?,?,JSON_OBJECT('name', ?, 'status', ?))",
    [uid(), staff.id, "FISH_SPECIES_UPDATE", "fish_species", species.id, payload.name, payload.status]
  );
  return NextResponse.json({ ok: true });
}
