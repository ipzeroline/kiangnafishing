import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { query, type Coupon } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";
import CouponManager from "./CouponManager";

export const dynamic = "force-dynamic";

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

export default async function RewardsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "STAFF" && user.role !== "ADMIN") redirect("/");

  const [coupons, redemptions] = await Promise.all([
    query<Coupon>("SELECT * FROM coupons ORDER BY status ASC, createdAt DESC LIMIT 200"),
    query<Redemption>(`
      SELECT r.id, c.code, c.title, u.memberCode, u.name, r.creditAmount, r.pointsAmount, r.createdAt, a.name actorName
      FROM coupon_redemptions r
      JOIN coupons c ON c.id=r.couponId
      JOIN users u ON u.id=r.userId
      LEFT JOIN users a ON a.id=r.actorUserId
      ORDER BY r.createdAt DESC
      LIMIT 50
    `),
  ]);

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
          <Link href="/admin/fish" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">ผลงานปลา</Link>
          <Link href="/admin/member-ranking" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">Ranking สมาชิก</Link>
          {user.role === "ADMIN" && <Link href="/admin/ranking-levels" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">Level Ranking</Link>}
          <Link href="/admin/events" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">Event</Link>
          <Link href="/admin/rewards" className="block rounded-lg bg-white/12 px-3 py-2.5 font-semibold text-white">คูปอง / รางวัล</Link>
          <Link href="/admin/scan" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">รับสมาชิกเข้าบ่อ</Link>
          <Link href="/admin/reports" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">รายงาน</Link>
          <Link href="/admin/employees" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">ผู้ใช้งานระบบ</Link>
        </nav>
      </aside>
      <section className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-line bg-[#f5f8f7]/90 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-dim">Coupon & Reward</p>
              <h2 className="font-display text-2xl font-semibold text-deep">ระบบคูปอง แจกรางวัล</h2>
            </div>
            <LogoutButton />
          </div>
        </header>
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <CouponManager coupons={coupons} redemptions={redemptions} />
        </div>
      </section>
    </main>
  );
}
