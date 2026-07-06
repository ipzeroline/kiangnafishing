import { requireLineBrowser } from "@/lib/line-request";

const staffContactLineUrl = "https://line.me/ti/p/SeS2mH9yey";

const actions = [
  { href: "/line/entry", label: "QR เข้าบ่อ", detail: "เปิดให้เจ้าหน้าที่สแกน", tone: "bg-pond text-white" },
  { href: "/line/wallet", label: "เติมเครดิต", detail: "เลือกยอดหรือกรอกเอง", tone: "bg-white text-deep" },
  { href: "/wallet", label: "รายละเอียด", detail: "ยอดเงิน แต้ม และประวัติ", tone: "bg-white text-deep" },
  { href: "/ranking", label: "อันดับ", detail: "กระดานนักตกปลา", tone: "bg-white text-deep" },
  { href: "/line/catch", label: "ส่งผลงานปลา", detail: "อัปโหลดรูปและน้ำหนัก", tone: "bg-white text-deep" },
  { href: "/catch", label: "อัลบั้มผลงาน", detail: "ตรวจสถานะผลงานของฉัน", tone: "bg-white text-deep" },
  { href: "/line/stocking", label: "ตารางลงปลา", detail: "รอบลงปลาใน LINE", tone: "bg-white text-deep" },
  { href: "/line/profile", label: "โปรไฟล์", detail: "จัดการชื่อและรูป", tone: "bg-white text-deep" },
  { href: staffContactLineUrl, label: "ติดต่อแอดมิน", detail: "แอด LINE เจ้าหน้าที่", tone: "bg-white text-deep" },
];

export const dynamic = "force-dynamic";

export default async function EntryPage() {
  await requireLineBrowser();

  return (
    <main className="min-h-dvh bg-[#f5f8f7] px-3 py-3">
      <div className="mx-auto flex min-h-[calc(100dvh-1.5rem)] max-w-md flex-col gap-3">
        <section className="rounded-2xl bg-deep p-4 text-white shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/55">LINE Menu</p>
              <h1 className="mt-1 font-display text-2xl font-semibold">เมนูบริการ</h1>
              <p className="mt-1 text-xs text-white/65">ศูนย์รวมบริการสมาชิกใน LINE</p>
            </div>
            <a href="/line/entry" className="shrink-0 rounded-full bg-white/12 px-3 py-1.5 text-xs font-semibold text-white">
              QR
            </a>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-white/65">
            <span className="rounded-xl bg-white/10 px-2 py-2">เข้าบ่อ</span>
            <span className="rounded-xl bg-white/10 px-2 py-2">เติมเครดิต</span>
            <span className="rounded-xl bg-white/10 px-2 py-2">ผลงาน</span>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-2">
          {actions.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className={`rounded-2xl p-3 shadow-sm ring-1 ring-line ${item.tone}`}
            >
              <span className="block font-semibold">{item.label}</span>
              <span className={`mt-1 block text-xs ${item.tone.includes("text-white") ? "text-white/70" : "text-dim"}`}>{item.detail}</span>
            </a>
          ))}
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-line">
          <p className="text-xs font-semibold text-pond">ใช้งานหน้าบ่อ</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-deep">เปิด QR ให้เจ้าหน้าที่สแกน</h2>
          <p className="mt-2 text-sm leading-relaxed text-dim">
            เมนูนี้เป็นหน้ารวมทางลัดของสมาชิก ถ้าจะเข้าบ่อให้กด “QR เข้าบ่อ” เพื่อสร้างรหัสจากบัญชี LINE ของตัวเอง
          </p>
        </section>
      </div>
    </main>
  );
}
