import { query as dbQuery } from "@/lib/db";

export const RANKING_BOARDS = [
  { key: "big", label: "ปลาใหญ่สุด", sub: "Biggest catch", unit: "กก.", metric: "น้ำหนักสูงสุด" },
  { key: "count", label: "จำนวนตัว", sub: "Catch count", unit: "ตัว", metric: "จำนวนปลาที่ยืนยัน" },
  { key: "weight", label: "น้ำหนักรวม", sub: "Total weight", unit: "กก.", metric: "น้ำหนักรวมเดือนนี้" },
  { key: "regular", label: "ขาประจำ", sub: "Visit streak", unit: "วัน", metric: "จำนวนวันเข้าใช้บริการ" },
] as const;

export type RankingBoardKey = (typeof RANKING_BOARDS)[number]["key"];

export type PublicRankingRow = {
  name: string;
  memberCode: string;
  linePictureUrl: string | null;
  value: number;
  detail?: string;
  score: number;
};

export function normalizeRankingBoard(board: string | undefined): RankingBoardKey {
  return RANKING_BOARDS.some((item) => item.key === board) ? board as RankingBoardKey : "big";
}

async function queryLeaderboard(board: RankingBoardKey, mk: string): Promise<PublicRankingRow[]> {
  const orderField = board === "count" ? "fishCount" : board === "weight" ? "totalWeight" : board === "regular" ? "visits" : "maxWeight";
  const valueField = board === "count" ? "fishCount" : board === "weight" ? "totalWeight" : board === "regular" ? "visits" : "maxWeight";
  return dbQuery<PublicRankingRow>(`
    SELECT COALESCE(NULLIF(u.alias,''), NULLIF(u.lineDisplayName,''), u.name) name,
      u.memberCode,
      u.linePictureUrl,
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
  `, [mk, mk]);
}

export async function queryRankingBoard(board: RankingBoardKey, mk: string): Promise<{ rows: PublicRankingRow[]; unit: string }> {
  const meta = RANKING_BOARDS.find((item) => item.key === board) || RANKING_BOARDS[0];
  return {
    unit: meta.unit,
    rows: await queryLeaderboard(board, mk),
  };
}
