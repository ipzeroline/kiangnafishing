import crypto from "node:crypto";

const KEY_LEN = 64;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const key = crypto.scryptSync(password, salt, KEY_LEN).toString("hex");
  return `scrypt:${salt}:${key}`;
}

export function verifyPassword(password: string, stored: string | null | undefined): boolean {
  if (!stored) return false;
  const [method, salt, key] = stored.split(":");
  if (method !== "scrypt" || !salt || !key) return false;
  const actual = crypto.scryptSync(password, salt, KEY_LEN);
  const expected = Buffer.from(key, "hex");
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(actual, expected);
}

export function isStrongPassword(password: string): boolean {
  return password.length >= 10
    && /[a-z]/.test(password)
    && /[A-Z]/.test(password)
    && /\d/.test(password)
    && /[^A-Za-z0-9]/.test(password);
}
