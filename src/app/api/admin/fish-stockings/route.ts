import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { execute, queryOne, uid } from "@/lib/db";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

async function requireStaff() {
  const user = await getSessionUser();
  return user && (user.role === "STAFF" || user.role === "ADMIN") ? user : null;
}

async function saveStockingImage(input: string, id: string) {
  const uploaded = await uploadImageToCloudinary(input, {
    folder: "kiangna/fish-stockings",
    publicId: id,
  }).catch(() => input);
  if (!uploaded.startsWith("data:image/")) return uploaded;

  const match = uploaded.match(/^data:(image\/(?:png|jpe?g|webp));base64,(.+)$/);
  if (!match) throw new Error("รูปภาพไม่ถูกต้อง");
  const ext = match[1] === "image/png" ? "png" : match[1] === "image/webp" ? "webp" : "jpg";
  const dir = path.join(process.cwd(), "public", "uploads", "fish-stockings");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, `${id}.${ext}`), Buffer.from(match[2], "base64"));
  return `/uploads/fish-stockings/${id}.${ext}`;
}

function clean(body: Record<string, unknown>) {
  return {
    stockingId: String(body.stockingId || ""),
    imagePath: String(body.imagePath || "").trim(),
    imageData: String(body.imageData || "").trim(),
    species: String(body.species || "").trim(),
    fishCount: Math.max(0, Math.floor(Number(body.fishCount || 0))),
    totalWeightKg: Math.max(0, Number(body.totalWeightKg || 0)),
    detail: String(body.detail || "").trim(),
    stockingDate: String(body.stockingDate || ""),
  };
}

function validate(payload: ReturnType<typeof clean>) {
  if (!payload.imagePath && !payload.imageData) return "กรุณาอัปโหลดรูปภาพ";
  if (payload.imagePath.length > 500) return "ลิงก์รูปภาพยาวเกินไป";
  if (payload.species.length < 2) return "กรุณากรอกชนิดปลา";
  if (payload.fishCount <= 0) return "กรุณากรอกจำนวนตัว";
  if (payload.totalWeightKg <= 0) return "กรุณากรอกจำนวนกิโลกรัมรวม";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.stockingDate)) return "กรุณาเลือกวันที่ให้ถูกต้อง";
  return "";
}

export async function POST(req: Request) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: "เฉพาะเจ้าหน้าที่ที่ได้รับสิทธิ์เท่านั้น" }, { status: 403 });
  const payload = clean(await req.json().catch(() => ({})));
  const error = validate(payload);
  if (error) return NextResponse.json({ error }, { status: 400 });
  const species = await queryOne<{ name: string }>("SELECT name FROM fish_species WHERE name=? AND status='ACTIVE'", [payload.species]);
  if (!species) return NextResponse.json({ error: "กรุณาเลือกชนิดปลาที่เปิดใช้งานในระบบ" }, { status: 400 });

  const id = uid();
  const imagePath = await saveStockingImage(payload.imageData || payload.imagePath, id);
  await execute(
    "INSERT INTO fish_stockings (id, imagePath, species, fishCount, totalWeightKg, detail, stockingDate, createdBy) VALUES (?,?,?,?,?,?,?,?)",
    [id, imagePath, payload.species, payload.fishCount, payload.totalWeightKg, payload.detail, payload.stockingDate, staff.id]
  );
  await execute(
    "INSERT INTO audit_logs (id, actorUserId, action, targetType, targetId, detail) VALUES (?,?,?,?,?,JSON_OBJECT('species', ?, 'fishCount', ?, 'totalWeightKg', ?, 'stockingDate', ?))",
    [uid(), staff.id, "FISH_STOCKING_CREATE", "fish_stockings", id, payload.species, payload.fishCount, payload.totalWeightKg, payload.stockingDate]
  );
  return NextResponse.json({ ok: true, id });
}

export async function PUT(req: Request) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: "เฉพาะเจ้าหน้าที่ที่ได้รับสิทธิ์เท่านั้น" }, { status: 403 });
  const payload = clean(await req.json().catch(() => ({})));
  if (!payload.stockingId) return NextResponse.json({ error: "ไม่พบรายการลงปลา" }, { status: 400 });
  const error = validate(payload);
  if (error) return NextResponse.json({ error }, { status: 400 });
  const stocking = await queryOne<{ id: string; imagePath: string }>("SELECT id, imagePath FROM fish_stockings WHERE id=?", [payload.stockingId]);
  if (!stocking) return NextResponse.json({ error: "ไม่พบรายการลงปลา" }, { status: 404 });
  const species = await queryOne<{ name: string }>("SELECT name FROM fish_species WHERE name=? AND status='ACTIVE'", [payload.species]);
  if (!species) return NextResponse.json({ error: "กรุณาเลือกชนิดปลาที่เปิดใช้งานในระบบ" }, { status: 400 });

  const imagePath = payload.imageData ? await saveStockingImage(payload.imageData, stocking.id) : payload.imagePath || stocking.imagePath;
  await execute(
    "UPDATE fish_stockings SET imagePath=?, species=?, fishCount=?, totalWeightKg=?, detail=?, stockingDate=? WHERE id=?",
    [imagePath, payload.species, payload.fishCount, payload.totalWeightKg, payload.detail, payload.stockingDate, stocking.id]
  );
  await execute(
    "INSERT INTO audit_logs (id, actorUserId, action, targetType, targetId, detail) VALUES (?,?,?,?,?,JSON_OBJECT('species', ?, 'fishCount', ?, 'totalWeightKg', ?, 'stockingDate', ?))",
    [uid(), staff.id, "FISH_STOCKING_UPDATE", "fish_stockings", stocking.id, payload.species, payload.fishCount, payload.totalWeightKg, payload.stockingDate]
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: "เฉพาะเจ้าหน้าที่ที่ได้รับสิทธิ์เท่านั้น" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const stockingId = String(body.stockingId || "");
  if (!stockingId) return NextResponse.json({ error: "ไม่พบรายการลงปลา" }, { status: 400 });
  const stocking = await queryOne<{ id: string; species: string }>("SELECT id, species FROM fish_stockings WHERE id=?", [stockingId]);
  if (!stocking) return NextResponse.json({ error: "ไม่พบรายการลงปลา" }, { status: 404 });

  await execute("DELETE FROM fish_stockings WHERE id=?", [stocking.id]);
  await execute(
    "INSERT INTO audit_logs (id, actorUserId, action, targetType, targetId, detail) VALUES (?,?,?,?,?,JSON_OBJECT('species', ?))",
    [uid(), staff.id, "FISH_STOCKING_DELETE", "fish_stockings", stocking.id, stocking.species]
  );
  return NextResponse.json({ ok: true });
}
