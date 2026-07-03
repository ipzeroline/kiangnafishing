import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { execute, nextEmployeeCode, queryOne, transaction, uid, type UserRole } from "@/lib/db";
import { hashPassword, isStrongPassword } from "@/lib/password";

async function requireAdmin() {
  const user = await getSessionUser();
  return user?.role === "ADMIN" ? user : null;
}

function cleanPhone(phone: unknown) {
  return String(phone || "").replace(/\D/g, "");
}

function cleanUsername(username: unknown) {
  return String(username || "").trim().toLowerCase();
}

function cleanRole(role: unknown): Exclude<UserRole, "MEMBER"> {
  return role === "ADMIN" ? "ADMIN" : "STAFF";
}

function cleanPayload(body: Record<string, unknown>) {
  return {
    employeeId: String(body.employeeId || ""),
    name: String(body.name || "").trim(),
    phone: cleanPhone(body.phone),
    username: cleanUsername(body.username),
    password: String(body.password || ""),
    position: String(body.position || "").trim(),
    role: cleanRole(body.role),
    status: body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
  };
}

function validateBase(payload: ReturnType<typeof cleanPayload>) {
  if (payload.name.length < 2) return "กรุณากรอกชื่อผู้ใช้งาน";
  if (!/^0\d{9}$/.test(payload.phone)) return "เบอร์โทรต้องเป็น 10 หลัก";
  if (!/^[a-z0-9._-]{4,32}$/.test(payload.username)) return "username ต้องเป็น a-z, 0-9, จุด, ขีดกลาง หรือขีดล่าง ความยาว 4-32 ตัว";
  if (!payload.position) return "กรุณากรอกตำแหน่ง";
  return "";
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "เฉพาะผู้ดูแลระบบเท่านั้น" }, { status: 403 });

  const payload = cleanPayload(await req.json().catch(() => ({})));
  const baseError = validateBase(payload);
  if (baseError) return NextResponse.json({ error: baseError }, { status: 400 });
  if (!isStrongPassword(payload.password)) {
    return NextResponse.json({ error: "password ต้องมีอย่างน้อย 10 ตัว และมีตัวพิมพ์เล็ก พิมพ์ใหญ่ ตัวเลข และอักขระพิเศษ" }, { status: 400 });
  }

  const existingPhone = await queryOne<{ id: string }>("SELECT id FROM users WHERE phone=?", [payload.phone]);
  if (existingPhone) return NextResponse.json({ error: "เบอร์นี้มีบัญชีอยู่แล้ว" }, { status: 409 });
  const existingUsername = await queryOne<{ id: string }>("SELECT id FROM users WHERE username=?", [payload.username]);
  if (existingUsername) return NextResponse.json({ error: "username นี้ถูกใช้งานแล้ว" }, { status: 409 });

  await transaction(async (db) => {
    const userId = uid();
    const code = await nextEmployeeCode();
    await execute(
      "INSERT INTO users (id, memberCode, name, phone, username, passwordHash, role, status) VALUES (?,?,?,?,?,?,?,?)",
      [userId, code, payload.name, payload.phone, payload.username, hashPassword(payload.password), payload.role, payload.status],
      db
    );
    await execute(
      "INSERT INTO employees (id, userId, employeeCode, position, status, hiredAt) VALUES (?,?,?,?,?,CURDATE())",
      [uid(), userId, code, payload.position, payload.status],
      db
    );
    await execute(
      "INSERT INTO audit_logs (id, actorUserId, action, targetType, targetId, detail) VALUES (?,?,?,?,?,JSON_OBJECT('username', ?, 'role', ?))",
      [uid(), admin.id, "SYSTEM_USER_CREATE", "users", userId, payload.username, payload.role],
      db
    );
  });

  return NextResponse.json({ ok: true });
}

export async function PUT(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "เฉพาะผู้ดูแลระบบเท่านั้น" }, { status: 403 });

  const payload = cleanPayload(await req.json().catch(() => ({})));
  if (!payload.employeeId) return NextResponse.json({ error: "ไม่พบรหัสผู้ใช้งาน" }, { status: 400 });
  const baseError = validateBase(payload);
  if (baseError) return NextResponse.json({ error: baseError }, { status: 400 });
  if (payload.password && !isStrongPassword(payload.password)) {
    return NextResponse.json({ error: "password ใหม่ต้องมีอย่างน้อย 10 ตัว และมีตัวพิมพ์เล็ก พิมพ์ใหญ่ ตัวเลข และอักขระพิเศษ" }, { status: 400 });
  }

  const employee = await queryOne<{ id: string; userId: string }>("SELECT id, userId FROM employees WHERE id=?", [payload.employeeId]);
  if (!employee) return NextResponse.json({ error: "ไม่พบผู้ใช้งาน" }, { status: 404 });

  const phoneOwner = await queryOne<{ id: string }>("SELECT id FROM users WHERE phone=? AND id<>?", [payload.phone, employee.userId]);
  if (phoneOwner) return NextResponse.json({ error: "เบอร์นี้ถูกใช้โดยบัญชีอื่นแล้ว" }, { status: 409 });
  const usernameOwner = await queryOne<{ id: string }>("SELECT id FROM users WHERE username=? AND id<>?", [payload.username, employee.userId]);
  if (usernameOwner) return NextResponse.json({ error: "username นี้ถูกใช้โดยบัญชีอื่นแล้ว" }, { status: 409 });

  await transaction(async (db) => {
    const passwordSql = payload.password ? ", passwordHash=?" : "";
    const passwordParams = payload.password ? [hashPassword(payload.password)] : [];
    await execute(
      `UPDATE users SET name=?, phone=?, username=?, role=?, status=?${passwordSql} WHERE id=?`,
      [payload.name, payload.phone, payload.username, payload.role, payload.status, ...passwordParams, employee.userId],
      db
    );
    await execute("UPDATE employees SET position=?, status=? WHERE id=?", [payload.position, payload.status, employee.id], db);
    await execute(
      "INSERT INTO audit_logs (id, actorUserId, action, targetType, targetId, detail) VALUES (?,?,?,?,?,JSON_OBJECT('username', ?, 'role', ?, 'status', ?))",
      [uid(), admin.id, "SYSTEM_USER_UPDATE", "users", employee.userId, payload.username, payload.role, payload.status],
      db
    );
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "เฉพาะผู้ดูแลระบบเท่านั้น" }, { status: 403 });

  const employeeId = new URL(req.url).searchParams.get("employeeId");
  if (!employeeId) return NextResponse.json({ error: "ไม่พบรหัสผู้ใช้งาน" }, { status: 400 });
  const employee = await queryOne<{ userId: string }>("SELECT userId FROM employees WHERE id=?", [employeeId]);
  if (!employee) return NextResponse.json({ error: "ไม่พบผู้ใช้งาน" }, { status: 404 });
  if (employee.userId === admin.id) return NextResponse.json({ error: "ไม่สามารถปิดบัญชีตัวเองได้" }, { status: 400 });

  await transaction(async (db) => {
    await execute("UPDATE employees SET status='INACTIVE' WHERE id=?", [employeeId], db);
    await execute("UPDATE users SET status='INACTIVE' WHERE id=?", [employee.userId], db);
    await execute(
      "INSERT INTO audit_logs (id, actorUserId, action, targetType, targetId) VALUES (?,?,?,?,?)",
      [uid(), admin.id, "SYSTEM_USER_DEACTIVATE", "users", employee.userId],
      db
    );
  });
  return NextResponse.json({ ok: true });
}
