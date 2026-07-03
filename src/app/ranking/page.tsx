import Link from "next/link";
import { query as dbQuery, type RankingLevel } from "@/lib/db";
import { monthKeyBKK, thaiMonthLabel } from "@/lib/date";
import { levelForScore } from "@/lib/ranking";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import RankingLevelBadge from "@/components/RankingLevelBadge";

export const dynamic = "force-dynamic";

const BOARDS = [
  { key: "big", label: "ปลาใหญ่สุด", sub: "Biggest catch", unit: "กก.", metric: "น้ำหนักสูงสุด" },
  { key: "count", label: "จำนวนตัว", sub: "Catch count", unit: "ตัว", metric: "จำนวนปลาที่ยืนยัน" },
  { key: "weight", label: "น้ำหนักรวม", sub: "Total weight", unit: "กก.", metric: "น้ำหนักรวมเดือนนี้" },
  { key: "regular", label: "ขาประจำ", sub: "Visit streak", unit: "วัน", metric: "จำนวนวันเข้าใช้บริการ" },
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
    LIMIT 50
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
  const activeBoard = BOARDS.some((b) => b.key === board) ? board : "big";
  const boardMeta = BOARDS.find((b) => b.key === activeBoard) || BOARDS[0];
  const mk = monthKeyBKK();
  const [{ rows, unit }, levels] = await Promise.all([
    queryBoard(activeBoard, mk),
    dbQuery<RankingLevel>("SELECT * FROM ranking_levels WHERE status='ACTIVE' ORDER BY minScore ASC"),
  ]);
  const [champion, runnerUp, thirdPlace] = rows;
  const podium = [runnerUp, champion, thirdPlace].filter(Boolean);
  const restRows = rows.slice(3);
  const totalValue = rows.reduce((sum, row) => sum + Number(row.value || 0), 0);
  const totalScore = rows.reduce((sum, row) => sum + Number(row.score || 0), 0);
  const nf = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 1 });

  return (
    <main className="ranking-page min-h-dvh pb-28">
      <TopBar title={`กระดานอันดับ · ${thaiMonthLabel(mk)}`} back />
      <div className="ranking-shell mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="ranking-hero">
          <div className="ranking-hero-copy">
            <p className="ranking-eyebrow">Kiangna Fishing Lake Ranking</p>
            <h1>กระดานอันดับนักตกปลา</h1>
            <p>
              สรุปผลงานเดือน {thaiMonthLabel(mk)} จากรายการที่ผ่านการตรวจสอบ พร้อมระดับสมาชิกและสัญลักษณ์ ranking
              เพื่อให้การแข่งขันโปร่งใสและติดตามผลงานได้อย่างมืออาชีพ
            </p>
          </div>
          <div className="ranking-hero-card">
            <p>{boardMeta.metric}</p>
            <strong>{champion ? nf.format(Number(champion.value)) : "0"}</strong>
            <span>{boardMeta.unit} · {boardMeta.label}</span>
          </div>
        </section>

        <section className="ranking-tabs" aria-label="เลือกประเภทอันดับ">
          {BOARDS.map((b) => (
            <Link key={b.key} href={`/ranking?board=${b.key}`} className={activeBoard === b.key ? "active" : ""}>
              <span>{b.label}</span>
              <small>{b.sub}</small>
            </Link>
          ))}
        </section>

        <section className="ranking-summary-grid" aria-label="สรุปอันดับ">
          <article>
            <p>ผู้มีผลงาน</p>
            <strong>{rows.length.toLocaleString("th-TH")}</strong>
            <span>แสดงสูงสุด 50 อันดับ</span>
          </article>
          <article>
            <p>คะแนนรวม</p>
            <strong>{nf.format(totalScore)}</strong>
            <span>จากเครดิต แต้ม ปลา และการเข้าใช้บริการ</span>
          </article>
          <article>
            <p>ค่ารวมของกระดาน</p>
            <strong>{nf.format(totalValue)}</strong>
            <span>{unit} จากอันดับที่แสดง</span>
          </article>
        </section>

        {rows.length > 0 ? (
          <>
            <section className="ranking-podium" aria-label="สามอันดับแรก">
              {podium.map((row) => {
                const originalIndex = rows.findIndex((item) => item.memberCode === row.memberCode);
                const level = levelForScore(Number(row.score), levels);
                return (
                  <article key={row.memberCode} className={`podium-card podium-${originalIndex + 1}`}>
                    <div className="podium-medal">{originalIndex + 1}</div>
                    <div className="podium-avatar">{row.name.slice(0, 1)}</div>
                    <p>{originalIndex === 0 ? "Champion" : originalIndex === 1 ? "Runner-up" : "Third place"}</p>
                    <h2>{row.name}</h2>
                    <span>{row.detail ? `${row.detail} · ` : ""}{row.memberCode}</span>
                    {level && <RankingLevelBadge level={level} size={originalIndex === 0 ? "md" : "sm"} />}
                    <strong>{nf.format(Number(row.value))} <small>{unit}</small></strong>
                  </article>
                );
              })}
            </section>

            <section className="ranking-board">
              <div className="ranking-board-head">
                <div>
                  <p className="ranking-eyebrow">Leaderboard</p>
                  <h2>{boardMeta.label} · Top 50</h2>
                </div>
                <p>Top 3 สิ้นเดือนรับเครดิตกระเป๋าฟรี ฿300 / ฿200 / ฿100 รีเซ็ตทุกวันที่ 1</p>
              </div>
              <ol className="ranking-list">
                {restRows.map((r, offset) => {
                  const i = offset + 3;
                  const level = levelForScore(Number(r.score), levels);
                  return (
                    <li key={r.memberCode}>
                      <span className="ranking-no">{i + 1}</span>
                      <div className="ranking-member">
                        <strong>{r.name}</strong>
                        <p>{r.detail ? `${r.detail} · ` : ""}{r.memberCode}</p>
                        {level && <RankingLevelBadge level={level} size="sm" />}
                      </div>
                      <div className="ranking-value">
                        <strong>{nf.format(Number(r.value))}</strong>
                        <span>{unit}</span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          </>
        ) : (
          <section className="ranking-empty">
            <h2>กระดานนี้ยังไม่มีข้อมูล</h2>
            <p>เมื่อมีผลงานที่ผ่านการตรวจสอบ ระบบจะแสดงอันดับล่าสุดในหน้านี้โดยอัตโนมัติ</p>
          </section>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
