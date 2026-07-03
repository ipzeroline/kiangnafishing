import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { dateKeyBKK } from "@/lib/date";
import BottomNav from "@/components/BottomNav";
import LogoutButton from "@/components/LogoutButton";
import MemberProfileForm from "../MemberProfileForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "โปรไฟล์สมาชิก | เคียงนา Fishing Lake",
  robots: { index: false, follow: false },
};

export default async function MemberPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "STAFF" || user.role === "ADMIN") redirect("/admin");

  const checkedIn = !!(await queryOne<{ id: string }>("SELECT id FROM checkins WHERE userId=? AND dateKey=?", [
    user.id,
    dateKeyBKK(),
  ]));

  return (
    <main className="min-h-dvh bg-[#f5f8f7] px-4 pb-28 pt-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-dim">Member Profile</p>
            <h1 className="mt-1 font-display text-3xl font-semibold text-deep">{user.alias || user.name}</h1>
          </div>
          <LogoutButton />
        </div>

        <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <aside className="rounded-card bg-deep p-6 text-white shadow-sm">
            <p className="text-sm text-white/60">รหัสสมาชิก</p>
            <p className="mt-2 font-mono text-3xl font-semibold">{user.memberCode}</p>
            <div className="mt-6 space-y-3 text-sm">
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-white/55">ชื่อจริงในระบบ</p>
                <p className="mt-1 font-semibold">{user.name}</p>
              </div>
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-white/55">นามแฝง</p>
                <p className="mt-1 font-semibold">{user.alias || "-"}</p>
              </div>
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-white/55">LINE</p>
                <p className="mt-1 font-semibold">{user.lineDisplayName || "อยู่ระหว่างเชื่อมต่อจาก LINE OA"}</p>
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-3">
              <div className="rounded-card bg-white p-5 shadow-sm ring-1 ring-line">
                <p className="text-sm text-dim">ยอดคงเหลือ</p>
                <p className="mt-2 font-display text-3xl font-semibold text-deep">฿{user.walletBalance.toLocaleString("th-TH")}</p>
              </div>
              <div className="rounded-card bg-white p-5 shadow-sm ring-1 ring-line">
                <p className="text-sm text-dim">แต้มสะสม</p>
                <p className="mt-2 font-display text-3xl font-semibold text-deep">{user.points.toLocaleString("th-TH")}</p>
              </div>
              <div className="rounded-card bg-white p-5 shadow-sm ring-1 ring-line">
                <p className="text-sm text-dim">สถานะวันนี้</p>
                <p className="mt-2 font-display text-2xl font-semibold text-deep">{checkedIn ? "เช็คอินแล้ว" : "ยังไม่เช็คอิน"}</p>
              </div>
            </section>

            <MemberProfileForm name={user.name} alias={user.alias || ""} />

            <section className="rounded-card border-l-4 border-buoy bg-white p-5 shadow-sm ring-1 ring-line">
              <h2 className="font-display text-lg font-semibold text-deep">รายการบริการของสมาชิก</h2>
              <p className="mt-2 text-sm leading-relaxed text-dim">
                QR เข้าบ่อ การเติมเครดิต การส่งผลงานปลา การดูอันดับ ตารางลงปลา และการติดต่อเจ้าหน้าที่
                ดำเนินการผ่าน Rich Menu ใน LINE Official Account เพื่อให้ข้อมูลสมาชิกผูกกับบัญชี LINE และลดความเสี่ยงจากรายการผิดบัญชี
              </p>
            </section>
          </div>
        </section>
      </div>
      <BottomNav />
    </main>
  );
}
