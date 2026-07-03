"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Member = {
  id: string;
  memberCode: string;
  name: string;
  alias: string | null;
  phone: string;
  lineUserId: string | null;
  lineDisplayName: string | null;
  linePictureUrl: string | null;
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
const pageSize = 20;

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

export default function MemberManager({
  members,
  isAdmin,
  duplicateStats,
}: {
  members: Member[];
  isAdmin: boolean;
  duplicateStats: { duplicateLine: number; duplicatePhone: number; duplicateProfile: number };
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [clearText, setClearText] = useState("");
  const [mergeSource, setMergeSource] = useState<Member | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const editing = Boolean(form.memberId);
  const hasDuplicate = Number(duplicateStats.duplicateLine || 0) > 0 || Number(duplicateStats.duplicatePhone || 0) > 0 || Number(duplicateStats.duplicateProfile || 0) > 0;
  const normalizedSearch = search.trim().toLowerCase();
  const filteredMembers = useMemo(() => {
    if (!normalizedSearch) return members;
    return members.filter((member) => [
      member.memberCode,
      member.name,
      member.alias,
      member.phone,
      member.lineUserId,
      member.lineDisplayName,
      member.profileNote,
      member.status === "ACTIVE" ? "ใช้งาน" : "ปิดใช้งาน",
    ].some((value) => String(value || "").toLowerCase().includes(normalizedSearch)));
  }, [members, normalizedSearch]);
  const pageCount = Math.max(1, Math.ceil(filteredMembers.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pagedMembers = filteredMembers.slice((safePage - 1) * pageSize, safePage * pageSize);
  const resultStart = filteredMembers.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const resultEnd = Math.min(safePage * pageSize, filteredMembers.length);

  function duplicateCandidates(member: Member) {
    const profileName = (member.lineDisplayName || member.name).trim().toLowerCase();
    return members.filter((item) => {
      if (item.id === member.id) return false;
      const itemProfileName = (item.lineDisplayName || item.name).trim().toLowerCase();
      return Boolean(
        (member.lineUserId && item.lineUserId === member.lineUserId) ||
        (member.phone && item.phone === member.phone) ||
        (profileName && itemProfileName === profileName)
      );
    });
  }

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

  async function clearMembers() {
    setBusy(true);
    setMessage("");
    const res = await fetch("/api/admin/members", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: clearText }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMessage(data.error || "ล้างข้อมูลสมาชิกไม่สำเร็จ");
      return;
    }
    setConfirmClearOpen(false);
    setClearText("");
    setMessage(`ล้างข้อมูลสมาชิกแล้ว ${Number(data.deletedCount || 0).toLocaleString("th-TH")} บัญชี`);
    router.refresh();
  }

  function openMerge(member: Member) {
    const candidates = duplicateCandidates(member);
    if (candidates.length === 0) return;
    setMergeSource(member);
    setMergeTargetId(candidates[0].id);
    setMessage("");
  }

  async function mergeMember() {
    if (!mergeSource || !mergeTargetId) return;
    setBusy(true);
    setMessage("");
    const res = await fetch("/api/admin/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "merge", sourceId: mergeSource.id, targetId: mergeTargetId }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMessage(data.error || "รวมสมาชิกไม่สำเร็จ");
      return;
    }
    setMergeSource(null);
    setMergeTargetId("");
    setMessage(`รวมสมาชิก ${data.sourceMemberCode} เข้ากับ ${data.targetMemberCode} แล้ว`);
    router.refresh();
  }

  return (
    <section className="space-y-4">
      {message && <p className="rounded-lg bg-mist px-3 py-2 text-sm text-deep">{message}</p>}

      <div className="rounded-lg bg-white shadow-sm ring-1 ring-line">
        <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-deep">สมาชิกจาก LINE</h3>
            <p className="text-sm text-dim">ข้อมูลหลักจะผูกกับ LINE ID เมื่อสมาชิกแอด LINE และใช้งาน เมนูบริการ</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={hasDuplicate
              ? "w-fit rounded-full bg-buoy/10 px-3 py-1 text-sm font-semibold text-buoy"
              : "w-fit rounded-full bg-pond/10 px-3 py-1 text-sm font-semibold text-pond"}>
              {hasDuplicate ? `พบข้อมูลซ้ำ LINE ${duplicateStats.duplicateLine} / เบอร์ ${duplicateStats.duplicatePhone} / โปรไฟล์ ${duplicateStats.duplicateProfile}` : "ตรวจซ้ำแล้ว ไม่พบข้อมูลซ้ำ"}
            </span>
            <span className="w-fit rounded-full bg-mist px-3 py-1 text-sm font-semibold text-deep">{members.length} บัญชีทั้งหมด</span>
            {isAdmin && (
              <button onClick={() => setConfirmClearOpen(true)} className="w-fit rounded-full bg-buoy px-3 py-1 text-sm font-semibold text-white">
                ล้างสมาชิกทั้งหมด
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-3 border-b border-line px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="block w-full lg:max-w-lg">
            <span className="mb-1 block text-sm font-medium text-ink">ค้นหาสมาชิก</span>
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="ชื่อ, รหัสสมาชิก, เบอร์, LINE ID, LINE name"
              className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-pond focus:ring-2 focus:ring-pond/15"
            />
          </label>
          <div className="flex flex-wrap items-center gap-2 text-sm text-dim">
            <span>
              แสดง {resultStart.toLocaleString("th-TH")}-{resultEnd.toLocaleString("th-TH")} จาก {filteredMembers.length.toLocaleString("th-TH")} รายการ
            </span>
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="rounded-lg bg-mist px-3 py-2 text-sm font-semibold text-deep"
              >
                ล้างคำค้น
              </button>
            )}
          </div>
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
              {pagedMembers.map((member) => (
                <tr key={member.id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <MemberAvatar member={member} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">{member.alias || member.name}</p>
                        <p className="truncate text-xs text-dim">{member.memberCode} · {member.name} · {member.phone}</p>
                      </div>
                    </div>
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
                    <div className="flex justify-end gap-2">
                      {isAdmin && duplicateCandidates(member).length > 0 && (
                        <button onClick={() => openMerge(member)} className="rounded-lg bg-mist px-3 py-1.5 text-xs font-semibold text-deep">รวม</button>
                      )}
                      <button onClick={() => edit(member)} className="rounded-lg bg-deep px-3 py-1.5 text-xs font-semibold text-white">แก้ไข</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-dim">{members.length === 0 ? "ยังไม่มีสมาชิก" : "ไม่พบสมาชิกที่ตรงกับคำค้น"}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-dim">
            หน้า {safePage.toLocaleString("th-TH")} จาก {pageCount.toLocaleString("th-TH")}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-deep ring-1 ring-line disabled:cursor-not-allowed disabled:opacity-45"
            >
              ก่อนหน้า
            </button>
            <button
              type="button"
              disabled={safePage >= pageCount}
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-deep ring-1 ring-line disabled:cursor-not-allowed disabled:opacity-45"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-deep/55 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
          <form onSubmit={submit} className="max-h-[calc(100dvh-3rem)] w-full max-w-xl overflow-y-auto rounded-lg bg-white p-5 shadow-xl ring-1 ring-line">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-semibold text-deep">แก้ไขสมาชิก</h3>
                <p className="text-sm text-dim">แก้ได้เฉพาะข้อมูลแสดงผลและสถานะ ข้อมูล LINE จะมาจาก LINE</p>
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

      {confirmClearOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-deep/60 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl ring-1 ring-line">
            <h3 className="font-display text-xl font-semibold text-buoy">ยืนยันการล้างข้อมูลสมาชิก</h3>
            <p className="mt-2 text-sm leading-relaxed text-dim">
              ระบบจะลบเฉพาะสมาชิก LINE ทั้งหมด รวมถึงประวัติที่ผูกกับสมาชิกผ่าน foreign key เช่น เช็คอิน เครดิต เติมเงิน คูปอง และผลงานปลา
              โดยไม่ลบเจ้าหน้าที่หรือผู้ดูแลระบบ การดำเนินการนี้ย้อนกลับไม่ได้
            </p>
            <label className="mt-4 block">
              <span className="mb-1 block text-sm font-medium text-ink">พิมพ์ CLEAR MEMBERS เพื่อยืนยัน</span>
              <input value={clearText} onChange={(event) => setClearText(event.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2.5 font-mono outline-none focus:border-buoy focus:ring-2 focus:ring-buoy/15" />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => { setConfirmClearOpen(false); setClearText(""); }} className="rounded-lg bg-mist px-4 py-2.5 text-sm font-semibold text-deep">ยกเลิก</button>
              <button disabled={busy || clearText !== "CLEAR MEMBERS"} onClick={clearMembers}
                className="rounded-lg bg-buoy px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                {busy ? "กำลังล้างข้อมูล..." : "ล้างข้อมูลสมาชิก"}
              </button>
            </div>
          </div>
        </div>
      )}

      {mergeSource && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-deep/60 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl ring-1 ring-line">
            <h3 className="font-display text-xl font-semibold text-deep">รวมสมาชิกซ้ำ</h3>
            <p className="mt-2 text-sm leading-relaxed text-dim">
              ระบบจะย้ายยอดเงิน แต้ม เช็คอิน เติมเงิน คูปอง และผลงานปลาของ <b>{mergeSource.memberCode}</b> ไปยังสมาชิกหลัก
              จากนั้นลบรายการซ้ำออกโดยเก็บ audit log ไว้ตรวจสอบย้อนหลัง
            </p>
            <label className="mt-4 block">
              <span className="mb-1 block text-sm font-medium text-ink">เลือกสมาชิกหลักที่จะเก็บไว้</span>
              <select value={mergeTargetId} onChange={(event) => setMergeTargetId(event.target.value)}
                className="w-full rounded-lg border border-line bg-white px-3 py-2.5 outline-none focus:border-pond focus:ring-2 focus:ring-pond/15">
                {duplicateCandidates(mergeSource).map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.memberCode} · {member.alias || member.name} · {member.lineDisplayName || "ยังไม่เชื่อม LINE"}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => { setMergeSource(null); setMergeTargetId(""); }} className="rounded-lg bg-mist px-4 py-2.5 text-sm font-semibold text-deep">ยกเลิก</button>
              <button disabled={busy || !mergeTargetId} onClick={mergeMember}
                className="rounded-lg bg-pond px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                {busy ? "กำลังรวม..." : "รวมสมาชิก"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
