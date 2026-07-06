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
  const invalidAmount = payAmount < 1;

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
    <main className="min-h-dvh bg-[#f5f8f7] px-3 py-3">
      <div className="mx-auto flex min-h-[calc(100dvh-1.5rem)] max-w-md flex-col gap-3">
        <section className="rounded-2xl bg-deep p-4 text-white shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/55">LINE Wallet</p>
              <h1 className="mt-1 font-display text-2xl font-semibold">กระเป๋าเงิน</h1>
            </div>
            <div className="flex shrink-0 flex-col gap-1.5">
              <a href="/line/profile" className="rounded-full bg-white px-3 py-1.5 text-center text-xs font-semibold text-deep">
                แก้รูป
              </a>
              <button onClick={() => void loadStatus()} className="rounded-full bg-white/12 px-3 py-1.5 text-xs font-semibold text-white">
                รีเฟรช
              </button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-[1.2fr_.8fr] gap-2">
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-xs text-white/55">ยอดคงเหลือ</p>
              <p className="mt-1 font-display text-3xl font-semibold">฿{balance.toLocaleString("th-TH")}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-xs text-white/55">แต้ม</p>
              <p className="mt-1 text-2xl font-semibold">{points.toLocaleString("th-TH")}</p>
            </div>
          </div>
        </section>

        <form onSubmit={submit} className="flex flex-1 flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-line">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-pond">เติมเครดิต</p>
              <h2 className="mt-1 font-display text-xl font-semibold text-deep">เลือกหรือกรอกยอด</h2>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <a href="/line/profile" className="rounded-full bg-mist px-3 py-1.5 text-xs font-semibold text-deep">โปรไฟล์</a>
              <a href="/wallet" className="rounded-full bg-mist px-3 py-1.5 text-xs font-semibold text-deep">ประวัติ</a>
            </div>
          </div>

          {pending ? (
            <div className="mt-3 rounded-xl border border-gold bg-gold/10 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-deep">รออนุมัติ</p>
                  <p className="mt-1 text-xs text-dim">ส่งสลิปในแชท LINE แล้วรอเจ้าหน้าที่ตรวจสอบ</p>
                </div>
                <p className="shrink-0 text-right text-sm font-semibold text-deep">
                  ฿{pending.payAmount.toLocaleString("th-TH")}
                  <span className="block text-xs text-pond">รับ ฿{pending.getAmount.toLocaleString("th-TH")}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {amounts.map((amount) => (
                  <button key={amount} type="button" disabled={loading} onClick={() => setPayAmount(amount)}
                    className={`rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${payAmount === amount ? "bg-pond text-white shadow-sm" : "bg-mist text-deep"}`}>
                    ฿{amount.toLocaleString("th-TH")}
                  </button>
                ))}
              </div>
              <label className="block rounded-xl border border-line bg-[#f5f8f7] px-3 py-2.5">
                <span className="block text-xs font-semibold text-dim">กรอกจำนวนเอง</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-display text-xl font-semibold text-deep">฿</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    disabled={loading}
                    value={payAmount || ""}
                    onChange={(e) => setPayAmount(Math.max(0, Math.floor(Number(e.target.value || 0))))}
                    className="min-w-0 flex-1 bg-transparent text-xl font-semibold text-deep outline-none placeholder:text-dim/60 disabled:opacity-45"
                    placeholder="ใส่ยอดที่ต้องการ"
                  />
                </div>
              </label>
            </div>
          )}

          <div className="mt-3 rounded-xl bg-mist p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-dim">ยอดโอน</span>
              <span className="font-semibold text-deep">฿{payAmount.toLocaleString("th-TH")}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-dim">เครดิตเข้า</span>
              <span className="font-semibold text-pond">฿{getAmount.toLocaleString("th-TH")}</span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[11px] font-semibold text-dim">
            <span className="rounded-full bg-[#f5f8f7] px-2 py-1.5">เลือกยอด</span>
            <span className="rounded-full bg-[#f5f8f7] px-2 py-1.5">แจ้งเติม</span>
            <span className="rounded-full bg-[#f5f8f7] px-2 py-1.5">ส่งสลิป</span>
          </div>

          {message && <p className="mt-3 rounded-xl bg-mist px-3 py-2 text-xs leading-relaxed text-deep">{message}</p>}
          <button disabled={busy || loading || Boolean(pending) || invalidAmount} className="mt-auto w-full rounded-xl bg-pond py-3.5 font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? "กำลังโหลด..." : busy ? "กำลังส่ง..." : pending ? "รออนุมัติรายการเดิม" : "แจ้งเติมเครดิต"}
          </button>
          <p className="mt-2 text-center text-[11px] text-dim">ทำรายการได้ครั้งละ 1 รายการ หลังอนุมัติแล้วจึงเติมใหม่ได้</p>
        </form>
      </div>
    </main>
  );
}
