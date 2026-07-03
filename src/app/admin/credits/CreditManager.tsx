"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Member = {
  id: string;
  memberCode: string;
  name: string;
  alias: string | null;
  phone: string;
  lineDisplayName: string | null;
  linePictureUrl: string | null;
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

function MemberAvatar({ member, size = "md" }: { member: Member; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "h-9 w-9 text-sm" : "h-12 w-12 text-base";
  const label = (member.alias || member.lineDisplayName || member.name || member.memberCode).slice(0, 1);
  return member.linePictureUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={member.linePictureUrl} alt={member.alias || member.name} className={`${cls} shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm`} />
  ) : (
    <span className={`${cls} grid shrink-0 place-items-center rounded-full bg-deep font-bold text-white shadow-sm`}>{label}</span>
  );
}

export default function CreditManager({ members, ledger }: { members: Member[]; ledger: Ledger[] }) {
  const router = useRouter();
  const [memberId, setMemberId] = useState(members[0]?.id || "");
  const [creditDelta, setCreditDelta] = useState(0);
  const [pointsDelta, setPointsDelta] = useState(0);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [ledgerSearch, setLedgerSearch] = useState("");
  const selected = useMemo(() => members.find((m) => m.id === memberId), [memberId, members]);
  const activeMembers = useMemo(() => members.filter((member) => member.status === "ACTIVE"), [members]);
  const filteredMembers = useMemo(() => {
    const keyword = memberSearch.trim().toLowerCase();
    if (!keyword) return members;
    return members.filter((member) => [
      member.memberCode,
      member.name,
      member.alias,
      member.phone,
      member.lineDisplayName,
      member.status === "ACTIVE" ? "ใช้งาน" : "ปิด",
    ].some((value) => String(value || "").toLowerCase().includes(keyword)));
  }, [memberSearch, members]);
  const filteredLedger = useMemo(() => {
    const keyword = ledgerSearch.trim().toLowerCase();
    if (!keyword) return ledger;
    return ledger.filter((row) => [
      row.createdAt,
      row.memberCode,
      row.name,
      typeLabel(row.type),
      row.note,
      row.actorName,
    ].some((value) => String(value || "").toLowerCase().includes(keyword)));
  }, [ledger, ledgerSearch]);
  const nextCredit = selected ? selected.walletBalance + creditDelta : 0;
  const nextPoints = selected ? selected.points + pointsDelta : 0;
  const invalidBalance = Boolean(selected && (nextCredit < 0 || nextPoints < 0));

  function selectMember(id: string) {
    setMemberId(id);
    setMessage("");
  }

  function setQuickAmount(kind: "credit" | "points", value: number) {
    if (kind === "credit") setCreditDelta(value);
    if (kind === "points") setPointsDelta(value);
  }

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
            <div className="rounded-lg border border-line bg-mist/50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-dim">สมาชิกที่เลือก</p>
              {selected ? (
                <div className="mt-2 flex items-center gap-3">
                  <MemberAvatar member={selected} />
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-deep">{selected.alias || selected.name}</p>
                    <p className="truncate text-sm text-dim">{selected.memberCode} · {selected.phone} · {selected.lineDisplayName || "ยังไม่เชื่อม LINE"}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-buoy">กรุณาเลือกสมาชิกจากรายการด้านขวา</p>
              )}
            </div>
            {selected && (
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-white ring-1 ring-line">
                <div className="p-3">
                  <p className="text-xs text-dim">เครดิตหลังปรับ</p>
                  <p className="mt-1 font-display text-2xl font-semibold text-deep">฿{nextCredit.toLocaleString("th-TH")}</p>
                  <p className="text-xs text-dim">เดิม ฿{selected.walletBalance.toLocaleString("th-TH")}</p>
                </div>
                <div className="border-l border-line p-3">
                  <p className="text-xs text-dim">แต้มหลังปรับ</p>
                  <p className="mt-1 font-display text-2xl font-semibold text-deep">{nextPoints.toLocaleString("th-TH")}</p>
                  <p className="text-xs text-dim">เดิม {selected.points.toLocaleString("th-TH")}</p>
                </div>
              </div>
            )}
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">ปรับเครดิต</span>
              <input type="number" value={creditDelta} onChange={(e) => setCreditDelta(Number(e.target.value))}
                className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" />
              <div className="mt-2 flex flex-wrap gap-2">
                {[100, 500, 1000, -100, -500, -1000].map((amount) => (
                  <button key={amount} type="button" onClick={() => setQuickAmount("credit", amount)}
                    className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-deep">
                    {amount > 0 ? "+" : ""}{amount.toLocaleString("th-TH")}
                  </button>
                ))}
              </div>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">ปรับแต้ม</span>
              <input type="number" value={pointsDelta} onChange={(e) => setPointsDelta(Number(e.target.value))}
                className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" />
              <div className="mt-2 flex flex-wrap gap-2">
                {[10, 50, 100, -10, -50, -100].map((amount) => (
                  <button key={amount} type="button" onClick={() => setQuickAmount("points", amount)}
                    className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-deep">
                    {amount > 0 ? "+" : ""}{amount.toLocaleString("th-TH")}
                  </button>
                ))}
              </div>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">เหตุผล</span>
              <textarea required value={note} onChange={(e) => setNote(e.target.value)}
                placeholder="เช่น เติมเงินหน้าบ่อ, ปรับยอดจากสลิป, หักค่าใช้บริการ"
                className="min-h-24 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-pond" />
            </label>
            {invalidBalance && <p className="rounded-lg bg-buoy/10 px-3 py-2 text-sm font-medium text-buoy">ยอดหลังปรับต้องไม่ติดลบ</p>}
            <button disabled={busy || !memberId || invalidBalance || (creditDelta === 0 && pointsDelta === 0)} className="w-full rounded-lg bg-pond py-3 font-semibold text-white disabled:opacity-50">
              {busy ? "กำลังบันทึก..." : "บันทึกการปรับยอด"}
            </button>
          </div>
        </form>

        <section className="rounded-lg bg-white shadow-sm ring-1 ring-line">
          <div className="border-b border-line px-5 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold text-deep">ค้นหาและเลือกสมาชิก</h3>
                <p className="text-sm text-dim">คลิกแถวสมาชิกเพื่อเลือกสำหรับปรับยอด</p>
              </div>
              <label className="block w-full lg:max-w-md">
                <span className="mb-1 block text-sm font-medium text-ink">ค้นหา</span>
                <input value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="ชื่อ, รหัสสมาชิก, เบอร์, LINE name"
                  className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-pond focus:ring-2 focus:ring-pond/15" />
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-mist px-3 py-1 font-semibold text-deep">{members.length.toLocaleString("th-TH")} สมาชิกทั้งหมด</span>
              <span className="rounded-full bg-pond/10 px-3 py-1 font-semibold text-pond">{activeMembers.length.toLocaleString("th-TH")} ใช้งาน</span>
              <span className="rounded-full bg-mist px-3 py-1 font-semibold text-dim">พบ {filteredMembers.length.toLocaleString("th-TH")} รายการ</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-mist/60 text-xs uppercase tracking-wide text-dim">
                <tr><th className="px-5 py-3">สมาชิก</th><th className="px-5 py-3 text-right">เครดิต</th><th className="px-5 py-3 text-right">แต้ม</th><th className="px-5 py-3">สถานะ</th></tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {filteredMembers.slice(0, 80).map((member) => (
                  <tr key={member.id} onClick={() => selectMember(member.id)}
                    className={`cursor-pointer ${member.id === memberId ? "bg-pond/10" : "hover:bg-mist/40"}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <MemberAvatar member={member} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">{member.alias || member.name}</p>
                          <p className="truncate font-mono text-xs text-dim">{member.memberCode} · {member.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-deep">฿{member.walletBalance.toLocaleString("th-TH")}</td>
                    <td className="px-5 py-4 text-right font-semibold text-deep">{member.points.toLocaleString("th-TH")}</td>
                    <td className="px-5 py-4"><span className={member.status === "ACTIVE" ? "rounded-full bg-pond/10 px-2.5 py-1 text-xs font-semibold text-pond" : "rounded-full bg-mist px-2.5 py-1 text-xs font-semibold text-dim"}>{member.status === "ACTIVE" ? "ใช้งาน" : "ปิด"}</span></td>
                  </tr>
                ))}
                {filteredMembers.length === 0 && <tr><td colSpan={4} className="px-5 py-8 text-center text-dim">ไม่พบสมาชิกที่ตรงกับคำค้น</td></tr>}
              </tbody>
            </table>
          </div>
          {filteredMembers.length > 80 && <p className="border-t border-line px-5 py-3 text-sm text-dim">แสดง 80 รายการแรก กรุณาพิมพ์คำค้นเพิ่มเพื่อจำกัดผลลัพธ์</p>}
        </section>
      </section>

      <section className="rounded-lg bg-white shadow-sm ring-1 ring-line">
        <div className="border-b border-line px-5 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold text-deep">ประวัติทำรายการเครดิต / แต้ม</h3>
              <p className="text-sm text-dim">รวมเติมเครดิต ปรับยอด แต้ม และคูปองรางวัล</p>
            </div>
            <label className="block w-full lg:max-w-md">
              <span className="mb-1 block text-sm font-medium text-ink">ค้นหาประวัติ</span>
              <input value={ledgerSearch} onChange={(e) => setLedgerSearch(e.target.value)}
                placeholder="สมาชิก, ประเภท, เหตุผล, ผู้ทำรายการ"
                className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-pond focus:ring-2 focus:ring-pond/15" />
            </label>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="bg-mist/60 text-xs uppercase tracking-wide text-dim">
              <tr><th className="px-5 py-3">เวลา</th><th className="px-5 py-3">สมาชิก</th><th className="px-5 py-3">ประเภท</th><th className="px-5 py-3 text-right">เครดิต</th><th className="px-5 py-3 text-right">แต้ม</th><th className="px-5 py-3">เหตุผล</th><th className="px-5 py-3">ผู้ทำรายการ</th></tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {filteredLedger.map((row) => (
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
              {filteredLedger.length === 0 && <tr><td colSpan={7} className="px-5 py-8 text-center text-dim">{ledger.length === 0 ? "ยังไม่มีประวัติเครดิต / แต้ม" : "ไม่พบประวัติที่ตรงกับคำค้น"}</td></tr>}
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
