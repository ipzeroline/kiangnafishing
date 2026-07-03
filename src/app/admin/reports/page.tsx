import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { monthKeyBKK, thaiDateTime, thaiMonthLabel } from "@/lib/date";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ month?: string }>;

type DailyRow = {
  dateKey: string;
  checkins: number;
  entryRevenue: number;
};

type TopupStatusRow = {
  status: string;
  count: number;
  payAmount: number;
  getAmount: number;
};

type FishStatusRow = {
  status: string;
  count: number;
  totalWeight: number;
  maxWeight: number;
};

type FishSpeciesRow = {
  species: string;
  count: number;
  totalWeight: number;
  maxWeight: number;
};

type MemberReportRow = {
  memberCode: string;
  name: string;
  alias: string | null;
  visits: number;
  entryPaid: number;
  topupApproved: number;
  verifiedFish: number;
  totalWeight: number;
  walletBalance: number;
  points: number;
};

type TransactionRow = {
  id: string;
  type: string;
  amount: number;
  note: string;
  createdAt: string;
  name: string;
  memberCode: string;
};

type AuditRow = {
  id: string;
  action: string;
  targetType: string;
  targetId: string | null;
  createdAt: string;
  actorName: string | null;
};

async function stat(sql: string, params: unknown[] = []) {
  return (await queryOne<{ value: number }>(sql, params))?.value ?? 0;
}

function validMonth(value?: string) {
  return value && /^\d{4}-\d{2}$/.test(value) ? value : monthKeyBKK();
}

function money(value: number) {
  return "฿" + Number(value || 0).toLocaleString("th-TH");
}

function number(value: number, digits = 0) {
  return Number(value || 0).toLocaleString("th-TH", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export default async function ReportsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "STAFF" && user.role !== "ADMIN") redirect("/");

  const params = await searchParams;
  const mk = validMonth(params?.month);
  const start = `${mk}-01`;
  const end = `${mk}-31`;

  const [
    memberCount,
    activeMemberCount,
    lineLinkedCount,
    checkinCount,
    entryRevenue,
    approvedTopup,
    pendingTopup,
    verifiedFish,
    totalFishWeight,
    daily,
    topups,
    fishStatus,
    fishSpecies,
    memberRows,
    transactions,
    audits,
  ] = await Promise.all([
    stat("SELECT COUNT(*) value FROM users WHERE role='MEMBER'"),
    stat("SELECT COUNT(*) value FROM users WHERE role='MEMBER' AND status='ACTIVE'"),
    stat("SELECT COUNT(*) value FROM users WHERE role='MEMBER' AND lineUserId IS NOT NULL"),
    stat("SELECT COUNT(*) value FROM checkins WHERE dateKey BETWEEN ? AND ?", [start, end]),
    stat("SELECT COALESCE(SUM(fee),0) value FROM checkins WHERE dateKey BETWEEN ? AND ?", [start, end]),
    stat("SELECT COALESCE(SUM(getAmount),0) value FROM topups WHERE status='APPROVED' AND DATE(createdAt) BETWEEN ? AND ?", [start, end]),
    stat("SELECT COUNT(*) value FROM topups WHERE status='PENDING'"),
    stat("SELECT COUNT(*) value FROM catches WHERE status='VERIFIED' AND monthKey=?", [mk]),
    stat("SELECT COALESCE(SUM(weightKg),0) value FROM catches WHERE status='VERIFIED' AND monthKey=?", [mk]),
    query<DailyRow>(`
      SELECT k.dateKey, COUNT(*) checkins, COALESCE(SUM(k.fee),0) entryRevenue
      FROM checkins k
      WHERE k.dateKey BETWEEN ? AND ?
      GROUP BY k.dateKey
      ORDER BY k.dateKey DESC
    `, [start, end]),
    query<TopupStatusRow>(`
      SELECT status, COUNT(*) count, COALESCE(SUM(payAmount),0) payAmount, COALESCE(SUM(getAmount),0) getAmount
      FROM topups
      WHERE DATE(createdAt) BETWEEN ? AND ?
      GROUP BY status
      ORDER BY FIELD(status,'PENDING','APPROVED','REJECTED')
    `, [start, end]),
    query<FishStatusRow>(`
      SELECT status, COUNT(*) count, COALESCE(SUM(weightKg),0) totalWeight, COALESCE(MAX(weightKg),0) maxWeight
      FROM catches
      WHERE monthKey=?
      GROUP BY status
      ORDER BY FIELD(status,'PENDING','VERIFIED','REJECTED')
    `, [mk]),
    query<FishSpeciesRow>(`
      SELECT species, COUNT(*) count, COALESCE(SUM(weightKg),0) totalWeight, COALESCE(MAX(weightKg),0) maxWeight
      FROM catches
      WHERE monthKey=? AND status='VERIFIED'
      GROUP BY species
      ORDER BY totalWeight DESC, maxWeight DESC
      LIMIT 10
    `, [mk]),
    query<MemberReportRow>(`
      SELECT u.memberCode, u.name, u.alias, u.walletBalance, u.points,
        COALESCE(k.visits,0) visits,
        COALESCE(k.entryPaid,0) entryPaid,
        COALESCE(t.topupApproved,0) topupApproved,
        COALESCE(c.verifiedFish,0) verifiedFish,
        COALESCE(c.totalWeight,0) totalWeight
      FROM users u
      LEFT JOIN (
        SELECT userId, COUNT(*) visits, COALESCE(SUM(fee),0) entryPaid
        FROM checkins
        WHERE dateKey BETWEEN ? AND ?
        GROUP BY userId
      ) k ON k.userId=u.id
      LEFT JOIN (
        SELECT userId, COALESCE(SUM(getAmount),0) topupApproved
        FROM topups
        WHERE status='APPROVED' AND DATE(createdAt) BETWEEN ? AND ?
        GROUP BY userId
      ) t ON t.userId=u.id
      LEFT JOIN (
        SELECT userId, COUNT(*) verifiedFish, COALESCE(SUM(weightKg),0) totalWeight
        FROM catches
        WHERE status='VERIFIED' AND monthKey=?
        GROUP BY userId
      ) c ON c.userId=u.id
      WHERE u.role='MEMBER'
        AND (COALESCE(k.visits,0) > 0 OR COALESCE(t.topupApproved,0) > 0 OR COALESCE(c.verifiedFish,0) > 0)
      ORDER BY visits DESC, totalWeight DESC, topupApproved DESC
      LIMIT 20
    `, [start, end, start, end, mk]),
    query<TransactionRow>(`
      SELECT tr.id, tr.type, tr.amount, tr.note, tr.createdAt, u.name, u.memberCode
      FROM transactions tr
      JOIN users u ON u.id=tr.userId
      WHERE DATE(tr.createdAt) BETWEEN ? AND ?
      ORDER BY tr.createdAt DESC
      LIMIT 30
    `, [start, end]),
    query<AuditRow>(`
      SELECT a.id, a.action, a.targetType, a.targetId, a.createdAt, u.name actorName
      FROM audit_logs a
      LEFT JOIN users u ON u.id=a.actorUserId
      WHERE DATE(a.createdAt) BETWEEN ? AND ?
      ORDER BY a.createdAt DESC
      LIMIT 30
    `, [start, end]),
  ]);

  const kpis = [
    { label: "สมาชิกทั้งหมด", value: number(memberCount), sub: `${number(activeMemberCount)} ใช้งาน / ${number(lineLinkedCount)} เชื่อม LINE` },
    { label: "เช็คอินเดือนนี้", value: number(checkinCount), sub: `รายได้ค่าเข้า ${money(entryRevenue)}` },
    { label: "เติมเงินอนุมัติ", value: money(approvedTopup), sub: `${number(pendingTopup)} รายการยังรออนุมัติ` },
    { label: "ปลายืนยัน", value: number(verifiedFish), sub: `น้ำหนักรวม ${number(totalFishWeight, 2)} กก.` },
  ];

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
          {user.role === "ADMIN" && <Link href="/admin/ranking-levels" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">Level Ranking</Link>}
          <Link href="/admin/events" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">Event</Link>
          <Link href="/admin/rewards" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">คูปอง / รางวัล</Link>
          <Link href="/admin/scan" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">รับสมาชิกเข้าบ่อ</Link>
          <Link href="/admin/reports" className="block rounded-lg bg-white/12 px-3 py-2.5 font-semibold text-white">รายงาน</Link>
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
          <div className="flex min-h-16 flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-dim">Reports & Audit</p>
              <h2 className="font-display text-2xl font-semibold text-deep">รายงานละเอียด · {thaiMonthLabel(mk)}</h2>
            </div>
            <div className="flex items-center gap-2">
              <form className="flex items-center gap-2">
                <input name="month" type="month" defaultValue={mk}
                  className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-deep outline-none focus:border-pond" />
                <button className="rounded-lg bg-pond px-4 py-2 text-sm font-semibold text-white">ดูรายงาน</button>
              </form>
              <LogoutButton />
            </div>
          </div>
        </header>

        <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi, index) => (
              <div key={kpi.label} className={index === 0 ? "rounded-lg bg-deep p-5 text-white shadow-sm" : "rounded-lg bg-white p-5 shadow-sm ring-1 ring-line"}>
                <p className={index === 0 ? "text-sm text-white/62" : "text-sm text-dim"}>{kpi.label}</p>
                <p className="mt-3 font-display text-3xl font-semibold">{kpi.value}</p>
                <p className={index === 0 ? "mt-3 text-xs text-white/55" : "mt-3 text-xs text-dim"}>{kpi.sub}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <ReportTable title="รายงานรายวัน" subtitle="เช็คอินและรายได้ค่าเข้า">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-mist/60 text-xs uppercase tracking-wide text-dim">
                  <tr><th className="px-5 py-3">วันที่</th><th className="px-5 py-3">เช็คอิน</th><th className="px-5 py-3 text-right">รายได้</th></tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {daily.map((row) => (
                    <tr key={row.dateKey}>
                      <td className="px-5 py-4 font-semibold text-ink">{row.dateKey}</td>
                      <td className="px-5 py-4">{number(row.checkins)} คน</td>
                      <td className="px-5 py-4 text-right font-semibold text-pond">{money(row.entryRevenue)}</td>
                    </tr>
                  ))}
                  {daily.length === 0 && <EmptyRow colSpan={3} label="ไม่มีข้อมูลรายวันในเดือนนี้" />}
                </tbody>
              </table>
            </ReportTable>

            <ReportTable title="รายงานเติมเงิน" subtitle="แยกตามสถานะการอนุมัติ">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-mist/60 text-xs uppercase tracking-wide text-dim">
                  <tr><th className="px-5 py-3">สถานะ</th><th className="px-5 py-3">รายการ</th><th className="px-5 py-3 text-right">ยอดโอน</th><th className="px-5 py-3 text-right">ยอดเข้า</th></tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {topups.map((row) => (
                    <tr key={row.status}>
                      <td className="px-5 py-4 font-semibold text-ink">{statusLabel(row.status)}</td>
                      <td className="px-5 py-4">{number(row.count)}</td>
                      <td className="px-5 py-4 text-right">{money(row.payAmount)}</td>
                      <td className="px-5 py-4 text-right font-semibold text-pond">{money(row.getAmount)}</td>
                    </tr>
                  ))}
                  {topups.length === 0 && <EmptyRow colSpan={4} label="ไม่มีข้อมูลเติมเงินในเดือนนี้" />}
                </tbody>
              </table>
            </ReportTable>

            <ReportTable title="รายงานปลา" subtitle="สถานะผลงานประจำเดือน">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-mist/60 text-xs uppercase tracking-wide text-dim">
                  <tr><th className="px-5 py-3">สถานะ</th><th className="px-5 py-3">รายการ</th><th className="px-5 py-3 text-right">น้ำหนักรวม</th><th className="px-5 py-3 text-right">ตัวใหญ่สุด</th></tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {fishStatus.map((row) => (
                    <tr key={row.status}>
                      <td className="px-5 py-4 font-semibold text-ink">{statusLabel(row.status)}</td>
                      <td className="px-5 py-4">{number(row.count)}</td>
                      <td className="px-5 py-4 text-right">{number(row.totalWeight, 2)} กก.</td>
                      <td className="px-5 py-4 text-right font-semibold text-deep">{number(row.maxWeight, 2)} กก.</td>
                    </tr>
                  ))}
                  {fishStatus.length === 0 && <EmptyRow colSpan={4} label="ไม่มีข้อมูลปลาในเดือนนี้" />}
                </tbody>
              </table>
            </ReportTable>

            <ReportTable title="ชนิดปลายอดนิยม" subtitle="เฉพาะรายการที่ยืนยันแล้ว">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-mist/60 text-xs uppercase tracking-wide text-dim">
                  <tr><th className="px-5 py-3">ชนิดปลา</th><th className="px-5 py-3">รายการ</th><th className="px-5 py-3 text-right">น้ำหนักรวม</th><th className="px-5 py-3 text-right">ตัวใหญ่สุด</th></tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {fishSpecies.map((row) => (
                    <tr key={row.species}>
                      <td className="px-5 py-4 font-semibold text-ink">{row.species}</td>
                      <td className="px-5 py-4">{number(row.count)}</td>
                      <td className="px-5 py-4 text-right">{number(row.totalWeight, 2)} กก.</td>
                      <td className="px-5 py-4 text-right font-semibold text-deep">{number(row.maxWeight, 2)} กก.</td>
                    </tr>
                  ))}
                  {fishSpecies.length === 0 && <EmptyRow colSpan={4} label="ยังไม่มีปลาที่ยืนยันแล้วในเดือนนี้" />}
                </tbody>
              </table>
            </ReportTable>
          </section>

          <ReportTable title="สมาชิกที่มีกิจกรรมสูง" subtitle="รวมเช็คอิน เติมเงิน และผลงานปลา">
            <table className="w-full min-w-[1080px] text-left text-sm">
              <thead className="bg-mist/60 text-xs uppercase tracking-wide text-dim">
                <tr>
                  <th className="px-5 py-3">สมาชิก</th>
                  <th className="px-5 py-3">เช็คอิน</th>
                  <th className="px-5 py-3 text-right">ค่าเข้า</th>
                  <th className="px-5 py-3 text-right">เติมเงิน</th>
                  <th className="px-5 py-3 text-right">ปลา</th>
                  <th className="px-5 py-3 text-right">น้ำหนัก</th>
                  <th className="px-5 py-3 text-right">คงเหลือ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {memberRows.map((row) => (
                  <tr key={row.memberCode}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-ink">{row.alias || row.name}</p>
                      <p className="font-mono text-xs text-dim">{row.memberCode}</p>
                    </td>
                    <td className="px-5 py-4">{number(row.visits)} ครั้ง</td>
                    <td className="px-5 py-4 text-right">{money(row.entryPaid)}</td>
                    <td className="px-5 py-4 text-right font-semibold text-pond">{money(row.topupApproved)}</td>
                    <td className="px-5 py-4 text-right">{number(row.verifiedFish)}</td>
                    <td className="px-5 py-4 text-right">{number(row.totalWeight, 2)} กก.</td>
                    <td className="px-5 py-4 text-right font-semibold text-deep">{money(row.walletBalance)}</td>
                  </tr>
                ))}
                {memberRows.length === 0 && <EmptyRow colSpan={7} label="ยังไม่มีสมาชิกที่มีกิจกรรมในเดือนนี้" />}
              </tbody>
            </table>
          </ReportTable>

          <section className="grid gap-6 xl:grid-cols-2">
            <ReportTable title="ธุรกรรมล่าสุด" subtitle="เงินเข้าออกกระเป๋าสมาชิก">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-mist/60 text-xs uppercase tracking-wide text-dim">
                  <tr><th className="px-5 py-3">เวลา</th><th className="px-5 py-3">สมาชิก</th><th className="px-5 py-3">ประเภท</th><th className="px-5 py-3 text-right">จำนวน</th></tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {transactions.map((row) => (
                    <tr key={row.id}>
                      <td className="px-5 py-4 text-dim">{thaiDateTime(row.createdAt)}</td>
                      <td className="px-5 py-4"><p className="font-semibold text-ink">{row.name}</p><p className="font-mono text-xs text-dim">{row.memberCode}</p></td>
                      <td className="px-5 py-4"><p className="font-semibold text-ink">{typeLabel(row.type)}</p><p className="text-xs text-dim">{row.note || "-"}</p></td>
                      <td className={row.amount >= 0 ? "px-5 py-4 text-right font-semibold text-pond" : "px-5 py-4 text-right font-semibold text-buoy"}>{row.amount > 0 ? "+" : ""}{money(row.amount).replace("฿-", "-฿")}</td>
                    </tr>
                  ))}
                  {transactions.length === 0 && <EmptyRow colSpan={4} label="ไม่มีธุรกรรมในเดือนนี้" />}
                </tbody>
              </table>
            </ReportTable>

            <ReportTable title="Audit Log" subtitle="บันทึกการแก้ไขและการอนุมัติ">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-mist/60 text-xs uppercase tracking-wide text-dim">
                  <tr><th className="px-5 py-3">เวลา</th><th className="px-5 py-3">ผู้ทำรายการ</th><th className="px-5 py-3">Action</th><th className="px-5 py-3">Target</th></tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {audits.map((row) => (
                    <tr key={row.id}>
                      <td className="px-5 py-4 text-dim">{thaiDateTime(row.createdAt)}</td>
                      <td className="px-5 py-4 font-semibold text-ink">{row.actorName || "ระบบ"}</td>
                      <td className="px-5 py-4 font-mono text-xs text-deep">{row.action}</td>
                      <td className="px-5 py-4 text-dim">{row.targetType}{row.targetId ? ` · ${row.targetId}` : ""}</td>
                    </tr>
                  ))}
                  {audits.length === 0 && <EmptyRow colSpan={4} label="ไม่มี audit log ในเดือนนี้" />}
                </tbody>
              </table>
            </ReportTable>
          </section>
        </div>
      </section>
    </main>
  );
}

function ReportTable({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg bg-white shadow-sm ring-1 ring-line">
      <div className="border-b border-line px-5 py-4">
        <h3 className="font-display text-lg font-semibold text-deep">{title}</h3>
        <p className="text-sm text-dim">{subtitle}</p>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}

function EmptyRow({ colSpan, label }: { colSpan: number; label: string }) {
  return <tr><td colSpan={colSpan} className="px-5 py-8 text-center text-dim">{label}</td></tr>;
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "รออนุมัติ",
    APPROVED: "อนุมัติแล้ว",
    REJECTED: "ปฏิเสธ",
    VERIFIED: "ยืนยันแล้ว",
  };
  return labels[status] || status;
}

function typeLabel(type: string) {
  const labels: Record<string, string> = {
    TOPUP: "เติมเงิน",
    ENTRY_FEE: "ค่าเข้าบ่อ",
    REWARD: "รางวัล",
    ADJUSTMENT: "ปรับยอด",
  };
  return labels[type] || type;
}
