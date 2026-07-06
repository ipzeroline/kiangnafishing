import Link from "next/link";
import { requireLineBrowser } from "@/lib/line-request";
import { query, type FishStocking } from "@/lib/db";

export const dynamic = "force-dynamic";

function dateLabel(value: string) {
  const date = String(value || "").slice(0, 10);
  if (!date) return "-";
  return new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(new Date(`${date}T00:00:00`));
}

export default async function LineStockingPage() {
  await requireLineBrowser();

  const rows = await query<Pick<FishStocking, "id" | "imagePath" | "species" | "fishCount" | "totalWeightKg" | "stockingDate">>(`
    SELECT id, imagePath, species, fishCount, totalWeightKg, stockingDate
    FROM fish_stockings
    ORDER BY stockingDate DESC, createdAt DESC
    LIMIT 12
  `);
  const nf = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 });
  const totalFish = rows.reduce((sum, item) => sum + Number(item.fishCount || 0), 0);
  const totalWeight = rows.reduce((sum, item) => sum + Number(item.totalWeightKg || 0), 0);

  return (
    <main className="min-h-dvh bg-[#f5f8f7] px-3 py-3">
      <div className="mx-auto flex min-h-[calc(100dvh-1.5rem)] max-w-md flex-col gap-3">
        <section className="rounded-2xl bg-deep p-4 text-white shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/55">LINE Stocking</p>
              <h1 className="mt-1 font-display text-2xl font-semibold">ตารางลงปลา</h1>
              <p className="mt-1 text-xs text-white/65">ข้อมูลล่าสุดสำหรับสมาชิก LINE</p>
            </div>
            <Link href="/entry" className="shrink-0 rounded-full bg-white/12 px-3 py-1.5 text-xs font-semibold text-white">
              เมนู
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-xs text-white/55">จำนวนรวม</p>
              <p className="mt-1 font-display text-2xl font-semibold">{nf.format(totalFish)}</p>
              <p className="text-[11px] text-white/55">ตัว</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-xs text-white/55">น้ำหนักรวม</p>
              <p className="mt-1 font-display text-2xl font-semibold">{nf.format(totalWeight)}</p>
              <p className="text-[11px] text-white/55">กก.</p>
            </div>
          </div>
        </section>

        {rows.length > 0 ? (
          <section className="flex flex-1 flex-col rounded-2xl bg-white shadow-sm ring-1 ring-line">
            <div className="border-b border-line px-4 py-3">
              <p className="text-xs font-semibold text-pond">รายการลงปลาล่าสุด</p>
              <h2 className="mt-1 font-display text-xl font-semibold text-deep">อัปเดตจากบ่อ</h2>
            </div>
            <div className="divide-y divide-line/70">
              {rows.map((row, index) => (
                <article key={row.id} className="flex gap-3 px-4 py-3">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-mist ring-1 ring-line">
                    {row.imagePath ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={row.imagePath} alt={row.species} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-lg font-semibold text-deep">{index + 1}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-display text-lg font-semibold text-deep">{row.species}</h3>
                        <p className="mt-0.5 text-xs text-dim">{dateLabel(row.stockingDate)}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-mist px-2.5 py-1 text-xs font-semibold text-pond">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <p className="rounded-xl bg-[#f5f8f7] px-3 py-2 text-dim">
                        จำนวน <strong className="block text-deep">{nf.format(Number(row.fishCount || 0))} ตัว</strong>
                      </p>
                      <p className="rounded-xl bg-[#f5f8f7] px-3 py-2 text-dim">
                        น้ำหนัก <strong className="block text-deep">{nf.format(Number(row.totalWeightKg || 0))} กก.</strong>
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <section className="rounded-2xl bg-white px-4 py-8 text-center shadow-sm ring-1 ring-line">
            <h2 className="font-display text-xl font-semibold text-deep">ยังไม่มีรายการลงปลา</h2>
            <p className="mt-2 text-sm text-dim">เมื่อมีรอบลงปลาใหม่ ระบบจะแสดงรายการในหน้านี้</p>
          </section>
        )}
      </div>
    </main>
  );
}
