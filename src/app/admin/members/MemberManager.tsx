"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Member = {
  id: string;
  memberCode: string;
  name: string;
  alias: string | null;
  phone: string;
  lineUserId: string | null;
  lineDisplayName: string | null;
  walletBalance: number;
  points: number;
  status: "ACTIVE" | "INACTIVE";
  profileNote: string | null;
  createdAt: string;
};

type FormState = {
  memberId: string;
  name: string;
  alias: string;
  status: "ACTIVE" | "INACTIVE";
  profileNote: string;
};

const emptyForm: FormState = { memberId: "", name: "", alias: "", status: "ACTIVE", profileNote: "" };

export default function MemberManager({ members }: { members: Member[] }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const editing = Boolean(form.memberId);

  function edit(member: Member) {
    setForm({
      memberId: member.id,
      name: member.name,
      alias: member.alias || "",
      status: member.status,
      profileNote: member.profileNote || "",
    });
    setMessage("");
    setModalOpen(true);
  }

  function closeModal() {
    if (busy) return;
    setModalOpen(false);
    setForm(emptyForm);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const res = await fetch("/api/admin/members", {
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
    setModalOpen(false);
    setForm(emptyForm);
    setMessage("บันทึกข้อมูลสมาชิกแล้ว");
    router.refresh();
  }

  return (
    <section className="space-y-4">
      {message && <p className="rounded-lg bg-mist px-3 py-2 text-sm text-deep">{message}</p>}

      <div className="rounded-lg bg-white shadow-sm ring-1 ring-line">
        <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-deep">สมาชิกจาก LINE OA</h3>
            <p className="text-sm text-dim">ข้อมูลหลักจะผูกกับ LINE ID เมื่อสมาชิกแอด LINE และใช้งาน Rich Menu</p>
          </div>
          <span className="w-fit rounded-full bg-mist px-3 py-1 text-sm font-semibold text-deep">{members.length} บัญชีล่าสุด</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-mist/60 text-xs uppercase tracking-wide text-dim">
              <tr>
                <th className="px-5 py-3 font-semibold">สมาชิก</th>
                <th className="px-5 py-3 font-semibold">LINE</th>
                <th className="px-5 py-3 font-semibold">ยอด/แต้ม</th>
                <th className="px-5 py-3 font-semibold">สถานะ</th>
                <th className="px-5 py-3 text-right font-semibold">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-ink">{member.alias || member.name}</p>
                    <p className="text-xs text-dim">{member.memberCode} · {member.name} · {member.phone}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-ink">{member.lineDisplayName || "ยังไม่เชื่อม LINE"}</p>
                    <p className="font-mono text-xs text-dim">{member.lineUserId || "-"}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-deep">฿{member.walletBalance.toLocaleString("th-TH")}</p>
                    <p className="text-xs text-dim">{member.points.toLocaleString("th-TH")} แต้ม</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={member.status === "ACTIVE"
                      ? "rounded-full bg-pond/10 px-2.5 py-1 text-xs font-semibold text-pond"
                      : "rounded-full bg-mist px-2.5 py-1 text-xs font-semibold text-dim"}>
                      {member.status === "ACTIVE" ? "ใช้งาน" : "ปิดใช้งาน"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => edit(member)} className="rounded-lg bg-deep px-3 py-1.5 text-xs font-semibold text-white">แก้ไข</button>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-dim">ยังไม่มีสมาชิก</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-deep/55 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
          <form onSubmit={submit} className="max-h-[calc(100dvh-3rem)] w-full max-w-xl overflow-y-auto rounded-lg bg-white p-5 shadow-xl ring-1 ring-line">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-semibold text-deep">แก้ไขสมาชิก</h3>
                <p className="text-sm text-dim">แก้ได้เฉพาะข้อมูลแสดงผลและสถานะ ข้อมูล LINE จะมาจาก LINE OA</p>
              </div>
              <button type="button" onClick={closeModal} className="rounded-lg bg-mist px-3 py-1.5 text-sm font-semibold text-deep">ปิด</button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">ชื่อแสดง</span>
                <input required disabled={!editing} value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2.5 outline-none disabled:bg-mist focus:border-pond focus:ring-2 focus:ring-pond/15" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">นามแฝง</span>
                <input disabled={!editing} value={form.alias} onChange={(e) => setForm((current) => ({ ...current, alias: e.target.value }))}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2.5 outline-none disabled:bg-mist focus:border-pond focus:ring-2 focus:ring-pond/15" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">หมายเหตุภายใน</span>
                <textarea disabled={!editing} value={form.profileNote} onChange={(e) => setForm((current) => ({ ...current, profileNote: e.target.value }))}
                  className="min-h-28 w-full rounded-lg border border-line bg-white px-3 py-2.5 outline-none disabled:bg-mist focus:border-pond focus:ring-2 focus:ring-pond/15" />
              </label>
              <div>
                <span className="mb-1 block text-sm font-medium text-ink">สถานะ</span>
                <div className="grid grid-cols-2 gap-2 rounded-lg bg-mist p-1">
                  {(["ACTIVE", "INACTIVE"] as const).map((status) => (
                    <button key={status} disabled={!editing} type="button" onClick={() => setForm((current) => ({ ...current, status }))}
                      className={`rounded-md py-2 text-sm font-semibold disabled:opacity-50 ${form.status === status ? "bg-white text-deep shadow-sm" : "text-dim"}`}>
                      {status === "ACTIVE" ? "ใช้งาน" : "ปิดใช้งาน"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {message && <p className="mt-4 rounded-lg bg-buoy/10 px-3 py-2 text-sm text-buoy">{message}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={closeModal} className="rounded-lg bg-mist px-4 py-2.5 text-sm font-semibold text-deep">ยกเลิก</button>
              <button disabled={!editing || busy} className="rounded-lg bg-pond px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                {busy ? "กำลังบันทึก..." : "บันทึกข้อมูลสมาชิก"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
