import type { Metadata } from "next";

export type Locale = "th" | "en";
export type SitePage = "home" | "news" | "articles" | "gallery" | "about" | "contact" | "privacy" | "terms";

export const siteUrl = "https://kiangnafishinglake.com";
export const siteContact = {
  phone: "062-229-3636",
  phoneHref: "tel:+66622293636",
  email: "kaingnagroup@gmail.com",
  emailHref: "mailto:kaingnagroup@gmail.com",
  lineId: "@038gyaxo",
  lineHref: "https://line.me/R/ti/p/@038gyaxo",
  mapHref: "https://share.google/e4aQCnRl4BfBwMNs1",
  mapEmbedHref: "https://www.google.com/maps?q=%E0%B9%80%E0%B8%84%E0%B8%B5%E0%B8%A2%E0%B8%87%E0%B8%99%E0%B8%B2%20Fishing%20Lake&output=embed",
};

export const locales: Record<Locale, { code: Locale; label: string; pathPrefix: string }> = {
  th: { code: "th", label: "TH", pathPrefix: "" },
  en: { code: "en", label: "EN", pathPrefix: "/en" },
};

export const pagePaths: Record<SitePage, Record<Locale, string>> = {
  home: { th: "/", en: "/en" },
  news: { th: "/news", en: "/en/news" },
  articles: { th: "/articles", en: "/en/articles" },
  gallery: { th: "/gallery", en: "/en/gallery" },
  about: { th: "/about", en: "/en/about" },
  contact: { th: "/contact", en: "/en/contact" },
  privacy: { th: "/privacy", en: "/en/privacy" },
  terms: { th: "/terms", en: "/en/terms" },
};

export const siteContent = {
  th: {
    brand: "เคียงนา Fishing Lake",
    nav: {
      home: "หน้าแรก",
      news: "ข่าวสาร/กิจกรรม",
      articles: "บทความ",
      gallery: "แกลลอรี่",
      about: "เกี่ยวกับเรา",
      contact: "ติดต่อเรา",
      admin: "เข้าสู่ระบบเจ้าหน้าที่",
    },
    cta: "เพิ่มเพื่อน LINE",
    lineId: siteContact.lineId,
    pages: {
      home: {
        title: "เคียงนา Fishing Lake | บ่อตกปลาพะเยา บ่อตกปลาดอกคำใต้",
        description:
          "เคียงนา Fishing Lake บ่อตกปลาพะเยาและบ่อตกปลาดอกคำใต้ บรรยากาศพรีเมียม รองรับกิจกรรมลงปลา ปลาใหญ่ เครดิต การส่งผลงานปลา และการติดตามอันดับผ่าน LINE",
      },
      news: {
        title: "ข่าวสารและกิจกรรม | เคียงนา Fishing Lake",
        description: "ติดตามกิจกรรมลงปลา อีเวนต์การแข่งขัน โปรโมชัน และข่าวสารล่าสุดของเคียงนา Fishing Lake",
      },
      articles: {
        title: "บทความตกปลา | เคียงนา Fishing Lake",
        description: "บทความความรู้ เทคนิคตกปลา การเตรียมตัวเข้าบ่อ การใช้งานเมนูบริการ และคำแนะนำสำหรับนักตกปลาที่เคียงนา Fishing Lake",
      },
      gallery: {
        title: "แกลลอรี่ผลงานปลา | บ่อตกปลาเคียงนา Fishing Lake พะเยา",
        description: "รวมรูปผลงานปลาที่ผ่านการตรวจสอบจากเคียงนา Fishing Lake บ่อตกปลาพะเยา พร้อมน้ำหนัก ชนิดปลา แคปชั่น และบรรยากาศความสำเร็จของนักตกปลา",
      },
      about: {
        title: "เกี่ยวกับเคียงนา Fishing Lake | บ่อตกปลาพะเยา ระบบทันสมัยใช้งานง่าย",
        description: "รู้จักเคียงนา Fishing Lake บ่อตกปลาพะเยาและดอกคำใต้ที่ออกแบบบริการให้ใช้งานง่ายและทันสมัย ครบทั้ง QR เข้าบ่อ เครดิต แต้ม ส่งผลงานปลา แกลลอรี่ และอันดับนักตกปลา",
      },
      contact: {
        title: "ติดต่อเรา | เคียงนา Fishing Lake",
        description: "ติดต่อ เคียงนา Fishing Lake โทร 062-229-3636 อีเมล kaingnagroup@gmail.com หรือ LINE @038gyaxo",
      },
      privacy: {
        title: "นโยบายความเป็นส่วนตัว | เคียงนา Fishing Lake",
        description: "นโยบายการเก็บ ใช้ และดูแลข้อมูลส่วนบุคคลของเคียงนา Fishing Lake สำหรับบริการผ่าน LINE",
      },
      terms: {
        title: "ข้อกำหนดและเงื่อนไข | เคียงนา Fishing Lake",
        description: "ข้อกำหนดการใช้บริการ กิจกรรม เครดิต คูปอง และการทำรายการผ่าน LINE",
      },
    },
    home: {
      eyebrow: "Premium Fishing Lake · บริการผ่าน LINE",
      headline: "ประสบการณ์ตกปลาพรีเมียม พร้อมบริการผ่าน LINE อย่างเป็นระบบ",
      intro:
        "เคียงนา Fishing Lake ออกแบบประสบการณ์หน้าบ่อให้สงบ สะดวก และตรวจสอบได้ โดยให้บริการสำคัญของลูกค้าดำเนินผ่าน LINE ตั้งแต่ QR เข้าบ่อ เครดิต การส่งผลงานปลา ไปจนถึงการติดตามอันดับ",
      primary: "เพิ่มเพื่อน LINE",
      secondary: "ติดต่อเรา",
      stats: [
        ["LINE Service", "ดำเนินรายการหลักผ่านเมนูบริการอย่างเป็นระบบ"],
        ["Premium Lake", "พื้นที่ตกปลาบรรยากาศสงบ พร้อมการดูแลอย่างมืออาชีพ"],
        ["Transparent", "เครดิต แต้ม รางวัล และผลงานปลา ตรวจสอบย้อนหลังได้"],
      ],
      features: [
        ["QR เข้าบ่อผ่าน LINE", "ลูกค้าไม่ต้องเข้าสู่ระบบบนเว็บไซต์ เพียงเปิด LINE แล้วแสดง QR ให้เจ้าหน้าที่สแกน"],
        ["เครดิตและแต้มใน LINE", "เติมเครดิต ตรวจสอบยอดคงเหลือ และติดตามประวัติรายการผ่านเมนูบริการ โดยข้อมูลผูกกับบัญชี LINE"],
        ["ส่งผลงานปลาและติดตามอันดับ", "ส่งผลงานปลา ติดตาม ranking และสิทธิรางวัลผ่าน LINE เพื่อให้ข้อมูลชัดเจนและลดความผิดพลาด"],
      ],
    },
    sections: {
      newsTitle: "ข่าวสารและกิจกรรมล่าสุด",
      galleryTitle: "บรรยากาศและผลงานปลา",
      aboutTitle: "บ่อตกปลาพะเยายุคใหม่ พร้อมระบบบริการที่ใช้งานง่าย",
      contactTitle: "ติดต่อและเริ่มใช้งาน",
    },
  },
  en: {
    brand: "Kiangna Fishing Lake",
    nav: {
      home: "Home",
      news: "News & Events",
      articles: "Articles",
      gallery: "Gallery",
      about: "About",
      contact: "Contact",
      admin: "Staff Portal",
    },
    cta: "Add LINE friend",
    lineId: siteContact.lineId,
    pages: {
      home: {
        title: "Kiangna Fishing Lake | Premium fishing lake with LINE service",
        description:
          "Kiangna Fishing Lake combines a premium lake atmosphere with the LINE account for entry QR, credits, catch submissions, and rankings.",
      },
      news: {
        title: "News and Events | Kiangna Fishing Lake",
        description: "Latest fish release schedules, competitions, promotions, and LINE activities at Kiangna Fishing Lake.",
      },
      articles: {
        title: "Fishing Articles | Kiangna Fishing Lake",
        description: "Fishing tips, lake preparation guides, LINE usage, and practical articles for anglers at Kiangna Fishing Lake.",
      },
      gallery: {
        title: "Verified Catch Gallery | Kiangna Fishing Lake Phayao",
        description: "Browse verified catch photos from Kiangna Fishing Lake with fish species, real weights, angler captions, and memorable trophy moments in Phayao.",
      },
      about: {
        title: "About Kiangna Fishing Lake | Modern fishing lake in Phayao",
        description: "Learn how Kiangna Fishing Lake in Phayao and Dok Kham Tai provides simple modern services for entry QR, credits, points, catch submissions, gallery, and angler rankings.",
      },
      contact: {
        title: "Contact | Kiangna Fishing Lake",
        description: "Contact Kiangna Fishing Lake by phone 062-229-3636, email kaingnagroup@gmail.com, or the LINE account @038gyaxo.",
      },
      privacy: {
        title: "Privacy Policy | Kiangna Fishing Lake",
        description: "How Kiangna Fishing Lake collects, uses, and protects information for the LINE services.",
      },
      terms: {
        title: "Terms and Conditions | Kiangna Fishing Lake",
        description: "Service terms for activities, credits, coupons, rankings, and the LINE transactions at Kiangna Fishing Lake.",
      },
    },
    home: {
      eyebrow: "Premium Fishing Lake · LINE Service",
      headline: "A premium fishing lake experience managed through LINE",
      intro:
        "Kiangna Fishing Lake combines a calm lakeside setting with the LINE account for entry QR, credits, catch submissions, rewards, and rankings.",
      primary: "Add LINE friend",
      secondary: "Contact us",
      stats: [
        ["LINE Service", "Core customer actions are managed through the LINE menu"],
        ["Premium Lake", "A quiet fishing environment with professional operations"],
        ["Transparent", "Credits, rewards, and catch records remain auditable"],
      ],
      features: [
        ["LINE QR entry", "Customers do not log in on the website. They open the LINE account and show the QR for staff scanning."],
        ["Credits and points", "Top up, check balances, and review transaction history through the LINE menu."],
        ["Catch submissions and ranking", "Submit catches, follow rankings, and manage reward eligibility through LINE for clearer records."],
      ],
    },
    sections: {
      newsTitle: "Latest News and Events",
      galleryTitle: "Lake Atmosphere and Trophy Catches",
      aboutTitle: "Built for a modern fishing lake",
      contactTitle: "Contact and Get Started",
    },
  },
} as const;

export function pageUrl(locale: Locale, page: SitePage) {
  return `${siteUrl}${pagePaths[page][locale]}`;
}

export function buildPageMetadata(locale: Locale, page: SitePage): Metadata {
  const content = siteContent[locale];
  const meta = content.pages[page];
  const thPath = pagePaths[page].th;
  const enPath = pagePaths[page].en;

  return {
    title: meta.title,
    description: meta.description,
    applicationName: siteContent.th.brand,
    keywords: [
      "เคียงนา Fishing Lake",
      "Kiangna Fishing Lake",
      "บ่อตกปลา",
      "บ่อตกปลาพะเยา",
      "บ่อตกปลาดอกคำใต้",
      "บ่อตกปลาใหญ่พะเยา",
      "บ่อตกปลาใหญ่ดอกคำใต้",
      "แกลลอรี่ผลงานปลา",
      "รูปปลาตกได้",
      "ผลงานปลาเคียงนา",
      "ตกปลาใหญ่พะเยา",
      "บ่อตกปลาพรีเมียม",
      "บ่อตกปลา LINE",
      "กิจกรรมลงปลา",
      "ranking นักตกปลา",
      "LINE",
      "ตกปลา",
      "Fishing Lake Thailand",
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
      canonical: pageUrl(locale, page),
      languages: {
        th: `${siteUrl}${thPath}`,
        en: `${siteUrl}${enPath}`,
        "x-default": `${siteUrl}${thPath}`,
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: pageUrl(locale, page),
      siteName: siteContent.th.brand,
      locale: locale === "th" ? "th_TH" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
  };
}

export const newsItems = {
  th: [
    ["ลงปลาใหญ่ประจำเดือน", "อัปเดตรอบลงปลาและช่วงเวลาที่เหมาะสำหรับผู้ที่ต้องการเก็บผลงานใน ranking"],
    ["กิจกรรมสะสมแต้ม", "ใช้เครดิตผ่าน LINE เพื่อรับแต้มเพิ่มและสิทธิแลกคูปองรางวัลในระบบ"],
    ["แข่งขันแมตช์พิเศษ", "เตรียมพบกิจกรรมแข่งขันแบบจำกัดจำนวน พร้อมการตรวจสอบรายการผ่านระบบหลังบ้าน"],
  ],
  en: [
    ["Monthly trophy fish release", "Updated release rounds and recommended sessions for ranking hunters."],
    ["Points campaign", "Use LINE credits, earn extra points, and redeem reward coupons."],
    ["Special match event", "Limited-seat competition with backend verification and transparent records."],
  ],
} as const;

export const galleryItems = {
  th: ["บรรยากาศริมน้ำ", "ปลาไซซ์รางวัล", "มุมพักผ่อน", "กิจกรรมหน้าบ่อ", "ตารางลงปลา", "ช่วงเย็นริมบ่อ"],
  en: ["Lakeside atmosphere", "Trophy catches", "Relax area", "Lake events", "Fish schedule", "Evening sessions"],
} as const;

export const articleItems = {
  th: [
    ["เตรียมตัวก่อนเข้าบ่ออย่างมืออาชีพ", "เช็กลิสต์อุปกรณ์ เหยื่อ เวลาเข้าใช้บริการ และรายการที่ควรดำเนินการผ่าน LINE ก่อนเดินทาง"],
    ["วิธีใช้เมนูบริการของเคียงนา", "แนะนำ QR เข้าบ่อ การเติมเครดิต การส่งผลงานปลา การดูอันดับ และการติดต่อเจ้าหน้าที่ผ่าน LINE"],
    ["เทคนิคอ่านหมายริมน้ำ", "แนวคิดการเลือกตำแหน่ง การดูทิศลม แสงแดด และพฤติกรรมปลาในช่วงเวลาต่าง ๆ"],
    ["ทำไมต้องส่งผลงานปลาผ่าน LINE", "การส่งรายการผ่าน LINE ช่วยลดความผิดพลาด ผูกข้อมูลกับบัญชีจริง และรองรับการตรวจสอบย้อนหลัง"],
    ["ระบบ Ranking คำนวณจากอะไร", "อธิบายหลักเกณฑ์ปลาใหญ่ น้ำหนักรวม จำนวนปลา จำนวนวันเข้าใช้บริการ และแต้มสะสม"],
    ["ดูแลเครดิตและคูปองให้ปลอดภัย", "คำแนะนำเพื่อป้องกันการสวมสิทธิ์ การใช้ QR ผิดบัญชี และการทำรายการซ้ำซ้อน"],
  ],
  en: [
    ["Before You Visit the Lake", "A practical checklist for gear, bait, timing, and LINE actions before arrival."],
    ["How to Use the Kiangna Service Menu", "Entry QR, top-ups, catch submissions, ranking, and admin contact through the LINE account."],
    ["Reading a Lakeside Spot", "How wind, sunlight, position, and fish behavior can shape a better fishing session."],
    ["Why Catch Submissions Stay in LINE", "LINE-linked submissions reduce errors, preserve identity, and keep records auditable."],
    ["How Ranking Scores Work", "A simple guide to biggest fish, total weight, fish count, visit count, and points."],
    ["Keeping Credits and Coupons Safe", "Tips to prevent account misuse, wrong QR usage, and duplicate transactions."],
  ],
} as const;

export const homeSeoContent = {
  th: {
    serviceTitle: "บ่อตกปลาพะเยาและบ่อตกปลาดอกคำใต้ พร้อมระบบบริการผ่าน LINE",
    serviceIntro:
      "เคียงนา Fishing Lake เป็นบ่อตกปลาพะเยาและบ่อตกปลาดอกคำใต้ที่ออกแบบสำหรับผู้ที่ต้องการพักผ่อน ตกปลาใหญ่ และร่วมกิจกรรมอย่างโปร่งใส ลูกค้าดำเนินรายการผ่าน LINE เป็นหลัก ไม่ว่าจะเป็น QR เข้าบ่อ เติมเครดิต ส่งผลงานปลา ดู ranking ใช้คูปอง หรือสอบถามเจ้าหน้าที่ ทำให้ข้อมูลเป็นระบบและตรวจสอบย้อนหลังได้สะดวก",
    serviceBlocks: [
      ["เหมาะสำหรับใคร", "เหมาะกับนักตกปลาที่ค้นหาบ่อตกปลาพะเยา บ่อตกปลาดอกคำใต้ หรือบ่อตกปลาใหญ่พะเยา ที่ต้องการบรรยากาศสงบ ข้อมูลกิจกรรมชัดเจน และบริการผ่านมือถือ"],
      ["ระบบหน้าบ่อ", "เจ้าหน้าที่ตรวจ QR เข้าบ่อและตรวจสอบรายการจากระบบภายใน ส่วนลูกค้าใช้เมนู LINE เพื่อดำเนินรายการสำคัญทั้งหมด"],
      ["ความโปร่งใส", "เครดิต แต้ม คูปอง ผลงานปลา และอันดับถูกผูกกับบัญชี LINE ลดความผิดพลาดและช่วยป้องกันการสวมสิทธิ์"],
    ],
    howToTitle: "วิธีเริ่มใช้งาน เคียงนา Fishing Lake",
    howToSteps: [
      "เพิ่มเพื่อน LINE @038gyaxo",
      "เปิดเมนูบริการเพื่อดู QR เข้าบ่อ เครดิต การส่งผลงานปลา อันดับ และช่องทางติดต่อเจ้าหน้าที่",
      "เมื่อมาถึงบ่อ ให้แสดง QR เพื่อให้เจ้าหน้าที่สแกนยืนยันการเข้าใช้บริการ",
      "ส่งผลงานปลาผ่าน LINE เพื่อให้เจ้าหน้าที่ตรวจสอบและอัปเดต ranking",
    ],
    keywordsTitle: "ข้อมูลที่นักตกปลามักค้นหา",
    keywords: [
      "บ่อตกปลา",
      "บ่อตกปลาพะเยา",
      "บ่อตกปลาดอกคำใต้",
      "บ่อตกปลาใหญ่พะเยา",
      "บ่อตกปลาใหญ่ดอกคำใต้",
      "บ่อตกปลาพรีเมียม",
      "บ่อตกปลาใช้ LINE",
      "กิจกรรมลงปลา",
      "ranking นักตกปลา",
      "เติมเครดิตผ่าน LINE",
      "ส่งผลงานปลาผ่าน LINE",
      "คูปองบ่อตกปลา",
      "บ่อตกปลาใกล้ฉัน",
      "เคียงนา Fishing Lake",
    ],
    faqTitle: "คำถามที่พบบ่อย",
    faqs: [
      ["ลูกค้าต้องสมัครสมาชิกบนเว็บไซต์หรือไม่", "ไม่ต้อง ลูกค้าดำเนินรายการผ่าน LINE เว็บไซต์นี้ใช้สำหรับดูข้อมูล ข่าวสาร บทความ แกลลอรี่ อันดับ และช่องทางติดต่อ"],
      ["เข้าใช้บ่อต้องทำอย่างไร", "เพิ่มเพื่อน LINE แล้วเปิดเมนูบริการเพื่อแสดง QR เข้าบ่อให้เจ้าหน้าที่สแกน"],
      ["เติมเครดิตและดูแต้มได้ที่ไหน", "ทำผ่านเมนูบริการใน LINE ระบบจะผูกข้อมูลกับบัญชี LINE ของลูกค้า"],
      ["ส่งผลงานปลาเพื่อขึ้น ranking อย่างไร", "เปิดเมนูส่งผลงานปลาใน LINE กรอกชนิดปลา น้ำหนัก และรูปภาพ จากนั้นรอเจ้าหน้าที่ตรวจสอบ"],
      ["เคียงนา Fishing Lake เหมาะกับคนค้นหาบ่อตกปลาในพื้นที่ไหน", "เหมาะสำหรับผู้ที่ค้นหาบ่อตกปลาพะเยา บ่อตกปลาดอกคำใต้ บ่อตกปลาใหญ่พะเยา และบ่อตกปลาใหญ่ดอกคำใต้ โดยสามารถดูข้อมูลและติดต่อผ่าน LINE ได้ก่อนเดินทาง"],
      ["ติดต่อเคียงนา Fishing Lake ได้ทางไหน", "ติดต่อผ่าน LINE @038gyaxo โทร 062-229-3636 หรืออีเมล kaingnagroup@gmail.com"],
    ],
  },
  en: {
    serviceTitle: "A premium fishing lake powered by the LINE account",
    serviceIntro:
      "Kiangna Fishing Lake is designed for anglers who want a calm lakeside experience, clear activities, transparent rankings, and customer transactions handled through the LINE account. Entry QR, credits, catch submissions, coupons, rewards, and admin contact are all kept inside LINE for clearer records.",
    serviceBlocks: [
      ["Who it is for", "For anglers who want a relaxed premium lake, clear event information, ranking visibility, and phone-first transactions without website customer login."],
      ["Lake workflow", "Staff verify entry QR and backend records, while customers use the LINE menu for every important action."],
      ["Transparency", "Credits, points, coupons, catch records, and rankings are linked to LINE identity, reducing mistakes and account misuse."],
    ],
    howToTitle: "How to get started",
    howToSteps: [
      "Add the LINE account @038gyaxo",
      "Open the เมนูบริการ for entry QR, credits, catch submission, ranking, and admin contact",
      "Show the QR to staff when arriving at the lake",
      "Submit catches through LINE for verification and ranking updates",
    ],
    keywordsTitle: "Popular search topics",
    keywords: [
      "premium fishing lake",
      "fishing lake Thailand",
      "LINE fishing lake",
      "fish release event",
      "angler ranking",
      "LINE credits",
      "catch submission",
      "fishing coupons",
      "fishing lake near me",
      "Kiangna Fishing Lake",
    ],
    faqTitle: "Frequently asked questions",
    faqs: [
      ["Do customers log in on the website?", "No. Customer transactions are handled through the LINE account. The website provides information, news, articles, gallery, rankings, and contact details."],
      ["How do I enter the lake?", "Add the LINE account and open the service menu to show your entry QR for staff scanning."],
      ["Where can I top up credits and check points?", "Use the LINE menu. Records are linked to the customer’s LINE account."],
      ["How do catch submissions affect ranking?", "Submit species, weight, and image through LINE. Staff verifies the record before it updates rankings."],
      ["How can I contact Kiangna Fishing Lake?", "Contact LINE @038gyaxo, phone 062-229-3636, or email kaingnagroup@gmail.com."],
    ],
  },
} as const;
