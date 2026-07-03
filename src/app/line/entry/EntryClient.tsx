"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import LineLiffGate from "@/components/LineLiffGate";

type Token = { payload: string; pin: string; memberCode: string; name: string; msLeft: number };

export default function EntryClient() {
  const [token, setToken] = useState<Token | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/line/entry-token", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "สร้าง QR ไม่สำเร็จ");
      return;
    }
    setToken(data);
    setError("");
  }

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 75_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <LineLiffGate>
      <main className="min-h-dvh bg-[#f5f8f7] px-4 py-6">
        <section className="mx-auto max-w-md rounded-lg bg-white p-6 text-center shadow-sm ring-1 ring-line">
          <p className="text-xs font-semibold uppercase tracking-widest text-dim">LINE Check-in</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-deep">QR เข้าบ่อ</h1>
          {error && <p className="mt-4 rounded-lg bg-buoy/10 px-3 py-2 text-sm text-buoy">{error}</p>}
          {token && (
            <div className="mt-6">
              <div className="mx-auto w-fit rounded-lg bg-white p-4 ring-1 ring-line">
                <QRCode value={token.payload} size={220} />
              </div>
              <p className="mt-4 font-mono text-2xl font-semibold text-deep">{token.pin}</p>
              <p className="mt-1 text-sm text-dim">{token.name} · {token.memberCode}</p>
              <p className="mt-4 text-xs text-dim">QR จะอัปเดตอัตโนมัติ กรุณาเปิดหน้านี้ให้เจ้าหน้าที่สแกน</p>
            </div>
          )}
          <button onClick={load} className="mt-6 w-full rounded-lg bg-pond py-3 font-semibold text-white">รีเฟรช QR</button>
        </section>
      </main>
    </LineLiffGate>
  );
}
