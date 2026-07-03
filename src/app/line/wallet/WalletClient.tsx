"use client";

import { useState } from "react";
import LineLiffGate from "@/components/LineLiffGate";

const amounts = [100, 300, 500, 1000, 2000];

export default function WalletClient() {
  const [payAmount, setPayAmount] = useState(300);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
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
      return;
    }
    setMessage(`รับคำขอเติมเครดิต ${data.payAmount} บาทแล้ว กรุณารอเจ้าหน้าที่ตรวจสอบ`);
  }

  return (
    <LineLiffGate>
      <main className="min-h-dvh bg-[#f5f8f7] px-4 py-6">
        <form onSubmit={submit} className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-sm ring-1 ring-line">
          <p className="text-xs font-semibold uppercase tracking-widest text-dim">LINE Wallet</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-deep">แจ้งเติมเครดิต</h1>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {amounts.map((amount) => (
              <button key={amount} type="button" onClick={() => setPayAmount(amount)}
                className={`rounded-lg px-4 py-3 text-sm font-semibold ${payAmount === amount ? "bg-pond text-white" : "bg-mist text-deep"}`}>
                ฿{amount.toLocaleString("th-TH")}
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm text-dim">หลังแจ้งเติมเครดิต กรุณาส่งสลิปในแชท LINE เพื่อให้เจ้าหน้าที่ตรวจสอบและอนุมัติ</p>
          {message && <p className="mt-4 rounded-lg bg-mist px-3 py-2 text-sm text-deep">{message}</p>}
          <button disabled={busy} className="mt-5 w-full rounded-lg bg-pond py-3 font-semibold text-white disabled:opacity-50">
            {busy ? "กำลังส่ง..." : "แจ้งเติมเครดิต"}
          </button>
          <a href="/wallet" className="mt-3 block text-center text-sm font-semibold text-pond">ดูยอดและประวัติ</a>
        </form>
      </main>
    </LineLiffGate>
  );
}
