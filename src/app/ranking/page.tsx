import Link from "next/link";
import { query as dbQuery, type RankingLevel } from "@/lib/db";
import { monthKeyBKK, thaiMonthLabel } from "@/lib/date";
import { levelForScore } from "@/lib/ranking";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import RankingLevelBadge from "@/components/RankingLevelBadge";

export const dynamic = "force-dynamic";

const BOARDS = [
  { key: "big", label: "ปลาใหญ่สุด" },
  { key: "count", label: "จำนวนตัว" },
  { key: "weight", label: "น้ำหนักรวม" },
  { key: "regular", label: "ขาประจำ" },
] as const;

type Row = {
  name: string;
  memberCode: string;
  value: number;
  detail?: string;
  score: number;
};

async function queryLeaderboard(board: string, mk: string): Promise<Row[]> {
  const orderField = board === "count" ? "fishCount" : board === "weight" ? "totalWeight" : board === "regular" ? "visits" : "maxWeight";
  const valueField = board === "count" ? "fishCount" : board === "weight" ? "totalWeight" : board === "regular" ? "visits" : "maxWeight";
  return dbQuery<Row>(`
    SELECT u.name, u.memberCode,
      COALESCE(metric.${valueField},0) value,
      metric.bestSpecies detail,
      (COALESCE(metric.maxWeight,0) * 10 + COALESCE(metric.totalWeight,0) * 2 + COALESCE(metric.fishCount,0) * 5 + COALESCE(metric.visits,0) * 3 + u.points * 0.05) score
    FROM users u
    LEFT JOIN (
      SELECT base.userId,
        COALESCE(c.fishCount,0) fishCount,
        COALESCE(c.totalWeight,0) totalWeight,
        COALESCE(c.maxWeight,0) maxWeight,
        c.bestSpecies,
        COALESCE(k.visits,0) visits
      FROM (SELECT id userId FROM users WHERE role='MEMBER') base
      LEFT JOIN (
        SELECT userId, COUNT(*) fishCount, ROUND(SUM(weightKg),1) totalWeight, ROUND(MAX(weightKg),1) maxWeight,
          SUBSTRING_INDEX(GROUP_CONCAT(species ORDER BY weightKg DESC, createdAt ASC SEPARATOR '||'), '||', 1) bestSpecies
        FROM catches
        WHERE status='VERIFIED' AND monthKey=?
        GROUP BY userId
      ) c ON c.userId=base.userId
      LEFT JOIN (
        SELECT userId, COUNT(*) visits
        FROM checkins
        WHERE SUBSTR(dateKey,1,7)=?
        GROUP BY userId
      ) k ON k.userId=base.userId
    ) metric ON metric.userId=u.id
    WHERE u.role='MEMBER' AND COALESCE(metric.${orderField},0) > 0
    ORDER BY COALESCE(metric.${orderField},0) DESC, score DESC
    LIMIT 10
  `, [mk, mk]);
}

async function queryBoard(board: string, mk: string): Promise<{ rows: Row[]; unit: string }> {
  if (board === "count") {
    return {
      unit: "ตัว",
      rows: await queryLeaderboard(board, mk),
    };
  }
  if (board === "weight") {
    return {
      unit: "กก.",
      rows: await queryLeaderboard(board, mk),
    };
  }
  if (board === "regular") {
    return {
      unit: "วัน",
      rows: await queryLeaderboard(board, mk),
    };
  }
  return {
    unit: "กก.",
    rows: await queryLeaderboard(board, mk),
  };
}

export default async function RankingPage({ searchParams }: { searchParams: Promise<{ board?: string }> }) {
  const { board = "big" } = await searchParams;
  const mk = monthKeyBKK();
  const [{ rows, unit }, levels] = await Promise.all([
    queryBoard(board, mk),
    dbQuery<RankingLevel>("SELECT * FROM ranking_levels WHERE status='ACTIVE' ORDER BY minScore ASC"),
  ]);
  const medal = ["bg-gold", "bg-dim", "bg-[#b0764a]"];

  return (
    <main className="min-h-dvh bg-[#f5f8f7] pb-28">
      <TopBar title={`กระดานอันดับ · ${thaiMonthLabel(mk)}`} back />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-card bg-white p-2 shadow-sm ring-1 ring-line">
          <div className="grid gap-2 md:grid-cols-4">
          {BOARDS.map((b) => (
            <Link key={b.key} href={`/ranking?board=${b.key}`}
              className={`rounded-md px-4 py-2.5 text-center text-sm font-semibold transition
                ${board === b.key ? "bg-deep text-white shadow-sm" : "text-dim hover:bg-mist hover:text-deep"}`}>
              {b.label}
            </Link>
          ))}
          </div>
        </div>

        <section className="mt-6 rounded-card bg-white shadow-sm ring-1 ring-line">
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-display text-xl font-semibold text-deep">Leaderboard</h2>
            <p className="mt-1 text-sm text-dim">Top 3 สิ้นเดือนรับเครดิตกระเป๋าฟรี ฿300 / ฿200 / ฿100 รีเซ็ตทุกวันที่ 1</p>
          </div>

        <ol className="divide-y divide-line/70">
          {rows.map((r, i) => (
            <li key={r.memberCode}
              className={`flex items-center gap-4 px-5 py-4 ${i === 0 ? "bg-deep text-white" : "bg-white"}`}>
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-display text-sm font-bold text-white
                ${i < 3 ? medal[i] : "bg-pond/50"}`}>{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className={`truncate font-medium ${i === 0 ? "text-white" : "text-ink"}`}>{r.name}</p>
                <p className={`text-xs ${i === 0 ? "text-white/60" : "text-dim"}`}>
                  {r.detail ? `${r.detail} · ` : ""}{r.memberCode}
                </p>
                {(() => {
                  const level = levelForScore(Number(r.score), levels);
                  return level ? (
                    <span className="mt-2 inline-flex">
                      <RankingLevelBadge level={level} size="sm" />
                    </span>
                  ) : null;
                })()}
              </div>
              <p className={`font-display text-lg font-semibold ${i === 0 ? "text-gold" : "text-deep"}`}>
                {r.value.toLocaleString("th-TH")} <span className="text-xs font-normal">{unit}</span>
              </p>
            </li>
          ))}
          {rows.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-dim">กระดานนี้ยังว่าง</p>
          )}
        </ol>
        </section>
      </div>
      <BottomNav />
    </main>
  );
}
