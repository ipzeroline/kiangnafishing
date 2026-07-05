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
    "เคียงนา Fishing Lake",
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
  const restRows = rows.slice(3);
  const totalValue = rows.reduce((sum, row) => sum + Number(row.value || 0), 0);
  const totalScore = rows.reduce((sum, row) => sum + Number(row.score || 0), 0);
  const nf = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 1 });

  const pageTitle = `อันดับนักตกปลา ${boardMeta.label} เดือน ${thaiMonthLabel(mk)} | เคียงนา Fishing Lake`;
  const pageDescription = `กระดานอันดับ ${boardMeta.label} เดือน ${thaiMonthLabel(mk)} ของเคียงนา Fishing Lake จากข้อมูลผลงานปลาที่เจ้าหน้าที่ยืนยันแล้ว`;
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
              text: "อันดับในหน้านี้คำนวณจากผลงานปลาที่เจ้าหน้าที่ยืนยันแล้ว โดยแยกเป็นปลาใหญ่สุด จำนวนตัว น้ำหนักรวม และจำนวนวันเข้าใช้บริการ",
            },
          },
          {
            "@type": "Question",
            name: "ข้อมูลอันดับนี้เกี่ยวกับข้อมูลส่วนตัวใน LINE หรือไม่",
            acceptedAnswer: {
              "@type": "Answer",
              text: "หน้าอันดับสาธารณะนี้แสดงเฉพาะข้อมูลผลงานและอันดับที่ยืนยันแล้ว ไม่แสดงยอดเครดิต รายการธุรกรรม หรือข้อมูลส่วนตัวใน LINE",
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
            <h2>Ranking นักตกปลาบ่อตกปลาพะเยา จากผลงานที่ตรวจสอบแล้ว</h2>
            <p>
              หน้านี้รวบรวมอันดับนักตกปลาของเคียงนา Fishing Lake สำหรับผู้ที่ต้องการดูผลงานปลาใหญ่ จำนวนตัว น้ำหนักรวม และสถิติขาประจำแบบโปร่งใส
              โดยอ้างอิงเฉพาะรายการที่เจ้าหน้าที่ตรวจสอบแล้ว เพื่อให้ข้อมูลบนกระดานอันดับน่าเชื่อถือและเหมาะสำหรับการติดตามผลกิจกรรมหน้าบ่อ
            </p>
          </section>

          <section className="ranking-summary-grid" aria-label="สรุปอันดับ">
            <article>
              <p>ผู้มีผลงาน</p>
              <strong>{rows.length.toLocaleString("th-TH")}</strong>
              <span>รายการที่ผ่านการตรวจสอบแล้ว</span>
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

              <section className="ranking-board">
                <div className="ranking-board-head">
                  <div>
                    <p className="ranking-eyebrow">Leaderboard</p>
                    <h2>{boardMeta.label} · ทั้งหมด</h2>
                  </div>
                  <p>รายการนี้เป็นข้อมูลอันดับสาธารณะจากผลงานที่เจ้าหน้าที่ยืนยันแล้วเท่านั้น ไม่มีการแสดงยอดเครดิตหรือข้อมูลส่วนตัวใน LINE</p>
                </div>
                <ol className="ranking-list">
                  {restRows.map((row, offset) => {
                    const index = offset + 3;
                    const level = levelForScore(Number(row.score), levels);
                    return (
                      <li key={row.memberCode}>
                        <span className="ranking-no">{index + 1}</span>
                        <div className="ranking-member ranking-member-with-avatar">
                          <PublicAvatar src={row.linePictureUrl} name={row.name} className="ranking-avatar" />
                          <div className="min-w-0">
                            <strong>{row.name}</strong>
                            <p>{row.detail ? `${row.detail} · ` : ""}{row.memberCode}</p>
                            {level && <RankingLevelBadge level={level} size="sm" />}
                          </div>
                        </div>
                        <div className="ranking-value">
                          <strong>{nf.format(Number(row.value))}</strong>
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
