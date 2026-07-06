import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { dateKeyBKK } from "@/lib/date";
import { requireLineBrowser } from "@/lib/line-request";
import BottomNav from "@/components/BottomNav";
import LogoutButton from "@/components/LogoutButton";
import MemberProfileForm from "../MemberProfileForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "โปรไฟล์สมาชิก | เคียงนา Fishing Lake",
  robots: { index: false, follow: false },
};

export default async function MemberPage() {
  await requireLineBrowser();
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "STAFF" || user.role === "ADMIN") redirect("/admin");

  const checkedIn = !!(await queryOne<{ id: string }>("SELECT id FROM checkins WHERE userId=? AND dateKey=?", [
    user.id,
    dateKeyBKK(),
  ]));

  return (
    <main className="min-h-dvh bg-[#f5f8f7] px-3 pb-28 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pond">Member Profile</p>
            <h1 className="mt-1 truncate font-display text-2xl font-semibold text-deep sm:text-3xl">ข้อมูลสมาชิก</h1>
          </div>
          <LogoutButton />
        </div>

        <section className="rounded-card bg-white p-4 shadow-sm ring-1 ring-line sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              {user.linePictureUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.linePictureUrl} alt={user.alias || user.name} className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-1 ring-line" />
              ) : (
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-deep text-2xl font-bold text-white">{(user.alias || user.name).slice(0, 1)}</span>
              )}
              <div className="min-w-0">
                <p className="truncate text-xl font-semibold text-deep">{user.alias || user.name}</p>
                <p className="mt-1 truncate font-mono text-xs text-dim">{user.memberCode}</p>
                <p className="mt-1 truncate text-sm text-dim">{user.lineDisplayName || "ยังไม่เชื่อมต่อ LINE"}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 md:w-[430px]">
              <div className="rounded-xl bg-mist px-3 py-2.5">
                <p className="text-[11px] font-medium text-dim">เครดิต</p>
                <p className="mt-1 text-lg font-semibold text-deep">฿{user.walletBalance.toLocaleString("th-TH")}</p>
              </div>
              <div className="rounded-xl bg-mist px-3 py-2.5">
                <p className="text-[11px] font-medium text-dim">แต้ม</p>
                <p className="mt-1 text-lg font-semibold text-deep">{user.points.toLocaleString("th-TH")}</p>
              </div>
              <div className="rounded-xl bg-mist px-3 py-2.5">
                <p className="text-[11px] font-medium text-dim">วันนี้</p>
                <p className="mt-1 truncate text-sm font-semibold text-deep">{checkedIn ? "เช็คอินแล้ว" : "ยังไม่เช็คอิน"}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <MemberProfileForm name={user.name} alias={user.alias || ""} pictureUrl={user.linePictureUrl || ""} />

          <aside className="space-y-3">
            <section className="rounded-card bg-deep p-4 text-white shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">Account</p>
              <div className="mt-3 grid gap-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-white/60">ชื่อในระบบ</span>
                  <span className="truncate font-semibold">{user.name}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-white/60">นามแฝง</span>
                  <span className="truncate font-semibold">{user.alias || "-"}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-white/60">LINE</span>
                  <span className="truncate font-semibold">{user.lineDisplayName || "-"}</span>
                </div>
              </div>
            </section>
            <section className="rounded-card bg-white p-4 shadow-sm ring-1 ring-line">
              <h2 className="font-display text-base font-semibold text-deep">บริการสมาชิก</h2>
              <p className="mt-2 text-sm leading-relaxed text-dim">
                QR เข้าบ่อ เติมเครดิต ส่งผลงานปลา ดูอันดับ ตารางลงปลา และติดต่อเจ้าหน้าที่ ใช้งานผ่านเมนู LINE
                เพื่อให้ข้อมูลผูกกับบัญชีสมาชิกเดียวกัน
              </p>
            </section>
          </aside>
        </section>
      </div>
      <BottomNav />
    </main>
  );
}
