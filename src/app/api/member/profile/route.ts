import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { isCloudinaryConfigured, uploadImageToCloudinary } from "@/lib/cloudinary";
import { execute } from "@/lib/db";

export async function PUT(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (user.role !== "MEMBER") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const alias = String(body.alias || "").trim();
  const pictureData = String(body.pictureData || "").trim();
  const clearPicture = Boolean(body.clearPicture);
  if (name.length < 2) return NextResponse.json({ error: "กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร" }, { status: 400 });
  if (alias.length > 80) return NextResponse.json({ error: "นามแฝงยาวเกินไป" }, { status: 400 });
  if (pictureData && !/^data:image\/(?:png|jpe?g|webp);base64,/i.test(pictureData)) {
    return NextResponse.json({ error: "ไฟล์รูปโปรไฟล์ไม่ถูกต้อง" }, { status: 400 });
  }
  if (pictureData.length > 3_500_000) return NextResponse.json({ error: "รูปโปรไฟล์ใหญ่เกินไป" }, { status: 400 });

  if (pictureData) {
    if (!isCloudinaryConfigured()) {
      return NextResponse.json({ error: "ยังไม่ได้ตั้งค่าระบบอัปโหลดรูป" }, { status: 400 });
    }
    const finalPictureUrl = await uploadImageToCloudinary(pictureData, {
      folder: "kiangna/members",
      publicId: user.id,
    });
    await execute("UPDATE users SET name=?, alias=?, linePictureUrl=? WHERE id=?", [name, alias || null, finalPictureUrl, user.id]);
    return NextResponse.json({ ok: true });
  }

  if (clearPicture) {
    await execute("UPDATE users SET name=?, alias=?, linePictureUrl=NULL WHERE id=?", [name, alias || null, user.id]);
    return NextResponse.json({ ok: true });
  }

  await execute("UPDATE users SET name=?, alias=? WHERE id=?", [name, alias || null, user.id]);
  return NextResponse.json({ ok: true });
}
