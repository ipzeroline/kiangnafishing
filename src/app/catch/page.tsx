import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { query, type FishCatch } from "@/lib/db";
import { thaiDate } from "@/lib/date";

export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "รอยืนยัน", cls: "bg-gold/15 text-gold" },
  VERIFIED: { label: "ยืนยันแล้ว", cls: "bg-pond/10 text-pond" },
  REJECTED: { label: "ไม่ผ่าน", cls: "bg-buoy/10 text-buoy" },
};

export default async function CatchPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const mine = await query<FishCatch>("SELECT * FROM catches WHERE userId=? ORDER BY createdAt DESC LIMIT 30", [user.id]);
  const pendingCount = mine.filter((item) => item.status === "PENDING").length;
  const verifiedCount = mine.filter((item) => item.status === "VERIFIED").length;
  const rejectedCount = mine.filter((item) => item.status === "REJECTED").length;

  return (
    <main className="min-h-dvh bg-[#f5f8f7] px-3 py-3">
      <div className="mx-auto flex min-h-[calc(100dvh-1.5rem)] max-w-md flex-col gap-3">
        <section className="rounded-2xl bg-deep p-4 text-white shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/55">LINE Catch</p>
              <h1 className="mt-1 font-display text-2xl font-semibold">ผลงานปลา</h1>
              <p className="mt-1 truncate text-xs text-white/65">
                {user.name} · <span className="font-mono">{user.memberCode}</span>
              </p>
            </div>
            <a href="/line/catch" className="shrink-0 rounded-full bg-white/12 px-3 py-1.5 text-xs font-semibold text-white">
              ส่งผลงาน
            </a>
          </div>
          <div className="mt-4 grid grid-cols-[1.2fr_.8fr] gap-2">
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-xs text-white/55">ผลงานทั้งหมด</p>
              <p className="mt-1 font-display text-3xl font-semibold">{mine.length.toLocaleString("th-TH")}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-xs text-white/55">ยืนยันแล้ว</p>
              <p className="mt-1 text-2xl font-semibold">{verifiedCount.toLocaleString("th-TH")}</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-2 text-center">
          <article className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-line">
            <p className="text-[11px] text-dim">รอยืนยัน</p>
            <strong className="mt-1 block text-lg text-deep">{pendingCount.toLocaleString("th-TH")}</strong>
          </article>
          <article className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-line">
            <p className="text-[11px] text-dim">ผ่านแล้ว</p>
            <strong className="mt-1 block text-lg text-pond">{verifiedCount.toLocaleString("th-TH")}</strong>
          </article>
          <article className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-line">
            <p className="text-[11px] text-dim">ไม่ผ่าน</p>
            <strong className="mt-1 block text-lg text-buoy">{rejectedCount.toLocaleString("th-TH")}</strong>
          </article>
        </section>

        <section className="flex flex-1 flex-col rounded-2xl bg-white shadow-sm ring-1 ring-line">
          <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-pond">อัลบั้มของฉัน</p>
              <h2 className="mt-0.5 font-display text-xl font-semibold text-deep">รายการล่าสุด</h2>
            </div>
            <p className="shrink-0 rounded-full bg-mist px-3 py-1.5 text-xs font-semibold text-dim">
              {mine.length.toLocaleString("th-TH")}/30
            </p>
          </div>
          {mine.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="font-semibold text-deep">ยังไม่มีผลงาน</p>
              <p className="mt-1 text-sm text-dim">ถ่ายรูปคู่ตาชั่งให้ชัด แล้วส่งผลงานเพื่อให้เจ้าหน้าที่ตรวจสอบ</p>
              <a href="/line/catch" className="mt-4 inline-flex rounded-xl bg-pond px-4 py-2.5 text-sm font-semibold text-white">ส่งผลงานปลา</a>
            </div>
          )}
          <div className="grid gap-3 p-3">
            {mine.map((c) => (
              <figure key={c.id} className="grid grid-cols-[112px_minmax(0,1fr)] overflow-hidden rounded-xl bg-[#f5f8f7] ring-1 ring-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.imagePath} alt={`${c.species} ${c.weightKg} กก.`} className="h-full min-h-28 w-full bg-mist object-cover" />
                <figcaption className="min-w-0 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{c.species}</p>
                      <p className="font-display text-lg font-semibold text-deep">{Number(c.weightKg).toLocaleString("th-TH")} กก.</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS[c.status]?.cls}`}>
                      {STATUS[c.status]?.label}
                    </span>
                  </div>
                  {c.caption && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-dim">{c.caption}</p>}
                  <p className="mt-2 text-[11px] font-medium text-dim">{thaiDate(c.createdAt)}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
