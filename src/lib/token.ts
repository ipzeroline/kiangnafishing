import crypto from "node:crypto";

const SECRET = process.env.SESSION_SECRET || "dev-secret";
const WINDOW_MS = 90_000; // QR หมุนใหม่ทุก 90 วินาที กันแคปหน้าจอส่งต่อ

function codeFor(userId: string, windowIndex: number): string {
  return crypto
    .createHmac("sha256", SECRET)
    .update(`${userId}:${windowIndex}`)
    .digest("hex")
    .slice(0, 6)
    .toUpperCase();
}

export function currentEntryCode(userId: string): { code: string; msLeft: number } {
  const now = Date.now();
  const idx = Math.floor(now / WINDOW_MS);
  return { code: codeFor(userId, idx), msLeft: WINDOW_MS - (now % WINDOW_MS) };
}

/** ยอมรับ window ปัจจุบันและก่อนหน้า 1 ช่อง (เผื่อสแกนคาบเกี่ยว) */
export function verifyEntryCode(userId: string, code: string): boolean {
  const idx = Math.floor(Date.now() / WINDOW_MS);
  return [idx, idx - 1].some((i) => codeFor(userId, i) === code.toUpperCase());
}
