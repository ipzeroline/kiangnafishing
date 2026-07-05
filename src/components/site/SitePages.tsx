import Link from "next/link";
import SiteChrome from "./SiteChrome";
import ArticleBrowser from "./ArticleBrowser";
import ArticleViewTracker from "./ArticleViewTracker";
import { Locale, SitePage, articleItems, articlePath, galleryItems, homeSeoContent, latestArticleItems, newsItems, pagePaths, siteContact, siteContent, siteUrl, type ArticleItem, type ArticleViewMap } from "@/lib/site";
import { query, queryOne, type RankingLevel } from "@/lib/db";
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

type PublicFishStocking = {
  id: string;
  imagePath: string;
  species: string;
  fishCount: number;
  totalWeightKg: number;
  detail: string;
  stockingDate: string;
  createdAt: string;
};

function ArticleCover({ article, index, locale, large = false }: { article: ArticleItem; index: number; locale: Locale; large?: boolean }) {
  const coverNumber = String((index % 10) + 1);
  const label = locale === "th" ? "คู่มือตกปลา" : "Fishing Guide";

  return (
    <div className={large ? "article-cover article-cover-large" : "article-cover"} data-cover={coverNumber} aria-label={article.alt}>
      <div className="article-cover-mark" aria-hidden="true">
        <svg viewBox="0 0 28 28">
          <path d="M4 15.5c5.4-5.5 11.6-5.5 18 0-6.4 5.5-12.6 5.5-18 0Z" />
          <path d="M21.5 15.5 25 12v7l-3.5-3.5Z" />
          <circle cx="9.2" cy="14.5" r="1.15" />
        </svg>
      </div>
      <div>
        <p>{label}</p>
        <strong>{article.keywords[0]}</strong>
        <span>{article.keywords.slice(1).join(" / ")}</span>
      </div>
    </div>
  );
}

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

async function getPublicFishStockings() {
  return query<PublicFishStocking>(`
    SELECT id, imagePath, species, fishCount, totalWeightKg, detail, stockingDate, createdAt
    FROM fish_stockings
    ORDER BY stockingDate DESC, createdAt DESC
    LIMIT 24
  `);
}

async function getArticleViews(): Promise<ArticleViewMap> {
  const rows = await query<{ slug: string; viewCount: number }>("SELECT slug, viewCount FROM article_views");
  return Object.fromEntries(rows.map((row) => [row.slug, Number(row.viewCount || 0)]));
}

async function getArticleViewCount(slug: string) {
  const row = await queryOne<{ viewCount: number }>("SELECT viewCount FROM article_views WHERE slug=? LIMIT 1", [slug]);
  return Number(row?.viewCount || 0);
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
      image: "/site/kiangna-lake-aerial-01.jpg",
      title: locale === "th" ? "มุมมองบ่อหลักจากมุมสูง" : "Main lake aerial view",
      detail: locale === "th" ? "พื้นที่บ่อกว้าง พร้อมเส้นทางเข้าถึงสะดวก" : "A spacious lake area with convenient access routes",
    },
    {
      image: "/site/kiangna-lake-aerial-02.jpg",
      title: locale === "th" ? "บรรยากาศกลางทุ่งพะเยา" : "Countryside setting in Phayao",
      detail: locale === "th" ? "บรรยากาศเปิดโล่ง เหมาะสำหรับวันพักผ่อนและกิจกรรมตกปลา" : "An open natural setting for fishing sessions and relaxed visits",
    },
    {
      image: "/site/kiangna-lake-view-03.jpg",
      title: locale === "th" ? "พื้นที่ตกปลาริมน้ำ" : "Lakeside fishing area",
      detail: locale === "th" ? "วิวริมน้ำและธรรมชาติรอบบ่อสำหรับประสบการณ์ตกปลาพรีเมียม" : "Lakeside views and natural surroundings for a premium fishing experience",
    },
  ];

  return (
    <div className="lake-hero-slider" aria-label={locale === "th" ? "ภาพบรรยากาศเคียงนา Fishing Lake" : "Kiangna Fishing Lake atmosphere"}>
      {slides.map((slide, index) => (
        <figure key={slide.image} className="lake-hero-slide" style={{ ["--slide-index" as string]: index }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slide.image}
            alt={slide.title}
            width={1200}
            height={899}
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "low"}
            decoding={index === 0 ? "sync" : "async"}
          />
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

function ContactChannelIcon({ title }: { title: string }) {
  const key = title.toLowerCase();
  if (key === "facebook") {
    return (
      <span className="contact-channel-icon contact-channel-icon-facebook" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M14.2 8.1h2.2V4.4a29 29 0 0 0-3.2-.2c-3.2 0-5.4 2-5.4 5.6V13H4.4v4.2h3.4V24h4.2v-6.8h3.3l.5-4.2H12V10.2c0-1.2.3-2.1 2.2-2.1Z" />
        </svg>
      </span>
    );
  }
  if (key === "tiktok") {
    return (
      <span className="contact-channel-icon contact-channel-icon-tiktok" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M16.7 3c.4 2.7 1.9 4.4 4.3 4.6v4.1a8.2 8.2 0 0 1-4.2-1.2v5.7c0 4.3-2.7 6.8-6.5 6.8-3.4 0-6.2-2.5-6.2-5.9 0-3.9 3-6.3 7-5.8v4.3c-1.7-.5-2.9.3-2.9 1.6 0 1.1.9 1.8 2 1.8 1.4 0 2.3-.8 2.3-2.8V3h4.2Z" />
        </svg>
      </span>
    );
  }
  if (key === "instagram") {
    return (
      <span className="contact-channel-icon contact-channel-icon-instagram" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M7.2 2h9.6A5.2 5.2 0 0 1 22 7.2v9.6a5.2 5.2 0 0 1-5.2 5.2H7.2A5.2 5.2 0 0 1 2 16.8V7.2A5.2 5.2 0 0 1 7.2 2Zm0 2.1a3.1 3.1 0 0 0-3.1 3.1v9.6a3.1 3.1 0 0 0 3.1 3.1h9.6a3.1 3.1 0 0 0 3.1-3.1V7.2a3.1 3.1 0 0 0-3.1-3.1H7.2Zm4.8 3.6a4.3 4.3 0 1 1 0 8.6 4.3 4.3 0 0 1 0-8.6Zm0 2.1a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4Zm5.1-2.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
        </svg>
      </span>
    );
  }
  return null;
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
  const latestArticles = latestArticleItems(locale).slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `${siteUrl}/#business`,
        name: content.brand,
        url: `${siteUrl}${pagePaths.home[locale]}`,
        telephone: siteContact.phone,
        email: siteContact.email,
        image: [
          `${siteUrl}/site/kiangna-lake-aerial-01.jpg`,
          `${siteUrl}/site/kiangna-lake-aerial-02.jpg`,
          `${siteUrl}/site/kiangna-lake-view-03.jpg`,
        ],
        sameAs: [siteContact.lineHref, siteContact.facebookHref, siteContact.instagramHref, siteContact.tiktokHref, siteContact.mapHref],
        description: content.pages.home.description,
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
            <p className="site-eyebrow">{locale === "th" ? "แดชบอร์ดหน้าบ่อ" : "Live Lake Dashboard"}</p>
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
            <p className="site-eyebrow">{locale === "th" ? "จุดเด่นบริการ" : "Service Highlights"}</p>
            <h2 className="h2">{locale === "th" ? "บริการสำคัญสำหรับนักตกปลา" : "Key services for anglers"}</h2>
          </div>
          <div className="cat-grid">
            {(locale === "th"
              ? [
                  ["ลงปลา", "ดูตารางการลงปลาพร้อมรูป ชนิดปลา จำนวนตัว น้ำหนักรวม และวันที่ล่าสุด", pagePaths.fishStocking[locale]],
                  ["เครดิต", "ดูวิธีเติมเครดิต ตรวจสอบยอด และใช้งานกระเป๋าเงินผ่าน LINE", pagePaths.articles[locale]],
                  ["อันดับ", "ดูอันดับนักตกปลา น้ำหนักปลาใหญ่ และผลงานล่าสุด", "/rankings"],
                  ["คูปอง", "ดูสิทธิพิเศษ แต้มสะสม และการแลกรางวัลสำหรับสมาชิก", pagePaths.news[locale]],
                  ["แกลลอรี่", "ชมรูปผลงานปลาใหญ่และบรรยากาศบ่อตกปลาเคียงนา", pagePaths.gallery[locale]],
                  ["ติดต่อ", "สอบถามข้อมูล จองหมาย และติดต่อเจ้าหน้าที่ผ่าน LINE", pagePaths.contact[locale]],
                ]
              : [
                  ["Fish release", "View official release records with photos, species, fish count, total weight, and dates", pagePaths.fishStocking[locale]],
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
            <p className="site-eyebrow">{locale === "th" ? "อันดับนักตกปลา" : "Ranking"}</p>
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
                    <img src={row.linePictureUrl} alt={row.name} className="rank-avatar" loading="lazy" decoding="async" />
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
            <p className="site-eyebrow">{locale === "th" ? "ข่าวสารและกิจกรรม" : "News & Events"}</p>
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
            <p className="site-eyebrow">{locale === "th" ? "บทความล่าสุด" : "Latest Articles"}</p>
            <h2 className="h2">{locale === "th" ? "ความรู้ตกปลาล่าสุด" : "Latest fishing knowledge"}</h2>
          </div>
          <div className="article-grid article-grid-featured">
            {latestArticles.map((article, index) => (
              <Link key={article.slug} href={articlePath(locale, article.slug)} className="article-card" aria-label={article.title}>
                <ArticleCover article={article} index={index} locale={locale} />
                <div className="article-card-body">
                  <p>{String(index + 1).padStart(2, "0")}</p>
                  <h2>{article.title}</h2>
                  <span>{article.detail}</span>
                  <div className="article-tags" aria-label={locale === "th" ? "คีย์เวิร์ดบทความ" : "Article keywords"}>
                    {article.keywords.map((keyword) => <b key={keyword}>{keyword}</b>)}
                  </div>
                </div>
                <span className="article-readmore">{locale === "th" ? "อ่านบทความ" : "Read article"}</span>
              </Link>
            ))}
          </div>
          <div className="center mt-lg">
            <Link href={pagePaths.articles[locale]} className="site-secondary-btn">{locale === "th" ? "ดูบทความทั้งหมด" : "View all articles"}</Link>
          </div>
        </section>

        <section className="site-section site-section-tight">
          <div className="section-head">
            <p className="site-eyebrow">{locale === "th" ? "แกลลอรี่" : "Gallery"}</p>
            <h2 className="h2">{locale === "th" ? "แกลลอรี่ล่าสุด" : "Latest gallery"}</h2>
          </div>
          <div className="home-gallery-grid">
            {displayGallery.map((item) => (
              <figure key={item.id} className="home-gallery-card">
                <div className="home-gallery-art">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imagePath || "/fish-placeholder.svg"}
                    alt={locale === "th"
                      ? `${item.species} ${item.weightKg > 0 ? `${Number(item.weightKg).toLocaleString("th-TH")} กิโลกรัม` : ""} ที่เคียงนา Fishing Lake`
                      : `${item.species} ${item.weightKg > 0 ? `${Number(item.weightKg).toLocaleString("en-US")} kg` : ""} at Kiangna Fishing Lake`}
                    width={640}
                    height={416}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
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
            <p className="site-eyebrow">{locale === "th" ? "คำถามที่พบบ่อย" : "FAQ"}</p>
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
    <ContentPage locale={locale} page="news" eyebrow={locale === "th" ? "ข่าวสาร" : "Updates"} title={content.sections.newsTitle}>
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

export async function ArticlesSitePage({ locale }: { locale: Locale }) {
  const content = siteContent[locale];
  const articles = latestArticleItems(locale);
  const viewCounts = await getArticleViews();
  const title = locale === "th"
    ? "บทความบ่อตกปลาในพะเยา ดอกคำใต้ และเทคนิคตกปลาใหญ่"
    : "Fishing Lake Articles, Phayao Guides, and Trophy Fishing Tips";
  const intro = locale === "th"
    ? "รวมบทความสำหรับคนที่กำลังค้นหาบ่อตกปลาในพะเยา บ่อตกปลาดอกคำใต้ บ่อตกปลาใหญ่พะเยา เทคนิคตกปลา ตารางลงปลา ระบบ LINE และการส่งผลงานปลาที่เคียงนา Fishing Lake"
    : "Guides for anglers searching for a fishing lake in Phayao, Dok Kham Tai trophy fishing, LINE service, fish release schedules, and verified catch records at Kiangna Fishing Lake.";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${siteUrl}${pagePaths.articles[locale]}#articles`,
    name: title,
    description: content.pages.articles.description,
    url: `${siteUrl}${pagePaths.articles[locale]}`,
    inLanguage: locale === "th" ? "th-TH" : "en-US",
    itemListElement: articles.map((article, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Article",
        headline: article.title,
        description: article.detail,
        image: `${siteUrl}${article.image}`,
        mainEntityOfPage: `${siteUrl}${articlePath(locale, article.slug)}`,
        interactionStatistic: {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/ReadAction",
          userInteractionCount: viewCounts[article.slug] || 0,
        },
        author: { "@type": "Organization", name: content.brand },
        publisher: { "@type": "Organization", name: content.brand },
        keywords: article.keywords.join(", "),
      },
    })),
  };

  return (
    <ContentPage locale={locale} page="articles" eyebrow={locale === "th" ? "บทความ" : "Articles"} title={title}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="site-page-intro">{intro}</p>
      <ArticleBrowser locale={locale} articles={articles} viewCounts={viewCounts} />
    </ContentPage>
  );
}

function buildArticleSections(locale: Locale, article: ArticleItem) {
  const mainKeyword = article.keywords[0];
  const secondaryKeyword = article.keywords[1] || article.keywords[0];
  const localKeyword = article.keywords[2] || "Kiangna Fishing Lake";

  return locale === "th"
    ? [
        {
          heading: `ภาพรวมของ${mainKeyword}`,
          paragraphs: [
            `${article.detail} สิ่งสำคัญไม่ใช่แค่มีบ่อให้ตกปลา แต่ต้องดูทั้งบรรยากาศ ความสะดวก ข้อมูลรอบลงปลา การติดต่อทีมงาน และความชัดเจนของระบบบริการก่อนเดินทาง`,
            `เคียงนา Fishing Lake ช่วยให้นักตกปลาวางแผนง่ายขึ้น เพราะมีข้อมูลหน้าเว็บไซต์ ช่องทาง LINE ${siteContact.lineId} และระบบที่ช่วยจัดการ QR เข้าบ่อ เครดิต ผลงานปลา และอันดับอย่างเป็นระเบียบ`,
          ],
        },
        {
          heading: `ก่อนเลือก${secondaryKeyword}ควรตรวจอะไรบ้าง`,
          paragraphs: [
            "นักตกปลาควรดูเส้นทาง เวลาเปิดให้บริการ สภาพอากาศ ชนิดปลาที่ต้องการตก และข้อมูลตารางลงปลา หากต้องการลุ้นปลาใหญ่ ควรดูวันที่ลงปลา น้ำหนักรวม และผลงานที่ผ่านการตรวจสอบ",
            "อีกจุดที่ควรให้ความสำคัญคือช่องทางติดต่อที่รวดเร็ว บ่อที่มี LINE หรือระบบแจ้งข้อมูลชัดเจนจะช่วยลดความผิดพลาด เช่น การสอบถามรอบลงปลา การเช็กเครดิต และการส่งผลงานปลา",
          ],
        },
        {
          heading: `ทำไมระบบ LINE ช่วยให้${localKeyword}ใช้งานง่ายขึ้น`,
          paragraphs: [
            "การใช้ LINE เป็นศูนย์กลางทำให้ลูกค้าไม่ต้องจำรหัสผ่านบนเว็บไซต์ และลดขั้นตอนซ้ำซ้อน เมื่อต้องเข้าใช้บริการสามารถเปิด QR ให้เจ้าหน้าที่สแกน",
            "สำหรับบ่อตกปลายุคใหม่ ความโปร่งใสของข้อมูลมีผลต่อความเชื่อมั่น ระบบที่ตรวจสอบย้อนหลังได้ช่วยให้ทั้งลูกค้าและทีมงานดูรายการได้ชัดเจน",
          ],
        },
        {
          heading: "สรุปสำหรับนักตกปลาที่กำลังวางแผนมาเคียงนา",
          paragraphs: [
            `ถ้าคุณกำลังมองหา${mainKeyword} หรือเปรียบเทียบบ่อตกปลาในพื้นที่พะเยาและดอกคำใต้ ให้เริ่มจากดูข้อมูลบทความ ตารางลงปลา แกลลอรี่ผลงาน และติดต่อทีมงานผ่าน LINE ก่อนเดินทาง`,
            "เคียงนา Fishing Lake เหมาะกับคนที่อยากได้ประสบการณ์ตกปลาที่เป็นระบบ มีข้อมูลให้ตรวจสอบ และต้องการลุ้นผลงานปลาในบรรยากาศริมบ่อที่เดินทางสะดวก",
          ],
        },
      ]
    : [
        {
          heading: `Overview: ${mainKeyword}`,
          paragraphs: [
            `${article.detail} A good fishing lake experience depends on more than the water itself. Anglers should review the atmosphere, release updates, service channels, safety, and how clearly the lake communicates before visiting.`,
            `Kiangna Fishing Lake helps anglers plan with website information, LINE ${siteContact.lineId}, entry QR, credits, catch submissions, and ranking records organized in one practical workflow.`,
          ],
        },
        {
          heading: `What to Check Before Choosing ${secondaryKeyword}`,
          paragraphs: [
            "Review travel time, weather, target species, fish release dates, total release weight, and verified catch records. If your goal is trophy fishing, timing and verified release information matter.",
            "Fast contact also matters. A LINE-based service flow helps with release questions, credits, catch submissions, ranking updates, and special event information.",
          ],
        },
        {
          heading: `Why LINE Makes ${localKeyword} Easier`,
          paragraphs: [
            "LINE keeps customer actions simple. Anglers can show an entry QR, check credits, submit catches, and follow rankings without creating a separate website login.",
            "For a modern fishing lake, auditable records build trust. Verified catch submissions and clear ranking data help both anglers and staff keep activities fair and transparent.",
          ],
        },
        {
          heading: "Final Planning Tip",
          paragraphs: [
            "If you are comparing fishing lakes in Phayao or Dok Kham Tai, review the articles, fish release schedule, gallery, and contact the Kiangna team before your trip.",
            "Kiangna Fishing Lake is built for anglers who want a calm lake atmosphere, organized service, transparent records, and a better chance to plan serious fishing sessions.",
          ],
        },
      ];
}

export async function ArticleDetailPage({ locale, article }: { locale: Locale; article: ArticleItem }) {
  const content = siteContent[locale];
  const sections = buildArticleSections(locale, article);
  const articleIndex = articleItems[locale].findIndex((item) => item.slug === article.slug);
  const viewCount = await getArticleViewCount(article.slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${siteUrl}${articlePath(locale, article.slug)}#article`,
    headline: article.title,
    description: article.detail,
    image: `${siteUrl}${article.image}`,
    author: { "@type": "Organization", name: content.brand },
    publisher: { "@type": "Organization", name: content.brand },
    mainEntityOfPage: `${siteUrl}${articlePath(locale, article.slug)}`,
    inLanguage: locale === "th" ? "th-TH" : "en-US",
    keywords: article.keywords.join(", "),
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/ReadAction",
      userInteractionCount: viewCount,
    },
  };

  return (
    <SiteChrome locale={locale} page="articles" alternateHref={articlePath(locale === "th" ? "en" : "th", article.slug)}>
      <main className="site-content-page article-detail-page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <nav className="article-breadcrumb" aria-label={locale === "th" ? "เส้นทางหน้าเว็บ" : "Breadcrumb"}>
          <Link href={pagePaths.articles[locale]}>{locale === "th" ? "บทความ" : "Articles"}</Link>
          <span>{article.title}</span>
        </nav>
        <header className="site-page-head article-detail-head">
          <p className="site-eyebrow">{locale === "th" ? "คู่มือตกปลา" : "Fishing Guide"}</p>
          <h1>{article.title}</h1>
          <p>{article.detail}</p>
        </header>
        <ArticleCover article={article} index={articleIndex >= 0 ? articleIndex : 0} locale={locale} large />
        <div className="article-tags article-detail-tags" aria-label={locale === "th" ? "คีย์เวิร์ดบทความ" : "Article keywords"}>
          {article.keywords.map((keyword) => <b key={keyword}>{keyword}</b>)}
        </div>
        <ArticleViewTracker slug={article.slug} initialCount={viewCount} locale={locale} />
        <article className="article-detail-content">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}
        </article>
        <section className="article-detail-cta">
          <div>
            <h2>{locale === "th" ? "สอบถามรอบลงปลาและวางแผนเข้าบ่อ" : "Ask About Fish Releases and Plan Your Visit"}</h2>
            <p>
              {locale === "th"
                ? `ติดต่อเคียงนา Fishing Lake ผ่าน LINE ${siteContact.lineId} หรือโทร ${siteContact.phone} เพื่อสอบถามรอบลงปลา เครดิต กิจกรรม และข้อมูลก่อนเดินทาง`
                : `Contact Kiangna Fishing Lake via LINE ${siteContact.lineId} or phone ${siteContact.phone} for release rounds, credits, events, and visit planning.`}
            </p>
          </div>
          <Link href={pagePaths.contact[locale]}>{locale === "th" ? "ติดต่อเรา" : "Contact us"}</Link>
        </section>
      </main>
    </SiteChrome>
  );
}

export async function FishStockingSitePage({ locale }: { locale: Locale }) {
  const content = siteContent[locale];
  const rows = await getPublicFishStockings();
  const nf = new Intl.NumberFormat(locale === "th" ? "th-TH" : "en-US");
  const totalFish = rows.reduce((sum, item) => sum + Number(item.fishCount || 0), 0);
  const totalWeight = rows.reduce((sum, item) => sum + Number(item.totalWeightKg || 0), 0);
  const speciesCount = new Set(rows.map((item) => item.species)).size;
  const faqs = locale === "th"
    ? [
        ["ตารางการลงปลาอัปเดตจากที่ไหน", "เคียงนา Fishing Lake อัปเดตรายการลงปลาจากข้อมูลที่ทีมงานตรวจสอบแล้ว พร้อมรูปภาพ ชนิดปลา จำนวนตัว น้ำหนักรวม รายละเอียด และวันที่บนหน้านี้"],
        ["ควรใช้ตารางลงปลาเพื่อวางแผนอย่างไร", "ดูวันที่ลงปลา ชนิดปลา และน้ำหนักรวมประกอบกับข่าวสารกิจกรรม แล้วติดต่อ LINE @038gyaxo เพื่อสอบถามรอบที่เหมาะกับการเข้าบ่อ"],
        ["จำนวนปลาและน้ำหนักรวมหมายถึงอะไร", "จำนวนตัวคือจำนวนปลาที่ลงในรอบนั้น ส่วนน้ำหนักรวมเป็นกิโลกรัมรวมของรอบลงปลา ใช้เป็นข้อมูลประกอบการวางแผนเท่านั้น"],
      ]
    : [
        ["Where does the fish release schedule come from?", "Kiangna Fishing Lake publishes verified release updates with photos, species, fish count, total weight, details, and date."],
        ["How should anglers use this schedule?", "Review the release date, species, and total weight together with event news, then contact LINE @038gyaxo to plan the best visit."],
        ["What do fish count and total weight mean?", "Fish count is the number of fish released in that round. Total weight is the combined release weight in kilograms."],
      ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${siteUrl}${pagePaths.fishStocking[locale]}#webpage`,
        name: content.pages.fishStocking.title,
        description: content.pages.fishStocking.description,
        url: `${siteUrl}${pagePaths.fishStocking[locale]}`,
        inLanguage: locale === "th" ? "th-TH" : "en-US",
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#business` },
      },
      {
        "@type": "ItemList",
        "@id": `${siteUrl}${pagePaths.fishStocking[locale]}#release-list`,
        name: locale === "th" ? "รายการตารางการลงปลา" : "Fish release records",
        itemListElement: rows.slice(0, 12).map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Event",
            name: `${item.species} ${dateText(item.stockingDate, locale)}`,
            startDate: item.stockingDate,
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            eventStatus: "https://schema.org/EventScheduled",
            image: item.imagePath.startsWith("http") ? item.imagePath : `${siteUrl}${item.imagePath}`,
            location: { "@type": "Place", name: content.brand },
            description: item.detail || `${item.species} ${nf.format(Number(item.fishCount || 0))} fish, ${nf.format(Number(item.totalWeightKg || 0))} kg`,
          },
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}${pagePaths.fishStocking[locale]}#faq`,
        mainEntity: faqs.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };

  return (
    <SiteChrome locale={locale} page="fishStocking">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="fish-release-page">
        <section className="fish-release-hero">
          <div className="fish-release-hero-copy">
            <p className="site-eyebrow">{locale === "th" ? "ตารางลงปลาอย่างเป็นทางการ" : "Official Fish Release Schedule"}</p>
            <h1>{locale === "th" ? "ตารางการลงปลา เคียงนา Fishing Lake" : "Kiangna Fishing Lake Fish Release Schedule"}</h1>
            <p>
              {locale === "th"
                ? "ติดตามรอบลงปลาล่าสุด พร้อมรูปภาพ ชนิดปลา จำนวนตัว น้ำหนักรวม รายละเอียด และวันที่ลงปลา เพื่อวางแผนเข้าบ่อได้อย่างมั่นใจ"
                : "Review official fish release updates with photos, species, fish count, total weight, details, and release dates before planning your visit."}
            </p>
            <div className="site-hero-actions">
              <Link href={siteContact.lineHref} className="site-primary-btn" target="_blank" rel="noopener noreferrer">{content.cta}</Link>
              <Link href={pagePaths.contact[locale]} className="site-secondary-btn">{locale === "th" ? "สอบถามรอบลงปลา" : "Ask about releases"}</Link>
            </div>
            <div className="fish-release-hero-proof" aria-label={locale === "th" ? "ข้อมูลหลักของตารางลงปลา" : "Fish release highlights"}>
              <span>{locale === "th" ? "ข้อมูลอัปเดตจากทีมงาน" : "Verified lake updates"}</span>
              <span>{locale === "th" ? "อัปเดตตามวันที่ลงปลา" : "Sorted by release date"}</span>
              <span>{locale === "th" ? "รูปและน้ำหนักรวมครบ" : "Photos and total weight"}</span>
            </div>
          </div>
          <section className="fish-release-stats" aria-label={locale === "th" ? "สรุปตารางการลงปลา" : "Fish release summary"}>
            <article>
              <span>{locale === "th" ? "รายการเผยแพร่" : "Published rounds"}</span>
              <strong>{nf.format(rows.length)}</strong>
            </article>
            <article>
              <span>{locale === "th" ? "จำนวนปลารวม" : "Total fish"}</span>
              <strong>{nf.format(totalFish)}</strong>
            </article>
            <article>
              <span>{locale === "th" ? "น้ำหนักรวม" : "Total weight"}</span>
              <strong>{nf.format(totalWeight)} kg</strong>
            </article>
            <article>
              <span>{locale === "th" ? "ชนิดปลา" : "Species"}</span>
              <strong>{nf.format(speciesCount)}</strong>
            </article>
          </section>
        </section>

        <section className="site-section fish-release-section">
          <div className="section-head">
            <p className="site-eyebrow">{locale === "th" ? "ประวัติการลงปลา" : "Release Records"}</p>
            <h2 className="h2">{locale === "th" ? "รายการลงปลาล่าสุด" : "Latest fish releases"}</h2>
          </div>
          {rows.length > 0 ? (
            <div className="fish-release-grid">
              {rows.map((item, index) => (
                <article key={item.id} className={index === 0 ? "fish-release-card is-featured" : "fish-release-card"}>
                  <div className="fish-release-card-image">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imagePath}
                      alt={locale === "th" ? `ตารางการลงปลา ${item.species}` : `Fish release ${item.species}`}
                      width={760}
                      height={540}
                      loading={index < 2 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : "auto"}
                      decoding={index === 0 ? "sync" : "async"}
                    />
                  </div>
                  <div className="fish-release-card-body">
                    <div className="fish-release-card-top">
                      <span>{dateText(item.stockingDate, locale)}</span>
                      <b>{String(index + 1).padStart(2, "0")}</b>
                    </div>
                    <h2>{item.species}</h2>
                    <p>{item.detail || (locale === "th" ? "รายละเอียดรอบลงปลาจะอัปเดตจากเจ้าหน้าที่" : "Release details will be updated by staff.")}</p>
                    <dl>
                      <div>
                        <dt>{locale === "th" ? "จำนวนตัว" : "Fish count"}</dt>
                        <dd>{item.fishCount ? nf.format(Number(item.fishCount)) : "-"}</dd>
                      </div>
                      <div>
                        <dt>{locale === "th" ? "น้ำหนักรวม" : "Total weight"}</dt>
                        <dd>{item.totalWeightKg ? `${nf.format(Number(item.totalWeightKg))} kg` : "-"}</dd>
                      </div>
                    </dl>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="fish-release-empty">
              <p className="site-eyebrow">{locale === "th" ? "ยังไม่มีรายการลงปลา" : "No release updates yet"}</p>
              <h2>{locale === "th" ? "รอบลงปลาพร้อมรูปภาพและรายละเอียดจะแสดงที่นี่เมื่อมีการอัปเดต" : "Fish photos and release details will appear here when new updates are published."}</h2>
              <p>{locale === "th" ? "ติดตามหน้านี้หรือสอบถามทีมงานทาง LINE เพื่อรับข้อมูลรอบลงปลาล่าสุด" : "Follow this page or contact the team on LINE for the latest fish release information."}</p>
            </div>
          )}
        </section>

        <section className="site-section fish-release-seo-panel">
          <div>
            <p className="site-eyebrow">{locale === "th" ? "คู่มือวางแผน" : "Planning Guide"}</p>
            <h2>{locale === "th" ? "ใช้ตารางการลงปลาเพื่อวางแผนเข้าบ่ออย่างมืออาชีพ" : "Use the fish release schedule to plan a better visit"}</h2>
            <p>
              {locale === "th"
                ? "ตารางการลงปลาเป็นข้อมูลสำคัญสำหรับนักตกปลาที่ต้องการติดตามรอบปล่อยปลาใหญ่ กิจกรรมลงปลา และช่วงเวลาที่เหมาะกับการเข้าบ่อ รายการแต่ละรอบแสดงข้อมูลที่จำเป็นต่อการวางแผนอย่างชัดเจน"
                : "The fish release schedule helps anglers follow release rounds, fish species, total release weight, and relevant lake activity details before visiting Kiangna Fishing Lake."}
            </p>
          </div>
          <ul>
            {(locale === "th"
              ? ["ดูวันที่ลงปลาก่อนวางแผนเดินทาง", "เทียบชนิดปลาและน้ำหนักรวมของแต่ละรอบ", "ติดต่อ LINE เพื่อสอบถามช่วงเวลาที่เหมาะสม", "ติดตามข่าวสารและกิจกรรมประกอบรอบลงปลา"]
              : ["Check release dates before planning a trip", "Compare species and total release weight", "Contact LINE for suitable sessions", "Follow news and activities around release rounds"]
            ).map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        <section className="site-section site-section-tight">
          <div className="section-head">
            <p className="site-eyebrow">{locale === "th" ? "คำถามที่พบบ่อย" : "FAQ"}</p>
            <h2 className="h2">{locale === "th" ? "คำถามที่พบบ่อยเกี่ยวกับตารางการลงปลา" : "Fish release schedule FAQ"}</h2>
          </div>
          <div className="home-faq-list">
            {faqs.map(([question, answer]) => (
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
    <ContentPage locale={locale} page="gallery" eyebrow={locale === "th" ? "แกลลอรี่" : "Gallery"} title={content.sections.galleryTitle}>
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
                width={760}
                height={540}
                loading={index < 4 ? "eager" : "lazy"}
                decoding={index < 2 ? "sync" : "async"}
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
        ["Transparent operations", "Important member, payment, catch, report, and audit records are reviewed by the team for reliable service."],
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
        ["Are credits and points auditable?", "Credits, points, top-ups, and important actions are recorded for team review when customers need support."],
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
          url: `${siteUrl}/site/kiangna-lake-aerial-02.jpg`,
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
          `${siteUrl}/site/kiangna-lake-aerial-01.jpg`,
          `${siteUrl}/site/kiangna-lake-aerial-02.jpg`,
          `${siteUrl}/site/kiangna-lake-view-03.jpg`,
        ],
        sameAs: [siteContact.lineHref, siteContact.facebookHref, siteContact.instagramHref, siteContact.tiktokHref, siteContact.mapHref],
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
    <ContentPage locale={locale} page="about" eyebrow={locale === "th" ? "เกี่ยวกับเรา" : "About"} title={content.sections.aboutTitle}>
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
          <p className="site-eyebrow">{locale === "th" ? "บริการสมัยใหม่" : "Modern Service"}</p>
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
        ["Facebook", "Kiangna Fishing Lake", "ติดตามข่าวสาร รูปภาพ กิจกรรม และประกาศจากบ่อตกปลาเคียงนา", siteContact.facebookHref, "เปิด Facebook"],
        ["Instagram", "@kiangnafishinglake", "ติดตามภาพบรรยากาศริมบ่อ ผลงานปลา และโมเมนต์จากเคียงนา Fishing Lake", siteContact.instagramHref, "เปิด Instagram"],
        ["TikTok", "@kiangnafishinglake", "ชมคลิปบรรยากาศ กิจกรรม และผลงานปลาจากเคียงนา Fishing Lake", siteContact.tiktokHref, "เปิด TikTok"],
      ]
    : [
        ["LINE", siteContact.lineId, "Ask about fish releases, credits, entry QR, catch submissions, and staff support.", siteContact.lineHref, "Add LINE friend"],
        ["Phone", siteContact.phone, "Call for lake visits, spot reservations, and event information.", siteContact.phoneHref, "Call now"],
        ["Email", siteContact.email, "Send business questions, document requests, or detailed inquiries.", siteContact.emailHref, "Send email"],
        ["Facebook", "Kiangna Fishing Lake", "Follow news, photos, activities, and lake announcements.", siteContact.facebookHref, "Open Facebook"],
        ["Instagram", "@kiangnafishinglake", "Follow lakeside photos, catch highlights, and Kiangna Fishing Lake moments.", siteContact.instagramHref, "Open Instagram"],
        ["TikTok", "@kiangnafishinglake", "Watch lake moments, activities, and catch highlights.", siteContact.tiktokHref, "Open TikTok"],
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
        sameAs: [siteContact.lineHref, siteContact.facebookHref, siteContact.instagramHref, siteContact.tiktokHref, siteContact.mapHref],
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
    <ContentPage locale={locale} page="contact" eyebrow={locale === "th" ? "ติดต่อเรา" : "Contact"} title={content.sections.contactTitle}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }} />
      <section className="contact-hero-panel">
        <div>
          <p className="site-eyebrow">{locale === "th" ? "ช่องทางติดต่อเคียงนา Fishing Lake" : "Kiangna Fishing Lake Contact"}</p>
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
            <div className="contact-channel-heading">
              <ContactChannelIcon title={title} />
              <p className="site-eyebrow">{title}</p>
            </div>
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
          <p className="site-eyebrow">{locale === "th" ? "ที่ตั้ง" : "Location"}</p>
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
          <p className="site-eyebrow">{locale === "th" ? "คำถามที่พบบ่อย" : "FAQ"}</p>
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
