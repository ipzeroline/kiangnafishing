import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { execute, queryOne, uid } from "@/lib/db";
import { monthKeyBKK } from "@/lib/date";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "MEMBER") return NextResponse.json({ error: "ต้องเปิดผ่าน LINE" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const species = String(body.species || "").trim();
  const weightKg = Number(body.weightKg || 0);
  const caption = String(body.caption || "").trim().slice(0, 180);
  const imageInput = String(body.imageData || "/fish-placeholder.svg").trim();
  if (species.length < 2) return NextResponse.json({ error: "กรุณาเลือกชนิดปลา" }, { status: 400 });
  if (!Number.isFinite(weightKg) || weightKg <= 0 || weightKg > 10000) {
    return NextResponse.json({ error: "น้ำหนักปลาไม่ถูกต้อง" }, { status: 400 });
  }
  const rule = await queryOne<{ minWeightKg: number }>("SELECT minWeightKg FROM fish_species WHERE name=? AND status='ACTIVE'", [species]);
  if (!rule) return NextResponse.json({ error: "ชนิดปลานี้ยังไม่เปิดใช้งาน" }, { status: 400 });
  if (weightKg < Number(rule.minWeightKg || 0)) {
    return NextResponse.json({ error: `น้ำหนักต้องไม่น้อยกว่า ${Number(rule.minWeightKg).toFixed(2)} กก.` }, { status: 400 });
  }

  const id = uid();
  const imagePath = await uploadImageToCloudinary(imageInput || "/fish-placeholder.svg", {
    folder: "kiangna/catches",
    publicId: id,
  }).catch(() => imageInput || "/fish-placeholder.svg");
  await execute(
    "INSERT INTO catches (id, userId, species, weightKg, imagePath, caption, status, monthKey) VALUES (?,?,?,?,?,?,'PENDING',?)",
    [id, user.id, species, weightKg, imagePath || "/fish-placeholder.svg", caption || null, monthKeyBKK()]
  );
  await execute(
    "INSERT INTO audit_logs (id, actorUserId, action, targetType, targetId, detail) VALUES (?,?,?,?,?,JSON_OBJECT('species', ?, 'weightKg', ?, 'caption', ?))",
    [uid(), user.id, "LINE_CATCH_SUBMIT", "catches", id, species, weightKg, caption]
  );
  return NextResponse.json({ ok: true, catchId: id });
}
