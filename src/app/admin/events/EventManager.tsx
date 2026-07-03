"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Event } from "@/lib/db";

type FormState = {
  eventId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: Event["status"];
  rewardType: Event["rewardType"];
  creditReward: number;
  pointReward: number;
};

const today = new Date().toISOString().slice(0, 10);
const emptyForm: FormState = {
  eventId: "",
  title: "",
  description: "",
  startDate: today,
  endDate: today,
  status: "DRAFT",
  rewardType: "NONE",
  creditReward: 0,
  pointReward: 0,
};

const STATUS: Record<Event["status"], string> = {
  DRAFT: "ร่าง",
  ACTIVE: "เปิดใช้งาน",
  FINISHED: "จบแล้ว",
  CANCELLED: "ยกเลิก",
};

const REWARD: Record<Event["rewardType"], string> = {
  NONE: "ไม่มี",
  CREDIT: "เครดิต",
  POINTS: "แต้ม",
  BOTH: "เครดิต + แต้ม",
};

export default function EventManager({ events }: { events: Event[] }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const editing = Boolean(form.eventId);

  function openCreate() {
    setForm(emptyForm);
    setMessage("");
    setModalOpen(true);
  }

  function edit(event: Event) {
    setForm({
      eventId: event.id,
      title: event.title,
      description: event.description,
      startDate: event.startDate.slice(0, 10),
      endDate: event.endDate.slice(0, 10),
      status: event.status,
      rewardType: event.rewardType,
      creditReward: event.creditReward,
      pointReward: event.pointReward,
    });
    setMessage("");
    setModalOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const res = await fetch("/api/admin/events", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMessage(data.error || "บันทึก Event ไม่สำเร็จ");
      return;
    }
    setModalOpen(false);
    setForm(emptyForm);
    setMessage("บันทึก Event แล้ว");
    router.refresh();
  }

  return (
    <section className="space-y-4">
      {message && <p className="rounded-lg bg-mist px-3 py-2 text-sm font-medium text-deep">{message}</p>}
      <div className="rounded-lg bg-white shadow-sm ring-1 ring-line">
        <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-deep">Event และกิจกรรม</h3>
            <p className="text-sm text-dim">สร้างกิจกรรมแข่งขัน โปรโมชัน หรือแคมเปญแจกเครดิต/แต้ม</p>
          </div>
          <button onClick={openCreate} className="w-fit rounded-lg bg-pond px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-pond/20">
            สร้าง Event
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-mist/60 text-xs uppercase tracking-wide text-dim">
              <tr>
                <th className="px-5 py-3">Event</th>
                <th className="px-5 py-3">ช่วงเวลา</th>
                <th className="px-5 py-3">รางวัล</th>
                <th className="px-5 py-3">สถานะ</th>
                <th className="px-5 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {events.map((event) => (
                <tr key={event.id}>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-ink">{event.title}</p>
                    <p className="line-clamp-1 text-xs text-dim">{event.description || "-"}</p>
                  </td>
                  <td className="px-5 py-4 text-dim">{event.startDate.slice(0, 10)} ถึง {event.endDate.slice(0, 10)}</td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-deep">{REWARD[event.rewardType]}</p>
                    <p className="text-xs text-dim">เครดิต {event.creditReward.toLocaleString("th-TH")} / แต้ม {event.pointReward.toLocaleString("th-TH")}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={event.status === "ACTIVE" ? "rounded-full bg-pond/10 px-2.5 py-1 text-xs font-semibold text-pond" : "rounded-full bg-mist px-2.5 py-1 text-xs font-semibold text-dim"}>
                      {STATUS[event.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => edit(event)} className="rounded-lg bg-deep px-3 py-1.5 text-xs font-semibold text-white">แก้ไข</button>
                  </td>
                </tr>
              ))}
              {events.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-dim">ยังไม่มี Event</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-deep/55 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
          <form onSubmit={submit} className="max-h-[calc(100dvh-3rem)] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-5 shadow-xl ring-1 ring-line">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-semibold text-deep">{editing ? "แก้ไข Event" : "สร้าง Event"}</h3>
                <p className="text-sm text-dim">กำหนดช่วงเวลา สถานะ และรูปแบบรางวัล</p>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg bg-mist px-3 py-1.5 text-sm font-semibold text-deep">ปิด</button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-1 block text-sm font-medium text-ink">ชื่อ Event</span>
                <input required value={form.title} onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))}
                  className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-1 block text-sm font-medium text-ink">รายละเอียด</span>
                <textarea value={form.description} onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))}
                  className="min-h-24 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">วันที่เริ่ม</span>
                <input type="date" required value={form.startDate} onChange={(e) => setForm((v) => ({ ...v, startDate: e.target.value }))}
                  className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">วันที่สิ้นสุด</span>
                <input type="date" required value={form.endDate} onChange={(e) => setForm((v) => ({ ...v, endDate: e.target.value }))}
                  className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">สถานะ</span>
                <select value={form.status} onChange={(e) => setForm((v) => ({ ...v, status: e.target.value as Event["status"] }))}
                  className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond">
                  {Object.entries(STATUS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">รางวัล</span>
                <select value={form.rewardType} onChange={(e) => setForm((v) => ({ ...v, rewardType: e.target.value as Event["rewardType"] }))}
                  className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond">
                  {Object.entries(REWARD).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">เครดิตรางวัล</span>
                <input type="number" min={0} value={form.creditReward} onChange={(e) => setForm((v) => ({ ...v, creditReward: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">แต้มรางวัล</span>
                <input type="number" min={0} value={form.pointReward} onChange={(e) => setForm((v) => ({ ...v, pointReward: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" />
              </label>
            </div>
            {message && <p className="mt-4 rounded-lg bg-buoy/10 px-3 py-2 text-sm text-buoy">{message}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg bg-mist px-4 py-2.5 text-sm font-semibold text-deep">ยกเลิก</button>
              <button disabled={busy} className="rounded-lg bg-pond px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                {busy ? "กำลังบันทึก..." : "บันทึก Event"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
