import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { query, type FishCatch } from "@/lib/db";
import { thaiDate } from "@/lib/date";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";

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

  return (
    <main className="min-h-dvh bg-[#f5f8f7] pb-28">
      <TopBar title="ส่งผลงานปลา / อัลบั้มผลงาน" back />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8 xl:grid-cols-[420px_minmax(0,1fr)]">
        <aside className="rounded-card bg-white p-6 shadow-sm ring-1 ring-line">
          <h2 className="font-display text-xl font-semibold text-deep">ส่งผลงานปลาผ่าน LINE OA</h2>
          <p className="mt-2 text-sm leading-relaxed text-dim">
            การส่งผลงานปลาให้ใช้เมนู “ส่งผลงานปลา” ใน Rich Menu เท่านั้น เพื่อให้รูปภาพและข้อมูลรายการผูกกับ LINE ID ของสมาชิกโดยตรง
          </p>
          <div className="mt-5 rounded-lg border border-line bg-mist p-4 text-sm text-dim">
            กรุณาถ่ายรูปคู่ตาชั่งให้ชัดเจนแล้วส่งผ่าน LINE เจ้าหน้าที่จะตรวจสอบและยืนยันเข้าสู่กระดานอันดับ
          </div>
        </aside>
        <section className="rounded-card bg-white shadow-sm ring-1 ring-line">
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-display text-lg font-semibold text-deep">อัลบั้มของฉัน ({mine.length})</h2>
            <p className="text-sm text-dim">ติดตามสถานะผลงานที่ส่งเข้าระบบ</p>
          </div>
          {mine.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-dim">
              ยังไม่มีผลงาน
            </p>
          )}
          <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {mine.map((c) => (
              <figure key={c.id} className="overflow-hidden rounded-card bg-white shadow-sm ring-1 ring-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.imagePath} alt={`${c.species} ${c.weightKg} กก.`} className="h-40 w-full bg-mist object-cover" />
                <figcaption className="p-3">
                  <p className="text-sm font-semibold text-ink">{c.species} · {c.weightKg} กก.</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS[c.status]?.cls}`}>
                      {STATUS[c.status]?.label}
                    </span>
                    <span className="text-[10px] text-dim">{thaiDate(c.createdAt)}</span>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </div>
      <BottomNav />
    </main>
  );
}
