import fs from "node:fs";
import path from "node:path";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
const staffContactLineUrl = "https://line.me/ti/p/SeS2mH9yey";
const richMenuJson = process.argv[2] || "/Users/zeroline/Downloads/files/richmenu-pack/richmenu.json";
const richMenuImage = process.argv[3] || "/Users/zeroline/Downloads/files/richmenu-pack/richmenu.png";

if (!token) throw new Error("LINE_CHANNEL_ACCESS_TOKEN is required");
if (!appUrl) throw new Error("NEXT_PUBLIC_APP_URL is required");
if (!liffId) throw new Error("NEXT_PUBLIC_LIFF_ID is required");

const raw = JSON.parse(fs.readFileSync(richMenuJson, "utf8"));
const liffUrl = (route) => `https://liff.line.me/${liffId}${route}`;
const actionMap = {
  "/entry": liffUrl("/line/entry"),
  "/wallet": liffUrl("/line/wallet"),
  "/catch": liffUrl("/line/catch"),
  "/ranking": `${appUrl}/ranking`,
  "/fish-stocking-schedule": `${appUrl}/fish-stocking-schedule`,
  "/contact": staffContactLineUrl,
};

const menu = JSON.parse(JSON.stringify(raw).replace(/https?:\/\/[^"\\]+(\/entry|\/wallet|\/catch|\/ranking|\/fish-stocking-schedule|\/contact)/g, (_all, route) => {
  return actionMap[route] || `${appUrl}${route}`;
}));

for (const area of menu.areas || []) {
  if (area.action?.type === "uri" && area.action.uri?.startsWith("/")) {
    area.action.uri = `${appUrl}${area.action.uri}`;
  }
  if (area.action?.type === "uri" && area.action.uri?.includes("/fish-stocking-schedule")) {
    area.action = {
      type: "postback",
      data: "action=fishStocking",
      displayText: "ขอดูตารางลงปลาและโปรโมชั่นล่าสุด",
    };
  }
  if (area.action?.type === "uri" && area.action.uri?.includes("/contact")) {
    area.action = {
      type: "uri",
      uri: staffContactLineUrl,
    };
  }
  if (area.action?.type === "postback" && ["action=contact", "action=staff", "action=admin_contact"].includes(area.action.data || "")) {
    area.action.displayText = "ติดต่อเจ้าหน้าที่";
  }
}

const createRes = await fetch("https://api.line.me/v2/bot/richmenu", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify(menu),
});
if (!createRes.ok) throw new Error(`Create rich menu failed: ${createRes.status} ${await createRes.text()}`);
const { richMenuId } = await createRes.json();

const image = fs.readFileSync(path.resolve(richMenuImage));
const uploadRes = await fetch(`https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "image/png" },
  body: image,
});
if (!uploadRes.ok) throw new Error(`Upload rich menu image failed: ${uploadRes.status} ${await uploadRes.text()}`);

const defaultRes = await fetch(`https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
});
if (!defaultRes.ok) throw new Error(`Set default rich menu failed: ${defaultRes.status} ${await defaultRes.text()}`);

console.log(`Rich menu set as default: ${richMenuId}`);
