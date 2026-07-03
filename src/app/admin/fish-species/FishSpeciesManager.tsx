"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FishSpecies } from "@/lib/db";

type SpeciesRow = FishSpecies & {
  catchCount: number;
  verifiedCount: number;
  maxWeight: number;
};

type FormState = {
  speciesId: string;
  name: string;
  category: string;
  pointRate: number;
  minWeightKg: number;
  status: "ACTIVE" | "INACTIVE";
};

const emptyForm: FormState = {
  speciesId: "",
  name: "",
  category: "",
  pointRate: 5,
  minWeightKg: 0,
  status: "ACTIVE",
};

export default function FishSpeciesManager({ species }: { species: SpeciesRow[] }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const editing = Boolean(form.speciesId);

  function openCreate() {
    setForm(emptyForm);
    setMessage("");
    setModalOpen(true);
  }

  function edit(row: SpeciesRow) {
    setForm({
      speciesId: row.id,
      name: row.name,
      category: row.category,
      pointRate: row.pointRate,
      minWeightKg: Number(row.minWeightKg),
      status: row.status,
    });
    setMessage("");
    setModalOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const res = await fetch("/api/admin/fish-species", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMessage(data.error || "บันทึกชนิดปลาไม่สำเร็จ");
      return;
    }
    setModalOpen(false);
    setForm(emptyForm);
    setMessage("บันทึกชนิดปลาแล้ว");
    router.refresh();
  }

  return (
    <section className="space-y-4">
      {message && <p className="rounded-lg bg-mist px-3 py-2 text-sm font-medium text-deep">{message}</p>}
      <div className="rounded-lg bg-white shadow-sm ring-1 ring-line">
        <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-deep">ชนิดปลา</h3>
            <p className="text-sm text-dim">กำหนดชื่อปลา หมวดหมู่ แต้มพื้นฐาน และน้ำหนักขั้นต่ำสำหรับรายการส่งผลงานปลา</p>
          </div>
          <button onClick={openCreate} className="w-fit rounded-lg bg-pond px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-pond/20">
            เพิ่มชนิดปลา
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-mist/60 text-xs uppercase tracking-wide text-dim">
              <tr>
                <th className="px-5 py-3">ชนิดปลา</th>
                <th className="px-5 py-3">แต้ม/เงื่อนไข</th>
                <th className="px-5 py-3">สถิติ</th>
                <th className="px-5 py-3">สถานะ</th>
                <th className="px-5 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {species.map((row) => (
                <tr key={row.id}>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-ink">{row.name}</p>
                    <p className="text-xs text-dim">{row.category || "ไม่ระบุหมวดหมู่"}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-deep">{row.pointRate.toLocaleString("th-TH")} แต้ม</p>
                    <p className="text-xs text-dim">น้ำหนักขั้นต่ำ {Number(row.minWeightKg).toFixed(2)} กก.</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-ink">{row.catchCount.toLocaleString("th-TH")} รายการ / ยืนยัน {row.verifiedCount.toLocaleString("th-TH")}</p>
                    <p className="text-xs text-dim">ตัวใหญ่สุด {Number(row.maxWeight || 0).toFixed(2)} กก.</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={row.status === "ACTIVE" ? "rounded-full bg-pond/10 px-2.5 py-1 text-xs font-semibold text-pond" : "rounded-full bg-mist px-2.5 py-1 text-xs font-semibold text-dim"}>
                      {row.status === "ACTIVE" ? "ใช้งาน" : "ปิด"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => edit(row)} className="rounded-lg bg-deep px-3 py-1.5 text-xs font-semibold text-white">แก้ไข</button>
                  </td>
                </tr>
              ))}
              {species.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-dim">ยังไม่มีชนิดปลา</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-deep/55 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
          <form onSubmit={submit} className="w-full max-w-xl rounded-lg bg-white p-5 shadow-xl ring-1 ring-line">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-semibold text-deep">{editing ? "แก้ไขชนิดปลา" : "เพิ่มชนิดปลา"}</h3>
                <p className="text-sm text-dim">ข้อมูลนี้ใช้ควบคุมมาตรฐานรายการปลาที่ส่งผ่าน LINE</p>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg bg-mist px-3 py-1.5 text-sm font-semibold text-deep">ปิด</button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-1 block text-sm font-medium text-ink">ชื่อชนิดปลา</span>
                <input required value={form.name} onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))}
                  className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-1 block text-sm font-medium text-ink">หมวดหมู่</span>
                <input value={form.category} onChange={(e) => setForm((v) => ({ ...v, category: e.target.value }))}
                  placeholder="เช่น ปลาบ่อ / ปลาใหญ่ / ปลาเกม"
                  className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">แต้มพื้นฐาน</span>
                <input type="number" min={0} value={form.pointRate} onChange={(e) => setForm((v) => ({ ...v, pointRate: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">น้ำหนักขั้นต่ำ (กก.)</span>
                <input type="number" min={0} step="0.01" value={form.minWeightKg} onChange={(e) => setForm((v) => ({ ...v, minWeightKg: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-1 block text-sm font-medium text-ink">สถานะ</span>
                <select value={form.status} onChange={(e) => setForm((v) => ({ ...v, status: e.target.value as "ACTIVE" | "INACTIVE" }))}
                  className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond">
                  <option value="ACTIVE">ใช้งาน</option>
                  <option value="INACTIVE">ปิด</option>
                </select>
              </label>
            </div>
            {message && <p className="mt-4 rounded-lg bg-buoy/10 px-3 py-2 text-sm text-buoy">{message}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg bg-mist px-4 py-2.5 text-sm font-semibold text-deep">ยกเลิก</button>
              <button disabled={busy} className="rounded-lg bg-pond px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                {busy ? "กำลังบันทึก..." : "บันทึกชนิดปลา"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
