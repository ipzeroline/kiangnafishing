import crypto from "node:crypto";
import { execute, nextMemberCode, queryOne, uid, type User } from "./db";

const LINE_API = "https://api.line.me";
const LINE_DATA_API = "https://api-data.line.me";

export type LineProfile = {
  userId: string;
  displayName: string;
  pictureUrl?: string;
};

export function lineEnv(name: string) {
  return process.env[name] || "";
}

export function getBaseUrl() {
  return lineEnv("NEXT_PUBLIC_APP_URL").replace(/\/$/, "") || "http://localhost:3000";
}

export function verifyLineSignature(rawBody: string, signature: string | null) {
  const secret = lineEnv("LINE_CHANNEL_SECRET");
  if (!secret || !signature) return false;
  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("base64");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch {
    return false;
  }
}

export async function lineFetch(path: string, init: RequestInit = {}, dataApi = false) {
  const token = lineEnv("LINE_CHANNEL_ACCESS_TOKEN");
  if (!token) throw new Error("LINE_CHANNEL_ACCESS_TOKEN is missing");
  return fetch(`${dataApi ? LINE_DATA_API : LINE_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });
}

export async function replyText(replyToken: string, text: string) {
  if (!replyToken) return;
  await lineFetch("/v2/bot/message/reply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: "text", text: text.slice(0, 4900) }],
    }),
  });
}

export async function getLineProfile(userId: string): Promise<LineProfile | null> {
  const res = await lineFetch(`/v2/bot/profile/${encodeURIComponent(userId)}`);
  if (!res.ok) return null;
  return await res.json();
}

export async function verifyLineIdToken(idToken: string): Promise<LineProfile | null> {
  const clientId = lineEnv("LINE_LOGIN_CHANNEL_ID");
  if (!clientId) return null;
  const body = new URLSearchParams({ id_token: idToken, client_id: clientId });
  const res = await fetch(`${LINE_API}/oauth2/v2.1/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) return null;
  const data = await res.json();
  return {
    userId: data.sub,
    displayName: data.name || "LINE Member",
    pictureUrl: data.picture,
  };
}

export async function upsertLineMember(profile: LineProfile): Promise<User> {
  const existing = await queryOne<User>("SELECT * FROM users WHERE lineUserId=?", [profile.userId]);
  if (existing) {
    await execute("UPDATE users SET lineDisplayName=?, linePictureUrl=?, status='ACTIVE' WHERE id=?", [
      profile.displayName,
      profile.pictureUrl || null,
      existing.id,
    ]);
    return (await queryOne<User>("SELECT * FROM users WHERE id=?", [existing.id]))!;
  }

  const id = uid();
  const memberCode = await nextMemberCode();
  const phoneKey = `L${profile.userId.slice(-19)}`;
  await execute(
    "INSERT INTO users (id, memberCode, name, phone, lineUserId, lineDisplayName, linePictureUrl, role, status) VALUES (?,?,?,?,?,?,?,?, 'ACTIVE')",
    [id, memberCode, profile.displayName || "LINE Member", phoneKey, profile.userId, profile.displayName, profile.pictureUrl || null, "MEMBER"]
  );
  await execute(
    "INSERT INTO audit_logs (id, actorUserId, action, targetType, targetId, detail) VALUES (?,?,?,?,?,JSON_OBJECT('lineUserId', ?, 'displayName', ?))",
    [uid(), null, "LINE_MEMBER_CREATE", "users", id, profile.userId, profile.displayName]
  );
  return (await queryOne<User>("SELECT * FROM users WHERE id=?", [id]))!;
}

export function lineUrl(path: string) {
  return `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
