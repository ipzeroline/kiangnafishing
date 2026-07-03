"use client";

import { useEffect, useState } from "react";
import LineLiffGate from "@/components/LineLiffGate";
import { getAmountFor } from "@/lib/wallet";

const amounts = [100, 300, 500, 1000, 2000];
type PendingTopup = { id: string; payAmount: number; getAmount: number; createdAt: string };

export default function WalletClient() {
  return (
    <LineLiffGate>
      <WalletPanel />
    </LineLiffGate>
  );
}

function WalletPanel() {
  const [payAmount, setPayAmount] = useState(300);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PendingTopup | null>(null);
  const [balance, setBalance] = useState(0);
  const [points, setPoints] = useState(0);
  const getAmount = getAmountFor(payAmount);

  async function loadStatus() {
    setLoading(true);
    const res = await fetch("/api/line/topup", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setMessage(data.error || "โหลดข้อมูลกระเป๋าเงินไม่สำเร็จ");
      return;
    }
    setPending(data.pending || null);
    setBalance(Number(data.walletBalance || 0));
    setPoints(Number(data.points || 0));
  }

  useEffect(() => {
    void loadStatus();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setBusy(true);
    setMessage("");
    const res = await fetch("/api/line/topup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payAmount }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMessage(data.error || "แจ้งเติมเงินไม่สำเร็จ");
      if (data.pending) setPending(data.pending);
      return;
    }
    setPending({ id: data.topupId, payAmount: data.payAmount, getAmount: data.getAmount, createdAt: new Date().toISOString() });
    setMessage("ส่งคำขอเติมเครดิตแล้ว กรุณารอเจ้าหน้าที่ตรวจสอบก่อนทำรายการใหม่");
  }

  return (
    <main className="min-h-dvh bg-[#f5f8f7] px-4 py-6">
      <div className="mx-auto grid max-w-4xl gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <form onSubmit={submit} className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-line">
          <p className="text-xs font-semibold uppercase tracking-widest text-dim">LINE Wallet</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-deep">แจ้งเติมเครดิต</h1>
          <p className="mt-2 text-sm leading-relaxed text-dim">
            เลือกยอดเติมแล้วส่งคำขอ 1 รายการต่อครั้ง เมื่อเจ้าหน้าที่อนุมัติหรือปฏิเสธแล้วจึงทำรายการใหม่ได้
          </p>

          {pending && (
            <div className="mt-5 rounded-lg border border-gold bg-gold/10 p-4">
              <p className="text-sm font-semibold text-deep">มีรายการรออนุมัติ</p>
              <p className="mt-1 text-sm text-dim">
                โอน ฿{pending.payAmount.toLocaleString("th-TH")} รับเครดิต ฿{pending.getAmount.toLocaleString("th-TH")}
              </p>
              <p className="mt-2 text-xs text-dim">กรุณาส่งสลิปในแชท LINE และรอเจ้าหน้าที่ตรวจสอบก่อนทำรายการใหม่</p>
            </div>
          )}

          <div className="mt-5 grid grid-cols-2 gap-2">
            {amounts.map((amount) => (
              <button key={amount} type="button" disabled={Boolean(pending) || loading} onClick={() => setPayAmount(amount)}
                className={`rounded-lg px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45 ${payAmount === amount ? "bg-pond text-white" : "bg-mist text-deep"}`}>
                ฿{amount.toLocaleString("th-TH")}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-mist p-4">
            <p className="text-sm font-semibold text-deep">สรุปรายการ</p>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-dim">ยอดโอน</span>
              <span className="font-semibold text-deep">฿{payAmount.toLocaleString("th-TH")}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-dim">เครดิตที่จะได้รับ</span>
              <span className="font-semibold text-pond">฿{getAmount.toLocaleString("th-TH")}</span>
            </div>
          </div>
          {message && <p className="mt-4 rounded-lg bg-mist px-3 py-2 text-sm text-deep">{message}</p>}
          <button disabled={busy || loading || Boolean(pending)} className="mt-5 w-full rounded-lg bg-pond py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? "กำลังโหลด..." : busy ? "กำลังส่ง..." : pending ? "รออนุมัติรายการเดิม" : "แจ้งเติมเครดิต"}
          </button>
        </form>

        <aside className="rounded-lg bg-deep p-6 text-white shadow-sm">
          <p className="text-sm text-white/60">ยอดคงเหลือ</p>
          <p className="mt-2 font-display text-3xl font-semibold">฿{balance.toLocaleString("th-TH")}</p>
          <div className="mt-4 rounded-lg bg-white/10 p-3">
            <p className="text-sm text-white/55">แต้มสะสม</p>
            <p className="mt-1 text-xl font-semibold">{points.toLocaleString("th-TH")}</p>
          </div>
          <div className="mt-4 space-y-2 text-sm text-white/70">
            <p>1. เลือกยอดเติม</p>
            <p>2. กดแจ้งเติมเครดิต</p>
            <p>3. ส่งสลิปในแชท LINE</p>
            <p>4. รอเจ้าหน้าที่อนุมัติ</p>
          </div>
          <button onClick={() => void loadStatus()} className="mt-5 w-full rounded-lg bg-white/12 py-2.5 text-sm font-semibold text-white">
            รีเฟรชสถานะ
          </button>
          <a href="/wallet" className="mt-3 block text-center text-sm font-semibold text-white">ดูยอดและประวัติ</a>
        </aside>
      </div>
    </main>
  );
}
