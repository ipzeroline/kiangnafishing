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
  species: string;
  weightKg: number;
  imagePath: string;
  createdAt: string;
};

async function getHomeRanking() {
  const mk = monthKeyBKK();
  return query<HomeRanking>(`
    SELECT u.name, u.memberCode,
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
    LIMIT 50
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
    ? ["บรรยากาศริมบ่อ", "ผลงานปลาใหญ่", "กิจกรรมลงปลา", "LINE Rich Menu"]
    : ["Lakeside Setting", "Trophy Catches", "Fish Release", "LINE Rich Menu"];

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
        <p>{locale === "th" ? "LINE OFFICIAL" : "LINE OFFICIAL"}</p>
        <strong>{locale === "th" ? "ดำเนินรายการผ่าน LINE อย่างเป็นระบบ" : "Structured customer service through LINE"}</strong>
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
            <p className="site-eyebrow">LINE Official Account</p>
            <h2>{locale === "th" ? "ธุรกรรมลูกค้าดำเนินผ่าน LINE Official Account" : "Customer transactions are managed through LINE Official Account"}</h2>
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
                  ["ลงปลา", "ติดตามรอบลงปลาและกิจกรรมหน้าบ่ออย่างเป็นทางการ"],
                  ["เครดิต", "เติมและตรวจสอบยอดผ่าน LINE OA เท่านั้น"],
                  ["อันดับ", "ติดตาม ranking และสิทธิรางวัลจากผลงานปลา"],
                  ["คูปอง", "รับสิทธิพิเศษและแลกรางวัลตามเงื่อนไขกิจกรรม"],
                  ["แกลลอรี่", "ภาพบรรยากาศ ผลงานปลาใหญ่ และช่วงเวลาประทับใจ"],
                  ["ติดต่อ", "สอบถามข้อมูล จองหมาย และติดต่อเจ้าหน้าที่ผ่าน LINE"],
                ]
              : [
                  ["Fish release", "Official release updates and lake activities"],
                  ["Credits", "Top up and check balances through LINE OA"],
                  ["Ranking", "Follow catch rankings and reward eligibility"],
                  ["Coupons", "Claim campaign privileges and reward coupons"],
                  ["Gallery", "Lake atmosphere, trophy catches, and memorable moments"],
                  ["Contact", "Ask questions, reserve spots, and contact admin through LINE"],
                ]
            ).map(([title, detail], index) => (
              <article className="cat-card" key={title}>
                <div className="cat-card-header">
                  <span className="dot" data-index={index + 1} />
                  <h3>{title}</h3>
                </div>
                <p>{detail}</p>
              </article>
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
              return (
              <article key={row.memberCode} className={index === 0 ? "rank-card rank-card-leader" : "rank-card"}>
                <span>{index + 1}</span>
                <div>
                  <h3>{row.name}</h3>
                  <p>{row.detail || row.memberCode}</p>
                  {level && <RankingLevelBadge level={level} size="sm" />}
                </div>
                <strong>{Number(row.value).toLocaleString(locale === "th" ? "th-TH" : "en-US")} kg</strong>
              </article>
              );
            })}
          </div>
          <div className="center mt-lg">
            <Link href="/ranking" className="site-secondary-btn">{locale === "th" ? "ดูอันดับทั้งหมด" : "View full ranking"}</Link>
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
    ? "รวมบทความสำหรับการเตรียมตัวก่อนเข้าใช้บริการ การใช้งาน LINE Official Account ระบบอันดับ เครดิต และแนวทางทำรายการอย่างปลอดภัย"
    : "Guides for lake preparation, LINE Official Account usage, rankings, credits, and secure customer transactions.";

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

export function GallerySitePage({ locale }: { locale: Locale }) {
  const content = siteContent[locale];
  return (
    <ContentPage locale={locale} page="gallery" eyebrow="Gallery" title={content.sections.galleryTitle}>
      <div className="site-gallery-grid">
        {galleryItems[locale].map((item, index) => (
          <figure key={item} className={`site-gallery-item item-${index + 1}`}>
            <div aria-hidden="true" />
            <figcaption>{item}</figcaption>
          </figure>
        ))}
      </div>
    </ContentPage>
  );
}

export function AboutSitePage({ locale }: { locale: Locale }) {
  const content = siteContent[locale];
  const points = locale === "th"
    ? ["ธุรกรรมลูกค้าดำเนินผ่าน LINE Official Account", "เจ้าหน้าที่ทำงานผ่านระบบหลังบ้านตามสิทธิ์ที่กำหนด", "รายการเครดิต แต้ม คูปอง และผลงานปลา ตรวจสอบย้อนหลังได้"]
    : ["Customer transactions are managed through LINE Official Account", "Role-based staff backend access", "Auditable credits, points, coupons, and catch records"];

  return (
    <ContentPage locale={locale} page="about" eyebrow="About" title={content.sections.aboutTitle}>
      <div className="site-about-layout">
        <LakeVisual locale={locale} />
        <div className="site-about-copy">
          <p>
            {locale === "th"
              ? "เคียงนา Fishing Lake ออกแบบให้ลูกค้าดำเนินรายการผ่าน LINE Official Account และให้ทีมงานควบคุมข้อมูลสำคัญผ่านระบบหลังบ้านเดียวกัน เพื่อให้การให้บริการหน้าบ่อรวดเร็ว โปร่งใส และตรวจสอบได้"
              : "Kiangna Fishing Lake is designed around a LINE-only customer journey and a controlled backend for staff, making lake operations faster, clearer, and easier to audit."}
          </p>
          <ul>
            {points.map((point) => <li key={point}>{point}</li>)}
          </ul>
        </div>
      </div>
    </ContentPage>
  );
}

export function ContactSitePage({ locale }: { locale: Locale }) {
  const content = siteContent[locale];
  return (
    <ContentPage locale={locale} page="contact" eyebrow="Contact" title={content.sections.contactTitle}>
      <div className="site-contact-grid">
        <section className="site-contact-panel">
          <h2>LINE Official Account</h2>
          <p>{siteContact.lineId}</p>
          <Link href={siteContact.lineHref} className="site-primary-btn">{content.cta}</Link>
        </section>
        <section className="site-contact-panel">
          <h2>{locale === "th" ? "โทรศัพท์" : "Phone"}</h2>
          <p><a href={siteContact.phoneHref}>{siteContact.phone}</a></p>
          <h2>{locale === "th" ? "อีเมล" : "Email"}</h2>
          <p><a href={siteContact.emailHref}>{siteContact.email}</a></p>
        </section>
        <section className="site-contact-panel">
          <h2>{locale === "th" ? "เมนู LINE สำหรับลูกค้า" : "LINE customer menu"}</h2>
          <p>
            {locale === "th"
              ? "QR เข้าบ่อ การเติมเครดิต การส่งผลงานปลา การดูอันดับ และการติดต่อเจ้าหน้าที่ ดำเนินการผ่าน Rich Menu ใน LINE Official Account"
              : "Entry QR, top-ups, catch submissions, rankings, and admin contact are handled through the LINE Official Account Rich Menu."}
          </p>
        </section>
      </div>
      <section className="site-map-panel">
        <div className="site-map-copy">
          <p className="site-eyebrow">{locale === "th" ? "Location" : "Location"}</p>
          <h2>{locale === "th" ? "แผนที่ เคียงนา Fishing Lake" : "Kiangna Fishing Lake Map"}</h2>
          <p>
            {locale === "th"
              ? "ตรวจสอบตำแหน่งและเส้นทางมายังบ่อได้จากแผนที่ด้านล่าง หรือเปิดผ่าน Google Maps เพื่อใช้ระบบนำทาง"
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
