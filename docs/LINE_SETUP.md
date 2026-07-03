# LINE Official Account Setup

## 1. สร้าง LINE OA และ Messaging API

1. เข้า LINE Official Account Manager: https://manager.line.biz/
2. สร้างบัญชี `เคียงนา Fishing Lake`
3. เปิดใช้งาน Messaging API จากหน้า OA Manager
4. เข้า LINE Developers Console: https://developers.line.biz/console/
5. เลือก Provider เดียวกับ OA
6. เปิด Messaging API channel แล้วคัดลอก:
   - Channel secret
   - Channel access token

> LINE ระบุว่า Messaging API channel ต้องสร้างผ่าน LINE Official Account และเปิด Messaging API จาก OA Manager ไม่ใช่สร้าง channel ตรงใน Developers Console แล้ว

## 2. สร้าง LIFF

1. ใน Provider เดียวกัน สร้าง LINE Login channel หรือ LINE MINI App channel
2. เพิ่ม LIFF app
3. Endpoint URL:
   - `https://YOUR_DOMAIN/line/profile`
4. Scope:
   - `profile`
   - `openid`
5. คัดลอก LIFF ID และ LINE Login Channel ID

สำคัญ: Messaging API channel และ LIFF/LINE Login channel ควรอยู่ Provider เดียวกัน เพื่อให้ LINE userId ใช้งานร่วมกันได้ถูกต้อง

## 3. ตั้งค่า Environment

เพิ่มใน `.env.local` หรือ production env:

```env
NEXT_PUBLIC_APP_URL=https://YOUR_DOMAIN
NEXT_PUBLIC_LIFF_ID=YOUR_LIFF_ID
LINE_LOGIN_CHANNEL_ID=YOUR_LINE_LOGIN_CHANNEL_ID
LINE_CHANNEL_SECRET=YOUR_MESSAGING_API_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN=YOUR_MESSAGING_API_CHANNEL_ACCESS_TOKEN
```

## 4. ตั้งค่า Webhook

ใน LINE Developers Console > Messaging API:

```text
Webhook URL: https://YOUR_DOMAIN/api/line/webhook
Use webhook: Enabled
```

กด Verify ต้องได้ success

## 5. Rich Menu

ไฟล์ที่ใช้:

```text
/Users/zeroline/Downloads/files/richmenu-pack/richmenu.json
/Users/zeroline/Downloads/files/richmenu-pack/richmenu.png
```

รัน:

```bash
NEXT_PUBLIC_APP_URL=https://YOUR_DOMAIN \
LINE_CHANNEL_ACCESS_TOKEN=YOUR_TOKEN \
node scripts/line/setup-rich-menu.mjs
```

ระบบจะสร้าง Rich Menu, upload รูป และ set เป็น default ให้ทุกคน

## 6. URL ที่ Rich Menu ควรเปิด

- เข้าบ่อ: `/line/entry`
- กระเป๋าเงิน: `/line/wallet`
- ส่งปลา: `/line/catch`
- อันดับ: `/ranking`
- โปรไฟล์: `/line/profile`

## 7. Flow สมาชิก

1. สมาชิก add LINE OA
2. Webhook `follow` สร้าง/อัปเดตสมาชิกจาก LINE userId
3. สมาชิกเปิดเมนูใน Rich Menu
4. LIFF set session ให้สมาชิกอัตโนมัติ
5. สมาชิกทำรายการได้เฉพาะใน LINE:
   - สร้าง QR เข้าบ่อ
   - แจ้งเติมเครดิต
   - ส่งปลา
   - ดูอันดับ
   - แก้โปรไฟล์

## 8. สิ่งที่ระบบรองรับแล้ว

- Verify webhook signature
- Auto-create member จาก LINE follow
- LIFF session binding
- LINE-only QR check-in
- LINE-only topup request
- LINE-only catch submit
- Rich menu setup script
- Member profile/ranking/wallet/catch เชื่อมกับ session จาก LINE
