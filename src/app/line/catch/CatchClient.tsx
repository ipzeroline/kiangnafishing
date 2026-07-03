"use client";

import { useState } from "react";
import LineLiffGate from "@/components/LineLiffGate";

export default function CatchClient({ species }: { species: string[] }) {
  const [form, setForm] = useState({ species: species[0] || "", weightKg: "", imagePath: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const res = await fetch("/api/line/catch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMessage(data.error || "ส่งผลงานปลาไม่สำเร็จ");
      return;
    }
    setForm({ species: species[0] || "", weightKg: "", imagePath: "" });
    setMessage("ส่งผลงานปลาเรียบร้อยแล้ว กรุณารอเจ้าหน้าที่ตรวจสอบ");
  }

  return (
    <LineLiffGate>
      <main className="min-h-dvh bg-[#f5f8f7] px-4 py-6">
        <form onSubmit={submit} className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-sm ring-1 ring-line">
          <p className="text-xs font-semibold uppercase tracking-widest text-dim">LINE Catch</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-deep">ส่งผลงานปลา</h1>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">ชนิดปลา</span>
              <select value={form.species} onChange={(e) => setForm((v) => ({ ...v, species: e.target.value }))}
                className="w-full rounded-lg border border-line px-3 py-3 outline-none focus:border-pond">
                {species.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">น้ำหนัก (กก.)</span>
              <input type="number" step="0.01" min="0" value={form.weightKg} onChange={(e) => setForm((v) => ({ ...v, weightKg: e.target.value }))}
                className="w-full rounded-lg border border-line px-3 py-3 outline-none focus:border-pond" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">ลิงก์รูปภาพ (ถ้ามี)</span>
              <input value={form.imagePath} onChange={(e) => setForm((v) => ({ ...v, imagePath: e.target.value }))}
                placeholder="หากไม่ระบุ ระบบจะใช้รูปมาตรฐาน"
                className="w-full rounded-lg border border-line px-3 py-3 outline-none focus:border-pond" />
            </label>
          </div>
          <p className="mt-4 text-sm text-dim">หลังส่งรายการแล้ว เจ้าหน้าที่จะตรวจสอบรูปภาพและน้ำหนักก่อนยืนยันเข้าสู่กระดานอันดับ</p>
          {message && <p className="mt-4 rounded-lg bg-mist px-3 py-2 text-sm text-deep">{message}</p>}
          <button disabled={busy || !form.species || !form.weightKg} className="mt-5 w-full rounded-lg bg-pond py-3 font-semibold text-white disabled:opacity-50">
            {busy ? "กำลังส่ง..." : "ส่งผลงานปลา"}
          </button>
          <a href="/catch" className="mt-3 block text-center text-sm font-semibold text-pond">ดูอัลบั้มของฉัน</a>
        </form>
      </main>
    </LineLiffGate>
  );
}
