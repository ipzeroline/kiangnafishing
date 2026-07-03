"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Coupon } from "@/lib/db";

type Redemption = {
  id: string;
  code: string;
  title: string;
  memberCode: string;
  name: string;
  creditAmount: number;
  pointsAmount: number;
  createdAt: string;
  actorName: string | null;
};

type FormState = {
  couponId: string;
  code: string;
  title: string;
  description: string;
  rewardType: Coupon["rewardType"];
  creditAmount: number;
  pointsAmount: number;
  usageLimit: number;
  perMemberLimit: number;
  startDate: string;
  endDate: string;
  status: Coupon["status"];
};

const today = new Date().toISOString().slice(0, 10);
const emptyForm: FormState = {
  couponId: "",
  code: "",
  title: "",
  description: "",
  rewardType: "POINTS",
  creditAmount: 0,
  pointsAmount: 0,
  usageLimit: 0,
  perMemberLimit: 1,
  startDate: today,
  endDate: today,
  status: "ACTIVE",
};

const REWARD = { CREDIT: "เครดิต", POINTS: "แต้ม", BOTH: "เครดิต + แต้ม" } as const;

export default function CouponManager({ coupons, redemptions }: { coupons: Coupon[]; redemptions: Redemption[] }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [redeem, setRedeem] = useState({ memberCode: "", code: "" });
  const editing = Boolean(form.couponId);

  function openCreate() {
    setForm(emptyForm);
    setMessage("");
    setModalOpen(true);
  }

  function edit(coupon: Coupon) {
    setForm({
      couponId: coupon.id,
      code: coupon.code,
      title: coupon.title,
      description: coupon.description,
      rewardType: coupon.rewardType,
      creditAmount: coupon.creditAmount,
      pointsAmount: coupon.pointsAmount,
      usageLimit: coupon.usageLimit,
      perMemberLimit: coupon.perMemberLimit,
      startDate: coupon.startDate.slice(0, 10),
      endDate: coupon.endDate.slice(0, 10),
      status: coupon.status,
    });
    setMessage("");
    setModalOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const res = await fetch("/api/admin/coupons", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMessage(data.error || "บันทึกคูปองไม่สำเร็จ");
      return;
    }
    setModalOpen(false);
    setForm(emptyForm);
    setMessage("บันทึกคูปองแล้ว");
    router.refresh();
  }

  async function redeemCoupon(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const res = await fetch("/api/admin/coupons/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(redeem),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMessage(data.error || "แลกคูปองไม่สำเร็จ");
      return;
    }
    setRedeem({ memberCode: "", code: "" });
    setMessage("แลกคูปองสำเร็จ");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {message && <p className="rounded-lg bg-mist px-3 py-2 text-sm font-medium text-deep">{message}</p>}

      <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <form onSubmit={redeemCoupon} className="rounded-lg bg-deep p-5 text-white shadow-sm">
          <p className="text-sm text-white/62">Quick Reward</p>
          <h3 className="mt-2 font-display text-2xl font-semibold">แลกคูปองให้สมาชิก</h3>
          <p className="mt-2 text-sm text-white/65">ใช้ที่หน้าเคาน์เตอร์เมื่อสมาชิกแจ้งรหัสคูปองจาก LINE OA หรือกิจกรรม</p>
          <div className="mt-5 space-y-3">
            <input value={redeem.memberCode} onChange={(e) => setRedeem((v) => ({ ...v, memberCode: e.target.value.toUpperCase() }))}
              placeholder="รหัสสมาชิก เช่น FP0001"
              className="w-full rounded-lg border border-white/10 bg-white px-3 py-3 font-mono text-sm text-deep outline-none" />
            <input value={redeem.code} onChange={(e) => setRedeem((v) => ({ ...v, code: e.target.value.toUpperCase() }))}
              placeholder="รหัสคูปอง"
              className="w-full rounded-lg border border-white/10 bg-white px-3 py-3 font-mono text-sm text-deep outline-none" />
            <button disabled={busy || !redeem.memberCode || !redeem.code} className="w-full rounded-lg bg-buoy py-3 font-semibold text-white disabled:opacity-50">
              {busy ? "กำลังแลก..." : "แลกรางวัล"}
            </button>
          </div>
        </form>

        <div className="rounded-lg bg-white shadow-sm ring-1 ring-line">
          <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold text-deep">คูปอง / รางวัล</h3>
              <p className="text-sm text-dim">กำหนดเครดิต แต้ม จำนวนสิทธิ์ และช่วงวันที่ใช้งาน</p>
            </div>
            <button onClick={openCreate} className="w-fit rounded-lg bg-pond px-4 py-2 text-sm font-semibold text-white">สร้างคูปอง</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-mist/60 text-xs uppercase tracking-wide text-dim">
                <tr><th className="px-5 py-3">คูปอง</th><th className="px-5 py-3">รางวัล</th><th className="px-5 py-3">การใช้</th><th className="px-5 py-3">สถานะ</th><th className="px-5 py-3 text-right">จัดการ</th></tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td className="px-5 py-4"><p className="font-semibold text-ink">{coupon.title}</p><p className="font-mono text-xs text-dim">{coupon.code}</p></td>
                    <td className="px-5 py-4"><p className="font-semibold text-deep">{REWARD[coupon.rewardType]}</p><p className="text-xs text-dim">เครดิต {coupon.creditAmount} / แต้ม {coupon.pointsAmount}</p></td>
                    <td className="px-5 py-4"><p>{coupon.usedCount.toLocaleString("th-TH")} / {coupon.usageLimit ? coupon.usageLimit.toLocaleString("th-TH") : "ไม่จำกัด"}</p><p className="text-xs text-dim">ต่อสมาชิก {coupon.perMemberLimit} ครั้ง</p></td>
                    <td className="px-5 py-4"><span className={coupon.status === "ACTIVE" ? "rounded-full bg-pond/10 px-2.5 py-1 text-xs font-semibold text-pond" : "rounded-full bg-mist px-2.5 py-1 text-xs font-semibold text-dim"}>{coupon.status === "ACTIVE" ? "ใช้งาน" : "ปิด"}</span></td>
                    <td className="px-5 py-4 text-right"><button onClick={() => edit(coupon)} className="rounded-lg bg-deep px-3 py-1.5 text-xs font-semibold text-white">แก้ไข</button></td>
                  </tr>
                ))}
                {coupons.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-dim">ยังไม่มีคูปอง</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="rounded-lg bg-white shadow-sm ring-1 ring-line">
        <div className="border-b border-line px-5 py-4">
          <h3 className="font-display text-lg font-semibold text-deep">ประวัติแลกรางวัลล่าสุด</h3>
          <p className="text-sm text-dim">ติดตามประวัติการแลกคูปอง สมาชิกที่ใช้สิทธิ์ และเจ้าหน้าที่ผู้ดำเนินรายการ</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-mist/60 text-xs uppercase tracking-wide text-dim">
              <tr><th className="px-5 py-3">สมาชิก</th><th className="px-5 py-3">คูปอง</th><th className="px-5 py-3">รางวัล</th><th className="px-5 py-3">ผู้ทำรายการ</th><th className="px-5 py-3">เวลา</th></tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {redemptions.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-4"><p className="font-semibold text-ink">{r.name}</p><p className="font-mono text-xs text-dim">{r.memberCode}</p></td>
                  <td className="px-5 py-4"><p className="font-semibold text-ink">{r.title}</p><p className="font-mono text-xs text-dim">{r.code}</p></td>
                  <td className="px-5 py-4">เครดิต {r.creditAmount.toLocaleString("th-TH")} / แต้ม {r.pointsAmount.toLocaleString("th-TH")}</td>
                  <td className="px-5 py-4 text-dim">{r.actorName || "ระบบ"}</td>
                  <td className="px-5 py-4 text-dim">{r.createdAt}</td>
                </tr>
              ))}
              {redemptions.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-dim">ยังไม่มีประวัติแลกรางวัล</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-deep/55 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
          <form onSubmit={submit} className="max-h-[calc(100dvh-3rem)] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-5 shadow-xl ring-1 ring-line">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div><h3 className="font-display text-xl font-semibold text-deep">{editing ? "แก้ไขคูปอง" : "สร้างคูปอง"}</h3><p className="text-sm text-dim">รหัสคูปองควรเดายากและจำกัดสิทธิ์ชัดเจน</p></div>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg bg-mist px-3 py-1.5 text-sm font-semibold text-deep">ปิด</button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block"><span className="mb-1 block text-sm font-medium text-ink">รหัสคูปอง</span><input required value={form.code} onChange={(e) => setForm((v) => ({ ...v, code: e.target.value.toUpperCase() }))} className="w-full rounded-lg border border-line px-3 py-2.5 font-mono outline-none focus:border-pond" /></label>
              <label className="block"><span className="mb-1 block text-sm font-medium text-ink">ชื่อคูปอง</span><input required value={form.title} onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))} className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" /></label>
              <label className="block md:col-span-2"><span className="mb-1 block text-sm font-medium text-ink">รายละเอียด</span><textarea value={form.description} onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))} className="min-h-20 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" /></label>
              <label className="block"><span className="mb-1 block text-sm font-medium text-ink">รางวัล</span><select value={form.rewardType} onChange={(e) => setForm((v) => ({ ...v, rewardType: e.target.value as Coupon["rewardType"] }))} className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond">{Object.entries(REWARD).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label className="block"><span className="mb-1 block text-sm font-medium text-ink">สถานะ</span><select value={form.status} onChange={(e) => setForm((v) => ({ ...v, status: e.target.value as Coupon["status"] }))} className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond"><option value="ACTIVE">ใช้งาน</option><option value="INACTIVE">ปิด</option></select></label>
              <label className="block"><span className="mb-1 block text-sm font-medium text-ink">เครดิต</span><input type="number" min={0} value={form.creditAmount} onChange={(e) => setForm((v) => ({ ...v, creditAmount: Number(e.target.value) }))} className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" /></label>
              <label className="block"><span className="mb-1 block text-sm font-medium text-ink">แต้ม</span><input type="number" min={0} value={form.pointsAmount} onChange={(e) => setForm((v) => ({ ...v, pointsAmount: Number(e.target.value) }))} className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" /></label>
              <label className="block"><span className="mb-1 block text-sm font-medium text-ink">จำนวนสิทธิ์รวม</span><input type="number" min={0} value={form.usageLimit} onChange={(e) => setForm((v) => ({ ...v, usageLimit: Number(e.target.value) }))} className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" /><span className="mt-1 block text-xs text-dim">0 = ไม่จำกัด</span></label>
              <label className="block"><span className="mb-1 block text-sm font-medium text-ink">สิทธิ์ต่อสมาชิก</span><input type="number" min={1} value={form.perMemberLimit} onChange={(e) => setForm((v) => ({ ...v, perMemberLimit: Number(e.target.value) }))} className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" /></label>
              <label className="block"><span className="mb-1 block text-sm font-medium text-ink">เริ่มใช้</span><input type="date" required value={form.startDate} onChange={(e) => setForm((v) => ({ ...v, startDate: e.target.value }))} className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" /></label>
              <label className="block"><span className="mb-1 block text-sm font-medium text-ink">หมดอายุ</span><input type="date" required value={form.endDate} onChange={(e) => setForm((v) => ({ ...v, endDate: e.target.value }))} className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" /></label>
            </div>
            {message && <p className="mt-4 rounded-lg bg-buoy/10 px-3 py-2 text-sm text-buoy">{message}</p>}
            <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setModalOpen(false)} className="rounded-lg bg-mist px-4 py-2.5 text-sm font-semibold text-deep">ยกเลิก</button><button disabled={busy} className="rounded-lg bg-pond px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "กำลังบันทึก..." : "บันทึกคูปอง"}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
