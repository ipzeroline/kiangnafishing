"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Member = {
  id: string;
  memberCode: string;
  name: string;
  alias: string | null;
  walletBalance: number;
  points: number;
  status: "ACTIVE" | "INACTIVE";
};

type Ledger = {
  id: string;
  type: string;
  creditDelta: number;
  pointsDelta: number;
  note: string;
  createdAt: string;
  memberCode: string;
  name: string;
  actorName: string | null;
};

export default function CreditManager({ members, ledger }: { members: Member[]; ledger: Ledger[] }) {
  const router = useRouter();
  const [memberId, setMemberId] = useState(members[0]?.id || "");
  const [creditDelta, setCreditDelta] = useState(0);
  const [pointsDelta, setPointsDelta] = useState(0);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const selected = useMemo(() => members.find((m) => m.id === memberId), [memberId, members]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const res = await fetch("/api/admin/credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, creditDelta, pointsDelta, note }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMessage(data.error || "ปรับยอดไม่สำเร็จ");
      return;
    }
    setCreditDelta(0);
    setPointsDelta(0);
    setNote("");
    setMessage("ปรับเครดิต / แต้มเรียบร้อย");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {message && <p className="rounded-lg bg-mist px-3 py-2 text-sm font-medium text-deep">{message}</p>}
      <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <form onSubmit={submit} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-line">
          <h3 className="font-display text-xl font-semibold text-deep">ปรับเครดิต / แต้มสมาชิก</h3>
          <p className="mt-1 text-sm text-dim">ทุกการปรับยอดต้องมีเหตุผลและถูกบันทึกในประวัติ</p>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">เลือกสมาชิก</span>
              <select value={memberId} onChange={(e) => setMemberId(e.target.value)}
                className="w-full rounded-lg border border-line bg-white px-3 py-2.5 outline-none focus:border-pond">
                {members.map((member) => (
                  <option key={member.id} value={member.id}>{member.memberCode} · {member.alias || member.name}</option>
                ))}
              </select>
            </label>
            {selected && (
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-mist p-3">
                <div><p className="text-xs text-dim">เครดิตปัจจุบัน</p><p className="mt-1 font-display text-2xl font-semibold text-deep">฿{selected.walletBalance.toLocaleString("th-TH")}</p></div>
                <div><p className="text-xs text-dim">แต้มปัจจุบัน</p><p className="mt-1 font-display text-2xl font-semibold text-deep">{selected.points.toLocaleString("th-TH")}</p></div>
              </div>
            )}
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">ปรับเครดิต</span>
              <input type="number" value={creditDelta} onChange={(e) => setCreditDelta(Number(e.target.value))}
                className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" />
              <span className="mt-1 block text-xs text-dim">ใส่ค่าลบเมื่อต้องการหักเครดิต</span>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">ปรับแต้ม</span>
              <input type="number" value={pointsDelta} onChange={(e) => setPointsDelta(Number(e.target.value))}
                className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" />
              <span className="mt-1 block text-xs text-dim">ใส่ค่าลบเมื่อต้องการหักแต้ม</span>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">เหตุผล</span>
              <textarea required value={note} onChange={(e) => setNote(e.target.value)}
                className="min-h-24 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" />
            </label>
            <button disabled={busy || !memberId} className="w-full rounded-lg bg-pond py-3 font-semibold text-white disabled:opacity-50">
              {busy ? "กำลังบันทึก..." : "บันทึกการปรับยอด"}
            </button>
          </div>
        </form>

        <section className="rounded-lg bg-white shadow-sm ring-1 ring-line">
          <div className="border-b border-line px-5 py-4">
            <h3 className="font-display text-lg font-semibold text-deep">สมาชิกและยอดคงเหลือ</h3>
            <p className="text-sm text-dim">ใช้ตรวจยอดก่อนปรับเครดิตหรือแต้ม</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-mist/60 text-xs uppercase tracking-wide text-dim">
                <tr><th className="px-5 py-3">สมาชิก</th><th className="px-5 py-3 text-right">เครดิต</th><th className="px-5 py-3 text-right">แต้ม</th><th className="px-5 py-3">สถานะ</th></tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {members.map((member) => (
                  <tr key={member.id} className={member.id === memberId ? "bg-pond/5" : ""}>
                    <td className="px-5 py-4"><p className="font-semibold text-ink">{member.alias || member.name}</p><p className="font-mono text-xs text-dim">{member.memberCode}</p></td>
                    <td className="px-5 py-4 text-right font-semibold text-deep">฿{member.walletBalance.toLocaleString("th-TH")}</td>
                    <td className="px-5 py-4 text-right font-semibold text-deep">{member.points.toLocaleString("th-TH")}</td>
                    <td className="px-5 py-4"><span className={member.status === "ACTIVE" ? "rounded-full bg-pond/10 px-2.5 py-1 text-xs font-semibold text-pond" : "rounded-full bg-mist px-2.5 py-1 text-xs font-semibold text-dim"}>{member.status === "ACTIVE" ? "ใช้งาน" : "ปิด"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      <section className="rounded-lg bg-white shadow-sm ring-1 ring-line">
        <div className="border-b border-line px-5 py-4">
          <h3 className="font-display text-lg font-semibold text-deep">ประวัติทำรายการเครดิต / แต้ม</h3>
          <p className="text-sm text-dim">รวมเติมเครดิต ปรับยอด แต้ม และคูปองรางวัล</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="bg-mist/60 text-xs uppercase tracking-wide text-dim">
              <tr><th className="px-5 py-3">เวลา</th><th className="px-5 py-3">สมาชิก</th><th className="px-5 py-3">ประเภท</th><th className="px-5 py-3 text-right">เครดิต</th><th className="px-5 py-3 text-right">แต้ม</th><th className="px-5 py-3">เหตุผล</th><th className="px-5 py-3">ผู้ทำรายการ</th></tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {ledger.map((row) => (
                <tr key={row.id}>
                  <td className="px-5 py-4 text-dim">{row.createdAt}</td>
                  <td className="px-5 py-4"><p className="font-semibold text-ink">{row.name}</p><p className="font-mono text-xs text-dim">{row.memberCode}</p></td>
                  <td className="px-5 py-4 font-semibold text-deep">{typeLabel(row.type)}</td>
                  <td className={row.creditDelta >= 0 ? "px-5 py-4 text-right font-semibold text-pond" : "px-5 py-4 text-right font-semibold text-buoy"}>{row.creditDelta > 0 ? "+" : ""}{row.creditDelta.toLocaleString("th-TH")}</td>
                  <td className={row.pointsDelta >= 0 ? "px-5 py-4 text-right font-semibold text-pond" : "px-5 py-4 text-right font-semibold text-buoy"}>{row.pointsDelta > 0 ? "+" : ""}{row.pointsDelta.toLocaleString("th-TH")}</td>
                  <td className="px-5 py-4 text-dim">{row.note || "-"}</td>
                  <td className="px-5 py-4 text-dim">{row.actorName || "ระบบ"}</td>
                </tr>
              ))}
              {ledger.length === 0 && <tr><td colSpan={7} className="px-5 py-8 text-center text-dim">ยังไม่มีประวัติเครดิต / แต้ม</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function typeLabel(type: string) {
  const labels: Record<string, string> = {
    TOPUP: "เติมเครดิต",
    ENTRY_FEE: "ค่าเข้าบ่อ",
    CREDIT_ADJUST: "ปรับเครดิต",
    POINT_ADJUST: "ปรับแต้ม",
    COUPON_REWARD: "คูปองรางวัล",
    EVENT_REWARD: "รางวัล Event",
  };
  return labels[type] || type;
}
