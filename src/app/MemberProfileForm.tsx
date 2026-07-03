"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MemberProfileForm({ name, alias }: { name: string; alias: string }) {
  const router = useRouter();
  const [form, setForm] = useState({ name, alias });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const res = await fetch("/api/member/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMessage(data.error || "บันทึกไม่สำเร็จ");
      return;
    }
    setMessage("บันทึกข้อมูลแล้ว");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="rounded-card bg-white p-5 shadow-sm ring-1 ring-line">
      <h2 className="font-display text-lg font-semibold text-deep">แก้ไขข้อมูลส่วนตัว</h2>
      <p className="mt-1 text-sm text-dim">ข้อมูลนี้ใช้แสดงในระบบสมาชิกและกระดานอันดับ</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">ชื่อแสดง</span>
          <input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 outline-none focus:border-pond focus:ring-2 focus:ring-pond/15" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">นามแฝง</span>
          <input value={form.alias} onChange={(e) => setForm((current) => ({ ...current, alias: e.target.value }))}
            placeholder="เช่น มือปลาช่อน"
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 outline-none focus:border-pond focus:ring-2 focus:ring-pond/15" />
        </label>
      </div>
      {message && <p className="mt-3 rounded-lg bg-mist px-3 py-2 text-sm text-deep">{message}</p>}
      <button disabled={busy} className="mt-4 rounded-lg bg-pond px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
        {busy ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
      </button>
    </form>
  );
}
