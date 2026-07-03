import fs from "node:fs";
import path from "node:path";

const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
const richMenuJson = process.argv[2] || "/Users/zeroline/Downloads/files/richmenu-pack/richmenu.json";
const richMenuImage = process.argv[3] || "/Users/zeroline/Downloads/files/richmenu-pack/richmenu.png";

if (!token) throw new Error("LINE_CHANNEL_ACCESS_TOKEN is required");
if (!appUrl) throw new Error("NEXT_PUBLIC_APP_URL is required");

const raw = JSON.parse(fs.readFileSync(richMenuJson, "utf8"));
const actionMap = {
  "/entry": "/line/entry",
  "/wallet": "/line/wallet",
  "/catch": "/line/catch",
  "/ranking": "/ranking",
};

const menu = JSON.parse(JSON.stringify(raw).replace(/https?:\/\/[^"\\]+(\/entry|\/wallet|\/catch|\/ranking)/g, (_all, route) => {
  return `${appUrl}${actionMap[route] || route}`;
}));

for (const area of menu.areas || []) {
  if (area.action?.type === "uri" && area.action.uri?.startsWith("/")) {
    area.action.uri = `${appUrl}${area.action.uri}`;
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
