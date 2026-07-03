import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { query, type Employee } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";
import EmployeeManager from "./EmployeeManager";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/admin");

  const employees = await query<Employee>(`
    SELECT e.id, e.userId, e.employeeCode, e.position, e.status, e.hiredAt, e.createdAt, e.updatedAt,
      u.name, u.phone, u.username, u.role
    FROM employees e
    JOIN users u ON u.id=e.userId
    ORDER BY e.status ASC, e.createdAt DESC
  `);

  return (
    <main className="admin-shell min-h-dvh bg-[#f5f8f7] text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-line bg-deep px-5 py-6 text-white lg:block">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/45">เคียงนา Fishing Lake</p>
          <h1 className="mt-2 font-display text-2xl font-semibold">Back Office</h1>
        </div>
        <nav className="space-y-1 text-sm">
          <Link href="/admin" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">Dashboard</Link>
          <Link href="/admin/members" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">สมาชิก</Link>
          <Link href="/admin/credits" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">เครดิต / แต้ม</Link>
          <Link href="/admin/fish-species" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">ชนิดปลา</Link>
          <Link href="/admin/member-ranking" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">Ranking สมาชิก</Link>
          <Link href="/admin/ranking-levels" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">Level Ranking</Link>
          <Link href="/admin/events" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">Event</Link>
          <Link href="/admin/rewards" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">คูปอง / รางวัล</Link>
          <Link href="/admin/scan" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">รับสมาชิกเข้าบ่อ</Link>
          <Link href="/admin/reports" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">รายงาน</Link>
          <Link href="/admin/employees" className="block rounded-lg bg-white/12 px-3 py-2.5 font-semibold text-white">ผู้ใช้งานระบบ</Link>
          <Link href="/ranking" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">กระดานอันดับ</Link>
        </nav>
        <div className="absolute bottom-6 left-5 right-5 rounded-lg border border-white/10 bg-white/8 p-4">
          <p className="text-xs text-white/55">เข้าสู่ระบบโดย</p>
          <p className="mt-1 truncate font-semibold">{user.name}</p>
          <p className="text-xs text-white/50">{user.memberCode}</p>
        </div>
      </aside>

      <section className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-line bg-[#f5f8f7]/90 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-dim">Security & Access Control</p>
              <h2 className="font-display text-2xl font-semibold text-deep">จัดการผู้ใช้งานระบบ</h2>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-deep ring-1 ring-line">กลับ Dashboard</Link>
              <LogoutButton />
            </div>
          </div>
        </header>
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <EmployeeManager employees={employees} currentUserId={user.id} />
        </div>
      </section>
    </main>
  );
}
