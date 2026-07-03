import { NextResponse } from "next/server";
import { getLineProfile, lineUrl, replyText, upsertLineMember, verifyLineSignature } from "@/lib/line";

type LineEvent = {
  type: string;
  replyToken?: string;
  source?: { userId?: string };
  message?: { type?: string; text?: string };
  postback?: { data?: string };
};

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-line-signature");
  if (!verifyLineSignature(raw, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(raw || "{}") as { events?: LineEvent[] };
  for (const event of body.events || []) {
    await handleEvent(event).catch((error) => console.error("LINE webhook error", error));
  }
  return NextResponse.json({ ok: true });
}

async function handleEvent(event: LineEvent) {
  const lineUserId = event.source?.userId;
  if (!lineUserId) return;

  if (event.type === "follow") {
    const profile = await getLineProfile(lineUserId);
    if (profile) await upsertLineMember(profile);
    await replyText(event.replyToken || "", [
      "ยินดีต้อนรับสู่เคียงนา Fishing Lake",
      "ระบบสร้างบัญชีสมาชิกจาก LINE ให้แล้ว",
      `เปิดข้อมูลสมาชิก: ${lineUrl("/line/profile")}`,
      `เข้าบ่อ/สร้าง QR: ${lineUrl("/line/entry")}`,
    ].join("\n"));
    return;
  }

  if (event.type === "postback") {
    const data = new URLSearchParams(event.postback?.data || "");
    await replyByAction(event.replyToken || "", data.get("action") || "");
    return;
  }

  if (event.type === "message" && event.message?.type === "text") {
    const text = (event.message.text || "").trim().toLowerCase();
    if (["เมนู", "menu", "help"].includes(text)) {
      await replyText(event.replyToken || "", menuText());
      return;
    }
    if (["โปรไฟล์", "profile"].includes(text)) return replyText(event.replyToken || "", lineUrl("/line/profile"));
    if (["เข้าบ่อ", "qr", "entry"].includes(text)) return replyText(event.replyToken || "", lineUrl("/line/entry"));
    if (["กระเป๋า", "wallet"].includes(text)) return replyText(event.replyToken || "", lineUrl("/line/wallet"));
    if (["ส่งปลา", "ส่งผลงานปลา", "catch"].includes(text)) return replyText(event.replyToken || "", lineUrl("/line/catch"));
    if (["อันดับ", "ranking"].includes(text)) return replyText(event.replyToken || "", lineUrl("/ranking"));
  }
}

async function replyByAction(replyToken: string, action: string) {
  const urls: Record<string, string> = {
    profile: "/line/profile",
    entry: "/line/entry",
    wallet: "/line/wallet",
    catch: "/line/catch",
    ranking: "/ranking",
  };
  await replyText(replyToken, urls[action] ? lineUrl(urls[action]) : menuText());
}

function menuText() {
  return [
    "เมนูเคียงนา Fishing Lake",
    `โปรไฟล์: ${lineUrl("/line/profile")}`,
    `เข้าบ่อ QR: ${lineUrl("/line/entry")}`,
    `กระเป๋าเงิน: ${lineUrl("/line/wallet")}`,
    `ส่งผลงานปลา: ${lineUrl("/line/catch")}`,
    `อันดับ: ${lineUrl("/ranking")}`,
  ].join("\n");
}
