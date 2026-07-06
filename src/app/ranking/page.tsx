import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { query as dbQuery, type RankingLevel } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { monthKeyBKK, thaiMonthLabel } from "@/lib/date";
import { levelForScore } from "@/lib/ranking";
import { RANKING_BOARDS, normalizeRankingBoard, queryRankingBoard } from "@/lib/public-ranking";
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
  const [champion] = rows;
  const totalValue = allRows.reduce((sum, row) => sum + Number(row.value || 0), 0);
  const totalScore = allRows.reduce((sum, row) => sum + Number(row.score || 0), 0);
  const myIndex = user?.role === "MEMBER" ? allRows.findIndex((row) => row.memberCode === user.memberCode) : -1;
  const myRow = myIndex >= 0 ? allRows[myIndex] : null;
  const myScore = Number(myRow?.score ?? (user?.role === "MEMBER" ? user.points * 0.05 : 0));
  const myLevel = user?.role === "MEMBER" ? levelForScore(myScore, levels) : null;
  const nf = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 1 });

  return (
    <main className="min-h-dvh bg-[#f5f8f7] px-3 py-3">
      <div className="mx-auto flex min-h-[calc(100dvh-1.5rem)] max-w-md flex-col gap-3">
        <section className="rounded-2xl bg-deep p-4 text-white shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/55">LINE Ranking</p>
              <h1 className="mt-1 font-display text-2xl font-semibold">อันดับนักตกปลา</h1>
              <p className="mt-1 truncate text-xs text-white/65">{thaiMonthLabel(mk)} · {boardMeta.label}</p>
            </div>
            <Link href="/line/catch" className="shrink-0 rounded-full bg-white/12 px-3 py-1.5 text-xs font-semibold text-white">
              ส่งผลงาน
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-[1.2fr_.8fr] gap-2">
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-xs text-white/55">อันดับ 1</p>
              <p className="mt-1 truncate font-display text-2xl font-semibold">{champion?.name || "-"}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-xs text-white/55">{boardMeta.metric}</p>
              <p className="mt-1 text-2xl font-semibold">{champion ? nf.format(Number(champion.value)) : "0"}</p>
              <p className="text-[11px] text-white/55">{unit}</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-2" aria-label="เลือกประเภทอันดับ">
          {RANKING_BOARDS.map((b) => (
            <Link
              key={b.key}
              href={`/ranking?board=${b.key}`}
              className={`rounded-xl px-3 py-2.5 text-sm font-semibold shadow-sm ring-1 ring-line transition ${
                activeBoard === b.key ? "bg-pond text-white ring-pond" : "bg-white text-deep"
              }`}
            >
              <span className="block truncate">{b.label}</span>
              <small className={`block truncate text-[11px] ${activeBoard === b.key ? "text-white/70" : "text-dim"}`}>{b.sub}</small>
            </Link>
          ))}
        </section>

        {user?.role === "MEMBER" && (
          <section className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-line" aria-label="อันดับและระดับของฉัน">
            <div className="flex items-center gap-3">
              <PublicAvatar
                src={user.linePictureUrl}
                name={user.alias || user.name}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-mist font-display text-lg font-semibold text-deep"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-pond">อันดับของฉัน</p>
                <h2 className="truncate font-display text-lg font-semibold text-deep">{user.alias || user.name}</h2>
                <p className="truncate font-mono text-xs text-dim">{user.memberCode}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-display text-2xl font-semibold text-deep">
                  {myIndex >= 0 ? `#${(myIndex + 1).toLocaleString("th-TH")}` : "-"}
                </p>
                <p className="text-xs font-semibold text-dim">{myRow ? `${nf.format(Number(myRow.value))} ${unit}` : "ยังไม่มีผลงาน"}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-mist p-3">
              <div className="min-w-0">
                <p className="text-xs text-dim">Level ของฉัน</p>
                <p className="truncate font-semibold text-deep">{myLevel?.name || "-"}</p>
                <p className="text-xs text-dim">{myLevel ? `${myLevel.symbol} · คะแนน ${nf.format(myScore)}` : "ยังไม่มีระดับ"}</p>
              </div>
              {myLevel && <RankingLevelBadge level={myLevel} size="sm" />}
            </div>
          </section>
        )}

        <section className="grid grid-cols-3 gap-2 text-center" aria-label="สรุปอันดับ">
          <article className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-line">
            <p className="text-[11px] text-dim">ผู้มีผลงาน</p>
            <strong className="mt-1 block text-lg text-deep">{allRows.length.toLocaleString("th-TH")}</strong>
          </article>
          <article className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-line">
            <p className="text-[11px] text-dim">คะแนนรวม</p>
            <strong className="mt-1 block text-lg text-deep">{nf.format(totalScore)}</strong>
          </article>
          <article className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-line">
            <p className="text-[11px] text-dim">รวม {unit}</p>
            <strong className="mt-1 block text-lg text-deep">{nf.format(totalValue)}</strong>
          </article>
        </section>

        {rows.length > 0 ? (
          <section className="flex flex-1 flex-col rounded-2xl bg-white shadow-sm ring-1 ring-line">
            <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
              <div>
                <p className="text-xs font-semibold text-pond">Leaderboard</p>
                <h2 className="mt-0.5 font-display text-xl font-semibold text-deep">{boardMeta.label}</h2>
              </div>
              <p className="shrink-0 rounded-full bg-mist px-3 py-1.5 text-xs font-semibold text-dim">
                Top {rows.length.toLocaleString("th-TH")}
              </p>
            </div>
            <ol className="divide-y divide-line/70">
              {rows.map((r, i) => {
                const level = levelForScore(Number(r.score), levels);
                return (
                  <li key={r.memberCode} className="flex items-center gap-3 px-4 py-3">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                      i === 0 ? "bg-gold text-deep" : i === 1 ? "bg-pond/10 text-pond" : i === 2 ? "bg-buoy/10 text-buoy" : "bg-mist text-dim"
                    }`}>
                      {i + 1}
                    </span>
                    <PublicAvatar
                      src={r.linePictureUrl}
                      name={r.name}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mist font-display text-base font-semibold text-deep"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <p className="truncate font-semibold text-ink">{r.name}</p>
                        {i < 3 && <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-semibold text-deep">Top {i + 1}</span>}
                      </div>
                      <p className="truncate text-xs text-dim">{r.detail ? `${r.detail} · ` : ""}{r.memberCode}</p>
                      {level && <div className="mt-1"><RankingLevelBadge level={level} size="sm" /></div>}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-display text-base font-semibold text-deep">{nf.format(Number(r.value))}</p>
                      <p className="text-[11px] text-dim">{unit}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
            <p className="border-t border-line px-4 py-3 text-center text-[11px] text-dim">
              Top 3 สิ้นเดือนรับเครดิตกระเป๋าฟรี ฿300 / ฿200 / ฿100
            </p>
          </section>
        ) : (
          <section className="rounded-2xl bg-white px-4 py-8 text-center shadow-sm ring-1 ring-line">
            <h2 className="font-display text-xl font-semibold text-deep">กระดานนี้ยังไม่มีข้อมูล</h2>
            <p className="mt-2 text-sm text-dim">เมื่อมีผลงานที่ผ่านการตรวจสอบ ระบบจะแสดงอันดับล่าสุดในหน้านี้โดยอัตโนมัติ</p>
          </section>
        )}
      </div>
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
