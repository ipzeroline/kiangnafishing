import type { Metadata } from "next";
import { siteOgImage, siteUrl } from "@/lib/site";
import SiteChrome from "@/components/site/SiteChrome";

const steps = [
  {
    eyebrow: "เริ่มต้น",
    title: "เพิ่มเพื่อน LINE",
    body: "กดเพิ่มเพื่อนจากหน้าเว็บไซต์หรือค้นหา LINE ID: @038gyaxo เพื่อใช้งานบริการสมาชิก",
    visual: "friend",
  },
  {
    eyebrow: "เข้าบ่อ",
    title: "เปิด QR เข้าบ่อ",
    body: "ก่อนเข้าใช้บริการ ให้เปิดเมนู QR เข้าบ่อ แล้วแสดงหน้าจอให้เจ้าหน้าที่สแกน",
    visual: "qr",
  },
  {
    eyebrow: "เครดิต",
    title: "เติมเครดิตและดูประวัติ",
    body: "เลือกยอดเติมหรือกรอกจำนวนเอง ส่งคำขอแล้วรอเจ้าหน้าที่ตรวจสอบ จากนั้นดูยอดและประวัติได้ในหน้ารายละเอียด",
    visual: "wallet",
  },
  {
    eyebrow: "ผลงาน",
    title: "ส่งผลงานปลา",
    body: "เลือกรูปปลา กรอกชนิดปลาและน้ำหนัก เจ้าหน้าที่จะตรวจสอบก่อนนำไปแสดงในอันดับหรืออัลบั้ม",
    visual: "catch",
  },
  {
    eyebrow: "อันดับ",
    title: "ดูอันดับนักตกปลา",
    body: "ติดตามอันดับประจำเดือน แยกตามประเภทกระดาน พร้อมดูอันดับของตัวเองเมื่อมีผลงานที่ยืนยันแล้ว",
    visual: "ranking",
  },
  {
    eyebrow: "ข้อมูลบ่อ",
    title: "ตารางลงปลาและติดต่อทีมงาน",
    body: "ดูรอบลงปลาล่าสุด จำนวนปลา น้ำหนักรวม และติดต่อทีมงานเพื่อสอบถามรอบที่เหมาะกับการเข้าบ่อ",
    visual: "stocking",
  },
];

const title = "คู่มือใช้งาน LINE เคียงนา Fishing Lake | QR เข้าบ่อ เติมเครดิต ส่งผลงาน";
const description =
  "คู่มือใช้งานระบบ LINE ของเคียงนา Fishing Lake สำหรับสมาชิก วิธีเพิ่มเพื่อน เปิด QR เข้าบ่อ เติมเครดิต ดูประวัติ ส่งผลงานปลา ดูอันดับ ตารางลงปลา และติดต่อทีมงาน";
const canonical = `${siteUrl}/line-guide`;
const systemLineId = "@038gyaxo";
const systemLineHref = "https://line.me/R/ti/p/@038gyaxo";

export const metadata: Metadata = {
  title,
  description,
  applicationName: "เคียงนา Fishing Lake",
  authors: [{ name: "เคียงนา Fishing Lake" }],
  creator: "เคียงนา Fishing Lake",
  publisher: "เคียงนา Fishing Lake",
  category: "LINE Service Guide",
  keywords: [
    "คู่มือใช้งาน LINE เคียงนา Fishing Lake",
    "วิธีใช้ LINE บ่อตกปลา",
    "QR เข้าบ่อ",
    "เติมเครดิต LINE",
    "ส่งผลงานปลา",
    "อันดับนักตกปลา",
    "ตารางลงปลา",
    "บ่อตกปลาพะเยา",
    "เคียงนา Fishing Lake",
    "kiangnafishinglake",
  ],
  alternates: {
    canonical,
  },
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
  openGraph: {
    title,
    description,
    url: canonical,
    siteName: "เคียงนา Fishing Lake",
    locale: "th_TH",
    type: "article",
    images: [
      {
        url: siteOgImage,
        width: 1200,
        height: 900,
        alt: "คู่มือใช้งาน LINE เคียงนา Fishing Lake",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [siteOgImage],
  },
};

export default function LineGuidePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: title,
        description,
        inLanguage: "th-TH",
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#business` },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: siteOgImage,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "หน้าแรก", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "คู่มือใช้งาน LINE", item: canonical },
        ],
      },
      {
        "@type": "HowTo",
        "@id": `${canonical}#howto`,
        name: "วิธีใช้งานระบบ LINE เคียงนา Fishing Lake",
        description,
        totalTime: "PT5M",
        step: steps.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: step.title,
          text: step.body,
          url: `${canonical}#step-${index + 1}`,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${canonical}#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "ใช้ LINE ทำอะไรได้บ้างที่เคียงนา Fishing Lake",
            acceptedAnswer: {
              "@type": "Answer",
              text: "สมาชิกใช้ LINE เพื่อเปิด QR เข้าบ่อ เติมเครดิต ดูประวัติ ส่งผลงานปลา ดูอันดับ ติดตามตารางลงปลา และติดต่อทีมงาน",
            },
          },
          {
            "@type": "Question",
            name: "ต้องเข้าสู่ระบบเว็บไซต์หรือไม่",
            acceptedAnswer: {
              "@type": "Answer",
              text: "รายการสมาชิกหลักทำผ่าน LINE เพื่อให้ข้อมูลผูกกับบัญชีสมาชิกเดียวกันและให้เจ้าหน้าที่ตรวจสอบได้",
            },
          },
        ],
      },
    ],
  };

  return (
    <SiteChrome locale="th" page="about">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="site-content-page site-about-page">
        <header className="site-page-head site-about-head">
          <div className="site-about-head-copy">
            <p className="site-eyebrow">คู่มือ LINE</p>
            <h1>คู่มือใช้งานระบบ LINE เคียงนา Fishing Lake</h1>
            <p>
              เรียนรู้วิธีใช้ LINE ระบบสำหรับ QR เข้าบ่อ เติมเครดิต ดูประวัติ ส่งผลงานปลา ดูอันดับ และติดตามตารางลงปลา
            </p>
          </div>
          <div className="site-about-head-meta" aria-label="สรุปคู่มือ LINE">
            <span><strong>QR</strong> เข้าบ่อ</span>
            <span><strong>เครดิต</strong> และประวัติ</span>
            <span><strong>ผลงาน</strong> และอันดับ</span>
          </div>
        </header>

        <section className="about-system-panel">
          <div>
            <p className="site-eyebrow">LINE ระบบ เคียงนา Fishing Lake</p>
            <h2>{systemLineId}</h2>
            <p>
              ใช้สำหรับเปิดเมนูบริการสมาชิก เช่น QR เข้าบ่อ เติมเครดิต ส่งผลงานปลา ดูอันดับ ตารางลงปลา และติดต่อทีมงาน
            </p>
          </div>
          <div>
            <a href={systemLineHref} target="_blank" rel="noopener noreferrer" className="site-primary-btn">
              เพิ่มเพื่อน LINE ระบบ
            </a>
            <p className="mt-3 text-sm text-dim">หากเปิดจากมือถือ ลิงก์จะพาไปเพิ่มเพื่อนในแอป LINE</p>
          </div>
        </section>

        <section className="about-proof-grid" aria-label="บริการหลักใน LINE">
          {[
            ["QR เข้าบ่อ", "เปิด QR จาก LINE ระบบ แล้วให้เจ้าหน้าที่สแกนเพื่อบันทึกการเข้าใช้บริการ"],
            ["เติมเครดิต", "เลือกยอดเติมหรือกรอกจำนวนเอง จากนั้นรอเจ้าหน้าที่ตรวจสอบและอนุมัติ"],
            ["ส่งผลงานปลา", "อัปโหลดรูปปลา เลือกชนิดปลา กรอกน้ำหนัก แล้วรอการตรวจสอบก่อนขึ้นอันดับ"],
          ].map(([itemTitle, detail]) => (
            <article key={itemTitle}>
              <h2>{itemTitle}</h2>
              <p>{detail}</p>
            </article>
          ))}
        </section>

        <section className="site-section site-section-tight">
          <div className="section-head">
            <p className="site-eyebrow">ขั้นตอนการใช้งาน</p>
            <h2 className="h2">เริ่มใช้งานระบบ LINE ในไม่กี่ขั้นตอน</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {steps.map((step, index) => (
            <article id={`step-${index + 1}`} key={step.title} className="scroll-mt-4 overflow-hidden rounded-card bg-white shadow-sm ring-1 ring-line">
              <GuideVisual kind={step.visual} index={index + 1} />
              <div className="p-5">
                <p className="site-eyebrow">{step.eyebrow}</p>
                <h2 className="mt-2 font-display text-xl font-semibold text-deep">{index + 1}. {step.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-dim">{step.body}</p>
                {index === 0 ? (
                  <a
                    href={systemLineHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-pond px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-deep"
                  >
                    เพิ่มเพื่อน LINE ระบบ
                  </a>
                ) : null}
              </div>
            </article>
          ))}
          </div>
        </section>

        <section className="home-faq-list about-faq" aria-label="คำถามที่พบบ่อย">
          {[
            ["หน้านี้เปิดผ่านเว็บได้ไหม", "ได้ หน้านี้เป็นคู่มือบนเว็บไซต์สำหรับอ่านวิธีใช้งานและเพิ่มเพื่อน LINE ระบบ"],
            ["หน้าระบบสมาชิกเปิดผ่าน browser ได้ไหม", "ไม่ได้ หน้าระบบสมาชิก เช่น QR เข้าบ่อ เติมเครดิต และส่งผลงานปลา ถูกออกแบบให้ใช้งานผ่าน LINE เท่านั้น"],
            ["ติดต่อทีมงานได้ทางไหน", `เพิ่มเพื่อน LINE ระบบ ${systemLineId} หรือเปิดหน้าติดต่อบนเว็บไซต์เพื่อดูโทรศัพท์ แผนที่ และช่องทางอื่น`],
          ].map(([question, answer]) => (
            <details key={question} className="home-faq-item">
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
            ))}
        </section>
      </main>
    </SiteChrome>
  );
}

function GuideVisual({ kind, index }: { kind: string; index: number }) {
  const title: Record<string, string> = {
    friend: "LINE",
    qr: "CHECK-IN",
    wallet: "WALLET",
    catch: "CATCH",
    ranking: "RANKING",
    stocking: "STOCK",
  };

  return (
    <div className="bg-[#e9f1ee] p-4">
      <div className="mx-auto max-w-[260px] rounded-[28px] bg-deep p-2 shadow-sm">
        <div className="rounded-[22px] bg-white p-3">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-pond/10 px-2 py-1 text-[10px] font-bold text-pond">{title[kind]}</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mist text-xs font-bold text-deep">{index}</span>
          </div>
          <div className="mt-3">
            {kind === "qr" ? (
              <div className="mx-auto grid h-28 w-28 grid-cols-5 gap-1 rounded-xl bg-mist p-2">
                {Array.from({ length: 25 }).map((_, i) => (
                  <span key={i} className={(i + index) % 3 === 0 || i % 7 === 0 ? "rounded-sm bg-deep" : "rounded-sm bg-white"} />
                ))}
              </div>
            ) : kind === "ranking" ? (
              <div className="space-y-2">
                {[1, 2, 3].map((rank) => (
                  <div key={rank} className="flex items-center gap-2 rounded-xl bg-mist p-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pond text-xs font-bold text-white">{rank}</span>
                    <span className="h-2 flex-1 rounded-full bg-line" />
                    <span className="h-2 w-8 rounded-full bg-gold" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="h-24 rounded-xl bg-mist" />
                <div className="grid grid-cols-2 gap-2">
                  <span className="h-9 rounded-xl bg-pond/15" />
                  <span className="h-9 rounded-xl bg-gold/20" />
                </div>
              </div>
            )}
          </div>
          <div className="mt-3 h-3 rounded-full bg-mist" />
        </div>
      </div>
    </div>
  );
}
