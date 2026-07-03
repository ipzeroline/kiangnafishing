import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { execute, queryOne, transaction, uid } from "@/lib/db";

export async function POST(req: Request) {
  const staff = await getSessionUser();
  if (!staff || (staff.role !== "STAFF" && staff.role !== "ADMIN")) {
    return NextResponse.json({ error: "เฉพาะเจ้าหน้าที่ที่ได้รับสิทธิ์เท่านั้น" }, { status: 403 });
  }
  const { catchId, action } = await req.json().catch(() => ({}));
  const c = await queryOne<{ id: string; userId: string; species: string; weightKg: number }>(
    "SELECT * FROM catches WHERE id = ? AND status = 'PENDING'",
    [catchId]
  );
  if (!c) return NextResponse.json({ error: "ไม่พบรายการหรือดำเนินการไปแล้ว" }, { status: 404 });

  if (action === "reject") {
    await execute("UPDATE catches SET status = 'REJECTED' WHERE id = ?", [c.id]);
    await execute(
      "INSERT INTO audit_logs (id, actorUserId, action, targetType, targetId) VALUES (?,?,?,?,?)",
      [uid(), staff.id, "FISH_REJECT", "catches", c.id]
    );
    return NextResponse.json({ ok: true });
  }
  const species = await queryOne<{ pointRate: number }>("SELECT pointRate FROM fish_species WHERE name=? AND status='ACTIVE'", [c.species]);
  const points = species?.pointRate ?? 5;
  await transaction(async (db) => {
    await execute("UPDATE catches SET status = 'VERIFIED' WHERE id = ?", [c.id], db);
    await execute("UPDATE users SET points = points + ? WHERE id = ?", [points, c.userId], db);
    await execute("INSERT INTO transactions (id, userId, type, amount, note) VALUES (?,?,?,0,?)", [
      uid(),
      c.userId,
      "REWARD",
      `ยืนยันปลา ${c.species} ${c.weightKg} กก. (+${points} แต้ม)`,
    ], db);
    await execute(
      "INSERT INTO member_ledger (id, userId, actorUserId, type, creditDelta, pointsDelta, note, refType, refId) VALUES (?,?,?,?,?,?,?,?,?)",
      [uid(), c.userId, staff.id, "EVENT_REWARD", 0, points, `ยืนยันปลา ${c.species} ${c.weightKg} กก.`, "catches", c.id],
      db
    );
    await execute(
      "INSERT INTO audit_logs (id, actorUserId, action, targetType, targetId, detail) VALUES (?,?,?,?,?,JSON_OBJECT('species', ?, 'points', ?))",
      [uid(), staff.id, "FISH_VERIFY", "catches", c.id, c.species, points],
      db
    );
  });
  return NextResponse.json({ ok: true });
}
