import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { execute, queryOne, transaction, uid } from "@/lib/db";

async function requireStaff() {
  const user = await getSessionUser();
  return user && (user.role === "STAFF" || user.role === "ADMIN") ? user : null;
}

export async function PUT(req: Request) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const memberId = String(body.memberId || "");
  const name = String(body.name || "").trim();
  const alias = String(body.alias || "").trim();
  const status = body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE";
  const profileNote = String(body.profileNote || "").trim();

  if (!memberId) return NextResponse.json({ error: "ไม่พบสมาชิก" }, { status: 400 });
  if (name.length < 2) return NextResponse.json({ error: "กรุณากรอกชื่อสมาชิก" }, { status: 400 });

  const member = await queryOne<{ id: string }>("SELECT id FROM users WHERE id=? AND role='MEMBER'", [memberId]);
  if (!member) return NextResponse.json({ error: "ไม่พบสมาชิก" }, { status: 404 });

  await execute("UPDATE users SET name=?, alias=?, status=?, profileNote=? WHERE id=?", [
    name,
    alias || null,
    status,
    profileNote || null,
    member.id,
  ]);
  await execute(
    "INSERT INTO audit_logs (id, actorUserId, action, targetType, targetId, detail) VALUES (?,?,?,?,?,JSON_OBJECT('status', ?))",
    [uid(), staff.id, "MEMBER_PROFILE_UPDATE", "users", member.id, status]
  );
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  const staff = await requireStaff();
  if (!staff || staff.role !== "ADMIN") {
    return NextResponse.json({ error: "เฉพาะผู้ดูแลระบบเท่านั้น" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  if (body.action !== "merge") {
    return NextResponse.json({ error: "คำสั่งไม่ถูกต้อง" }, { status: 400 });
  }

  const targetId = String(body.targetId || "");
  const sourceId = String(body.sourceId || "");
  if (!targetId || !sourceId || targetId === sourceId) {
    return NextResponse.json({ error: "กรุณาเลือกสมาชิกหลักและสมาชิกที่ต้องการรวม" }, { status: 400 });
  }

  const target = await queryOne<{
    id: string;
    memberCode: string;
    name: string;
    alias: string | null;
    lineUserId: string | null;
    lineDisplayName: string | null;
    linePictureUrl: string | null;
    lineIdentityKey: string | null;
    walletBalance: number;
    points: number;
  }>("SELECT id, memberCode, name, alias, lineUserId, lineDisplayName, linePictureUrl, lineIdentityKey, walletBalance, points FROM users WHERE id=? AND role='MEMBER'", [targetId]);
  const source = await queryOne<{
    id: string;
    memberCode: string;
    name: string;
    alias: string | null;
    lineUserId: string | null;
    lineDisplayName: string | null;
    linePictureUrl: string | null;
    lineIdentityKey: string | null;
    walletBalance: number;
    points: number;
  }>("SELECT id, memberCode, name, alias, lineUserId, lineDisplayName, linePictureUrl, lineIdentityKey, walletBalance, points FROM users WHERE id=? AND role='MEMBER'", [sourceId]);

  if (!target || !source) {
    return NextResponse.json({ error: "ไม่พบสมาชิกที่เลือก" }, { status: 404 });
  }

  await transaction(async (db) => {
    await execute(
      `DELETE sourceCheckin
       FROM checkins sourceCheckin
       INNER JOIN checkins targetCheckin
         ON targetCheckin.userId=? AND targetCheckin.dateKey=sourceCheckin.dateKey
       WHERE sourceCheckin.userId=?`,
      [target.id, source.id],
      db
    );
    await execute("UPDATE checkins SET userId=? WHERE userId=?", [target.id, source.id], db);
    await execute("UPDATE transactions SET userId=? WHERE userId=?", [target.id, source.id], db);
    await execute("UPDATE catches SET userId=? WHERE userId=?", [target.id, source.id], db);
    await execute("UPDATE topups SET userId=? WHERE userId=?", [target.id, source.id], db);
    await execute("UPDATE coupon_redemptions SET userId=? WHERE userId=?", [target.id, source.id], db);
    await execute("UPDATE member_ledger SET userId=? WHERE userId=?", [target.id, source.id], db);
    await execute("UPDATE users SET lineUserId=NULL, lineIdentityKey=NULL WHERE id=?", [source.id], db);
    await execute(
      `UPDATE users
       SET walletBalance=walletBalance+?,
           points=points+?,
           name=COALESCE(NULLIF(name,''), ?),
           lineUserId=COALESCE(?, lineUserId),
           lineDisplayName=COALESCE(?, lineDisplayName),
           linePictureUrl=COALESCE(?, linePictureUrl),
           lineIdentityKey=COALESCE(?, lineIdentityKey),
           status='ACTIVE'
       WHERE id=?`,
      [
        Number(source.walletBalance || 0),
        Number(source.points || 0),
        target.name || source.name,
        source.lineUserId,
        source.lineDisplayName,
        source.linePictureUrl,
        source.lineIdentityKey,
        target.id,
      ],
      db
    );
    await execute("DELETE FROM users WHERE id=? AND role='MEMBER'", [source.id], db);
    await execute(
      "INSERT INTO audit_logs (id, actorUserId, action, targetType, targetId, detail) VALUES (?,?,?,?,?,JSON_OBJECT('targetMemberCode', ?, 'sourceMemberCode', ?, 'sourceUserId', ?))",
      [uid(), staff.id, "MEMBER_MERGE", "users", target.id, target.memberCode, source.memberCode, source.id],
      db
    );
  });

  return NextResponse.json({ ok: true, targetMemberCode: target.memberCode, sourceMemberCode: source.memberCode });
}

export async function DELETE(req: Request) {
  const staff = await requireStaff();
  if (!staff || staff.role !== "ADMIN") {
    return NextResponse.json({ error: "เฉพาะผู้ดูแลระบบเท่านั้น" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  if (String(body.confirm || "") !== "CLEAR MEMBERS") {
    return NextResponse.json({ error: "กรุณายืนยันด้วยข้อความ CLEAR MEMBERS" }, { status: 400 });
  }

  const countRow = await queryOne<{ count: number }>("SELECT COUNT(*) count FROM users WHERE role='MEMBER'");
  const deletedCount = Number(countRow?.count || 0);

  await transaction(async (db) => {
    await execute("DELETE FROM users WHERE role='MEMBER'", [], db);
    await execute(
      "INSERT INTO audit_logs (id, actorUserId, action, targetType, targetId, detail) VALUES (?,?,?,?,?,JSON_OBJECT('deletedMembers', ?))",
      [uid(), staff.id, "MEMBER_CLEAR_ALL", "users", null, deletedCount],
      db
    );
  });

  return NextResponse.json({ ok: true, deletedCount });
}
