import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { dateKeyBKK, monthKeyBKK, thaiDateTime } from "@/lib/date";
import LogoutButton from "@/components/LogoutButton";
import { FishActions, TopupActions } from "./Actions";

export const dynamic = "force-dynamic";

type TopupRow = {
  id: string;
  payAmount: number;
  getAmount: number;
  createdAt: string;
  name: string;
  memberCode: string;
};

type FishRow = {
  id: string;
  species: string;
  weightKg: number;
  imagePath: string;
  createdAt: string;
  name: string;
  memberCode: string;
};

type ActivityRow = {
  id: string;
  type: string;
  amount: number;
  note: string;
  createdAt: string;
  name: string;
  memberCode: string;
};

type CheckinRow = {
  id: string;
  createdAt: string;
  fee: number;
  name: string;
  memberCode: string;
  walletBalance: number;
};

type TrendRow = {
  dateKey: string;
  checkins: number;
  revenue: number;
};

type TopMemberRow = {
  memberCode: string;
  name: string;
  totalWeight: number;
  visits: number;
};

async function stat(sql: string, params: unknown[] = []) {
  return (await queryOne<{ value: number }>(sql, params))?.value ?? 0;
}

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "STAFF" && user.role !== "ADMIN") redirect("/");

  const dk = dateKeyBKK();
  const mk = monthKeyBKK();
  const [
    todayCheckins,
    todayRevenue,
    monthRevenue,
    members,
    activeEmployees,
    pendingTopupCount,
    pendingFishCount,
    verifiedFish,
    pendingTopups,
    pendingFish,
    activities,
    recentCheckins,
    trend,
    topMembers,
  ] = await Promise.all([
    stat("SELECT COUNT(*) value FROM checkins WHERE dateKey=?", [dk]),
    stat("SELECT COALESCE(SUM(fee),0) value FROM checkins WHERE dateKey=?", [dk]),
    stat("SELECT COALESCE(SUM(fee),0) value FROM checkins WHERE SUBSTR(dateKey,1,7)=?", [mk]),
    stat("SELECT COUNT(*) value FROM users WHERE role='MEMBER'"),
    stat("SELECT COUNT(*) value FROM employees WHERE status='ACTIVE'"),
    stat("SELECT COUNT(*) value FROM topups WHERE status='PENDING'"),
    stat("SELECT COUNT(*) value FROM catches WHERE status='PENDING'"),
    stat("SELECT COUNT(*) value FROM catches WHERE status='VERIFIED' AND monthKey=?", [mk]),
    query<TopupRow>(`
      SELECT t.id, t.payAmount, t.getAmount, t.createdAt, u.name, u.memberCode
      FROM topups t JOIN users u ON u.id=t.userId
      WHERE t.status='PENDING' ORDER BY t.createdAt ASC LIMIT 10
    `),
    query<FishRow>(`
      SELECT c.id, c.species, c.weightKg, c.imagePath, c.createdAt, u.name, u.memberCode
      FROM catches c JOIN users u ON u.id=c.userId
      WHERE c.status='PENDING' ORDER BY c.createdAt ASC LIMIT 10
    `),
    query<ActivityRow>(`
      SELECT tr.id, tr.type, tr.amount, tr.note, tr.createdAt, u.name, u.memberCode
      FROM transactions tr JOIN users u ON u.id=tr.userId
      ORDER BY tr.createdAt DESC LIMIT 8
    `),
    query<CheckinRow>(`
      SELECT k.id, k.createdAt, k.fee, u.name, u.memberCode, u.walletBalance
      FROM checkins k JOIN users u ON u.id=k.userId
      WHERE k.dateKey=?
      ORDER BY k.createdAt DESC LIMIT 8
    `, [dk]),
    query<TrendRow>(`
      SELECT dateKey, COUNT(*) checkins, COALESCE(SUM(fee),0) revenue
      FROM checkins
      WHERE dateKey >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 13 DAY), '%Y-%m-%d')
      GROUP BY dateKey
      ORDER BY dateKey ASC
    `),
    query<TopMemberRow>(`
      SELECT u.memberCode, u.name,
        COALESCE(SUM(CASE WHEN c.status='VERIFIED' THEN c.weightKg ELSE 0 END),0) totalWeight,
        COUNT(DISTINCT k.id) visits
      FROM users u
      LEFT JOIN catches c ON c.userId=u.id AND c.monthKey=?
      LEFT JOIN checkins k ON k.userId=u.id AND SUBSTR(k.dateKey,1,7)=?
      WHERE u.role='MEMBER'
      GROUP BY u.id, u.memberCode, u.name
      ORDER BY totalWeight DESC, visits DESC
      LIMIT 6
    `, [mk, mk]),
  ]);

  const kpis = [
    { label: "เข้าบ่อวันนี้", value: todayCheckins.toLocaleString("th-TH"), unit: "คน", sub: "เช็คอินวันที่ " + dk },
    { label: "รายได้วันนี้", value: todayRevenue.toLocaleString("th-TH"), unit: "บาท", sub: "ค่าเข้าบ่อทั้งหมด" },
    { label: "รายได้เดือนนี้", value: monthRevenue.toLocaleString("th-TH"), unit: "บาท", sub: "รอบเดือน " + mk },
    { label: "สมาชิก", value: members.toLocaleString("th-TH"), unit: "บัญชี", sub: "ไม่รวมเจ้าหน้าที่" },
  ];

  return (
    <main className="admin-shell min-h-dvh bg-[#f5f8f7] text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-line bg-deep px-5 py-6 text-white lg:block">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/45">เคียงนา Fishing Lake</p>
          <h1 className="mt-2 font-display text-2xl font-semibold">Back Office</h1>
        </div>
        <nav className="space-y-1 text-sm">
          <Link href="/admin" className="block rounded-lg bg-white/12 px-3 py-2.5 font-semibold text-white">Dashboard</Link>
          <Link href="/admin/scan" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">รับสมาชิกเข้าบ่อ</Link>
          <Link href="/admin/members" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">สมาชิก</Link>
          <Link href="/admin/credits" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">เครดิต / แต้ม</Link>
          <Link href="/admin/fish-stockings" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">ตารางลงปลา</Link>
          <Link href="/admin/fish" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">ผลงานปลา</Link>
          <Link href="/admin/fish-species" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">ชนิดปลา</Link>
          <Link href="/admin/member-ranking" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">Ranking สมาชิก</Link>
          {user.role === "ADMIN" && <Link href="/admin/ranking-levels" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">Level Ranking</Link>}
          <Link href="/admin/events" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">Event</Link>
          <Link href="/admin/rewards" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">คูปอง / รางวัล</Link>
          <Link href="/admin/reports" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">รายงาน</Link>
          <Link href="/admin/employees" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">ผู้ใช้งานระบบ</Link>
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
              <p className="text-xs font-semibold uppercase tracking-widest text-dim">ระบบหลังบ้าน</p>
              <h2 className="font-display text-2xl font-semibold text-deep">แดชบอร์ดเคียงนา Fishing Lake</h2>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin/scan" className="rounded-lg bg-pond px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-pond/20">เช็คอินลูกค้า</Link>
              <LogoutButton />
            </div>
          </div>
        </header>

        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi, index) => (
              <div key={kpi.label} className={index === 0 ? "rounded-lg bg-deep p-5 text-white shadow-sm" : "rounded-lg bg-white p-5 shadow-sm ring-1 ring-line"}>
                <p className={index === 0 ? "text-sm text-white/62" : "text-sm text-dim"}>{kpi.label}</p>
                <div className="mt-3 flex items-end gap-2">
                  <p className="font-display text-3xl font-semibold">{kpi.value}</p>
                  <p className={index === 0 ? "pb-1 text-sm text-white/60" : "pb-1 text-sm text-dim"}>{kpi.unit}</p>
                </div>
                <p className={index === 0 ? "mt-3 text-xs text-white/55" : "mt-3 text-xs text-dim"}>{kpi.sub}</p>
              </div>
            ))}
          </section>

          <section className="mt-6 grid gap-4 lg:grid-cols-3 xl:grid-cols-6">
            <Link href="/admin/scan" className="rounded-lg bg-pond p-5 text-white shadow-sm shadow-pond/20">
              <p className="text-sm text-white/65">งานหน้าบ่อ</p>
              <p className="mt-2 font-display text-xl font-semibold">รับสมาชิกเข้าบ่อ</p>
              <p className="mt-2 text-sm text-white/68">สแกน QR หรือพิมพ์รหัสสมาชิกเพื่อบันทึกการเข้าใช้บริการ</p>
            </Link>
            <Link href="/admin/employees" className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-line">
              <p className="text-sm text-dim">ทีมงาน</p>
              <p className="mt-2 font-display text-xl font-semibold text-deep">{activeEmployees} ผู้ใช้งานเปิดใช้งาน</p>
              <p className="mt-2 text-sm text-dim">เพิ่ม แก้ไข และกำหนดสิทธิ์ผู้ใช้งานระบบ</p>
            </Link>
            <Link href="/admin/members" className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-line">
              <p className="text-sm text-dim">สมาชิก LINE</p>
              <p className="mt-2 font-display text-xl font-semibold text-deep">{members.toLocaleString("th-TH")} บัญชีสมาชิก</p>
              <p className="mt-2 text-sm text-dim">ดูข้อมูล LINE, นามแฝง, สถานะ และหมายเหตุ</p>
            </Link>
            <Link href="/admin/credits" className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-line">
              <p className="text-sm text-dim">เครดิต / แต้ม</p>
              <p className="mt-2 font-display text-xl font-semibold text-deep">ปรับยอดและตรวจประวัติ</p>
              <p className="mt-2 text-sm text-dim">ควบคุมเครดิต แต้ม และ ledger สมาชิก</p>
            </Link>
            <Link href="/admin/fish-species" className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-line">
              <p className="text-sm text-dim">ชนิดปลา</p>
              <p className="mt-2 font-display text-xl font-semibold text-deep">แคตตาล็อกปลา</p>
              <p className="mt-2 text-sm text-dim">กำหนดชื่อปลา หมวดหมู่ แต้ม และเงื่อนไขน้ำหนัก</p>
            </Link>
            <Link href="/admin/fish-stockings" className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-line">
              <p className="text-sm text-dim">ตารางลงปลา</p>
              <p className="mt-2 font-display text-xl font-semibold text-deep">บันทึกปลาลงบ่อ</p>
              <p className="mt-2 text-sm text-dim">รูปภาพ ชนิดปลา จำนวนตัว น้ำหนักรวม รายละเอียด และวันที่ลงปลา</p>
            </Link>
            <Link href="/admin/member-ranking" className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-line">
              <p className="text-sm text-dim">Ranking สมาชิก</p>
              <p className="mt-2 font-display text-xl font-semibold text-deep">อันดับแบบละเอียด</p>
              <p className="mt-2 text-sm text-dim">ปลาใหญ่ น้ำหนักรวม จำนวนตัว ขาประจำ และคะแนนรวม</p>
            </Link>
            {user.role === "ADMIN" && (
              <Link href="/admin/ranking-levels" className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-line">
                <p className="text-sm text-dim">Level Ranking</p>
                <p className="mt-2 font-display text-xl font-semibold text-deep">ระดับและสัญลักษณ์</p>
                <p className="mt-2 text-sm text-dim">กำหนดชื่อระดับ สี คะแนนขั้นต่ำ และ badge สมาชิก</p>
              </Link>
            )}
            <Link href="/admin/events" className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-line">
              <p className="text-sm text-dim">Event</p>
              <p className="mt-2 font-display text-xl font-semibold text-deep">กิจกรรมและแคมเปญ</p>
              <p className="mt-2 text-sm text-dim">กำหนดช่วงเวลาและรางวัล</p>
            </Link>
            <Link href="/admin/rewards" className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-line">
              <p className="text-sm text-dim">คูปอง / รางวัล</p>
              <p className="mt-2 font-display text-xl font-semibold text-deep">แจกเครดิตและแต้ม</p>
              <p className="mt-2 text-sm text-dim">สร้างคูปองและแลกสิทธิ์สมาชิก</p>
            </Link>
            <Link href="/admin/reports" className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-line">
              <p className="text-sm text-dim">รายงาน</p>
              <p className="mt-2 font-display text-xl font-semibold text-deep">สรุปรายได้และกิจกรรม</p>
              <p className="mt-2 text-sm text-dim">รายงานรายวัน เติมเงิน ปลา สมาชิก และ audit log</p>
            </Link>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-line">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-semibold text-deep">กราฟเช็คอิน 14 วัน</h3>
                  <p className="text-sm text-dim">ดูแนวโน้มจำนวนลูกค้าและรายได้ค่าเข้า</p>
                </div>
                <Link href="/admin/reports" className="rounded-lg bg-mist px-3 py-2 text-sm font-semibold text-deep">รายงานเต็ม</Link>
              </div>
              <DashboardBars rows={trend} />
            </div>
            <div className="rounded-lg bg-deep p-5 text-white shadow-sm">
              <p className="text-sm text-white/62">Top Members</p>
              <h3 className="mt-1 font-display text-xl font-semibold">ผลงานเด่นประจำเดือน</h3>
              <div className="mt-4 space-y-3">
                {topMembers.map((member, index) => (
                  <div key={member.memberCode} className="flex items-center justify-between gap-3 rounded-lg bg-white/8 px-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{index + 1}. {member.name}</p>
                      <p className="font-mono text-xs text-white/50">{member.memberCode} · {member.visits} visits</p>
                    </div>
                    <p className="font-display text-lg font-semibold text-gold">{Number(member.totalWeight).toFixed(1)} กก.</p>
                  </div>
                ))}
                {topMembers.length === 0 && <p className="rounded-lg bg-white/8 px-3 py-8 text-center text-sm text-white/55">ยังไม่มีข้อมูลเดือนนี้</p>}
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-4 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-line">
              <p className="text-sm text-dim">รายการค้าง</p>
              <p className="mt-2 font-display text-xl font-semibold text-deep">{pendingTopupCount} เติมเงิน</p>
              <p className="mt-2 text-sm text-dim">รอการอนุมัติจากเจ้าหน้าที่</p>
            </div>
            <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-line">
              <p className="text-sm text-dim">ผลงานปลา</p>
              <p className="mt-2 font-display text-xl font-semibold text-deep">{verifiedFish} รายการยืนยัน</p>
              <p className="mt-2 text-sm text-dim">รอยืนยันอีก {pendingFishCount} รายการ</p>
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="space-y-6">
              <div className="rounded-lg bg-white shadow-sm ring-1 ring-line">
                <div className="flex items-center justify-between border-b border-line px-5 py-4">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-deep">คำขอเติมเงิน</h3>
                    <p className="text-sm text-dim">ตรวจสอบยอดโอนและอนุมัติเข้ากระเป๋าสมาชิก</p>
                  </div>
                  <span className="rounded-full bg-buoy/10 px-3 py-1 text-sm font-semibold text-buoy">{pendingTopupCount} รออยู่</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-mist/60 text-xs uppercase tracking-wide text-dim">
                      <tr>
                        <th className="px-5 py-3 font-semibold">สมาชิก</th>
                        <th className="px-5 py-3 font-semibold">ยอดโอน</th>
                        <th className="px-5 py-3 font-semibold">ยอดเข้า</th>
                        <th className="px-5 py-3 font-semibold">เวลา</th>
                        <th className="px-5 py-3 text-right font-semibold">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/70">
                      {pendingTopups.map((t) => (
                        <tr key={t.id}>
                          <td className="px-5 py-4">
                            <p className="font-semibold text-ink">{t.name}</p>
                            <p className="font-mono text-xs text-dim">{t.memberCode}</p>
                          </td>
                          <td className="px-5 py-4">฿{t.payAmount.toLocaleString("th-TH")}</td>
                          <td className="px-5 py-4 font-semibold text-pond">฿{t.getAmount.toLocaleString("th-TH")}</td>
                          <td className="px-5 py-4 text-dim">{thaiDateTime(t.createdAt)}</td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end"><TopupActions id={t.id} /></div>
                          </td>
                        </tr>
                      ))}
                      {pendingTopups.length === 0 && (
                        <tr><td colSpan={5} className="px-5 py-8 text-center text-dim">ไม่มีรายการเติมเงินค้างอนุมัติ</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-lg bg-white shadow-sm ring-1 ring-line">
                <div className="flex items-center justify-between border-b border-line px-5 py-4">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-deep">ปลารอยืนยัน</h3>
                    <p className="text-sm text-dim">อนุมัติผลงานเพื่อขึ้นกระดานอันดับประจำเดือน</p>
                  </div>
                  <span className="rounded-full bg-gold/15 px-3 py-1 text-sm font-semibold text-[#8b6b12]">{pendingFishCount} รายการ</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-mist/60 text-xs uppercase tracking-wide text-dim">
                      <tr>
                        <th className="px-5 py-3 font-semibold">ปลา</th>
                        <th className="px-5 py-3 font-semibold">สมาชิก</th>
                        <th className="px-5 py-3 font-semibold">น้ำหนัก</th>
                        <th className="px-5 py-3 font-semibold">เวลา</th>
                        <th className="px-5 py-3 text-right font-semibold">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/70">
                      {pendingFish.map((c) => (
                        <tr key={c.id}>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={c.imagePath} alt={c.species} className="h-12 w-12 rounded-lg bg-mist object-cover" />
                              <p className="font-semibold text-ink">{c.species}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-semibold text-ink">{c.name}</p>
                            <p className="font-mono text-xs text-dim">{c.memberCode}</p>
                          </td>
                          <td className="px-5 py-4 font-semibold text-deep">{Number(c.weightKg).toFixed(1)} กก.</td>
                          <td className="px-5 py-4 text-dim">{thaiDateTime(c.createdAt)}</td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end"><FishActions id={c.id} /></div>
                          </td>
                        </tr>
                      ))}
                      {pendingFish.length === 0 && (
                        <tr><td colSpan={5} className="px-5 py-8 text-center text-dim">ไม่มีปลารอยืนยัน</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <section className="rounded-lg bg-white shadow-sm ring-1 ring-line">
                <div className="border-b border-line px-5 py-4">
                  <h3 className="font-display text-lg font-semibold text-deep">เช็คอินล่าสุดวันนี้</h3>
                  <p className="text-sm text-dim">รายการเข้าใช้บริการหน้าบ่อ</p>
                </div>
                <ul className="divide-y divide-line/70">
                  {recentCheckins.map((item) => (
                    <li key={item.id} className="px-5 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">{item.name}</p>
                          <p className="font-mono text-xs text-dim">{item.memberCode}</p>
                        </div>
                        <p className="font-semibold text-deep">฿{item.fee.toLocaleString("th-TH")}</p>
                      </div>
                      <p className="mt-1 text-xs text-dim">{thaiDateTime(item.createdAt)} · คงเหลือ ฿{item.walletBalance.toLocaleString("th-TH")}</p>
                    </li>
                  ))}
                  {recentCheckins.length === 0 && <li className="px-5 py-8 text-center text-sm text-dim">วันนี้ยังไม่มีเช็คอิน</li>}
                </ul>
              </section>

              <section className="rounded-lg bg-white shadow-sm ring-1 ring-line">
                <div className="border-b border-line px-5 py-4">
                  <h3 className="font-display text-lg font-semibold text-deep">กิจกรรมล่าสุด</h3>
                  <p className="text-sm text-dim">ประวัติธุรกรรมและรางวัล</p>
                </div>
                <ul className="divide-y divide-line/70">
                  {activities.map((a) => (
                    <li key={a.id} className="px-5 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">{a.name}</p>
                          <p className="truncate text-xs text-dim">{a.note || a.type}</p>
                        </div>
                        <p className={a.amount >= 0 ? "font-display font-semibold text-pond" : "font-display font-semibold text-buoy"}>
                          {a.amount > 0 ? "+" : ""}{a.amount.toLocaleString("th-TH")}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-dim">{thaiDateTime(a.createdAt)}</p>
                    </li>
                  ))}
                  {activities.length === 0 && <li className="px-5 py-8 text-center text-sm text-dim">ยังไม่มีกิจกรรม</li>}
                </ul>
              </section>
            </aside>
          </section>
        </div>
      </section>
    </main>
  );
}

function DashboardBars({ rows }: { rows: TrendRow[] }) {
  const maxCheckins = Math.max(1, ...rows.map((row) => Number(row.checkins || 0)));
  const maxRevenue = Math.max(1, ...rows.map((row) => Number(row.revenue || 0)));
  return (
    <div className="mt-6">
      <div className="flex h-64 items-end gap-2 rounded-lg bg-mist/45 px-4 py-4">
        {rows.length === 0 && <div className="grid h-full flex-1 place-items-center text-sm text-dim">ยังไม่มีข้อมูลเช็คอิน</div>}
        {rows.map((row) => {
          const checkinHeight = Math.max(8, (Number(row.checkins) / maxCheckins) * 100);
          const revenueHeight = Math.max(8, (Number(row.revenue) / maxRevenue) * 100);
          return (
            <div key={row.dateKey} className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
              <div className="flex h-48 w-full max-w-12 items-end justify-center gap-1">
                <div title={`${row.checkins} เช็คอิน`} className="w-1/2 rounded-t-md bg-pond transition group-hover:bg-deep" style={{ height: `${checkinHeight}%` }} />
                <div title={`฿${Number(row.revenue).toLocaleString("th-TH")}`} className="w-1/2 rounded-t-md bg-buoy transition group-hover:bg-gold" style={{ height: `${revenueHeight}%` }} />
              </div>
              <p className="truncate text-[11px] font-semibold text-dim">{row.dateKey.slice(5)}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-dim">
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-pond" /> เช็คอิน</span>
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-buoy" /> รายได้ค่าเข้า</span>
      </div>
    </div>
  );
}
