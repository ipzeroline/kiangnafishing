"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { RankingLevel } from "@/lib/db";
import RankingLevelBadge from "@/components/RankingLevelBadge";

type FormState = {
  levelId: string;
  levelNo: number;
  name: string;
  symbol: string;
  minScore: number;
  color: string;
  benefit: string;
  isSpecial: boolean;
  status: "ACTIVE" | "INACTIVE";
};

const emptyForm: FormState = {
  levelId: "",
  levelNo: 1,
  name: "",
  symbol: "",
  minScore: 0,
  color: "#135a66",
  benefit: "",
  isSpecial: false,
  status: "ACTIVE",
};

const SYMBOL_OPTIONS = [
  "ตะขอเบ็ด",
  "ทุ่นลอย",
  "คันเบ็ด",
  "ปลาเงิน",
  "ปลาใหญ่",
  "ถ้วยทองแดง",
  "ถ้วยทอง",
  "มงกุฎปลาใหญ่",
];

export default function RankingLevelManager({ levels }: { levels: RankingLevel[] }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const editing = Boolean(form.levelId);

  function openCreate() {
    setForm({ ...emptyForm, levelNo: (levels.at(-1)?.levelNo || 0) + 1 });
    setMessage("");
    setModalOpen(true);
  }

  function edit(level: RankingLevel) {
    setForm({
      levelId: level.id,
      levelNo: level.levelNo,
      name: level.name,
      symbol: level.symbol,
      minScore: level.minScore,
      color: level.color,
      benefit: level.benefit,
      isSpecial: Boolean(level.isSpecial),
      status: level.status,
    });
    setMessage("");
    setModalOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const res = await fetch("/api/admin/ranking-levels", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMessage(data.error || "บันทึก Level ไม่สำเร็จ");
      return;
    }
    setModalOpen(false);
    setForm(emptyForm);
    setMessage("บันทึก Level แล้ว");
    router.refresh();
  }

  return (
    <section className="space-y-4">
      {message && <p className="rounded-lg bg-mist px-3 py-2 text-sm font-medium text-deep">{message}</p>}
      <div className="rounded-lg bg-white shadow-sm ring-1 ring-line">
        <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-deep">Level Ranking</h3>
            <p className="text-sm text-dim">กำหนดชื่อระดับ สัญลักษณ์ สี คะแนนขั้นต่ำ และสิทธิประโยชน์</p>
          </div>
          <button onClick={openCreate} className="w-fit rounded-lg bg-pond px-4 py-2 text-sm font-semibold text-white">เพิ่ม Level</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left text-sm">
            <thead className="bg-mist/60 text-xs uppercase tracking-wide text-dim">
              <tr>
                <th className="px-5 py-3">Level</th>
                <th className="px-5 py-3">สัญลักษณ์</th>
                <th className="px-5 py-3 text-right">คะแนนขั้นต่ำ</th>
                <th className="px-5 py-3">สิทธิประโยชน์</th>
                <th className="px-5 py-3">สถานะ</th>
                <th className="px-5 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {levels.map((level) => (
                <tr key={level.id}>
                  <td className="px-5 py-4">
                    <RankingLevelBadge level={level} size="md" />
                    {Boolean(level.isSpecial) && <p className="mt-1 text-xs font-semibold text-buoy">ระดับพิเศษ</p>}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <RankingLevelBadge level={level} size="sm" />
                      <span className="font-semibold text-ink">{level.symbol}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-deep">{level.minScore.toLocaleString("th-TH")}</td>
                  <td className="px-5 py-4 text-dim">{level.benefit || "-"}</td>
                  <td className="px-5 py-4">
                    <span className={level.status === "ACTIVE" ? "rounded-full bg-pond/10 px-2.5 py-1 text-xs font-semibold text-pond" : "rounded-full bg-mist px-2.5 py-1 text-xs font-semibold text-dim"}>
                      {level.status === "ACTIVE" ? "ใช้งาน" : "ปิด"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => edit(level)} className="rounded-lg bg-deep px-3 py-1.5 text-xs font-semibold text-white">แก้ไข</button>
                  </td>
                </tr>
              ))}
              {levels.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-dim">ยังไม่มี Level</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-deep/55 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
          <form onSubmit={submit} className="max-h-[calc(100dvh-3rem)] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-5 shadow-xl ring-1 ring-line">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-semibold text-deep">{editing ? "แก้ไข Level" : "เพิ่ม Level"}</h3>
                <p className="text-sm text-dim">Level ที่เปิดใช้งานจะถูกนำไปแสดงใน Ranking สมาชิกอัตโนมัติ</p>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg bg-mist px-3 py-1.5 text-sm font-semibold text-deep">ปิด</button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">เลข Level</span>
                <input type="number" min={1} max={99} value={form.levelNo} onChange={(e) => setForm((v) => ({ ...v, levelNo: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">คะแนนขั้นต่ำ</span>
                <input type="number" min={0} value={form.minScore} onChange={(e) => setForm((v) => ({ ...v, minScore: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">ชื่อระดับ</span>
                <input required value={form.name} onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))}
                  className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">สัญลักษณ์</span>
                <select required value={form.symbol} onChange={(e) => setForm((v) => ({ ...v, symbol: e.target.value }))}
                  className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond">
                  <option value="">เลือกสัญลักษณ์</option>
                  {SYMBOL_OPTIONS.map((symbol) => <option key={symbol} value={symbol}>{symbol}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">สี Badge</span>
                <input type="color" value={form.color} onChange={(e) => setForm((v) => ({ ...v, color: e.target.value }))}
                  className="h-11 w-full rounded-lg border border-line bg-white px-2 py-1 outline-none focus:border-pond" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">สถานะ</span>
                <select value={form.status} onChange={(e) => setForm((v) => ({ ...v, status: e.target.value as "ACTIVE" | "INACTIVE" }))}
                  className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond">
                  <option value="ACTIVE">ใช้งาน</option>
                  <option value="INACTIVE">ปิด</option>
                </select>
              </label>
              <label className="block md:col-span-2">
                <span className="mb-1 block text-sm font-medium text-ink">สิทธิประโยชน์ / หมายเหตุ</span>
                <textarea value={form.benefit} onChange={(e) => setForm((v) => ({ ...v, benefit: e.target.value }))}
                  className="min-h-24 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" />
              </label>
              <label className="flex items-center gap-3 rounded-lg bg-mist px-3 py-3 md:col-span-2">
                <input type="checkbox" checked={form.isSpecial} onChange={(e) => setForm((v) => ({ ...v, isSpecial: e.target.checked }))}
                  className="h-4 w-4 accent-pond" />
                <span className="text-sm font-semibold text-deep">เป็นระดับพิเศษ เช่น Hall of Fame</span>
              </label>
              {form.symbol && (
                <div className="rounded-lg bg-deep p-4 text-white md:col-span-2">
                  <p className="mb-3 text-sm text-white/65">ตัวอย่าง Badge</p>
                  <RankingLevelBadge
                    size="lg"
                    level={{
                      id: form.levelId || "preview",
                      levelNo: form.levelNo,
                      name: form.name || "ตัวอย่าง Level",
                      symbol: form.symbol,
                      minScore: form.minScore,
                      color: form.color,
                      benefit: form.benefit,
                      isSpecial: form.isSpecial ? 1 : 0,
                      status: form.status,
                      createdAt: "",
                    }}
                  />
                </div>
              )}
            </div>
            {message && <p className="mt-4 rounded-lg bg-buoy/10 px-3 py-2 text-sm text-buoy">{message}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg bg-mist px-4 py-2.5 text-sm font-semibold text-deep">ยกเลิก</button>
              <button disabled={busy} className="rounded-lg bg-pond px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                {busy ? "กำลังบันทึก..." : "บันทึก Level"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
