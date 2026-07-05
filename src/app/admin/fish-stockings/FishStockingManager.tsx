"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FishStocking } from "@/lib/db";

type FormState = {
  stockingId: string;
  imagePath: string;
  imageData: string;
  species: string;
  fishCount: number;
  totalWeightKg: number;
  costAmount: number;
  detail: string;
  stockingDate: string;
};

function emptyForm(today: string): FormState {
  return {
    stockingId: "",
    imagePath: "",
    imageData: "",
    species: "",
    fishCount: 0,
    totalWeightKg: 0,
    costAmount: 0,
    detail: "",
    stockingDate: today,
  };
}

function dateLabel(value: string) {
  const date = value.slice(0, 10);
  if (!date) return "-";
  return new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(new Date(`${date}T00:00:00`));
}

function readImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function FishStockingManager({ stockings, species, today }: { stockings: FishStocking[]; species: string[]; today: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => emptyForm(today));
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const editing = Boolean(form.stockingId);
  const speciesOptions = form.species && !species.includes(form.species) ? [form.species, ...species] : species;
  const previewImage = form.imageData || form.imagePath;

  function openCreate() {
    setForm(emptyForm(today));
    setMessage("");
    setModalOpen(true);
  }

  function edit(stocking: FishStocking) {
    setForm({
      stockingId: stocking.id,
      imagePath: stocking.imagePath,
      imageData: "",
      species: stocking.species,
      fishCount: stocking.fishCount,
      totalWeightKg: Number(stocking.totalWeightKg),
      costAmount: Number(stocking.costAmount || 0),
      detail: stocking.detail,
      stockingDate: stocking.stockingDate.slice(0, 10),
    });
    setMessage("");
    setModalOpen(true);
  }

  async function changeImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("กรุณาเลือกไฟล์รูปภาพ");
      return;
    }
    setMessage("");
    setForm((value) => ({ ...value, imageData: "" }));
    const imageData = await readImage(file);
    setForm((value) => ({ ...value, imageData }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const res = await fetch("/api/admin/fish-stockings", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMessage(data.error || "บันทึกรายการลงปลาไม่สำเร็จ");
      return;
    }
    setModalOpen(false);
    setForm(emptyForm(today));
    setMessage("บันทึกรายการลงปลาแล้ว");
    router.refresh();
  }

  async function remove(stocking: FishStocking) {
    if (!confirm(`ลบรายการลงปลา ${stocking.species} ใช่ไหม`)) return;
    setBusy(true);
    setMessage("");
    const res = await fetch("/api/admin/fish-stockings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stockingId: stocking.id }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMessage(data.error || "ลบรายการลงปลาไม่สำเร็จ");
      return;
    }
    setMessage("ลบรายการลงปลาแล้ว");
    router.refresh();
  }

  return (
    <section className="space-y-4">
      {message && <p className="rounded-lg bg-mist px-3 py-2 text-sm font-medium text-deep">{message}</p>}
      <div className="rounded-lg bg-white shadow-sm ring-1 ring-line">
        <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-deep">ตารางลงปลา</h3>
            <p className="text-sm text-dim">บันทึกประวัติการปล่อยปลาเข้าบ่อ พร้อมจำนวนตัว น้ำหนักรวม ค่าใช้จ่าย และรายละเอียด</p>
          </div>
          <button onClick={openCreate} className="w-fit rounded-lg bg-pond px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-pond/20">
            เพิ่มรายการลงปลา
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left text-sm">
            <thead className="bg-mist/60 text-xs uppercase tracking-wide text-dim">
              <tr>
                <th className="px-5 py-3">รูปภาพ</th>
                <th className="px-5 py-3">ชนิดปลา</th>
                <th className="px-5 py-3 text-right">จำนวนตัว</th>
                <th className="px-5 py-3 text-right">จำนวนกิโลกรัมรวม</th>
                <th className="px-5 py-3 text-right">ค่าใช้จ่าย</th>
                <th className="px-5 py-3">รายละเอียด</th>
                <th className="px-5 py-3">วันที่</th>
                <th className="px-5 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {stockings.map((stocking) => (
                <tr key={stocking.id}>
                  <td className="px-5 py-4">
                    <a href={stocking.imagePath} target="_blank" rel="noreferrer" className="block h-16 w-16">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={stocking.imagePath} alt={stocking.species} className="h-16 w-16 rounded-lg bg-mist object-cover ring-1 ring-line" />
                    </a>
                  </td>
                  <td className="px-5 py-4 font-semibold text-ink">{stocking.species}</td>
                  <td className="px-5 py-4 text-right font-semibold text-deep">{stocking.fishCount.toLocaleString("th-TH")}</td>
                  <td className="px-5 py-4 text-right font-semibold text-deep">
                    {Number(stocking.totalWeightKg).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} กก.
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-pond">
                    {Number(stocking.costAmount || 0) > 0 ? `฿${Number(stocking.costAmount).toLocaleString("th-TH")}` : "-"}
                  </td>
                  <td className="px-5 py-4">
                    <p className="max-w-sm whitespace-pre-line text-dim">{stocking.detail || "-"}</p>
                  </td>
                  <td className="px-5 py-4 text-dim">{dateLabel(stocking.stockingDate)}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => edit(stocking)} className="rounded-lg bg-deep px-3 py-1.5 text-xs font-semibold text-white">แก้ไข</button>
                      <button disabled={busy} onClick={() => remove(stocking)} className="rounded-lg bg-buoy/10 px-3 py-1.5 text-xs font-semibold text-buoy disabled:opacity-50">ลบ</button>
                    </div>
                  </td>
                </tr>
              ))}
              {stockings.length === 0 && <tr><td colSpan={8} className="px-5 py-8 text-center text-dim">ยังไม่มีรายการลงปลา</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-deep/55 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
          <form onSubmit={submit} className="max-h-[calc(100dvh-3rem)] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-5 shadow-xl ring-1 ring-line">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-semibold text-deep">{editing ? "แก้ไขรายการลงปลา" : "เพิ่มรายการลงปลา"}</h3>
                <p className="text-sm text-dim">กรอกข้อมูลการปล่อยปลาเข้าบ่อให้ครบถ้วน</p>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg bg-mist px-3 py-1.5 text-sm font-semibold text-deep">ปิด</button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-1 block text-sm font-medium text-ink">รูปภาพ</span>
                <input type="file" accept="image/*" required={!editing && !form.imagePath} onChange={changeImage}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-mist file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-deep focus:border-pond" />
                {previewImage && (
                  <div className="mt-3 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewImage} alt={form.species || "รูปปลา"} className="h-20 w-20 rounded-lg bg-mist object-cover ring-1 ring-line" />
                    <p className="text-xs text-dim">{form.imageData ? "รูปใหม่พร้อมอัปโหลด" : "ใช้รูปเดิม"}</p>
                  </div>
                )}
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">ชนิดปลา</span>
                <select required value={form.species} onChange={(e) => setForm((v) => ({ ...v, species: e.target.value }))}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2.5 outline-none focus:border-pond">
                  <option value="">เลือกชนิดปลา</option>
                  {speciesOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                {species.length === 0 && <p className="mt-1 text-xs text-buoy">กรุณาเพิ่มชนิดปลาที่เปิดใช้งานก่อน</p>}
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">วันที่</span>
                <input type="date" required value={form.stockingDate} onChange={(e) => setForm((v) => ({ ...v, stockingDate: e.target.value }))}
                  className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">จำนวนตัว</span>
                <input type="number" min={1} required value={form.fishCount || ""} onChange={(e) => setForm((v) => ({ ...v, fishCount: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">จำนวนกิโลกรัมรวม</span>
                <input type="number" min={0.01} step="0.01" required value={form.totalWeightKg || ""} onChange={(e) => setForm((v) => ({ ...v, totalWeightKg: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">ค่าใช้จ่าย</span>
                <input type="number" min={0} step={1} value={form.costAmount || ""} onChange={(e) => setForm((v) => ({ ...v, costAmount: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" placeholder="0" />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-1 block text-sm font-medium text-ink">รายละเอียด</span>
                <textarea value={form.detail} onChange={(e) => setForm((v) => ({ ...v, detail: e.target.value }))}
                  className="min-h-28 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" />
              </label>
            </div>
            {message && <p className="mt-4 rounded-lg bg-buoy/10 px-3 py-2 text-sm text-buoy">{message}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg bg-mist px-4 py-2.5 text-sm font-semibold text-deep">ยกเลิก</button>
              <button disabled={busy} className="rounded-lg bg-pond px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                {busy ? "กำลังบันทึก..." : "บันทึกรายการลงปลา"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
