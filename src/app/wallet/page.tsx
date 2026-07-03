import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { thaiDateTime } from "@/lib/date";
import WalletCard from "@/components/WalletCard";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = { TOPUP: "เติมเงิน", ENTRY_FEE: "ค่าเข้าบ่อ", REWARD: "รางวัล/แต้ม" };

export default async function WalletPage() {
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
    <main className="min-h-dvh bg-[#f5f8f7] pb-28">
      <TopBar title="กระเป๋าเงิน" back />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <WalletCard balance={user.walletBalance} points={user.points} name={user.name} memberCode={user.memberCode} />
          <div className="rounded-card bg-white p-6 shadow-sm ring-1 ring-line">
            <h2 className="font-display text-xl font-semibold text-deep">กระเป๋าเงิน</h2>
            <p className="mt-2 text-sm leading-relaxed text-dim">
              หน้านี้ใช้ดูยอดคงเหลือและประวัติเท่านั้น การเติมเงินต้องทำผ่าน LINE Official Account จาก Rich Menu เพื่อผูกธุรกรรมกับบัญชี LINE ของสมาชิก
            </p>
            <div className="mt-5 rounded-lg border border-line bg-mist p-4">
              <p className="text-sm font-semibold text-deep">เมนูใน LINE</p>
              <p className="mt-1 text-sm text-dim">เปิดปุ่ม “กระเป๋าเงิน” ใน Rich Menu เพื่อเติมเงินหรือแจ้งสลิป</p>
            </div>
          </div>
        </section>

        {pending.length > 0 && (
          <section className="mt-6 rounded-card border-l-4 border-gold bg-white p-5 shadow-sm ring-1 ring-line">
            <p className="text-sm font-semibold text-ink">รายการเติมเงินรอยืนยัน</p>
            <div className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {pending.map((p) => (
                <p key={p.id} className="rounded-md bg-mist px-3 py-2 text-sm text-dim">โอน ฿{p.payAmount.toLocaleString()} รับ ฿{p.getAmount.toLocaleString()}</p>
              ))}
            </div>
          </section>
        )}

        <section className="mt-6 rounded-card bg-white shadow-sm ring-1 ring-line">
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-display text-lg font-semibold text-deep">ประวัติธุรกรรม</h2>
            <p className="text-sm text-dim">รายการล่าสุดจากกระเป๋าเงินและแต้มสะสม</p>
          </div>
          {txs.length === 0 && <p className="px-5 py-8 text-center text-sm text-dim">ยังไม่มีรายการ</p>}
          <ul className="divide-y divide-line/70">
            {txs.map((t) => (
              <li key={t.id} className="flex items-center gap-4 px-5 py-4 text-sm">
                <div className="flex-1">
                  <p className="font-medium text-ink">{TYPE_LABEL[t.type] ?? t.type}</p>
                  <p className="text-xs text-dim">{t.note} · {thaiDateTime(t.createdAt)}</p>
                </div>
                {t.amount !== 0 && (
                  <span className={`font-display font-semibold ${t.amount > 0 ? "text-pond" : "text-buoy"}`}>
                    {t.amount > 0 ? "+" : ""}{t.amount.toLocaleString()}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
      <BottomNav />
    </main>
  );
}
