"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Employee, UserRole } from "@/lib/db";

type SystemRole = Exclude<UserRole, "MEMBER">;

type FormState = {
  employeeId: string;
  name: string;
  phone: string;
  username: string;
  password: string;
  position: string;
  role: SystemRole;
  status: "ACTIVE" | "INACTIVE";
};

const emptyForm: FormState = {
  employeeId: "",
  name: "",
  phone: "",
  username: "",
  password: "",
  position: "",
  role: "STAFF",
  status: "ACTIVE",
};

const ROLE_LABEL: Record<SystemRole, string> = {
  ADMIN: "ผู้ดูแลระบบ",
  STAFF: "เจ้าหน้าที่",
};

export default function EmployeeManager({ employees, currentUserId }: { employees: Employee[]; currentUserId: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const editing = Boolean(form.employeeId);

  const activeCount = useMemo(() => employees.filter((e) => e.status === "ACTIVE").length, [employees]);
  const adminCount = useMemo(() => employees.filter((e) => e.role === "ADMIN" && e.status === "ACTIVE").length, [employees]);
  const inactiveCount = employees.length - activeCount;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function openCreate() {
    setForm(emptyForm);
    setMessage("");
    setModalOpen(true);
  }

  function edit(employee: Employee) {
    setForm({
      employeeId: employee.id,
      name: employee.name,
      phone: employee.phone,
      username: employee.username || "",
      password: "",
      position: employee.position,
      role: employee.role === "ADMIN" ? "ADMIN" : "STAFF",
      status: employee.status,
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
    const res = await fetch("/api/admin/employees", {
      method: editing ? "PUT" : "POST",
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
    setMessage("บันทึกผู้ใช้งานระบบแล้ว");
    router.refresh();
  }

  async function deactivate(employeeId: string) {
    setBusy(true);
    setMessage("");
    const res = await fetch(`/api/admin/employees?employeeId=${employeeId}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMessage(data.error || "ปิดสถานะไม่สำเร็จ");
      return;
    }
    setMessage("ปิดใช้งานผู้ใช้งานระบบแล้ว");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-deep p-5 text-white shadow-sm">
          <p className="text-sm text-white/62">ผู้ใช้งานเปิดใช้งาน</p>
          <p className="mt-2 font-display text-3xl font-semibold">{activeCount}</p>
          <p className="mt-2 text-xs text-white/55">เข้าถึงระบบหลังบ้านได้</p>
        </div>
        <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-line">
          <p className="text-sm text-dim">ผู้ดูแลระบบ</p>
          <p className="mt-2 font-display text-3xl font-semibold text-deep">{adminCount}</p>
          <p className="mt-2 text-xs text-dim">มีสิทธิ์จัดการผู้ใช้งานระบบ</p>
        </div>
        <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-line">
          <p className="text-sm text-dim">ปิดใช้งาน</p>
          <p className="mt-2 font-display text-3xl font-semibold text-deep">{inactiveCount}</p>
          <p className="mt-2 text-xs text-dim">ไม่สามารถเข้าสู่ระบบได้</p>
        </div>
      </section>

      <section className="rounded-lg bg-white shadow-sm ring-1 ring-line">
        <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-deep">ผู้ใช้งานระบบ</h3>
            <p className="text-sm text-dim">จัดการบัญชี สิทธิ์ และสถานะเพื่อป้องกันการใช้งานผิดสิทธิ์</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-mist px-3 py-1 text-sm font-semibold text-deep">{employees.length} บัญชี</span>
            <button onClick={openCreate} className="rounded-lg bg-pond px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-pond/20">
              เพิ่มผู้ใช้งานระบบ
            </button>
          </div>
        </div>
        {message && <p className="mx-5 mt-4 rounded-lg bg-mist px-3 py-2 text-sm font-medium text-deep">{message}</p>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-mist/60 text-xs uppercase tracking-wide text-dim">
              <tr>
                <th className="px-5 py-3 font-semibold">ผู้ใช้งาน</th>
                <th className="px-5 py-3 font-semibold">Username</th>
                <th className="px-5 py-3 font-semibold">สิทธิ์</th>
                <th className="px-5 py-3 font-semibold">สถานะ</th>
                <th className="px-5 py-3 text-right font-semibold">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-deep text-sm font-semibold text-white">
                        {employee.name.slice(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">{employee.name}</p>
                        <p className="text-xs text-dim">{employee.employeeCode} · {employee.position} · {employee.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-ink">{employee.username || "-"}</td>
                  <td className="px-5 py-4">
                    <span className={employee.role === "ADMIN"
                      ? "rounded-full bg-buoy/10 px-2.5 py-1 text-xs font-semibold text-buoy"
                      : "rounded-full bg-pond/10 px-2.5 py-1 text-xs font-semibold text-pond"}>
                      {ROLE_LABEL[employee.role === "ADMIN" ? "ADMIN" : "STAFF"]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={employee.status === "ACTIVE"
                      ? "rounded-full bg-pond/10 px-2.5 py-1 text-xs font-semibold text-pond"
                      : "rounded-full bg-mist px-2.5 py-1 text-xs font-semibold text-dim"}>
                      {employee.status === "ACTIVE" ? "ใช้งาน" : "ปิดใช้งาน"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button disabled={busy} onClick={() => edit(employee)}
                        className="rounded-lg bg-deep px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
                        แก้ไข
                      </button>
                      {employee.status === "ACTIVE" && employee.userId !== currentUserId && (
                        <button disabled={busy} onClick={() => deactivate(employee.id)}
                          className="rounded-lg bg-buoy/10 px-3 py-1.5 text-xs font-semibold text-buoy disabled:opacity-50">
                          ปิดใช้งาน
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-dim">ยังไม่มีผู้ใช้งานระบบ</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-deep/55 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
          <form onSubmit={submit} className="max-h-[calc(100dvh-3rem)] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-5 shadow-xl ring-1 ring-line">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-semibold text-deep">{editing ? "แก้ไขผู้ใช้งาน" : "เพิ่มผู้ใช้งานระบบ"}</h3>
                <p className="text-sm text-dim">ผู้ใช้งานระบบต้องเข้าสู่ระบบด้วย username และ password</p>
              </div>
              <button type="button" onClick={closeModal} className="rounded-lg bg-mist px-3 py-1.5 text-sm font-semibold text-deep">ปิด</button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">ชื่อผู้ใช้งาน</span>
                <input required value={form.name} onChange={(e) => setField("name", e.target.value)}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2.5 outline-none focus:border-pond focus:ring-2 focus:ring-pond/15" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">Username</span>
                <input required value={form.username} onChange={(e) => setField("username", e.target.value.toLowerCase())}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2.5 font-mono outline-none focus:border-pond focus:ring-2 focus:ring-pond/15" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">{editing ? "Password ใหม่" : "Password"}</span>
                <input type="password" required={!editing} value={form.password} onChange={(e) => setField("password", e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-line bg-white px-3 py-2.5 outline-none focus:border-pond focus:ring-2 focus:ring-pond/15" />
                <span className="mt-1 block text-xs text-dim">ไม่กรอกเมื่อแก้ไข = ไม่เปลี่ยน password</span>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">เบอร์โทร</span>
                <input required inputMode="numeric" maxLength={10} value={form.phone}
                  onChange={(e) => setField("phone", e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2.5 outline-none focus:border-pond focus:ring-2 focus:ring-pond/15" />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-1 block text-sm font-medium text-ink">ตำแหน่ง</span>
                <input required value={form.position} onChange={(e) => setField("position", e.target.value)}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2.5 outline-none focus:border-pond focus:ring-2 focus:ring-pond/15" />
              </label>
              <div>
                <span className="mb-1 block text-sm font-medium text-ink">สิทธิ์ผู้ใช้งานระบบ</span>
                <div className="grid grid-cols-2 gap-2 rounded-lg bg-mist p-1">
                  {(["STAFF", "ADMIN"] as const).map((role) => (
                    <button key={role} type="button" onClick={() => setField("role", role)}
                      className={`rounded-md py-2 text-sm font-semibold ${form.role === role ? "bg-white text-deep shadow-sm" : "text-dim"}`}>
                      {ROLE_LABEL[role]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="mb-1 block text-sm font-medium text-ink">สถานะ</span>
                <div className="grid grid-cols-2 gap-2 rounded-lg bg-mist p-1">
                  {(["ACTIVE", "INACTIVE"] as const).map((status) => (
                    <button key={status} type="button" onClick={() => setField("status", status)}
                      className={`rounded-md py-2 text-sm font-semibold ${form.status === status ? "bg-white text-deep shadow-sm" : "text-dim"}`}>
                      {status === "ACTIVE" ? "ใช้งาน" : "ปิดใช้งาน"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {message && <p className="mt-4 rounded-lg bg-buoy/10 px-3 py-2 text-sm font-medium text-buoy">{message}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={closeModal} className="rounded-lg bg-mist px-4 py-2.5 text-sm font-semibold text-deep">ยกเลิก</button>
              <button disabled={busy} className="rounded-lg bg-pond px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-pond/20 disabled:opacity-50">
                {busy ? "กำลังบันทึก..." : editing ? "บันทึกการแก้ไข" : "เพิ่มผู้ใช้งานระบบ"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
