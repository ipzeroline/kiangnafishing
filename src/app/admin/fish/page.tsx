import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { monthKeyBKK, thaiDateTime, thaiMonthLabel } from "@/lib/date";
import LogoutButton from "@/components/LogoutButton";
import { FishActions } from "../Actions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ status?: string; month?: string; q?: string }>;

type FishRow = {
  id: string;
  species: string;
  weightKg: number;
  imagePath: string;
  caption: string | null;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  monthKey: string;
  createdAt: string;
  name: string;
  memberCode: string;
  linePictureUrl: string | null;
  pointRate: number | null;
};

const statuses = [
  { key: "ALL", label: "ทั้งหมด" },
  { key: "PENDING", label: "รอตรวจ" },
  { key: "VERIFIED", label: "ยืนยันแล้ว" },
  { key: "REJECTED", label: "ไม่ผ่าน" },
] as const;

const statusStyle: Record<string, string> = {
  PENDING: "bg-gold/15 text-[#8b6b12]",
  VERIFIED: "bg-pond/10 text-pond",
  REJECTED: "bg-buoy/10 text-buoy",
};

function validStatus(value?: string) {
  return statuses.some((item) => item.key === value) ? value || "ALL" : "ALL";
}

function validMonth(value?: string) {
  return value && /^\d{4}-\d{2}$/.test(value) ? value : monthKeyBKK();
}

async function stat(sql: string, params: unknown[] = []) {
  return (await queryOne<{ value: number }>(sql, params))?.value ?? 0;
}

export default async function AdminFishPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "STAFF" && user.role !== "ADMIN") redirect("/");

  const params = await searchParams;
  const month = validMonth(params?.month);
  const status = validStatus(params?.status);
  const keyword = String(params?.q || "").trim();
  const where: string[] = ["c.monthKey=?"];
  const values: unknown[] = [month];

  if (status !== "ALL") {
    where.push("c.status=?");
    values.push(status);
  }
  if (keyword) {
    where.push("(u.memberCode LIKE ? OR u.name LIKE ? OR COALESCE(u.alias,'') LIKE ? OR c.species LIKE ? OR COALESCE(c.caption,'') LIKE ?)");
    const like = `%${keyword}%`;
    values.push(like, like, like, like, like);
  }

  const [pendingCount, verifiedCount, rejectedCount, totalWeight, rows] = await Promise.all([
    stat("SELECT COUNT(*) value FROM catches WHERE monthKey=? AND status='PENDING'", [month]),
    stat("SELECT COUNT(*) value FROM catches WHERE monthKey=? AND status='VERIFIED'", [month]),
    stat("SELECT COUNT(*) value FROM catches WHERE monthKey=? AND status='REJECTED'", [month]),
    stat("SELECT COALESCE(SUM(weightKg),0) value FROM catches WHERE monthKey=? AND status='VERIFIED'", [month]),
    query<FishRow>(`
      SELECT c.id, c.species, c.weightKg, c.imagePath, c.caption, c.status, c.monthKey, c.createdAt,
        u.name, u.memberCode, u.linePictureUrl, fs.pointRate
      FROM catches c
      JOIN users u ON u.id=c.userId
      LEFT JOIN fish_species fs ON fs.name=c.species
      WHERE ${where.join(" AND ")}
      ORDER BY FIELD(c.status,'PENDING','VERIFIED','REJECTED'), c.createdAt DESC
      LIMIT 200
    `, values),
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
          <Link href="/admin/fish" className="block rounded-lg bg-white/12 px-3 py-2.5 font-semibold text-white">ผลงานปลา</Link>
          <Link href="/admin/member-ranking" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">Ranking สมาชิก</Link>
          {user.role === "ADMIN" && <Link href="/admin/ranking-levels" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">Level Ranking</Link>}
          <Link href="/admin/events" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">Event</Link>
          <Link href="/admin/rewards" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">คูปอง / รางวัล</Link>
          <Link href="/admin/scan" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">รับสมาชิกเข้าบ่อ</Link>
          <Link href="/admin/reports" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">รายงาน</Link>
          <Link href="/admin/employees" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">ผู้ใช้งานระบบ</Link>
        </nav>
      </aside>
      <section className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-line bg-[#f5f8f7]/90 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-dim">Catch Review</p>
              <h2 className="font-display text-2xl font-semibold text-deep">จัดการผลงานปลา</h2>
            </div>
            <LogoutButton />
          </div>
        </header>

        <div className="space-y-5 px-4 py-6 sm:px-6 lg:px-8">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="รอตรวจ" value={pendingCount.toLocaleString("th-TH")} detail="รายการที่ต้องอนุมัติหรือปฏิเสธ" tone="gold" />
            <Metric label="ยืนยันแล้ว" value={verifiedCount.toLocaleString("th-TH")} detail={`เดือน ${thaiMonthLabel(month)}`} tone="pond" />
            <Metric label="ไม่ผ่าน" value={rejectedCount.toLocaleString("th-TH")} detail="รายการที่ถูกปฏิเสธ" />
            <Metric label="น้ำหนักยืนยันรวม" value={`${Number(totalWeight).toLocaleString("th-TH", { maximumFractionDigits: 2 })} กก.`} detail="เฉพาะรายการที่ยืนยันแล้ว" />
          </section>

          <section className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-line">
            <form className="grid gap-3 lg:grid-cols-[180px_180px_minmax(0,1fr)_auto] lg:items-end">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">เดือน</span>
                <input name="month" type="month" defaultValue={month}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-pond" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">สถานะ</span>
                <select name="status" defaultValue={status}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-pond">
                  {statuses.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">ค้นหา</span>
                <input name="q" defaultValue={keyword} placeholder="รหัสสมาชิก, ชื่อ, ชนิดปลา, แคปชั่น"
                  className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-pond" />
              </label>
              <button className="rounded-lg bg-pond px-5 py-2.5 text-sm font-semibold text-white">กรองข้อมูล</button>
            </form>
          </section>

          <section className="rounded-lg bg-white shadow-sm ring-1 ring-line">
            <div className="flex flex-col gap-2 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold text-deep">รายการผลงานปลา</h3>
                <p className="text-sm text-dim">ตรวจรูป น้ำหนัก แคปชั่น และให้คะแนนตามชนิดปลาก่อนยืนยันเข้ากระดานอันดับ</p>
              </div>
              <span className="rounded-full bg-mist px-3 py-1 text-sm font-semibold text-deep">{rows.length.toLocaleString("th-TH")} รายการ</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px] text-left text-sm">
                <thead className="bg-mist/60 text-xs uppercase tracking-wide text-dim">
                  <tr>
                    <th className="px-5 py-3">ผลงาน</th>
                    <th className="px-5 py-3">สมาชิก</th>
                    <th className="px-5 py-3 text-right">น้ำหนัก</th>
                    <th className="px-5 py-3">สถานะ</th>
                    <th className="px-5 py-3">เวลา</th>
                    <th className="px-5 py-3 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <a href={row.imagePath} target="_blank" rel="noreferrer" className="block shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={row.imagePath} alt={row.species} className="h-16 w-16 rounded-lg bg-mist object-cover ring-1 ring-line" />
                          </a>
                          <div className="min-w-0">
                            <p className="font-semibold text-ink">{row.species}</p>
                            <p className="text-xs text-dim">แต้มเมื่อยืนยัน: {(row.pointRate ?? 5).toLocaleString("th-TH")}</p>
                            {row.caption && <p className="mt-1 max-w-md truncate text-sm text-dim">“{row.caption}”</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {row.linePictureUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={row.linePictureUrl} alt={row.name} className="h-9 w-9 rounded-full object-cover" />
                          ) : (
                            <span className="grid h-9 w-9 place-items-center rounded-full bg-deep text-sm font-bold text-white">{row.name.slice(0, 1)}</span>
                          )}
                          <div>
                            <p className="font-semibold text-ink">{row.name}</p>
                            <p className="font-mono text-xs text-dim">{row.memberCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-deep">{Number(row.weightKg).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} กก.</td>
                      <td className="px-5 py-4"><StatusBadge status={row.status} /></td>
                      <td className="px-5 py-4 text-dim">{thaiDateTime(row.createdAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          {row.status === "PENDING" ? <FishActions id={row.id} /> : <span className="text-xs text-dim">ดำเนินการแล้ว</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-8 text-center text-dim">ไม่พบผลงานปลาตามเงื่อนไข</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value, detail, tone }: { label: string; value: string; detail: string; tone?: "gold" | "pond" }) {
  const cls = tone === "gold" ? "text-[#8b6b12]" : tone === "pond" ? "text-pond" : "text-deep";
  return (
    <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-line">
      <p className="text-sm text-dim">{label}</p>
      <p className={`mt-2 font-display text-3xl font-semibold ${cls}`}>{value}</p>
      <p className="mt-2 text-xs text-dim">{detail}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: FishRow["status"] }) {
  const label = statuses.find((item) => item.key === status)?.label || status;
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[status]}`}>{label}</span>;
}
