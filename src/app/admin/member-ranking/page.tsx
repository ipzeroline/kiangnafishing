import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { query, type RankingLevel } from "@/lib/db";
import { monthKeyBKK, thaiMonthLabel } from "@/lib/date";
import { levelForScore } from "@/lib/ranking";
import LogoutButton from "@/components/LogoutButton";
import RankingLevelBadge from "@/components/RankingLevelBadge";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ month?: string }>;

type RankingRow = {
  memberCode: string;
  name: string;
  alias: string | null;
  linePictureUrl: string | null;
  walletBalance: number;
  points: number;
  visits: number;
  fishCount: number;
  totalWeight: number;
  maxWeight: number;
  bestSpecies: string | null;
  score: number;
};

function validMonth(value?: string) {
  return value && /^\d{4}-\d{2}$/.test(value) ? value : monthKeyBKK();
}

function n(value: number, digits = 0) {
  return Number(value || 0).toLocaleString("th-TH", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export default async function AdminMemberRankingPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "STAFF" && user.role !== "ADMIN") redirect("/");

  const params = await searchParams;
  const mk = validMonth(params.month);

  const [rows, levels] = await Promise.all([
    query<RankingRow>(`
    SELECT u.memberCode, u.name, u.alias, u.linePictureUrl, u.walletBalance, u.points,
      COALESCE(k.visits,0) visits,
      COALESCE(c.fishCount,0) fishCount,
      COALESCE(c.totalWeight,0) totalWeight,
      COALESCE(c.maxWeight,0) maxWeight,
      c.bestSpecies,
      (COALESCE(c.maxWeight,0) * 10 + COALESCE(c.totalWeight,0) * 2 + COALESCE(c.fishCount,0) * 5 + COALESCE(k.visits,0) * 3 + u.points * 0.05) score
    FROM users u
    LEFT JOIN (
      SELECT userId, COUNT(*) visits
      FROM checkins
      WHERE SUBSTR(dateKey,1,7)=?
      GROUP BY userId
    ) k ON k.userId=u.id
    LEFT JOIN (
      SELECT userId, COUNT(*) fishCount, COALESCE(SUM(weightKg),0) totalWeight, COALESCE(MAX(weightKg),0) maxWeight,
        SUBSTRING_INDEX(GROUP_CONCAT(species ORDER BY weightKg DESC, createdAt ASC SEPARATOR '||'), '||', 1) bestSpecies
      FROM catches
      WHERE status='VERIFIED' AND monthKey=?
      GROUP BY userId
    ) c ON c.userId=u.id
    WHERE u.role='MEMBER'
      AND (COALESCE(k.visits,0) > 0 OR COALESCE(c.fishCount,0) > 0 OR u.points > 0)
    ORDER BY score DESC, maxWeight DESC, visits DESC
    LIMIT 100
  `, [mk, mk]),
    query<RankingLevel>("SELECT * FROM ranking_levels WHERE status='ACTIVE' ORDER BY minScore ASC"),
  ]);

  const topBig = [...rows].sort((a, b) => Number(b.maxWeight) - Number(a.maxWeight)).slice(0, 5);
  const topCount = [...rows].sort((a, b) => Number(b.fishCount) - Number(a.fishCount)).slice(0, 5);
  const topWeight = [...rows].sort((a, b) => Number(b.totalWeight) - Number(a.totalWeight)).slice(0, 5);
  const topVisits = [...rows].sort((a, b) => Number(b.visits) - Number(a.visits)).slice(0, 5);

  return (
    <main className="admin-shell min-h-dvh bg-[#f5f8f7] text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-line bg-deep px-5 py-6 text-white lg:block">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/45">เคียงนา Fishing Lake</p>
          <h1 className="mt-2 font-display text-2xl font-semibold">Back Office</h1>
        </div>
        <nav className="space-y-1 text-sm">
          <Link href="/admin" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">Dashboard</Link>
          <Link href="/admin/scan" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">รับสมาชิกเข้าบ่อ</Link>
          <Link href="/admin/members" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">สมาชิก</Link>
          <Link href="/admin/credits" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">เครดิต / แต้ม</Link>
          <Link href="/admin/fish-stockings" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">ตารางลงปลา</Link>
          <Link href="/admin/fish" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">ผลงานปลา</Link>
          <Link href="/admin/fish-species" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">ชนิดปลา</Link>
          <Link href="/admin/member-ranking" className="block rounded-lg bg-white/12 px-3 py-2.5 font-semibold text-white">Ranking สมาชิก</Link>
          {user.role === "ADMIN" && <Link href="/admin/ranking-levels" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">Level Ranking</Link>}
          <Link href="/admin/events" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">Event</Link>
          <Link href="/admin/rewards" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">คูปอง / รางวัล</Link>
          <Link href="/admin/reports" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">รายงาน</Link>
          <Link href="/admin/employees" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">ผู้ใช้งานระบบ</Link>
        </nav>
      </aside>
      <section className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-line bg-[#f5f8f7]/90 backdrop-blur">
          <div className="flex min-h-16 flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-dim">Member Ranking</p>
              <h2 className="font-display text-2xl font-semibold text-deep">Ranking สมาชิก · {thaiMonthLabel(mk)}</h2>
            </div>
            <div className="flex items-center gap-2">
              <form className="flex items-center gap-2">
                <input name="month" type="month" defaultValue={mk}
                  className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-deep outline-none focus:border-pond" />
                <button className="rounded-lg bg-pond px-4 py-2 text-sm font-semibold text-white">ดูอันดับ</button>
              </form>
              {user.role === "ADMIN" && <Link href="/admin/ranking-levels" className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-deep ring-1 ring-line">จัดการ Level</Link>}
              <LogoutButton />
            </div>
          </div>
        </header>

        <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <section className="grid gap-4 lg:grid-cols-4">
            <MiniBoard title="ปลาใหญ่สุด" unit="กก." rows={topBig} value={(r) => Number(r.maxWeight)} detail={(r) => r.bestSpecies || "-"} />
            <MiniBoard title="จำนวนตัว" unit="ตัว" rows={topCount} value={(r) => Number(r.fishCount)} detail={(r) => `${n(r.totalWeight, 1)} กก.`} />
            <MiniBoard title="น้ำหนักรวม" unit="กก." rows={topWeight} value={(r) => Number(r.totalWeight)} detail={(r) => `${n(r.fishCount)} ตัว`} />
            <MiniBoard title="ขาประจำ" unit="วัน" rows={topVisits} value={(r) => Number(r.visits)} detail={(r) => `${n(r.points)} แต้ม`} />
          </section>

          <section className="rounded-lg bg-white shadow-sm ring-1 ring-line">
            <div className="flex flex-col gap-2 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold text-deep">ตาราง Ranking รวม</h3>
                <p className="text-sm text-dim">คะแนนรวมคิดจากปลาใหญ่ น้ำหนักรวม จำนวนปลา จำนวนวันเข้าใช้บริการ และแต้มคงเหลือ</p>
              </div>
              <Link href={`/ranking`} className="w-fit rounded-lg bg-mist px-3 py-2 text-sm font-semibold text-deep">ดูหน้าสมาชิก</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px] text-left text-sm">
                <thead className="bg-mist/60 text-xs uppercase tracking-wide text-dim">
                  <tr>
                    <th className="px-5 py-3">อันดับ</th>
                    <th className="px-5 py-3">สมาชิก</th>
                    <th className="px-5 py-3 text-right">คะแนนรวม</th>
                    <th className="px-5 py-3 text-right">ปลาใหญ่สุด</th>
                    <th className="px-5 py-3 text-right">จำนวนตัว</th>
                    <th className="px-5 py-3 text-right">น้ำหนักรวม</th>
                    <th className="px-5 py-3 text-right">เข้าใช้บริการ</th>
                    <th className="px-5 py-3 text-right">แต้ม</th>
                    <th className="px-5 py-3 text-right">เครดิต</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {rows.map((row, index) => (
                    <tr key={row.memberCode} className={index === 0 ? "bg-deep text-white" : ""}>
                      {(() => {
                        const level = levelForScore(Number(row.score), levels);
                        return (
                          <>
                      <td className="px-5 py-4"><span className={index < 3 ? "inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gold font-bold text-white" : "font-semibold text-dim"}>{index + 1}</span></td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={row.linePictureUrl} name={row.alias || row.name} dark={index === 0} />
                          <div className="min-w-0">
                            <p className={index === 0 ? "truncate font-semibold text-white" : "truncate font-semibold text-ink"}>{row.alias || row.name}</p>
                            <p className={index === 0 ? "font-mono text-xs text-white/55" : "font-mono text-xs text-dim"}>{row.memberCode} · {row.bestSpecies || "-"}</p>
                            {level && (
                              <span className="mt-2 inline-flex">
                                <RankingLevelBadge level={level} size="sm" />
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right font-semibold">{n(row.score, 1)}</td>
                      <td className="px-5 py-4 text-right">{n(row.maxWeight, 2)} กก.</td>
                      <td className="px-5 py-4 text-right">{n(row.fishCount)}</td>
                      <td className="px-5 py-4 text-right">{n(row.totalWeight, 2)} กก.</td>
                      <td className="px-5 py-4 text-right">{n(row.visits)} วัน</td>
                      <td className="px-5 py-4 text-right">{n(row.points)}</td>
                      <td className="px-5 py-4 text-right">฿{n(row.walletBalance)}</td>
                          </>
                        );
                      })()}
                    </tr>
                  ))}
                  {rows.length === 0 && <tr><td colSpan={9} className="px-5 py-8 text-center text-dim">ยังไม่มีข้อมูล Ranking ในเดือนนี้</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function MiniBoard({
  title,
  unit,
  rows,
  value,
  detail,
}: {
  title: string;
  unit: string;
  rows: RankingRow[];
  value: (row: RankingRow) => number;
  detail: (row: RankingRow) => string;
}) {
  return (
    <section className="rounded-lg bg-white shadow-sm ring-1 ring-line">
      <div className="border-b border-line px-4 py-3">
        <h3 className="font-display text-base font-semibold text-deep">{title}</h3>
      </div>
      <ol className="divide-y divide-line/70">
        {rows.map((row, index) => (
          <li key={`${title}-${row.memberCode}`} className="flex items-center justify-between gap-3 px-4 py-3">
            <Avatar src={row.linePictureUrl} name={row.alias || row.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink">{index + 1}. {row.alias || row.name}</p>
              <p className="truncate text-xs text-dim">{row.memberCode} · {detail(row)}</p>
            </div>
            <p className="font-display text-lg font-semibold text-deep">{n(value(row), unit === "กก." ? 2 : 0)} <span className="text-xs font-normal text-dim">{unit}</span></p>
          </li>
        ))}
        {rows.length === 0 && <li className="px-4 py-8 text-center text-sm text-dim">ไม่มีข้อมูล</li>}
      </ol>
    </section>
  );
}

function Avatar({ src, name, dark = false, size = "md" }: { src: string | null; name: string; dark?: boolean; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name} className={`${cls} shrink-0 rounded-full object-cover ring-2 ${dark ? "ring-white/20" : "ring-white"} shadow-sm`} />
  ) : (
    <span className={`${cls} grid shrink-0 place-items-center rounded-full ${dark ? "bg-white/15 text-white" : "bg-deep text-white"} font-bold shadow-sm`}>
      {name.slice(0, 1)}
    </span>
  );
}
