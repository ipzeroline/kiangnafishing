import crypto from "node:crypto";
import mysql, { type Pool, type PoolConnection, type RowDataPacket } from "mysql2/promise";
import { dateKeyBKK, monthKeyBKK } from "./date";
import { hashPassword } from "./password";

type DbClient = Pool | PoolConnection;
const SCHEMA_VERSION = 5;

declare global {
  // eslint-disable-next-line no-var
  var __pondPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __pondSchemaReady: Promise<void> | undefined;
  // eslint-disable-next-line no-var
  var __pondSchemaVersion: number | undefined;
}

export type UserRole = "MEMBER" | "STAFF" | "ADMIN";

export type User = {
  id: string;
  memberCode: string;
  name: string;
  alias: string | null;
  phone: string;
  lineUserId: string | null;
  lineDisplayName: string | null;
  linePictureUrl: string | null;
  lineIdentityKey: string | null;
  profileNote: string | null;
  username: string | null;
  passwordHash: string | null;
  role: UserRole;
  status: "ACTIVE" | "INACTIVE";
  walletBalance: number;
  points: number;
  createdAt: string;
};

export type Employee = {
  id: string;
  userId: string;
  employeeCode: string;
  position: string;
  status: "ACTIVE" | "INACTIVE";
  hiredAt: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  phone: string;
  username: string | null;
  role: UserRole;
};

export type FishCatch = {
  id: string;
  userId: string;
  species: string;
  weightKg: number;
  imagePath: string;
  caption: string | null;
  status: string;
  monthKey: string;
  createdAt: string;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "DRAFT" | "ACTIVE" | "FINISHED" | "CANCELLED";
  rewardType: "NONE" | "CREDIT" | "POINTS" | "BOTH";
  creditReward: number;
  pointReward: number;
  createdAt: string;
};

export type Coupon = {
  id: string;
  code: string;
  title: string;
  description: string;
  rewardType: "CREDIT" | "POINTS" | "BOTH";
  creditAmount: number;
  pointsAmount: number;
  usageLimit: number;
  usedCount: number;
  perMemberLimit: number;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
};

export type FishSpecies = {
  id: string;
  name: string;
  category: string;
  pointRate: number;
  minWeightKg: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
};

export type RankingLevel = {
  id: string;
  levelNo: number;
  name: string;
  symbol: string;
  minScore: number;
  color: string;
  benefit: string;
  isSpecial: 0 | 1;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
};

function env(name: string, fallback = ""): string {
  return process.env[name] || fallback;
}

function systemAdminPassword(): string {
  const configured = env("SYSTEM_ADMIN_PASSWORD");
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SYSTEM_ADMIN_PASSWORD is required in production");
  }
  return "ChangeMe!Set_SYSTEM_ADMIN_PASSWORD";
}

function getPool(): Pool {
  if (!globalThis.__pondPool) {
    globalThis.__pondPool = mysql.createPool({
      host: env("DB_HOST", "127.0.0.1"),
      port: Number(env("DB_PORT", "3306")),
      database: env("DB_NAME", "kiangna_db"),
      user: env("DB_USER", "root"),
      password: env("DB_PASSWORD"),
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 10,
      idleTimeout: 60_000,
      namedPlaceholders: true,
      dateStrings: true,
      decimalNumbers: true,
      timezone: "Z",
    });
  }
  return globalThis.__pondPool;
}

async function initSchema(client: DbClient) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(32) PRIMARY KEY,
      memberCode VARCHAR(24) UNIQUE NOT NULL,
      name VARCHAR(160) NOT NULL,
      alias VARCHAR(160) NULL,
      phone VARCHAR(20) UNIQUE NOT NULL,
      lineUserId VARCHAR(80) UNIQUE NULL,
      lineDisplayName VARCHAR(160) NULL,
      linePictureUrl VARCHAR(500) NULL,
      lineIdentityKey VARCHAR(64) UNIQUE NULL,
      profileNote TEXT NULL,
      username VARCHAR(80) UNIQUE NULL,
      passwordHash VARCHAR(255) NULL,
      role ENUM('MEMBER','STAFF','ADMIN') NOT NULL DEFAULT 'MEMBER',
      status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
      walletBalance INT NOT NULL DEFAULT 0,
      points INT NOT NULL DEFAULT 0,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_users_role (role),
      INDEX idx_users_member_code (memberCode)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS alias VARCHAR(160) NULL");
  await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS lineUserId VARCHAR(80) NULL");
  await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS lineDisplayName VARCHAR(160) NULL");
  await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS linePictureUrl VARCHAR(500) NULL");
  await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS lineIdentityKey VARCHAR(64) NULL");
  await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS profileNote TEXT NULL");
  await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(80) NULL");
  await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS passwordHash VARCHAR(255) NULL");
  await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE'");
  await client.query("ALTER TABLE users MODIFY role ENUM('MEMBER','STAFF','ADMIN') NOT NULL DEFAULT 'MEMBER'");
  try {
    await client.query("CREATE UNIQUE INDEX uniq_users_username ON users (username)");
  } catch {}
  try {
    await client.query("CREATE UNIQUE INDEX uniq_users_line_user ON users (lineUserId)");
  } catch {}
  try {
    await client.query("CREATE UNIQUE INDEX uniq_users_line_identity ON users (lineIdentityKey)");
  } catch {}

  await client.query(`
    CREATE TABLE IF NOT EXISTS employees (
      id VARCHAR(32) PRIMARY KEY,
      userId VARCHAR(32) NOT NULL,
      employeeCode VARCHAR(24) UNIQUE NOT NULL,
      position VARCHAR(120) NOT NULL,
      status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
      hiredAt DATE NOT NULL,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_employees_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_employees_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id VARCHAR(32) PRIMARY KEY,
      actorUserId VARCHAR(32) NULL,
      action VARCHAR(80) NOT NULL,
      targetType VARCHAR(80) NOT NULL,
      targetId VARCHAR(32) NULL,
      detail JSON NULL,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_audit_created (createdAt),
      INDEX idx_audit_actor (actorUserId),
      CONSTRAINT fk_audit_actor FOREIGN KEY (actorUserId) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS checkins (
      id VARCHAR(32) PRIMARY KEY,
      userId VARCHAR(32) NOT NULL,
      dateKey VARCHAR(10) NOT NULL,
      fee INT NOT NULL DEFAULT 100,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_checkins_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY uniq_checkins_user_date (userId, dateKey),
      INDEX idx_checkins_date (dateKey)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id VARCHAR(32) PRIMARY KEY,
      userId VARCHAR(32) NOT NULL,
      type ENUM('TOPUP','ENTRY_FEE','REWARD','ADJUSTMENT') NOT NULL,
      amount INT NOT NULL,
      note VARCHAR(255) NOT NULL DEFAULT '',
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_transactions_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_transactions_user_created (userId, createdAt)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS fish_species (
      id VARCHAR(32) PRIMARY KEY,
      name VARCHAR(120) UNIQUE NOT NULL,
      category VARCHAR(120) NOT NULL DEFAULT '',
      pointRate INT NOT NULL DEFAULT 5,
      minWeightKg DECIMAL(8,2) NOT NULL DEFAULT 0,
      status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_fish_species_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS catches (
      id VARCHAR(32) PRIMARY KEY,
      userId VARCHAR(32) NOT NULL,
      species VARCHAR(120) NOT NULL,
      weightKg DECIMAL(8,2) NOT NULL,
      imagePath VARCHAR(255) NOT NULL,
      caption VARCHAR(180) NULL,
      status ENUM('PENDING','VERIFIED','REJECTED') NOT NULL DEFAULT 'PENDING',
      monthKey VARCHAR(7) NOT NULL,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_catches_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_catches_status_month (status, monthKey),
      INDEX idx_catches_user (userId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await client.query("ALTER TABLE catches MODIFY imagePath VARCHAR(500) NOT NULL");
  await client.query("ALTER TABLE catches ADD COLUMN caption VARCHAR(180) NULL").catch(() => undefined);

  await client.query(`
    CREATE TABLE IF NOT EXISTS topups (
      id VARCHAR(32) PRIMARY KEY,
      userId VARCHAR(32) NOT NULL,
      payAmount INT NOT NULL,
      getAmount INT NOT NULL,
      status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_topups_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_topups_status_created (status, createdAt),
      INDEX idx_topups_user_status (userId, status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS events (
      id VARCHAR(32) PRIMARY KEY,
      title VARCHAR(180) NOT NULL,
      description TEXT NOT NULL,
      startDate DATE NOT NULL,
      endDate DATE NOT NULL,
      status ENUM('DRAFT','ACTIVE','FINISHED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
      rewardType ENUM('NONE','CREDIT','POINTS','BOTH') NOT NULL DEFAULT 'NONE',
      creditReward INT NOT NULL DEFAULT 0,
      pointReward INT NOT NULL DEFAULT 0,
      createdBy VARCHAR(32) NULL,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_events_status_dates (status, startDate, endDate),
      CONSTRAINT fk_events_creator FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS coupons (
      id VARCHAR(32) PRIMARY KEY,
      code VARCHAR(40) UNIQUE NOT NULL,
      title VARCHAR(180) NOT NULL,
      description TEXT NOT NULL,
      rewardType ENUM('CREDIT','POINTS','BOTH') NOT NULL DEFAULT 'POINTS',
      creditAmount INT NOT NULL DEFAULT 0,
      pointsAmount INT NOT NULL DEFAULT 0,
      usageLimit INT NOT NULL DEFAULT 0,
      usedCount INT NOT NULL DEFAULT 0,
      perMemberLimit INT NOT NULL DEFAULT 1,
      startDate DATE NOT NULL,
      endDate DATE NOT NULL,
      status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
      createdBy VARCHAR(32) NULL,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_coupons_status_dates (status, startDate, endDate),
      CONSTRAINT fk_coupons_creator FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS coupon_redemptions (
      id VARCHAR(32) PRIMARY KEY,
      couponId VARCHAR(32) NOT NULL,
      userId VARCHAR(32) NOT NULL,
      actorUserId VARCHAR(32) NULL,
      creditAmount INT NOT NULL DEFAULT 0,
      pointsAmount INT NOT NULL DEFAULT 0,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_coupon_redemptions_coupon_user (couponId, userId),
      INDEX idx_coupon_redemptions_user_created (userId, createdAt),
      CONSTRAINT fk_coupon_redemptions_coupon FOREIGN KEY (couponId) REFERENCES coupons(id) ON DELETE CASCADE,
      CONSTRAINT fk_coupon_redemptions_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_coupon_redemptions_actor FOREIGN KEY (actorUserId) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS member_ledger (
      id VARCHAR(32) PRIMARY KEY,
      userId VARCHAR(32) NOT NULL,
      actorUserId VARCHAR(32) NULL,
      type ENUM('TOPUP','ENTRY_FEE','CREDIT_ADJUST','POINT_ADJUST','COUPON_REWARD','EVENT_REWARD') NOT NULL,
      creditDelta INT NOT NULL DEFAULT 0,
      pointsDelta INT NOT NULL DEFAULT 0,
      note VARCHAR(255) NOT NULL DEFAULT '',
      refType VARCHAR(40) NULL,
      refId VARCHAR(32) NULL,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_member_ledger_user_created (userId, createdAt),
      INDEX idx_member_ledger_type_created (type, createdAt),
      CONSTRAINT fk_member_ledger_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_member_ledger_actor FOREIGN KEY (actorUserId) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS ranking_levels (
      id VARCHAR(32) PRIMARY KEY,
      levelNo INT UNIQUE NOT NULL,
      name VARCHAR(120) NOT NULL,
      symbol VARCHAR(24) NOT NULL,
      minScore INT NOT NULL DEFAULT 0,
      color VARCHAR(24) NOT NULL DEFAULT '#135a66',
      benefit VARCHAR(255) NOT NULL DEFAULT '',
      isSpecial TINYINT(1) NOT NULL DEFAULT 0,
      status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_ranking_levels_active_score (status, minScore)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function ensureRankingLevels(client: DbClient) {
  const levels: Array<[number, string, string, number, string, string, number]> = [
    [1, "มือใหม่ริมน้ำ", "ตะขอเบ็ด", 0, "#5b7a80", "เริ่มต้นสะสมคะแนนและประวัติการตกปลา", 0],
    [2, "นักตกประจำบ่อ", "ทุ่นลอย", 100, "#135a66", "เริ่มมีสถานะสมาชิกประจำ", 0],
    [3, "นักล่าปลาใหญ่", "คันเบ็ด", 250, "#0a3540", "เหมาะกับสมาชิกที่เริ่มมีผลงานปลา", 0],
    [4, "เซียนเคียงนา", "ปลาเงิน", 500, "#6f7f88", "ระดับสมาชิกคุณภาพ", 0],
    [5, "จ้าวสังเวียนบ่อ", "ถ้วยทองแดง", 900, "#b0764a", "มีโอกาสเข้ากลุ่มรางวัลประจำเดือน", 0],
    [6, "ตำนาน Fishing Lake", "ถ้วยทอง", 1500, "#c9a227", "ระดับท็อปประจำเดือน", 0],
    [7, "Hall of Fame", "มงกุฎปลาใหญ่", 999999, "#e8562a", "ระดับพิเศษสำหรับแชมป์หรือผู้ทำสถิติ", 1],
  ];
  for (const [levelNo, name, symbol, minScore, color, benefit, isSpecial] of levels) {
    await client.query(
      "INSERT IGNORE INTO ranking_levels (id, levelNo, name, symbol, minScore, color, benefit, isSpecial, status) VALUES (?,?,?,?,?,?,?,?, 'ACTIVE')",
      [uid(), levelNo, name, symbol, minScore, color, benefit, isSpecial]
    );
  }
}

async function seed(client: DbClient) {
  const [countRows] = await client.query("SELECT COUNT(*) AS c FROM users");
  const count = (countRows as { c: number }[])[0]?.c ?? 0;
  if (count > 0) return;

  const adminPassword = systemAdminPassword();
  const mk = monthKeyBKK();
  const dk = dateKeyBKK();
  const adminId = uid();
  await client.query(
    "INSERT INTO users (id, memberCode, name, phone, username, passwordHash, role, walletBalance, points) VALUES (?,?,?,?,?,?,?,?,?)",
    [adminId, "ADMIN1", "แอดมินบ่อ", "0800000000", "admin", hashPassword(adminPassword), "ADMIN", 0, 0]
  );
  await client.query(
    "INSERT INTO employees (id, userId, employeeCode, position, status, hiredAt) VALUES (?,?,?,?,?,CURDATE())",
    [uid(), adminId, "EMP001", "ผู้จัดการระบบ", "ACTIVE"]
  );

  const demo: [string, string, string, number][] = [
    ["FP0001", "พี่หนุ่ม สายหนัก", "0811111111", 850],
    ["FP0002", "เจ๊แดง ปลาช่อน", "0822222222", 1200],
    ["FP0003", "น้องบาส มือใหม่", "0833333333", 300],
  ];
  const ids: Record<string, string> = {};
  for (const [code, name, phone, bal] of demo) {
    const id = uid();
    ids[code] = id;
    await client.query(
      "INSERT INTO users (id, memberCode, name, phone, role, walletBalance, points) VALUES (?,?,?,?,?,?,?)",
      [id, code, name, phone, "MEMBER", bal, 50]
    );
    await client.query("INSERT INTO checkins (id, userId, dateKey, fee) VALUES (?,?,?,100)", [uid(), id, dk]);
  }

  const catches: [string, string, number][] = [
    ["FP0001", "ปลาช่อน", 4.2],
    ["FP0001", "ปลาบึก", 12.5],
    ["FP0001", "ปลาสวาย", 6.8],
    ["FP0002", "ปลาช่อน", 5.1],
    ["FP0002", "ปลานิล", 1.8],
    ["FP0003", "ปลาดุก", 2.3],
  ];
  const species = Array.from(new Set(catches.map(([, sp]) => sp)));
  for (const sp of species) {
    await client.query(
      "INSERT IGNORE INTO fish_species (id, name, category, pointRate, minWeightKg, status) VALUES (?,?,?,?,?,?)",
      [uid(), sp, "ปลาบ่อ", 5, 0, "ACTIVE"]
    );
  }
  for (const [code, sp, w] of catches) {
    await client.query(
      "INSERT INTO catches (id, userId, species, weightKg, imagePath, status, monthKey) VALUES (?,?,?,?,?,?,?)",
      [uid(), ids[code], sp, w, "/fish-placeholder.svg", "VERIFIED", mk]
    );
  }
}

async function ensureSystemAdmin(client: DbClient) {
  const adminPassword = systemAdminPassword();
  const [rows] = await client.query("SELECT id, passwordHash FROM users WHERE phone='0800000000' OR memberCode IN ('STAFF1','ADMIN1') LIMIT 1");
  const admin = (rows as { id: string; passwordHash: string | null }[])[0];
  if (!admin) return;
  await client.query(
    "UPDATE users SET username=COALESCE(username,'admin'), passwordHash=COALESCE(passwordHash,?), role='ADMIN', status='ACTIVE', memberCode='ADMIN1' WHERE id=?",
    [hashPassword(adminPassword), admin.id]
  );
}

export async function ensureDb() {
  if (!globalThis.__pondSchemaReady || globalThis.__pondSchemaVersion !== SCHEMA_VERSION) {
    globalThis.__pondSchemaReady = (async () => {
      const pool = getPool();
      await initSchema(pool);
      await seed(pool);
      await ensureRankingLevels(pool);
      await ensureSystemAdmin(pool);
      globalThis.__pondSchemaVersion = SCHEMA_VERSION;
    })();
  }
  await globalThis.__pondSchemaReady;
}

export function uid(): string {
  return crypto.randomBytes(12).toString("hex");
}

export async function query<T extends RowDataPacket | object>(
  sql: string,
  params: unknown[] = [],
  client: DbClient = getPool()
): Promise<T[]> {
  await ensureDb();
  const [rows] = await client.query(sql, params);
  return rows as T[];
}

export async function queryOne<T extends RowDataPacket | object>(
  sql: string,
  params: unknown[] = [],
  client: DbClient = getPool()
): Promise<T | null> {
  const rows = await query<T>(sql, params, client);
  return rows[0] ?? null;
}

export async function execute(sql: string, params: unknown[] = [], client: DbClient = getPool()) {
  await ensureDb();
  return client.query(sql, params);
}

export async function transaction<T>(work: (client: PoolConnection) => Promise<T>): Promise<T> {
  await ensureDb();
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const result = await work(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function findUserById(id: string, client?: DbClient): Promise<User | null> {
  return queryOne<User>("SELECT * FROM users WHERE id = ?", [id], client);
}

export async function findUserByPhone(phone: string, client?: DbClient): Promise<User | null> {
  return queryOne<User>("SELECT * FROM users WHERE phone = ?", [phone], client);
}

export async function findUserByUsername(username: string, client?: DbClient): Promise<User | null> {
  return queryOne<User>("SELECT * FROM users WHERE username = ?", [username.toLowerCase()], client);
}

export async function nextMemberCode(): Promise<string> {
  const row = await queryOne<{ c: number }>("SELECT COUNT(*) AS c FROM users WHERE role='MEMBER'");
  return "FP" + String((row?.c ?? 0) + 1).padStart(4, "0");
}

export async function nextEmployeeCode(): Promise<string> {
  const row = await queryOne<{ c: number }>("SELECT COUNT(*) AS c FROM employees");
  return "EMP" + String((row?.c ?? 0) + 1).padStart(3, "0");
}
