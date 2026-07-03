import type { RankingLevel } from "./db";

export type RankingMetric = {
  maxWeight: number;
  totalWeight: number;
  fishCount: number;
  visits: number;
  points: number;
};

export function rankingScore(metric: RankingMetric): number {
  return (
    Number(metric.maxWeight || 0) * 10 +
    Number(metric.totalWeight || 0) * 2 +
    Number(metric.fishCount || 0) * 5 +
    Number(metric.visits || 0) * 3 +
    Number(metric.points || 0) * 0.05
  );
}

export function levelForScore(score: number, levels: RankingLevel[]): RankingLevel | null {
  const active = levels
    .filter((level) => level.status === "ACTIVE" && !level.isSpecial)
    .sort((a, b) => b.minScore - a.minScore);
  return active.find((level) => score >= level.minScore) ?? active.at(-1) ?? null;
}
