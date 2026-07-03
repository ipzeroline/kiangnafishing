import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { query as dbQuery, type RankingLevel } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { monthKeyBKK, thaiMonthLabel } from "@/lib/date";
import { levelForScore } from "@/lib/ranking";
import { RANKING_BOARDS, normalizeRankingBoard, queryRankingBoard } from "@/lib/public-ranking";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import RankingLevelBadge from "@/components/RankingLevelBadge";

export const dynamic = "force-dynamic";

export default async function RankingPage({ searchParams }: { searchParams: Promise<{ board?: string }> }) {
  const { board = "big" } = await searchParams;
  const activeBoard = normalizeRankingBoard(board);
  const requestHeaders = await headers();
  const userAgent = requestHeaders.get("user-agent") || "";
  if (!/\bLine\//i.test(userAgent)) redirect(`/rankings?board=${activeBoard}`);

  const boardMeta = RANKING_BOARDS.find((b) => b.key === activeBoard) || RANKING_BOARDS[0];
  const mk = monthKeyBKK();
  const [user, boardResult, levels] = await Promise.all([
    getSessionUser(),
    queryRankingBoard(activeBoard, mk),
    dbQuery<RankingLevel>("SELECT * FROM ranking_levels WHERE status='ACTIVE' ORDER BY minScore ASC"),
  ]);
  const { rows: allRows, unit } = boardResult;
  const rows = allRows.slice(0, 50);
  const [champion, runnerUp, thirdPlace] = rows;
  const podium = [runnerUp, champion, thirdPlace].filter(Boolean);
  const restRows = rows.slice(3);
  const totalValue = allRows.reduce((sum, row) => sum + Number(row.value || 0), 0);
  const totalScore = allRows.reduce((sum, row) => sum + Number(row.score || 0), 0);
  const myIndex = user?.role === "MEMBER" ? allRows.findIndex((row) => row.memberCode === user.memberCode) : -1;
  const myRow = myIndex >= 0 ? allRows[myIndex] : null;
  const myScore = Number(myRow?.score ?? (user?.role === "MEMBER" ? user.points * 0.05 : 0));
  const myLevel = user?.role === "MEMBER" ? levelForScore(myScore, levels) : null;
  const nf = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 1 });

  return (
    <main className="ranking-page min-h-dvh pb-28">
      <TopBar title={`กระดานอันดับ · ${thaiMonthLabel(mk)}`} back />
      <div className="ranking-shell mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="ranking-hero">
          <div className="ranking-hero-copy">
            <p className="ranking-eyebrow">Kiangna Fishing Lake Ranking</p>
            <h1>กระดานอันดับ</h1>
            <p>
              ผลงานนักตกปลาเดือน {thaiMonthLabel(mk)} จากรายการที่ตรวจสอบแล้ว พร้อมระดับสมาชิกและสัญลักษณ์ ranking
            </p>
          </div>
          <div className="ranking-hero-card">
            <p>{boardMeta.metric}</p>
            <strong>{champion ? nf.format(Number(champion.value)) : "0"}</strong>
            <span>{boardMeta.unit} · {boardMeta.label}</span>
          </div>
        </section>

        <section className="ranking-tabs" aria-label="เลือกประเภทอันดับ">
          {RANKING_BOARDS.map((b) => (
            <Link key={b.key} href={`/ranking?board=${b.key}`} className={activeBoard === b.key ? "active" : ""}>
              <span>{b.label}</span>
              <small>{b.sub}</small>
            </Link>
          ))}
        </section>

        {user?.role === "MEMBER" && (
          <section className="ranking-my-card" aria-label="อันดับและระดับของฉัน">
            <div className="ranking-my-profile">
              <PublicAvatar src={user.linePictureUrl} name={user.alias || user.name} className="ranking-my-avatar" />
              <div className="min-w-0">
                <p>ข้อมูลของฉัน</p>
                <h2>{user.alias || user.name}</h2>
                <span>{user.memberCode}</span>
              </div>
            </div>
            <div className="ranking-my-level">
              <p>Level ของฉัน</p>
              <strong>{myLevel?.name || "-"}</strong>
              <span>{myLevel ? `${myLevel.symbol} · คะแนน ${nf.format(myScore)}` : "ยังไม่มีระดับ"}</span>
              {myLevel && <RankingLevelBadge level={myLevel} size="md" />}
            </div>
            <div className="ranking-my-stats">
              <div>
                <p>อันดับกระดานนี้</p>
                <strong>{myIndex >= 0 ? `#${(myIndex + 1).toLocaleString("th-TH")}` : "ยังไม่มีอันดับ"}</strong>
                <span>{myRow ? `${nf.format(Number(myRow.value))} ${unit}` : "ยังไม่มีผลงานในเดือนนี้"}</span>
              </div>
            </div>
          </section>
        )}

        <section className="ranking-summary-grid" aria-label="สรุปอันดับ">
          <article>
            <p>ผู้มีผลงาน</p>
            <strong>{allRows.length.toLocaleString("th-TH")}</strong>
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
                    <PublicAvatar src={row.linePictureUrl} name={row.name} className="podium-avatar" />
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
                <p>เลื่อนดูตรงนี้เพื่อดูลำดับคนอื่นในกระดาน Top 50 · Top 3 สิ้นเดือนรับเครดิตกระเป๋าฟรี ฿300 / ฿200 / ฿100</p>
              </div>
              <ol className="ranking-list">
                {restRows.map((r, offset) => {
                  const i = offset + 3;
                  const level = levelForScore(Number(r.score), levels);
                  return (
                    <li key={r.memberCode}>
                      <span className="ranking-no">{i + 1}</span>
                      <div className="ranking-member ranking-member-with-avatar">
                        <PublicAvatar src={r.linePictureUrl} name={r.name} className="ranking-avatar" />
                        <div className="min-w-0">
                        <strong>{r.name}</strong>
                        <p>{r.detail ? `${r.detail} · ` : ""}{r.memberCode}</p>
                        {level && <RankingLevelBadge level={level} size="sm" />}
                        </div>
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

function PublicAvatar({ src, name, className }: { src: string | null; name: string; className: string }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name} className={`${className} object-cover`} />
  ) : (
    <div className={className}>{name.slice(0, 1)}</div>
  );
}
