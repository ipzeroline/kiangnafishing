import type { Metadata } from "next";
import Link from "next/link";
import SiteChrome from "@/components/site/SiteChrome";
import RankingLevelBadge from "@/components/RankingLevelBadge";
import { query as dbQuery, type RankingLevel } from "@/lib/db";
import { monthKeyBKK, thaiMonthLabel } from "@/lib/date";
import { levelForScore } from "@/lib/ranking";
import { RANKING_BOARDS, normalizeRankingBoard, queryRankingBoard } from "@/lib/public-ranking";
import { siteContact, siteOgImage, siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

const rankingsTitle = "อันดับนักตกปลา เคียงนา Fishing Lake | Ranking บ่อตกปลาพะเยา";
const rankingsDescription = "ดูอันดับนักตกปลาเคียงนา Fishing Lake พะเยา จากผลงานปลาที่ตรวจสอบแล้ว แยกปลาใหญ่สุด จำนวนตัว น้ำหนักรวม และขาประจำ พร้อมรูปโปรไฟล์ ระดับสมาชิก และกระดานอันดับล่าสุด";
const rankingsImage = siteOgImage;

export const metadata: Metadata = {
  title: rankingsTitle,
  description: rankingsDescription,
  applicationName: "เคียงนา Fishing Lake",
  keywords: [
    "อันดับนักตกปลา",
    "ranking นักตกปลา",
    "กระดานอันดับตกปลา",
    "อันดับปลาบึก",
    "อันดับปลาใหญ่",
    "บ่อตกปลาพะเยา",
    "บ่อตกปลาดอกคำใต้",
    "บ่อตกปลาใหญ่พะเยา",
    "บ่อตกปลาใหญ่ดอกคำใต้",
    "เคียงนา Fishing Lake",
    "เคียงนาฟิชชิ่งเลค",
    "เคียงนาฟิชชิ่งเลคพะเยา",
    "เคียงนาfishinglakeพะเยา",
    "Kiangna Fishing Lake",
    "ผลงานปลา",
    "นักตกปลาพะเยา",
    "ตกปลาใหญ่พะเยา",
    "แกลลอรี่ผลงานปลา",
    "LINE บ่อตกปลา",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: `${siteUrl}/rankings`,
    languages: {
      th: `${siteUrl}/rankings`,
      "x-default": `${siteUrl}/rankings`,
    },
  },
  openGraph: {
    title: rankingsTitle,
    description: rankingsDescription,
    url: `${siteUrl}/rankings`,
    siteName: "เคียงนา Fishing Lake",
    locale: "th_TH",
    type: "website",
    images: [
      {
        url: rankingsImage,
        width: 1200,
        height: 630,
        alt: "เคียงนา Fishing Lake บ่อตกปลาพะเยาและกระดานอันดับนักตกปลา",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: rankingsTitle,
    description: rankingsDescription,
    images: [rankingsImage],
  },
  category: "Fishing Lake Ranking",
};

export default async function PublicRankingsPage({ searchParams }: { searchParams: Promise<{ board?: string }> }) {
  const { board } = await searchParams;
  const activeBoard = normalizeRankingBoard(board);
  const boardMeta = RANKING_BOARDS.find((item) => item.key === activeBoard) || RANKING_BOARDS[0];
  const mk = monthKeyBKK();
  const [boardResult, levels] = await Promise.all([
    queryRankingBoard(activeBoard, mk),
    dbQuery<RankingLevel>("SELECT * FROM ranking_levels WHERE status='ACTIVE' ORDER BY minScore ASC"),
  ]);
  const { rows, unit } = boardResult;
  const [champion, runnerUp, thirdPlace] = rows;
  const podium = [runnerUp, champion, thirdPlace].filter(Boolean);
  const totalValue = rows.reduce((sum, row) => sum + Number(row.value || 0), 0);
  const totalScore = rows.reduce((sum, row) => sum + Number(row.score || 0), 0);
  const nf = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 1 });

  const pageTitle = `อันดับนักตกปลา ${boardMeta.label} เดือน ${thaiMonthLabel(mk)} | เคียงนา Fishing Lake`;
  const pageDescription = `กระดานอันดับ ${boardMeta.label} เดือน ${thaiMonthLabel(mk)} ของเคียงนา Fishing Lake อัปเดตจากระบบอันดับของบ่อ`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}/rankings#webpage`,
        name: pageTitle,
        description: pageDescription,
        url: `${siteUrl}/rankings?board=${activeBoard}`,
        inLanguage: "th-TH",
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: {
          "@type": "SportsEvent",
          name: "กระดานอันดับนักตกปลา เคียงนา Fishing Lake",
          sport: "Fishing",
          location: {
            "@type": "Place",
            name: "เคียงนา Fishing Lake",
            address: {
              "@type": "PostalAddress",
              addressLocality: "ดอกคำใต้",
              addressRegion: "พะเยา",
              addressCountry: "TH",
            },
          },
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: rankingsImage,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: "เคียงนา Fishing Lake",
        url: siteUrl,
        inLanguage: "th-TH",
      },
      {
        "@type": "LocalBusiness",
        "@id": `${siteUrl}/#business`,
        name: "เคียงนา Fishing Lake",
        url: siteUrl,
        telephone: siteContact.phone,
        email: siteContact.email,
        image: rankingsImage,
        sameAs: [siteContact.lineHref, siteContact.facebookHref, siteContact.instagramHref, siteContact.tiktokHref, siteContact.mapHref],
        address: {
          "@type": "PostalAddress",
          addressLocality: "ดอกคำใต้",
          addressRegion: "พะเยา",
          addressCountry: "TH",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "หน้าแรก",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "อันดับนักตกปลา",
            item: `${siteUrl}/rankings`,
          },
        ],
      },
      {
        "@type": "ItemList",
        name: pageTitle,
        description: pageDescription,
        numberOfItems: rows.length,
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        itemListElement: rows.slice(0, 20).map((row, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: `${row.name} - ${boardMeta.label}`,
          item: {
            "@type": "Person",
            name: row.name,
            identifier: row.memberCode,
            image: row.linePictureUrl || undefined,
            description: `${boardMeta.label}: ${nf.format(Number(row.value))} ${unit}${row.detail ? `, ${row.detail}` : ""}`,
          },
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "อันดับนักตกปลาคำนวณจากอะไร",
            acceptedAnswer: {
              "@type": "Answer",
              text: "อันดับในหน้านี้คำนวณจากข้อมูลในระบบอันดับของบ่อ โดยแยกเป็นปลาใหญ่สุด จำนวนตัว น้ำหนักรวม และจำนวนวันเข้าใช้บริการ",
            },
          },
          {
            "@type": "Question",
            name: "ข้อมูลอันดับนี้เกี่ยวกับข้อมูลส่วนตัวใน LINE หรือไม่",
            acceptedAnswer: {
              "@type": "Answer",
              text: "หน้าอันดับสาธารณะนี้แสดงเฉพาะข้อมูลผลงานและอันดับประจำเดือน ไม่แสดงยอดเครดิต รายการธุรกรรม หรือข้อมูลส่วนตัวใน LINE",
            },
          },
        ],
      },
    ],
  };

  return (
    <SiteChrome locale="th" page="home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="ranking-page min-h-dvh">
        <div className="ranking-shell mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <section className="ranking-hero">
            <div className="ranking-hero-copy">
              <p className="ranking-eyebrow">Kiangna Fishing Lake Ranking</p>
              <h1>อันดับนักตกปลา เคียงนา Fishing Lake</h1>
              <p>{pageDescription} แสดงสำหรับหน้าเว็บไซต์โดยไม่เชื่อมข้อมูลส่วนตัวใน LINE</p>
            </div>
            <div className="ranking-hero-card">
              <p>{boardMeta.metric}</p>
              <strong>{champion ? nf.format(Number(champion.value)) : "0"}</strong>
              <span>{boardMeta.unit} · {boardMeta.label}</span>
            </div>
          </section>

          <section className="ranking-tabs" aria-label="เลือกประเภทอันดับ">
            {RANKING_BOARDS.map((item) => (
              <Link key={item.key} href={`/rankings?board=${item.key}`} className={activeBoard === item.key ? "active" : ""}>
                <span>{item.label}</span>
                <small>{item.sub}</small>
              </Link>
            ))}
          </section>

          <section className="ranking-seo-intro" aria-label="รายละเอียดกระดานอันดับนักตกปลา">
            <h2>Ranking นักตกปลาบ่อตกปลาพะเยา อัปเดตจากระบบอันดับประจำเดือน</h2>
            <p>
              หน้านี้รวบรวมอันดับนักตกปลาของเคียงนา Fishing Lake สำหรับผู้ที่ต้องการดูผลงานปลาใหญ่ จำนวนตัว น้ำหนักรวม และสถิติขาประจำแบบโปร่งใส
              โดยเรียงข้อมูลจากระบบอันดับของบ่อ เพื่อให้ติดตามผลงานประจำเดือนและบรรยากาศการแข่งขันหน้าบ่อได้ง่าย
            </p>
          </section>

          <section className="ranking-summary-grid" aria-label="สรุปอันดับ">
            <article>
              <p>ผู้มีผลงาน</p>
              <strong>{rows.length.toLocaleString("th-TH")}</strong>
              <span>รายชื่อในกระดานเดือนนี้</span>
            </article>
            <article>
              <p>คะแนนรวม</p>
              <strong>{nf.format(totalScore)}</strong>
              <span>คำนวณจากผลงานปลา แต้ม และการเข้าใช้บริการ</span>
            </article>
            <article>
              <p>ค่ารวมของกระดาน</p>
              <strong>{nf.format(totalValue)}</strong>
              <span>{unit} จากกระดาน {boardMeta.label}</span>
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

              <section className="ranking-board ranking-board-table-section">
                <div className="ranking-board-head">
                  <div>
                    <p className="ranking-eyebrow">Leaderboard</p>
                    <h2>{boardMeta.label} · ตารางอันดับทั้งหมด</h2>
                  </div>
                  <p>ตารางนี้แสดงอันดับสาธารณะสำหรับติดตามผลงานประจำเดือน ไม่มีการแสดงยอดเครดิตหรือข้อมูลส่วนตัวใน LINE</p>
                </div>
                <div className="ranking-table-wrap">
                  <table className="ranking-table">
                    <caption>ตารางอันดับนักตกปลา {boardMeta.label} ประจำเดือน {thaiMonthLabel(mk)}</caption>
                    <thead>
                      <tr>
                        <th scope="col">อันดับ</th>
                        <th scope="col">นักตกปลา</th>
                        <th scope="col">ระดับ</th>
                        <th scope="col">รายละเอียด</th>
                        <th scope="col" className="ranking-table-number">{boardMeta.metric}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, index) => {
                        const level = levelForScore(Number(row.score), levels);
                        return (
                          <tr key={row.memberCode} className={index < 3 ? "is-top-rank" : ""}>
                            <td data-label="อันดับ">
                              <span className="ranking-table-rank">{index + 1}</span>
                            </td>
                            <td data-label="นักตกปลา">
                              <div className="ranking-table-angler">
                                <PublicAvatar src={row.linePictureUrl} name={row.name} className="ranking-table-avatar" />
                                <div>
                                  <strong>{row.name}</strong>
                                  <span>{row.memberCode}</span>
                                </div>
                              </div>
                            </td>
                            <td data-label="ระดับ">
                              {level ? <RankingLevelBadge level={level} size="sm" /> : <span className="ranking-table-muted">-</span>}
                            </td>
                            <td data-label="รายละเอียด">
                              <span className="ranking-table-detail">{row.detail || "ข้อมูลอันดับประจำเดือน"}</span>
                            </td>
                            <td data-label={boardMeta.metric} className="ranking-table-number">
                              <strong>{nf.format(Number(row.value))}</strong>
                              <span>{unit}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          ) : (
            <section className="ranking-empty">
              <h2>ยังไม่มีข้อมูลอันดับ</h2>
              <p>เมื่อมีผลงานปลาที่ผ่านการตรวจสอบ ระบบจะแสดงอันดับในหน้านี้โดยอัตโนมัติ</p>
            </section>
          )}
        </div>
      </main>
    </SiteChrome>
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
