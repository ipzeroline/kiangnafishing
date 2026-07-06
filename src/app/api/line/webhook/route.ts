import { NextResponse } from "next/server";
import { getLineProfile, lineUrl, replyText, upsertLineMember, verifyLineSignature } from "@/lib/line";
import { query, type FishStocking } from "@/lib/db";

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
    if (["ตารางลงปลา", "ตารางการลงปลา", "ลงปลา", "fish release", "stocking"].includes(text) || text.includes("ตารางลงปลา") || text.includes("ตารางการลงปลา")) {
      return replyText(event.replyToken || "", await fishStockingText());
    }
    if (["ติดต่อแอดมิน", "ติดต่อ", "แอดมิน", "admin", "contact"].includes(text)) return replyText(event.replyToken || "", contactText());
  }
}

async function replyByAction(replyToken: string, action: string) {
  const urls: Record<string, string> = {
    profile: "/line/profile",
    entry: "/line/entry",
    wallet: "/line/wallet",
    catch: "/line/catch",
    ranking: "/ranking",
    contact: "/contact",
  };
  if (["fishStocking", "fish_stocking", "stocking", "fish-release"].includes(action)) {
    await replyText(replyToken, await fishStockingText());
    return;
  }
  await replyText(replyToken, urls[action] ? lineUrl(urls[action]) : menuText());
}

function contactText() {
  return [
    "ติดต่อทีมงานเคียงนา Fishing Lake",
    "LINE: kiangnafishinglake",
    "โทร: 062-229-3636",
    `หน้าติดต่อ: ${lineUrl("/contact")}`,
    "",
    "แจ้งรอบที่ต้องการเข้าบ่อ หรือสอบถามตารางลงปลาได้เลยครับ",
  ].join("\n");
}

async function fishStockingText() {
  const rows = await query<Pick<FishStocking, "species" | "fishCount" | "totalWeightKg" | "stockingDate">>(`
    SELECT species, fishCount, totalWeightKg, stockingDate
    FROM fish_stockings
    ORDER BY stockingDate DESC, createdAt DESC
    LIMIT 5
  `);
  if (rows.length === 0) {
    return [
      "ตารางการลงปลา",
      "เคียงนา Fishing Lake",
      "",
      "ยังไม่มีรายการลงปลาที่เผยแพร่ในขณะนี้",
      "",
      `ดูตารางล่าสุด: ${lineUrl("/fish-stocking-schedule")}`,
      `สอบถามทีมงาน: ${lineUrl("/contact")}`,
    ].join("\n");
  }

  const nf = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 });
  const lines = rows.flatMap((row, index) => {
    const date = dateLabel(row.stockingDate);
    return [
      `${index + 1}. ${row.species}`,
      `วันที่: ${date}`,
      `จำนวน: ${nf.format(Number(row.fishCount || 0))} ตัว`,
      `น้ำหนักรวม: ${nf.format(Number(row.totalWeightKg || 0))} กก.`,
      "",
    ];
  });

  return [
    "ตารางการลงปลาล่าสุด",
    "เคียงนา Fishing Lake",
    "",
    ...lines,
    `ดูรูปและตารางเต็ม: ${lineUrl("/fish-stocking-schedule")}`,
    "ต้องการสอบถามรอบลงปลา พิมพ์ ติดต่อแอดมิน",
  ].join("\n");
}

function dateLabel(value: string) {
  const date = String(value || "").slice(0, 10);
  if (!date) return "-";
  return new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(new Date(`${date}T00:00:00`));
}

function menuText() {
  return [
    "เมนูเคียงนา Fishing Lake",
    `โปรไฟล์: ${lineUrl("/line/profile")}`,
    `เข้าบ่อ QR: ${lineUrl("/line/entry")}`,
    `กระเป๋าเงิน: ${lineUrl("/line/wallet")}`,
    `ส่งผลงานปลา: ${lineUrl("/line/catch")}`,
    `อันดับ: ${lineUrl("/ranking")}`,
    `ตารางลงปลา: ${lineUrl("/fish-stocking-schedule")}`,
  ].join("\n");
}
