import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { dateKeyBKK } from "@/lib/date";
import { query, queryOne, type FishSpecies, type FishStocking } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";
import FishStockingManager from "./FishStockingManager";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string; dateFrom?: string; dateTo?: string; page?: string }>;

const PAGE_SIZE = 20;

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-line">
      <p className="text-sm text-dim">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-deep">{value}</p>
      <p className="mt-2 text-sm text-dim">{detail}</p>
    </div>
  );
}

async function stat(sql: string, params: unknown[] = []) {
  return (await queryOne<{ value: number }>(sql, params))?.value ?? 0;
}

function validDate(value?: string) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function validPage(value?: string) {
  const page = Math.floor(Number(value || 1));
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function pageHref(page: number, filters: { q: string; dateFrom: string; dateTo: string }) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (page > 1) params.set("page", String(page));
  const queryString = params.toString();
  return queryString ? `/admin/fish-stockings?${queryString}` : "/admin/fish-stockings";
}

export default async function FishStockingsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "STAFF" && user.role !== "ADMIN") redirect("/");

  const params = await searchParams;
  const keyword = String(params?.q || "").trim();
  const dateFrom = validDate(params?.dateFrom);
  const dateTo = validDate(params?.dateTo);
  const requestedPage = validPage(params?.page);
  const where: string[] = [];
  const values: unknown[] = [];

  if (keyword) {
    where.push("(species LIKE ? OR detail LIKE ?)");
    const like = `%${keyword}%`;
    values.push(like, like);
  }
  if (dateFrom) {
    where.push("stockingDate >= ?");
    values.push(dateFrom);
  }
  if (dateTo) {
    where.push("stockingDate <= ?");
    values.push(dateTo);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [species, entryCount, fishCount, totalWeight, filteredCount] = await Promise.all([
    query<Pick<FishSpecies, "name">>("SELECT name FROM fish_species WHERE status='ACTIVE' ORDER BY name ASC"),
    stat("SELECT COUNT(*) value FROM fish_stockings"),
    stat("SELECT COALESCE(SUM(fishCount),0) value FROM fish_stockings"),
    stat("SELECT COALESCE(SUM(totalWeightKg),0) value FROM fish_stockings"),
    stat(`SELECT COUNT(*) value FROM fish_stockings ${whereSql}`, values),
  ]);
  const totalPages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const offset = (currentPage - 1) * PAGE_SIZE;
  const stockings = await query<FishStocking>(
    `SELECT * FROM fish_stockings ${whereSql} ORDER BY stockingDate DESC, createdAt DESC LIMIT ? OFFSET ?`,
    [...values, PAGE_SIZE, offset]
  );
  const filters = { q: keyword, dateFrom, dateTo };

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
          <Link href="/admin/fish-stockings" className="block rounded-lg bg-white/12 px-3 py-2.5 font-semibold text-white">ตารางลงปลา</Link>
          <Link href="/admin/fish" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">ผลงานปลา</Link>
          <Link href="/admin/fish-species" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">ชนิดปลา</Link>
          <Link href="/admin/member-ranking" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">Ranking สมาชิก</Link>
          {user.role === "ADMIN" && <Link href="/admin/ranking-levels" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">Level Ranking</Link>}
          <Link href="/admin/events" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">Event</Link>
          <Link href="/admin/rewards" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">คูปอง / รางวัล</Link>
          <Link href="/admin/reports" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">รายงาน</Link>
          <Link href="/admin/employees" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">ผู้ใช้งานระบบ</Link>
        </nav>
      </aside>
      <section className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-line bg-[#f5f8f7]/90 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-dim">Fish Stocking</p>
              <h2 className="font-display text-2xl font-semibold text-deep">ตารางลงปลา</h2>
            </div>
            <LogoutButton />
          </div>
        </header>
        <div className="space-y-5 px-4 py-6 sm:px-6 lg:px-8">
          <section className="grid gap-4 md:grid-cols-3">
            <Metric label="รายการลงปลา" value={entryCount.toLocaleString("th-TH")} detail="จำนวนรายการที่บันทึกทั้งหมด" />
            <Metric label="จำนวนปลารวม" value={`${fishCount.toLocaleString("th-TH")} ตัว`} detail="รวมทุกชนิดปลาที่ลงบ่อ" />
            <Metric label="น้ำหนักรวม" value={`${Number(totalWeight).toLocaleString("th-TH", { maximumFractionDigits: 2 })} กก.`} detail="จำนวนกิโลกรัมรวมทั้งหมด" />
          </section>
          <section className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-line">
            <form className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto_auto] lg:items-end">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">ค้นหา</span>
                <input name="q" defaultValue={keyword} placeholder="ชนิดปลา หรือรายละเอียด"
                  className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-pond" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">วันที่เริ่ม</span>
                <input name="dateFrom" type="date" defaultValue={dateFrom}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-pond" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">วันที่สิ้นสุด</span>
                <input name="dateTo" type="date" defaultValue={dateTo}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-pond" />
              </label>
              <button className="rounded-lg bg-pond px-5 py-2.5 text-sm font-semibold text-white">ค้นหา</button>
              <Link href="/admin/fish-stockings" className="rounded-lg bg-mist px-5 py-2.5 text-center text-sm font-semibold text-deep">ล้าง</Link>
            </form>
            <p className="mt-3 text-sm text-dim">
              พบ {filteredCount.toLocaleString("th-TH")} รายการ · หน้า {currentPage.toLocaleString("th-TH")} จาก {totalPages.toLocaleString("th-TH")}
            </p>
          </section>
          <FishStockingManager stockings={stockings} species={species.map((item) => item.name)} today={dateKeyBKK()} />
          {totalPages > 1 && (
            <nav className="flex flex-col gap-3 rounded-lg bg-white px-5 py-4 shadow-sm ring-1 ring-line sm:flex-row sm:items-center sm:justify-between" aria-label="pagination">
              <p className="text-sm text-dim">แสดง {stockings.length.toLocaleString("th-TH")} รายการในหน้านี้</p>
              <div className="flex items-center gap-2">
                {currentPage > 1 ? (
                  <Link href={pageHref(currentPage - 1, filters)} className="rounded-lg bg-mist px-4 py-2 text-sm font-semibold text-deep">ก่อนหน้า</Link>
                ) : (
                  <span className="rounded-lg bg-mist px-4 py-2 text-sm font-semibold text-dim opacity-50">ก่อนหน้า</span>
                )}
                <span className="rounded-lg bg-deep px-4 py-2 text-sm font-semibold text-white">{currentPage.toLocaleString("th-TH")}</span>
                {currentPage < totalPages ? (
                  <Link href={pageHref(currentPage + 1, filters)} className="rounded-lg bg-mist px-4 py-2 text-sm font-semibold text-deep">ถัดไป</Link>
                ) : (
                  <span className="rounded-lg bg-mist px-4 py-2 text-sm font-semibold text-dim opacity-50">ถัดไป</span>
                )}
              </div>
            </nav>
          )}
        </div>
      </section>
    </main>
  );
}
