import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { thaiDateTime } from "@/lib/date";
import { requireLineBrowser } from "@/lib/line-request";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = { TOPUP: "เติมเงิน", ENTRY_FEE: "ค่าเข้าบ่อ", REWARD: "รางวัล/แต้ม" };

export default async function WalletPage() {
  await requireLineBrowser();
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const txs = await query<{ id: string; type: string; amount: number; note: string; createdAt: string }>(
    "SELECT * FROM transactions WHERE userId=? ORDER BY createdAt DESC LIMIT 20",
    [user.id]
  );
  const pending = await query<{ id: string; payAmount: number; getAmount: number }>(
    "SELECT * FROM topups WHERE userId=? AND status='PENDING' ORDER BY createdAt DESC",
    [user.id]
  );

  return (
    <main className="min-h-dvh bg-[#f5f8f7] px-3 py-3">
      <div className="mx-auto flex min-h-[calc(100dvh-1.5rem)] max-w-md flex-col gap-3">
        <section className="rounded-2xl bg-deep p-4 text-white shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/55">LINE Wallet</p>
              <h1 className="mt-1 font-display text-2xl font-semibold">รายละเอียด</h1>
              <p className="mt-1 truncate text-xs text-white/65">
                {user.name} · <span className="font-mono">{user.memberCode}</span>
              </p>
            </div>
            <a href="/line/wallet" className="shrink-0 rounded-full bg-white/12 px-3 py-1.5 text-xs font-semibold text-white">
              เติมเงิน
            </a>
          </div>
          <div className="mt-4 grid grid-cols-[1.2fr_.8fr] gap-2">
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-xs text-white/55">ยอดคงเหลือ</p>
              <p className="mt-1 font-display text-3xl font-semibold">฿{user.walletBalance.toLocaleString("th-TH")}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-xs text-white/55">แต้ม</p>
              <p className="mt-1 text-2xl font-semibold">{user.points.toLocaleString("th-TH")}</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-2 text-center">
          <a href="/line/entry" className="rounded-xl bg-white px-2 py-3 text-xs font-semibold text-deep shadow-sm ring-1 ring-line">
            QR เข้าบ่อ
          </a>
          <a href="/ranking" className="rounded-xl bg-white px-2 py-3 text-xs font-semibold text-deep shadow-sm ring-1 ring-line">
            อันดับ
          </a>
          <a href="/line/catch" className="rounded-xl bg-white px-2 py-3 text-xs font-semibold text-deep shadow-sm ring-1 ring-line">
            ส่งผลงาน
          </a>
        </section>

        {pending.length > 0 && (
          <section className="rounded-2xl border border-gold bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-deep">รอยืนยัน</p>
              <p className="rounded-full bg-gold/10 px-2.5 py-1 text-[11px] font-semibold text-deep">
                {pending.length.toLocaleString("th-TH")} รายการ
              </p>
            </div>
            <div className="mt-2 grid gap-2">
              {pending.map((p) => (
                <p key={p.id} className="flex items-center justify-between rounded-xl bg-gold/10 px-3 py-2 text-sm">
                  <span className="font-semibold text-deep">โอน ฿{p.payAmount.toLocaleString("th-TH")}</span>
                  <span className="text-xs font-semibold text-pond">รับ ฿{p.getAmount.toLocaleString("th-TH")}</span>
                </p>
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-1 flex-col rounded-2xl bg-white shadow-sm ring-1 ring-line">
          <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-pond">รายการล่าสุด</p>
              <h2 className="mt-0.5 font-display text-xl font-semibold text-deep">ประวัติการใช้งาน</h2>
            </div>
            <p className="shrink-0 rounded-full bg-mist px-3 py-1.5 text-xs font-semibold text-dim">
              {txs.length.toLocaleString("th-TH")}/20
            </p>
          </div>
          {txs.length === 0 && <p className="px-4 py-8 text-center text-sm text-dim">ยังไม่มีรายการ</p>}
          <ul className="divide-y divide-line/70">
            {txs.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate font-semibold text-ink">{TYPE_LABEL[t.type] ?? t.type}</p>
                  </div>
                  {t.note && <p className="mt-0.5 truncate text-xs text-dim">{t.note}</p>}
                  <p className="mt-0.5 truncate text-[11px] font-medium text-dim">{thaiDateTime(t.createdAt)}</p>
                </div>
                {t.amount !== 0 && (
                  <span className={`shrink-0 font-display text-base font-semibold ${t.amount > 0 ? "text-pond" : "text-buoy"}`}>
                    {t.amount > 0 ? "+" : ""}{t.amount.toLocaleString("th-TH")}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
