import Link from "next/link";
import SiteChrome from "./SiteChrome";
import { Locale, SitePage, articleItems, galleryItems, homeSeoContent, newsItems, pagePaths, siteContact, siteContent, siteUrl } from "@/lib/site";
import { query, type RankingLevel } from "@/lib/db";
import { dateKeyBKK, monthKeyBKK } from "@/lib/date";
import { levelForScore } from "@/lib/ranking";
import RankingLevelBadge from "@/components/RankingLevelBadge";

type HomeRanking = {
  name: string;
  memberCode: string;
  linePictureUrl: string | null;
  value: number;
  detail: string | null;
  score: number;
};

type HomeStat = {
  label: string;
  value: string;
  detail: string;
};

type HomeEvent = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
};

type HomeCatch = {
  id: string;
  name: string;
  memberCode?: string;
  species: string;
  weightKg: number;
  imagePath: string;
  caption?: string | null;
  createdAt: string;
};

async function getHomeRanking() {
  const mk = monthKeyBKK();
  return query<HomeRanking>(`
    SELECT COALESCE(NULLIF(u.alias,''), NULLIF(u.lineDisplayName,''), u.name) name,
      u.memberCode,
      u.linePictureUrl,
      ROUND(COALESCE(metric.maxWeight,0), 1) value,
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
    WHERE u.role='MEMBER' AND COALESCE(metric.maxWeight,0) > 0
    ORDER BY COALESCE(metric.maxWeight,0) DESC, score DESC
    LIMIT 10
  `, [mk, mk]);
}

async function getHomeLevels() {
  return query<RankingLevel>("SELECT * FROM ranking_levels WHERE status='ACTIVE' ORDER BY minScore ASC");
}

async function getHomeStats(locale: Locale): Promise<HomeStat[]> {
  const [today, month, activeEvents, activeCoupons, activeAnglers] = await Promise.all([
    query<{ count: number }>("SELECT COUNT(*) count FROM checkins WHERE dateKey=?", [dateKeyBKK()]),
    query<{ totalWeight: number; fishCount: number; biggest: number }>(`
      SELECT ROUND(COALESCE(SUM(weightKg),0),1) totalWeight,
        COUNT(*) fishCount,
        ROUND(COALESCE(MAX(weightKg),0),1) biggest
      FROM catches
      WHERE status='VERIFIED' AND monthKey=?
    `, [monthKeyBKK()]),
    query<{ count: number }>("SELECT COUNT(*) count FROM events WHERE status='ACTIVE'"),
    query<{ count: number }>("SELECT COUNT(*) count FROM coupons WHERE status='ACTIVE' AND CURDATE() BETWEEN startDate AND endDate"),
    query<{ count: number }>("SELECT COUNT(DISTINCT userId) count FROM catches WHERE status='VERIFIED' AND monthKey=?", [monthKeyBKK()]),
  ]);

  const nf = new Intl.NumberFormat(locale === "th" ? "th-TH" : "en-US");
  const todayCount = Number(today[0]?.count || 0);
  const totalWeight = Number(month[0]?.totalWeight || 0);
  const fishCount = Number(month[0]?.fishCount || 0);
  const biggest = Number(month[0]?.biggest || 0);
  const eventCount = Number(activeEvents[0]?.count || 0);
  const couponCount = Number(activeCoupons[0]?.count || 0);
  const anglerCount = Number(activeAnglers[0]?.count || 0);

  return locale === "th"
    ? [
        { label: "เช็คอินวันนี้", value: nf.format(todayCount), detail: "คนเข้าบ่อวันนี้" },
        { label: "น้ำหนักปลารวม", value: `${nf.format(totalWeight)} kg`, detail: "รวมผลงานที่ยืนยันแล้วเดือนนี้" },
        { label: "จำนวนปลาที่ส่ง", value: nf.format(fishCount), detail: "ตัว จากรายการที่ผ่านการตรวจสอบ" },
        { label: "ปลาใหญ่สุด", value: `${nf.format(biggest)} kg`, detail: "สถิติสูงสุดของเดือนนี้" },
        { label: "นักตกปลาที่มีผลงาน", value: nf.format(anglerCount), detail: "ผู้ที่มีผลงานปลาที่ตรวจสอบแล้วในเดือนนี้" },
        { label: "กิจกรรม / คูปอง", value: `${nf.format(eventCount)} / ${nf.format(couponCount)}`, detail: "รายการที่กำลังเปิดใช้งาน" },
      ]
    : [
        { label: "Today check-ins", value: nf.format(todayCount), detail: "Visitors checked in today" },
        { label: "Total catch weight", value: `${nf.format(totalWeight)} kg`, detail: "Verified catch weight this month" },
        { label: "Verified catches", value: nf.format(fishCount), detail: "Fish records approved by staff" },
        { label: "Biggest catch", value: `${nf.format(biggest)} kg`, detail: "Largest catch this month" },
        { label: "Active anglers", value: nf.format(anglerCount), detail: "Anglers with verified catches" },
        { label: "Events / Coupons", value: `${nf.format(eventCount)} / ${nf.format(couponCount)}`, detail: "Currently active campaigns" },
      ];
}

async function getHomeEvents() {
  return query<HomeEvent>(`
    SELECT id, title, description, startDate, endDate, status
    FROM events
    WHERE status IN ('ACTIVE','FINISHED')
    ORDER BY startDate DESC, createdAt DESC
    LIMIT 3
  `);
}

async function getHomeGallery() {
  return query<HomeCatch>(`
    SELECT c.id, COALESCE(u.alias, u.lineDisplayName, u.name) name, c.species,
      c.weightKg, c.imagePath, c.createdAt
    FROM catches c
    JOIN users u ON u.id = c.userId
    WHERE c.status='VERIFIED'
    ORDER BY c.createdAt DESC
    LIMIT 6
  `);
}

async function getPublicGallery() {
  return query<Required<Pick<HomeCatch, "id" | "name" | "memberCode" | "species" | "weightKg" | "imagePath" | "createdAt">> & { caption: string | null }>(`
    SELECT c.id, COALESCE(u.alias, u.lineDisplayName, u.name) name, u.memberCode,
      c.species, c.weightKg, c.imagePath, c.caption, c.createdAt
    FROM catches c
    JOIN users u ON u.id = c.userId
    WHERE c.status='VERIFIED' AND c.imagePath IS NOT NULL AND c.imagePath <> ''
    ORDER BY c.createdAt DESC
    LIMIT 36
  `);
}

function dateText(value: string, locale: Locale) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function LakeVisual({ locale }: { locale: Locale }) {
  const labels = locale === "th"
    ? ["บรรยากาศริมบ่อ", "ผลงานปลาใหญ่", "กิจกรรมลงปลา", "ระบบบริการ"]
    : ["Lakeside Setting", "Trophy Catches", "Fish Release", "Service System"];

  return (
    <div className="lake-visual" aria-label={locale === "th" ? "คอลเลกชันบรรยากาศบ่อตกปลา" : "Fishing lake collection"}>
      {labels.map((label, index) => (
        <article key={label} className={`lake-tile lake-tile-${index + 1}`}>
          <div className="lake-tile-art">
            <span className="fish-line" />
            <span className="fish-body" />
          </div>
          <div className="lake-tile-info">
            <p>{String(index + 1).padStart(2, "0")}</p>
            <h3>{label}</h3>
          </div>
        </article>
      ))}
      <div className="lake-center-card">
        <p>{locale === "th" ? "MODERN SERVICE" : "MODERN SERVICE"}</p>
        <strong>{locale === "th" ? "ระบบบริการทันสมัย ใช้งานง่าย ตรวจสอบได้" : "Simple, modern, auditable service"}</strong>
      </div>
    </div>
  );
}

function LakeHeroSlider({ locale }: { locale: Locale }) {
  const slides = [
    {
      image: "/site/kiangna-lake-aerial-01.png",
      title: locale === "th" ? "มุมมองบ่อหลักจากมุมสูง" : "Main lake aerial view",
      detail: locale === "th" ? "พื้นที่บ่อกว้าง พร้อมเส้นทางเข้าถึงสะดวก" : "A spacious lake area with convenient access routes",
    },
    {
      image: "/site/kiangna-lake-aerial-02.png",
      title: locale === "th" ? "บรรยากาศกลางทุ่งพะเยา" : "Countryside setting in Phayao",
      detail: locale === "th" ? "บรรยากาศเปิดโล่ง เหมาะสำหรับวันพักผ่อนและกิจกรรมตกปลา" : "An open natural setting for fishing sessions and relaxed visits",
    },
    {
      image: "/site/kiangna-lake-view-03.png",
      title: locale === "th" ? "พื้นที่ตกปลาริมน้ำ" : "Lakeside fishing area",
      detail: locale === "th" ? "วิวริมน้ำและธรรมชาติรอบบ่อสำหรับประสบการณ์ตกปลาพรีเมียม" : "Lakeside views and natural surroundings for a premium fishing experience",
    },
  ];

  return (
    <div className="lake-hero-slider" aria-label={locale === "th" ? "ภาพบรรยากาศเคียงนา Fishing Lake" : "Kiangna Fishing Lake atmosphere"}>
      {slides.map((slide, index) => (
        <figure key={slide.image} className="lake-hero-slide" style={{ ["--slide-index" as string]: index }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={slide.image} alt={slide.title} />
          <figcaption>
            <p>{String(index + 1).padStart(2, "0")}</p>
            <strong>{slide.title}</strong>
            <span>{slide.detail}</span>
          </figcaption>
        </figure>
      ))}
      <div className="lake-hero-dots" aria-hidden="true">
        {slides.map((slide, index) => <span key={slide.image} style={{ ["--slide-index" as string]: index }} />)}
      </div>
    </div>
  );
}

export async function HomeSitePage({ locale }: { locale: Locale }) {
  const content = siteContent[locale];
  const [ranking, levels, stats, events, gallery] = await Promise.all([
    getHomeRanking(),
    getHomeLevels(),
    getHomeStats(locale),
    getHomeEvents(),
    getHomeGallery(),
  ]);
  const fallbackEvents = newsItems[locale].map(([title, detail], index) => ({
    id: `fallback-${index}`,
    title,
    description: detail,
    startDate: "",
    endDate: "",
    status: "ACTIVE",
  }));
  const displayEvents = events.length ? events : fallbackEvents;
  const fallbackGallery = galleryItems[locale].slice(0, 6).map((label, index) => ({
    id: `gallery-${index}`,
    name: label,
    species: locale === "th" ? "อยู่ระหว่างอัปเดตข้อมูลจาก LINE" : "Pending LINE update",
    weightKg: 0,
    imagePath: "/fish-placeholder.svg",
    createdAt: "",
  }));
  const displayGallery = gallery.length ? gallery : fallbackGallery;
  const seo = homeSeoContent[locale];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `${siteUrl}${pagePaths.home[locale]}#business`,
        name: content.brand,
        url: `${siteUrl}${pagePaths.home[locale]}`,
        telephone: siteContact.phone,
        email: siteContact.email,
        sameAs: [siteContact.lineHref, siteContact.mapHref],
        description: content.pages.home.description,
        areaServed: locale === "th" ? ["พะเยา", "ดอกคำใต้", "Thailand"] : ["Phayao", "Dok Kham Tai", "Thailand"],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}${pagePaths.home[locale]}#website`,
        name: content.brand,
        url: siteUrl,
        inLanguage: locale,
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}${pagePaths.articles[locale]}?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}${pagePaths.home[locale]}#faq`,
        mainEntity: seo.faqs.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };

  return (
    <SiteChrome locale={locale} page="home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main>
        <section className="site-hero">
          <div className="site-hero-copy">
            <p className="site-eyebrow">{content.home.eyebrow}</p>
            <h1>{content.home.headline}</h1>
            <p>{content.home.intro}</p>
            <div className="site-hero-actions">
              <Link href="https://line.me/R/ti/p/@038gyaxo" className="site-primary-btn">{content.home.primary}</Link>
              <Link href={pagePaths.contact[locale]} className="site-secondary-btn">{content.home.secondary}</Link>
            </div>
          </div>
          <LakeHeroSlider locale={locale} />
        </section>

        <section className="site-stat-band" aria-label="Highlights">
          {content.home.stats.map(([value, label]) => (
            <div key={value}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </section>

        <section className="site-section site-section-tight">
          <div className="section-head">
            <p className="site-eyebrow">{locale === "th" ? "Live Lake Dashboard" : "Live Lake Dashboard"}</p>
            <h2 className="h2">{locale === "th" ? "ข้อมูลสรุปล่าสุดจากบ่อตกปลา" : "Latest operational highlights"}</h2>
          </div>
          <div className="home-live-stats">
            {stats.map((item, index) => (
              <article key={item.label} className="live-stat-card">
                <span data-index={index + 1} />
                <p>{item.label}</p>
                <strong>{item.value}</strong>
                <small>{item.detail}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="site-section">
          <div className="site-section-head">
            <p className="site-eyebrow">{locale === "th" ? "LINE" : "LINE account"}</p>
            <h2>{locale === "th" ? "บริการลูกค้าดำเนินผ่าน LINE" : "Customer transactions are managed through the LINE account"}</h2>
          </div>
          <div className="site-feature-grid">
            {content.home.features.map(([title, detail]) => (
              <article key={title} className="site-feature">
                <span />
                <h3>{title}</h3>
                <p>{detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="site-section site-section-tight">
          <div className="section-head">
            <p className="site-eyebrow">{locale === "th" ? "Service Highlights" : "Service Highlights"}</p>
            <h2 className="h2">{locale === "th" ? "บริการสำคัญสำหรับนักตกปลา" : "Key services for anglers"}</h2>
          </div>
          <div className="cat-grid">
            {(locale === "th"
              ? [
                  ["ลงปลา", "ติดตามข่าวลงปลา กิจกรรม และโปรโมชันบ่อตกปลาเคียงนา", pagePaths.news[locale]],
                  ["เครดิต", "ดูวิธีเติมเครดิต ตรวจสอบยอด และใช้งานกระเป๋าเงินผ่าน LINE", pagePaths.articles[locale]],
                  ["อันดับ", "ดูอันดับนักตกปลา น้ำหนักปลาใหญ่ และผลงานล่าสุด", "/rankings"],
                  ["คูปอง", "ดูสิทธิพิเศษ แต้มสะสม และการแลกรางวัลสำหรับสมาชิก", pagePaths.news[locale]],
                  ["แกลลอรี่", "ชมรูปผลงานปลาใหญ่และบรรยากาศบ่อตกปลาเคียงนา", pagePaths.gallery[locale]],
                  ["ติดต่อ", "สอบถามข้อมูล จองหมาย และติดต่อเจ้าหน้าที่ผ่าน LINE", pagePaths.contact[locale]],
                ]
              : [
                  ["Fish release", "Read official fish release updates, events, and lake promotions", pagePaths.news[locale]],
                  ["Credits", "Check top-up guidance, balances, and LINE wallet usage", pagePaths.articles[locale]],
                  ["Ranking", "View angler rankings, biggest fish, and latest verified catches", "/rankings"],
                  ["Coupons", "Review member privileges, points, and reward redemption", pagePaths.news[locale]],
                  ["Gallery", "Browse trophy catch photos and Kiangna Fishing Lake moments", pagePaths.gallery[locale]],
                  ["Contact", "Ask questions, reserve spots, and contact staff through LINE", pagePaths.contact[locale]],
                ]
            ).map(([title, detail, href], index) => (
              <Link className="cat-card" href={href} key={title}>
                <div className="cat-card-header">
                  <span className="dot" data-index={index + 1} />
                  <h3>{title}</h3>
                </div>
                <p>{detail}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="site-section">
          <div className="section-head">
            <p className="site-eyebrow">{locale === "th" ? "Ranking" : "Ranking"}</p>
            <h2 className="h2">{locale === "th" ? "อันดับนักตกปลาล่าสุด" : "Latest angler ranking"}</h2>
          </div>
          <div className="home-ranking">
            {ranking.length === 0 ? (
              <div className="home-empty-card">
                <h3>{locale === "th" ? "ยังไม่มีข้อมูลอันดับในเดือนนี้" : "No ranking data yet this month"}</h3>
                <p>{locale === "th" ? "เมื่อมีผลงานปลาที่ผ่านการตรวจสอบ ระบบจะแสดงอันดับล่าสุดในส่วนนี้" : "Verified catches will appear here automatically."}</p>
              </div>
            ) : ranking.map((row, index) => {
              const level = levelForScore(Number(row.score), levels);
              const weightText = Number(row.value).toLocaleString(locale === "th" ? "th-TH" : "en-US");
              return (
              <article key={row.memberCode} className={index === 0 ? "rank-card rank-card-leader" : "rank-card"}>
                <span className="rank-medal">{index + 1}</span>
                <div className="rank-profile">
                  {row.linePictureUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={row.linePictureUrl} alt={row.name} className="rank-avatar" />
                  ) : (
                    <span className="rank-avatar rank-avatar-fallback">{row.name.slice(0, 1)}</span>
                  )}
                  <div className="rank-member-copy">
                    <h3>{row.name}</h3>
                    <p>{row.detail || row.memberCode}</p>
                    {level && <RankingLevelBadge level={level} size={index === 0 ? "md" : "sm"} />}
                  </div>
                </div>
                <strong><span>{weightText}</span> kg</strong>
              </article>
              );
            })}
          </div>
          <div className="center mt-lg">
            <Link href="/rankings" className="site-secondary-btn">{locale === "th" ? "ดูอันดับทั้งหมด" : "View full ranking"}</Link>
          </div>
        </section>

        <section className="site-section site-section-tight">
          <div className="section-head">
            <p className="site-eyebrow">{locale === "th" ? "News & Events" : "News & Events"}</p>
            <h2 className="h2">{locale === "th" ? "ข่าวสารและกิจกรรมล่าสุด" : "Latest news and events"}</h2>
          </div>
          <div className="site-list-grid">
            {displayEvents.map((item, index) => (
              <article key={item.id} className="site-news-card">
                <p>{item.startDate ? dateText(item.startDate, locale) : String(index + 1).padStart(2, "0")}</p>
                <h2>{item.title}</h2>
                <span>{item.description}</span>
              </article>
            ))}
          </div>
          <div className="center mt-lg">
            <Link href={pagePaths.news[locale]} className="site-secondary-btn">{locale === "th" ? "ดูข่าวสารทั้งหมด" : "View all updates"}</Link>
          </div>
        </section>

        <section className="site-section site-section-tight">
          <div className="section-head">
            <p className="site-eyebrow">{locale === "th" ? "Gallery" : "Gallery"}</p>
            <h2 className="h2">{locale === "th" ? "แกลลอรี่ล่าสุด" : "Latest gallery"}</h2>
          </div>
          <div className="home-gallery-grid">
            {displayGallery.map((item) => (
              <figure key={item.id} className="home-gallery-card">
                <div className="home-gallery-art" style={{ backgroundImage: item.imagePath && item.imagePath !== "/fish-placeholder.svg" ? `url(${item.imagePath})` : undefined }} />
                <figcaption>
                  <strong>{item.species}</strong>
                  <span>
                    {item.weightKg > 0 ? `${Number(item.weightKg).toLocaleString(locale === "th" ? "th-TH" : "en-US")} kg · ` : ""}
                    {item.name}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="center mt-lg">
            <Link href={pagePaths.gallery[locale]} className="site-secondary-btn">{locale === "th" ? "ดูแกลลอรี่ทั้งหมด" : "View gallery"}</Link>
          </div>
        </section>

        <section className="site-section seo-rich-section">
          <div className="seo-rich-layout">
            <article className="seo-copy-block">
              <p className="site-eyebrow">{locale === "th" ? "คู่มือบริการ" : "Service Guide"}</p>
              <h2>{seo.serviceTitle}</h2>
              <p>{seo.serviceIntro}</p>
              <div className="seo-service-grid">
                {seo.serviceBlocks.map(([title, detail]) => (
                  <div key={title}>
                    <h3>{title}</h3>
                    <p>{detail}</p>
                  </div>
                ))}
              </div>
            </article>
            <aside className="seo-howto-card">
              <h2>{seo.howToTitle}</h2>
              <ol>
                {seo.howToSteps.map((step) => <li key={step}>{step}</li>)}
              </ol>
            </aside>
          </div>
        </section>

        <section className="site-section site-section-tight">
          <div className="section-head">
            <p className="site-eyebrow">{locale === "th" ? "หัวข้อที่เกี่ยวข้อง" : "Related Topics"}</p>
            <h2 className="h2">{seo.keywordsTitle}</h2>
          </div>
          <div className="seo-keyword-cloud">
            {seo.keywords.map((keyword) => (
              <Link key={keyword} href={pagePaths.articles[locale]}>{keyword}</Link>
            ))}
          </div>
        </section>

        <section className="site-section site-section-tight">
          <div className="section-head">
            <p className="site-eyebrow">FAQ</p>
            <h2 className="h2">{seo.faqTitle}</h2>
          </div>
          <div className="home-faq-list">
            {seo.faqs.map(([question, answer]) => (
              <details key={question} className="home-faq-item">
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </SiteChrome>
  );
}

export function NewsSitePage({ locale }: { locale: Locale }) {
  const content = siteContent[locale];
  return (
    <ContentPage locale={locale} page="news" eyebrow="Updates" title={content.sections.newsTitle}>
      <div className="site-list-grid">
        {newsItems[locale].map(([title, detail], index) => (
          <article key={title} className="site-news-card">
            <p>{String(index + 1).padStart(2, "0")}</p>
            <h2>{title}</h2>
            <span>{detail}</span>
          </article>
        ))}
      </div>
    </ContentPage>
  );
}

export function ArticlesSitePage({ locale }: { locale: Locale }) {
  const title = locale === "th" ? "บทความตกปลาและคู่มือบริการ" : "Fishing Articles and Service Guides";
  const intro = locale === "th"
    ? "รวมบทความสำหรับการเตรียมตัวก่อนเข้าใช้บริการ การใช้งานเมนูบริการ ระบบอันดับ เครดิต และแนวทางทำรายการอย่างปลอดภัย"
    : "Guides for lake preparation, LINE usage, rankings, credits, and secure customer transactions.";

  return (
    <ContentPage locale={locale} page="articles" eyebrow="Articles" title={title}>
      <p className="site-page-intro">{intro}</p>
      <div className="article-grid">
        {articleItems[locale].map(([articleTitle, detail], index) => (
          <article key={articleTitle} className="article-card">
            <p>{String(index + 1).padStart(2, "0")}</p>
            <h2>{articleTitle}</h2>
            <span>{detail}</span>
            <Link href={pagePaths.contact[locale]}>{locale === "th" ? "ติดต่อสอบถาม" : "Contact for details"}</Link>
          </article>
        ))}
      </div>
    </ContentPage>
  );
}

export async function GallerySitePage({ locale }: { locale: Locale }) {
  const content = siteContent[locale];
  const catches = await getPublicGallery();
  const totalWeight = catches.reduce((sum, item) => sum + Number(item.weightKg || 0), 0);
  const speciesCount = new Set(catches.map((item) => item.species)).size;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: locale === "th" ? "แกลลอรี่ผลงานปลา เคียงนา Fishing Lake" : "Kiangna Fishing Lake Catch Gallery",
    description: content.pages.gallery.description,
    url: `${siteUrl}${pagePaths.gallery[locale]}`,
    image: catches.slice(0, 12).map((item) => ({
      "@type": "ImageObject",
      url: item.imagePath.startsWith("http") ? item.imagePath : `${siteUrl}${item.imagePath}`,
      caption: item.caption || `${item.species} ${Number(item.weightKg).toLocaleString(locale === "th" ? "th-TH" : "en-US")} kg by ${item.name}`,
      name: `${item.species} ${Number(item.weightKg).toLocaleString(locale === "th" ? "th-TH" : "en-US")} kg`,
      datePublished: item.createdAt,
      creator: { "@type": "Person", name: item.name },
    })),
  };

  return (
    <ContentPage locale={locale} page="gallery" eyebrow="Gallery" title={content.sections.galleryTitle}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="site-gallery-intro" aria-label={locale === "th" ? "สรุปแกลลอรี่ผลงานปลา" : "Catch gallery summary"}>
        <div>
          <p>{locale === "th" ? "รวมรูปผลงานปลาที่ผ่านการตรวจสอบจากเจ้าหน้าที่ พร้อมน้ำหนักจริงและข้อมูลสมาชิก" : "Verified catch photos reviewed by staff with real weights and member records."}</p>
        </div>
        <div className="site-gallery-stats">
          <span><strong>{catches.length.toLocaleString(locale === "th" ? "th-TH" : "en-US")}</strong>{locale === "th" ? " ผลงาน" : " catches"}</span>
          <span><strong>{speciesCount.toLocaleString(locale === "th" ? "th-TH" : "en-US")}</strong>{locale === "th" ? " ชนิดปลา" : " species"}</span>
          <span><strong>{totalWeight.toLocaleString(locale === "th" ? "th-TH" : "en-US", { maximumFractionDigits: 2 })}</strong>{locale === "th" ? " กก. รวม" : " kg total"}</span>
        </div>
      </section>

      {catches.length > 0 ? (
        <div className="site-catch-gallery-grid">
          {catches.map((item, index) => (
            <figure key={item.id} className={`site-catch-gallery-card ${index < 2 ? "featured" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imagePath}
                alt={locale === "th"
                  ? `${item.species} น้ำหนัก ${Number(item.weightKg).toLocaleString("th-TH")} กิโลกรัม ผลงานของ ${item.name} ที่เคียงนา Fishing Lake`
                  : `${item.species} weighing ${Number(item.weightKg).toLocaleString("en-US")} kg caught by ${item.name} at Kiangna Fishing Lake`}
                loading={index < 4 ? "eager" : "lazy"}
              />
              <figcaption>
                <div>
                  <p>{item.species}</p>
                  <strong>{Number(item.weightKg).toLocaleString(locale === "th" ? "th-TH" : "en-US", { maximumFractionDigits: 2 })} {locale === "th" ? "กก." : "kg"}</strong>
                </div>
                {item.caption && <blockquote>{item.caption}</blockquote>}
                <span>{locale === "th" ? "โดย" : "by"} {item.name} · {dateText(item.createdAt, locale)}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <div className="site-gallery-empty">
          <h2>{locale === "th" ? "ยังไม่มีผลงานปลาที่เผยแพร่" : "No published catches yet"}</h2>
          <p>{locale === "th" ? "เมื่อเจ้าหน้าที่ยืนยันผลงานปลา รูปจะถูกนำมาแสดงในแกลลอรี่นี้โดยอัตโนมัติ" : "Verified catches will appear here automatically after staff review."}</p>
        </div>
      )}
    </ContentPage>
  );
}

export function AboutSitePage({ locale }: { locale: Locale }) {
  const content = siteContent[locale];
  const points = locale === "th"
    ? [
        "ใช้งานบริการหลักได้ง่าย ตั้งแต่ QR เข้าบ่อ เติมเครดิต ส่งผลงานปลา และดูอันดับ",
        "ข้อมูลเครดิต แต้ม คูปอง และผลงานปลาถูกจัดเก็บเป็นระบบ ลดความสับสนในการใช้งาน",
        "รายการสำคัญมีประวัติ ตรวจสอบย้อนหลังได้ และช่วยลดความผิดพลาดจากการทำงานหน้าบ่อ",
        "ผลงานปลาต้องผ่านการตรวจสอบก่อนขึ้นอันดับและแกลลอรี่ เพื่อให้ข้อมูลน่าเชื่อถือ",
      ]
    : [
        "Customers use the LINE account for entry QR, credits, catch submissions, and rankings",
        "Staff manage members, credits, points, coupons, catches, and reports through role-based admin tools",
        "Important actions are recorded for auditability and fewer front-desk errors",
        "Catch records are reviewed before appearing in rankings and gallery pages",
      ];
  const serviceBlocks = locale === "th"
    ? [
        ["บ่อตกปลาพะเยา ดอกคำใต้", "พื้นที่ตกปลาที่ออกแบบให้ใช้งานจริงสำหรับนักตกปลา ทั้งการเข้าบ่อ การติดตามกิจกรรม และการเก็บผลงานปลาอย่างเป็นระบบ"],
        ["ระบบที่ทันสมัย ใช้งานง่าย", "ลูกค้าเข้าถึง QR เข้าบ่อ เครดิต กระเป๋าแต้ม ส่งปลา และดูอันดับได้จากเมนูที่จัดไว้ชัดเจน ไม่ต้องทำขั้นตอนซ้ำซ้อน"],
        ["ข้อมูลชัดเจน ตรวจสอบได้", "รายการเครดิต แต้ม ผลงานปลา และประวัติสำคัญถูกจัดเก็บอย่างเป็นระบบ ทำให้การให้บริการรวดเร็วและลดความผิดพลาด"],
      ]
    : [
        ["Fishing lake in Phayao", "A practical fishing lake experience with structured entry, event updates, and verified catch records."],
        ["LINE-first customer service", "Customers use the LINE menu for entry QR, credits, points, catch submissions, and rankings."],
        ["Staff back office", "Staff review members, top-ups, catch records, reports, and audit logs for transparent operations."],
      ];
  const workflows = locale === "th"
    ? ["เพิ่มเพื่อนบัญชีทางการ @038gyaxo", "เปิดเมนูบริการเพื่อเข้าบ่อ เติมเครดิต หรือส่งผลงานปลา", "รายการสำคัญจะถูกตรวจสอบก่อนยืนยัน", "ข้อมูลที่ผ่านการยืนยันจะแสดงในอันดับ แกลลอรี่ หรือประวัติสมาชิก"]
    : ["Add the LINE account @038gyaxo", "Use the service menu for entry, credits, or catch submissions", "Staff review important records before approval", "Approved records appear in rankings, gallery, or member history"];
  const faqs = locale === "th"
    ? [
        ["เคียงนา Fishing Lake อยู่ที่ไหน", "เคียงนา Fishing Lake ให้บริการในพื้นที่พะเยาและดอกคำใต้ ลูกค้าสามารถเปิดแผนที่จากหน้า Contact หรือสอบถามทาง LINE @038gyaxo"],
        ["ระบบบริการใช้งานยากไหม", "ไม่ยาก ระบบถูกออกแบบให้เปิดเมนูแล้วเลือกบริการที่ต้องการได้เลย เช่น QR เข้าบ่อ เติมเครดิต ตรวจสอบยอด ส่งผลงานปลา และดูอันดับ"],
        ["อันดับนักตกปลาน่าเชื่อถืออย่างไร", "ผลงานปลาต้องผ่านการตรวจสอบจากเจ้าหน้าที่ก่อนนำไปคำนวณอันดับหรือแสดงในแกลลอรี่สาธารณะ"],
        ["ข้อมูลเครดิตและแต้มตรวจสอบได้หรือไม่", "รายการเครดิต แต้ม เติมเงิน และกิจกรรมสำคัญถูกบันทึกเป็นประวัติ จึงตรวจสอบย้อนหลังได้เมื่อจำเป็น"],
      ]
    : [
        ["Where is Kiangna Fishing Lake located?", "Kiangna Fishing Lake serves anglers in Phayao and Dok Kham Tai. Customers can open the map on the contact page or ask through the LINE account."],
        ["Do customers need LINE?", "Core customer services are designed around the LINE account, including entry QR, credits, balances, catch submissions, and rankings."],
        ["How are rankings verified?", "Catch records are reviewed by staff before they are used in rankings or public gallery pages."],
        ["Are credits and points auditable?", "Credits, points, top-ups, and important actions are recorded in the back office for staff review."],
      ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${siteUrl}${pagePaths.about[locale]}#webpage`,
        name: content.pages.about.title,
        description: content.pages.about.description,
        url: `${siteUrl}${pagePaths.about[locale]}`,
        inLanguage: locale === "th" ? "th-TH" : "en-US",
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#business` },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${siteUrl}/site/kiangna-lake-aerial-02.png`,
        },
      },
      {
        "@type": "LocalBusiness",
        "@id": `${siteUrl}/#business`,
        name: content.brand,
        url: siteUrl,
        telephone: siteContact.phone,
        email: siteContact.email,
        image: [
          `${siteUrl}/site/kiangna-lake-aerial-01.png`,
          `${siteUrl}/site/kiangna-lake-aerial-02.png`,
          `${siteUrl}/site/kiangna-lake-view-03.png`,
        ],
        sameAs: [siteContact.lineHref, siteContact.mapHref],
        areaServed: locale === "th" ? ["พะเยา", "ดอกคำใต้", "Thailand"] : ["Phayao", "Dok Kham Tai", "Thailand"],
        address: {
          "@type": "PostalAddress",
          addressLocality: locale === "th" ? "ดอกคำใต้" : "Dok Kham Tai",
          addressRegion: locale === "th" ? "พะเยา" : "Phayao",
          addressCountry: "TH",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: content.brand,
        url: siteUrl,
        inLanguage: locale === "th" ? "th-TH" : "en-US",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: locale === "th" ? "หน้าแรก" : "Home", item: `${siteUrl}${pagePaths.home[locale]}` },
          { "@type": "ListItem", position: 2, name: locale === "th" ? "เกี่ยวกับเรา" : "About", item: `${siteUrl}${pagePaths.about[locale]}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };

  return (
    <ContentPage locale={locale} page="about" eyebrow="About" title={content.sections.aboutTitle}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="site-about-layout">
        <LakeVisual locale={locale} />
        <div className="site-about-copy">
          <p>
            {locale === "th"
              ? "เคียงนา Fishing Lake คือบ่อตกปลาพะเยาในพื้นที่ดอกคำใต้ที่วางระบบบริการให้ทันสมัย ใช้งานง่าย และตรวจสอบได้ ลูกค้าทำรายการสำคัญได้จากเมนูบริการเดียว ทั้ง QR เข้าบ่อ เครดิต แต้ม คูปอง ผลงานปลา และอันดับนักตกปลา"
              : "Kiangna Fishing Lake is a modern fishing lake in Phayao and Dok Kham Tai, built around a LINE-first customer journey and a controlled staff backend for clearer, faster, and auditable operations."}
          </p>
          <ul>
            {points.map((point) => <li key={point}>{point}</li>)}
          </ul>
        </div>
      </div>
      <section className="about-proof-grid" aria-label={locale === "th" ? "จุดเด่นของเคียงนา Fishing Lake" : "Kiangna Fishing Lake highlights"}>
        {serviceBlocks.map(([title, detail]) => (
          <article key={title}>
            <h2>{title}</h2>
            <p>{detail}</p>
          </article>
        ))}
      </section>
      <section className="about-system-panel">
        <div>
          <p className="site-eyebrow">{locale === "th" ? "Modern Service" : "Modern Service"}</p>
          <h2>{locale === "th" ? "ระบบบริการที่ทันสมัยและเข้าใจง่าย" : "Structured LINE customer workflow"}</h2>
          <p>
            {locale === "th"
              ? "ระบบถูกออกแบบให้ลูกค้าทำรายการได้สะดวก ลดการกรอกข้อมูลซ้ำ และเก็บประวัติสำคัญไว้อย่างเป็นระเบียบ เหมาะกับบ่อตกปลาที่ต้องจัดการทั้งการเข้าบ่อ เครดิต แต้ม ผลงานปลา และกิจกรรมในแต่ละเดือน"
              : "Using LINE as the customer center helps reduce repeated forms, keeps important actions tied to real customer accounts, and supports entry, credits, points, catches, and monthly events."}
          </p>
        </div>
        <ol>
          {workflows.map((item) => <li key={item}>{item}</li>)}
        </ol>
      </section>
      <section className="about-trust-grid" aria-label={locale === "th" ? "ระบบตรวจสอบและความโปร่งใส" : "Audit and transparency"}>
        {(locale === "th"
          ? [
              ["ผลงานปลา", "ส่งรูปและข้อมูลน้ำหนักผ่านเมนูบริการ จากนั้นตรวจสอบก่อนขึ้นอันดับหรือแกลลอรี่"],
              ["เครดิตและแต้ม", "รายการเติมเงิน ยอดคงเหลือ แต้ม และธุรกรรมสำคัญมีประวัติให้ตรวจสอบย้อนหลัง"],
              ["ข้อมูลเป็นระบบ", "ข้อมูลเดือน สมาชิก การเข้าบ่อ เครดิต และผลงานปลาแยกเป็นหมวดชัดเจน"],
              ["ประสบการณ์หน้าบ่อ", "ลดขั้นตอนซ้ำซ้อน ลูกค้าใช้ QR และเมนูบริการได้รวดเร็ว เข้าใจง่าย"],
            ]
          : [
              ["Catch records", "Photos and weights are submitted via LINE and reviewed before rankings or gallery publication."],
              ["Credits and points", "Top-ups, balances, points, and important transactions are recorded for review."],
              ["Back-office reports", "Monthly overview, members, entries, revenue, credits, catches, and audit logs are separated clearly."],
              ["Lake experience", "QR and LINE menus reduce repeated steps while staff can scan and verify records quickly."],
            ]
        ).map(([title, detail]) => (
          <article key={title}>
            <h2>{title}</h2>
            <p>{detail}</p>
          </article>
        ))}
      </section>
      <section className="home-faq-list about-faq" aria-label="FAQ">
        {faqs.map(([question, answer]) => (
          <details key={question} className="home-faq-item">
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </section>
    </ContentPage>
  );
}

export function ContactSitePage({ locale }: { locale: Locale }) {
  const content = siteContent[locale];
  const contactCards = locale === "th"
    ? [
        ["LINE", siteContact.lineId, "สอบถามรอบลงปลา เครดิต QR เข้าบ่อ ส่งผลงานปลา และติดต่อเจ้าหน้าที่", siteContact.lineHref, "เพิ่มเพื่อน LINE"],
        ["โทรศัพท์", siteContact.phone, "โทรสอบถามข้อมูลการเข้าใช้บริการ จองหมาย และกิจกรรมหน้าบ่อ", siteContact.phoneHref, "โทรเลย"],
        ["อีเมล", siteContact.email, "ติดต่อเรื่องข้อมูลธุรกิจ เอกสาร หรือคำถามที่ต้องการรายละเอียดเพิ่มเติม", siteContact.emailHref, "ส่งอีเมล"],
      ]
    : [
        ["LINE", siteContact.lineId, "Ask about fish releases, credits, entry QR, catch submissions, and staff support.", siteContact.lineHref, "Add LINE friend"],
        ["Phone", siteContact.phone, "Call for lake visits, spot reservations, and event information.", siteContact.phoneHref, "Call now"],
        ["Email", siteContact.email, "Send business questions, document requests, or detailed inquiries.", siteContact.emailHref, "Send email"],
      ];
  const serviceList = locale === "th"
    ? ["บ่อตกปลาพะเยาและดอกคำใต้", "รอบลงปลาและกิจกรรมหน้าบ่อ", "QR เข้าบ่อ เครดิต แต้ม และคูปอง", "ส่งผลงานปลาและตรวจสอบอันดับ", "แผนที่และเส้นทางไปเคียงนา Fishing Lake"]
    : ["Fishing lake in Phayao and Dok Kham Tai", "Fish release schedules and lake events", "Entry QR, credits, points, and coupons", "Catch submissions and ranking verification", "Map and directions to Kiangna Fishing Lake"];
  const faqs = locale === "th"
    ? [
        ["ติดต่อเคียงนา Fishing Lake ทางไหนเร็วที่สุด", "แนะนำให้เพิ่มเพื่อน LINE @038gyaxo เพื่อสอบถามรอบลงปลา เครดิต QR เข้าบ่อ การส่งผลงานปลา และติดต่อเจ้าหน้าที่"],
        ["บ่ออยู่พื้นที่ไหน", "เคียงนา Fishing Lake ให้บริการในพื้นที่พะเยาและดอกคำใต้ สามารถเปิดเส้นทางจาก Google Maps ในหน้านี้ได้ทันที"],
        ["ต้องเตรียมข้อมูลอะไรก่อนสอบถาม", "หากเป็นสมาชิกให้แจ้งชื่อหรือบัญชี LINE ที่ใช้บริการ หากสอบถามจองหมายหรือกิจกรรมให้แจ้งวันที่ต้องการเข้าใช้บริการ"],
      ]
    : [
        ["What is the fastest way to contact Kiangna Fishing Lake?", "Add LINE @038gyaxo for fish releases, credits, entry QR, catch submissions, and staff support."],
        ["Where is the lake located?", "Kiangna Fishing Lake serves anglers in Phayao and Dok Kham Tai. Use the Google Maps link on this page for directions."],
        ["What should I prepare before contacting staff?", "Members can share their name or LINE account. For visits or events, include the date you plan to come."],
      ];
  const contactJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": `${siteUrl}${pagePaths.contact[locale]}#contact-page`,
        name: locale === "th" ? "ติดต่อเคียงนา Fishing Lake" : "Contact Kiangna Fishing Lake",
        url: `${siteUrl}${pagePaths.contact[locale]}`,
        inLanguage: locale === "th" ? "th-TH" : "en",
        about: { "@id": `${siteUrl}#localbusiness` },
      },
      {
        "@type": "LocalBusiness",
        "@id": `${siteUrl}#localbusiness`,
        name: "เคียงนา Fishing Lake",
        alternateName: "Kiangna Fishing Lake",
        url: siteUrl,
        telephone: siteContact.phone,
        email: siteContact.email,
        areaServed: ["Phayao", "Dok Kham Tai"],
        contactPoint: [
          {
            "@type": "ContactPoint",
            telephone: siteContact.phone,
            contactType: "customer service",
            availableLanguage: ["Thai"],
          },
        ],
        sameAs: [siteContact.lineHref, siteContact.mapHref],
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}${pagePaths.contact[locale]}#faq`,
        mainEntity: faqs.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };
  return (
    <ContentPage locale={locale} page="contact" eyebrow="Contact" title={content.sections.contactTitle}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }} />
      <section className="contact-hero-panel">
        <div>
          <p className="site-eyebrow">{locale === "th" ? "Kiangna Fishing Lake Contact" : "Kiangna Fishing Lake Contact"}</p>
          <h2>{locale === "th" ? "สอบถามรอบลงปลา จองหมาย และเส้นทางมาบ่อตกปลาเคียงนา" : "Ask about fish releases, reservations, and directions to Kiangna Fishing Lake"}</h2>
          <p>
            {locale === "th"
              ? "ติดต่อเคียงนา Fishing Lake บ่อตกปลาพะเยาและดอกคำใต้ ผ่าน LINE โทรศัพท์ อีเมล หรือเปิดแผนที่ Google Maps เพื่อวางแผนเข้าบ่อได้สะดวก"
              : "Contact Kiangna Fishing Lake in Phayao and Dok Kham Tai through LINE, phone, email, or Google Maps before your visit."}
          </p>
        </div>
        <div className="contact-hero-actions">
          <Link href={siteContact.lineHref} className="site-primary-btn" target="_blank" rel="noopener noreferrer">{content.cta}</Link>
          <Link href={siteContact.mapHref} className="site-secondary-btn" target="_blank" rel="noopener noreferrer">
            {locale === "th" ? "เปิดแผนที่" : "Open map"}
          </Link>
        </div>
      </section>

      <div className="site-contact-grid contact-card-grid">
        {contactCards.map(([title, value, detail, href, cta]) => (
          <section className="site-contact-panel contact-channel-card" key={title}>
            <p className="site-eyebrow">{title}</p>
            <h2>{value}</h2>
            <p>{detail}</p>
            <Link href={href} className="site-secondary-btn" target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined}>
              {cta}
            </Link>
          </section>
        ))}
      </div>

      <section className="contact-service-panel">
        <div>
          <p className="site-eyebrow">{locale === "th" ? "ข้อมูลที่สอบถามได้" : "What You Can Ask"}</p>
          <h2>{locale === "th" ? "รวมช่องทางสำหรับนักตกปลาที่ต้องการมาใช้บริการ" : "Helpful contact topics for anglers"}</h2>
          <p>
            {locale === "th"
              ? "หน้านี้ออกแบบให้ค้นหาและติดต่อได้ง่าย ทั้งคำค้นบ่อตกปลาพะเยา บ่อตกปลาดอกคำใต้ รอบลงปลา ผลงานปลา อันดับนักตกปลา และเส้นทางไปบ่อ"
              : "This page is structured for anglers looking for a fishing lake in Phayao, fish releases, catch rankings, gallery records, and directions."}
          </p>
        </div>
        <ul>
          {serviceList.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section className="site-map-panel">
        <div className="site-map-copy">
          <p className="site-eyebrow">{locale === "th" ? "Location" : "Location"}</p>
          <h2>{locale === "th" ? "แผนที่ เคียงนา Fishing Lake พะเยา" : "Kiangna Fishing Lake Map"}</h2>
          <p>
            {locale === "th"
              ? "ตรวจสอบตำแหน่งและเส้นทางมายังบ่อตกปลาเคียงนาได้จากแผนที่ด้านล่าง หรือเปิดผ่าน Google Maps เพื่อใช้ระบบนำทาง"
              : "Use the embedded map below or open Google Maps for directions to the lake."}
          </p>
          <Link href={siteContact.mapHref} className="site-secondary-btn" target="_blank" rel="noopener noreferrer">
            {locale === "th" ? "เปิดใน Google Maps" : "Open in Google Maps"}
          </Link>
        </div>
        <iframe
          title={locale === "th" ? "แผนที่ เคียงนา Fishing Lake" : "Kiangna Fishing Lake Map"}
          src={siteContact.mapEmbedHref}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </section>

      <section className="site-section contact-faq-section">
        <div className="section-head">
          <p className="site-eyebrow">FAQ</p>
          <h2 className="h2">{locale === "th" ? "คำถามที่พบบ่อยก่อนติดต่อ" : "Contact FAQ"}</h2>
        </div>
        <div className="home-faq-list">
          {faqs.map(([question, answer]) => (
            <details className="home-faq-item" key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>
    </ContentPage>
  );
}

function ContentPage({
  locale,
  page,
  eyebrow,
  title,
  children,
}: {
  locale: Locale;
  page: SitePage;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <SiteChrome locale={locale} page={page}>
      <main className="site-content-page">
        <header className="site-page-head">
          <p className="site-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
        </header>
        {children}
      </main>
    </SiteChrome>
  );
}
