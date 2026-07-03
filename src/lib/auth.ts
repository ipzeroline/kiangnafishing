import crypto from "node:crypto";
import { cookies } from "next/headers";
import { findUserById, type User } from "./db";

const SECRET = process.env.SESSION_SECRET || "dev-secret";
const COOKIE = "pond_session";

function sign(value: string): string {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex").slice(0, 32);
}

export function makeSessionValue(userId: string): string {
  return `${userId}.${sign(userId)}`;
}

export function parseSessionValue(raw?: string): string | null {
  if (!raw) return null;
  const [userId, sig] = raw.split(".");
  if (!userId || !sig) return null;
  const expect = sign(userId);
  try {
    if (crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return userId;
  } catch {}
  return null;
}

export async function getSessionUser(): Promise<User | null> {
  const store = await cookies();
  const userId = parseSessionValue(store.get(COOKIE)?.value);
  return userId ? await findUserById(userId) : null;
}

export const SESSION_COOKIE = COOKIE;
