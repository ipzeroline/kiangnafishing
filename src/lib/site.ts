import type { Metadata } from "next";

export type Locale = "th" | "en";
export type SitePage = "home" | "news" | "articles" | "fishStocking" | "gallery" | "about" | "contact" | "privacy" | "terms";

export const siteUrl = "https://kiangnafishinglake.com";
export const siteOgImage = `${siteUrl}/site/kiangna-lake-aerial-01.jpg`;
export const siteContact = {
  phone: "062-229-3636",
  phoneHref: "tel:+66622293636",
  email: "kiangnafishinglake@gmail.com",
  emailHref: "mailto:kiangnafishinglake@gmail.com",
  lineId: "kingnafishinglake",
  lineHref: "https://line.me/ti/p/SeS2mH9yey",
  facebookHref: "https://www.facebook.com/kiangnafishinglake",
  instagramHref: "https://www.instagram.com/kiangnafishinglake",
  tiktokHref: "https://tiktok.com/@kiangnafishinglake",
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
  fishStocking: { th: "/fish-stocking-schedule", en: "/en/fish-stocking-schedule" },
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
      fishStocking: "ตารางการลงปลา",
      gallery: "แกลลอรี่",
      about: "เกี่ยวกับเรา",
      contact: "ติดต่อเรา",
      admin: "เข้าสู่ระบบเจ้าหน้าที่",
    },
    cta: "เพิ่มเพื่อน LINE",
    lineId: siteContact.lineId,
    pages: {
      home: {
        title: "เคียงนา Fishing Lake | บ่อตกปลาพะเยา ในอำเภอดอกคำใต้",
        description:
          "เคียงนา Fishing Lake หรือเคียงนาฟิชชิ่งเลค บ่อตกปลาพะเยา ในอำเภอดอกคำใต้ สำหรับคนค้นหาบ่อตกปลาใหญ่พะเยา บ่อตกปลาใหญ่ดอกคำใต้ และบ่อตกปลาใกล้ฉัน พร้อมบริการผ่าน LINE",
      },
      news: {
        title: "ข่าวสารและกิจกรรม | เคียงนา Fishing Lake",
        description: "ติดตามกิจกรรมลงปลา อีเวนต์การแข่งขัน โปรโมชัน และข่าวสารล่าสุดของเคียงนา Fishing Lake บ่อตกปลาพะเยา ในอำเภอดอกคำใต้",
      },
      articles: {
        title: "บทความบ่อตกปลาพะเยา ดอกคำใต้ | เคียงนา Fishing Lake",
        description: "บทความความรู้สำหรับคนค้นหาบ่อตกปลาพะเยา บ่อตกปลาดอกคำใต้ บ่อตกปลาใหญ่พะเยา บ่อตกปลาใหญ่ดอกคำใต้ เทคนิคตกปลา และการใช้งาน LINE ที่เคียงนา Fishing Lake",
      },
      fishStocking: {
        title: "ตารางการลงปลา | เคียงนา Fishing Lake พะเยา",
        description: "ดูตารางการลงปลาล่าสุดของเคียงนา Fishing Lake บ่อตกปลาพะเยา ในอำเภอดอกคำใต้ พร้อมรูปภาพ ชนิดปลา จำนวนตัว น้ำหนักรวม และข้อมูลสำหรับคนวางแผนเข้าบ่อตกปลาใหญ่พะเยา",
      },
      gallery: {
        title: "แกลลอรี่ผลงานปลา | เคียงนาฟิชชิ่งเลคพะเยา",
        description: "รวมรูปผลงานปลาที่ผ่านการตรวจสอบจากเคียงนา Fishing Lake หรือเคียงนาฟิชชิ่งเลคพะเยา บ่อตกปลาใหญ่พะเยา ในอำเภอดอกคำใต้ พร้อมน้ำหนัก ชนิดปลา และบรรยากาศจริง",
      },
      about: {
        title: "เกี่ยวกับเคียงนา Fishing Lake | เคียงนาฟิชชิ่งเลคพะเยา",
        description: "รู้จักเคียงนา Fishing Lake หรือเคียงนาฟิชชิ่งเลคพะเยา บ่อตกปลาพะเยา ในอำเภอดอกคำใต้ ที่ออกแบบบริการให้ใช้งานง่าย ครบทั้ง QR เข้าบ่อ เครดิต ส่งผลงานปลา แกลลอรี่ และอันดับนักตกปลา",
      },
      contact: {
        title: "ติดต่อเคียงนา Fishing Lake | บ่อตกปลาพะเยา ในอำเภอดอกคำใต้",
        description: "ติดต่อเคียงนา Fishing Lake เคียงนาฟิชชิ่งเลคพะเยา บ่อตกปลาพะเยา ในอำเภอดอกคำใต้ สำหรับคนค้นหาบ่อตกปลาใกล้ฉัน โทร 062-229-3636 เพิ่มเพื่อน LINE kiangnafishinglake",
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
    brand: "เคียงนา Fishing Lake",
    nav: {
      home: "Home",
      news: "News & Events",
      articles: "Articles",
      fishStocking: "Fish Releases",
      gallery: "Gallery",
      about: "About",
      contact: "Contact",
      admin: "Staff Portal",
    },
    cta: "Add LINE friend",
    lineId: siteContact.lineId,
    pages: {
      home: {
        title: "เคียงนา Fishing Lake | Premium fishing lake with LINE service",
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
      fishStocking: {
        title: "Fish Release Schedule | Kiangna Fishing Lake Phayao",
        description: "View the latest Kiangna Fishing Lake fish release schedule with photos, species, fish count, total weight, and dates for planning your fishing trip in Phayao.",
      },
      gallery: {
        title: "Verified Catch Gallery | Kiangna Fishing Lake Phayao",
        description: "Browse verified catch photos from Kiangna Fishing Lake with fish species, real weights, angler captions, and memorable trophy moments in Phayao.",
      },
      about: {
        title: "About Kiangna Fishing Lake | Modern fishing lake in Phayao",
        description: "Learn how Kiangna Fishing Lake in Phayao, in Dok Kham Tai District, provides simple modern services for entry QR, credits, points, catch submissions, gallery, and angler rankings.",
      },
      contact: {
        title: "Contact Kiangna Fishing Lake | Fishing Lake in Phayao",
        description: "Contact Kiangna Fishing Lake in Phayao, in Dok Kham Tai District, by phone, LINE kiangnafishinglake, email, or Google Maps for fish releases, credits, rankings, and reservations.",
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
    authors: [{ name: content.brand }],
    creator: siteContent.th.brand,
    publisher: siteContent.th.brand,
    category: "Fishing Lake",
    keywords: [
      "เคียงนา Fishing Lake",
      "เคียงนาฟิชชิ่งเลค",
      "เคียงนาfishinglake",
      "เคียงนาฟิชชิ่งเลคพะเยา",
      "เคียงนาfishinglakeพะเยา",
      "Kiangna Fishing Lake",
      "บ่อตกปลา",
      "บ่อตกปลาพะเยา",
      "บ่อตกปลาดอกคำใต้",
      "บ่อตกปลาใหญ่พะเยา",
      "บ่อตกปลาใหญ่ดอกคำใต้",
      "บ่อตกปลาใกล้ฉัน",
      "บ่อตกปลาในพะเยา",
      "บ่อตกปลาอำเภอดอกคำใต้",
      "แกลลอรี่ผลงานปลา",
      "รูปปลาตกได้",
      "ผลงานปลาเคียงนา",
      "ตกปลาใหญ่พะเยา",
      "บ่อตกปลาพรีเมียม",
      "บ่อตกปลา LINE",
      "กิจกรรมลงปลา",
      "ตารางการลงปลา",
      "ตารางลงปลาเคียงนา",
      "รอบลงปลา",
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
      images: [
        {
          url: siteOgImage,
          width: 1200,
          height: 900,
          alt: locale === "th" ? "เคียงนา Fishing Lake บ่อตกปลาพะเยา" : "Kiangna Fishing Lake in Phayao",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [siteOgImage],
    },
  };
}

export const newsItems = {
  th: [
    ["ลงปลาใหญ่ประจำเดือน", "อัปเดตรอบลงปลาและช่วงเวลาที่เหมาะสำหรับผู้ที่ต้องการเก็บผลงานใน ranking"],
    ["กิจกรรมสะสมแต้ม", "ใช้เครดิตผ่าน LINE เพื่อรับแต้มเพิ่มและสิทธิแลกคูปองรางวัลในระบบ"],
    ["แข่งขันแมตช์พิเศษ", "เตรียมพบกิจกรรมแข่งขันแบบจำกัดจำนวน พร้อมการตรวจสอบผลงานอย่างเป็นระบบ"],
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
    {
      slug: "fishing-lake-phayao-guide",
      title: "บ่อตกปลาในพะเยาเลือกอย่างไรให้คุ้มเวลาและได้ประสบการณ์ดี",
      detail: "คู่มือสำหรับนักตกปลาที่กำลังมองหาบ่อตกปลาในพะเยา ทั้งเรื่องบรรยากาศ ความสะดวก รอบลงปลา ความปลอดภัย และช่องทางติดต่อก่อนเดินทาง",
      image: "/site/kiangna-lake-aerial-01.jpg",
      alt: "ภาพมุมสูงเคียงนา Fishing Lake บ่อตกปลาในพะเยา",
      keywords: ["บ่อตกปลาในพะเยา", "บ่อตกปลาพะเยา", "เคียงนา Fishing Lake", "เคียงนาฟิชชิ่งเลคพะเยา"],
    },
    {
      slug: "dok-kham-tai-fishing-lake",
      title: "บ่อตกปลาดอกคำใต้ จุดหมายสำหรับคนอยากพักผ่อนและลุ้นปลาใหญ่",
      detail: "ดอกคำใต้เป็นพื้นที่ที่เดินทางสะดวกและเหมาะกับการตกปลาแบบจริงจัง บทความนี้สรุปสิ่งที่ควรดูเมื่อเลือกบ่อ ตั้งแต่สภาพหมายไปจนถึงบริการผ่าน LINE",
      image: "/site/kiangna-lake-aerial-02.jpg",
      alt: "บรรยากาศบ่อตกปลาดอกคำใต้พร้อมพื้นที่ริมน้ำ",
      keywords: ["บ่อตกปลาดอกคำใต้", "ตกปลาดอกคำใต้", "บ่อตกปลาใหญ่ดอกคำใต้", "เคียงนาfishinglakeพะเยา"],
    },
    {
      slug: "big-fish-lake-phayao",
      title: "บ่อตกปลาใหญ่พะเยา ต้องดูอะไรบ้างก่อนวางแผนเข้าบ่อ",
      detail: "ถ้าเป้าหมายคือปลาไซซ์ใหญ่ ควรดูข้อมูลรอบลงปลา ชนิดปลา น้ำหนักรวม สถิติผลงาน และช่วงเวลาที่เหมาะสม เพื่อวางแผนได้แม่นยำขึ้น",
      image: "/site/kiangna-lake-view-03.jpg",
      alt: "วิวบ่อตกปลาใหญ่พะเยาและบรรยากาศริมน้ำ",
      keywords: ["บ่อตกปลาใหญ่พะเยา", "ปลาใหญ่พะเยา", "บ่อตกปลาใหญ่ดอกคำใต้", "ตารางลงปลา"],
    },
    {
      slug: "prepare-for-phayao-fishing-lake",
      title: "เตรียมตัวก่อนมาบ่อตกปลาพะเยา เช็กลิสต์ที่นักตกปลาไม่ควรมองข้าม",
      detail: "เช็กอุปกรณ์ เหยื่อ เวลาเดินทาง สภาพอากาศ เอกสารหรือ QR เข้าบ่อ และการติดต่อทีมงานล่วงหน้า เพื่อให้วันตกปลาไหลลื่นตั้งแต่เริ่มต้น",
      image: "/site/kiangna-lake-aerial-01.jpg",
      alt: "พื้นที่บ่อตกปลาพะเยาสำหรับเตรียมตัวก่อนเข้าใช้บริการ",
      keywords: ["บ่อตกปลาพะเยา", "เตรียมตัวตกปลา", "QR เข้าบ่อ"],
    },
    {
      slug: "kiangna-line-service-guide",
      title: "วิธีใช้ LINE ของเคียงนา Fishing Lake สำหรับเข้าบ่อ เครดิต และส่งผลงานปลา",
      detail: "ลูกค้าสามารถใช้ LINE เพื่อแสดง QR เข้าบ่อ ตรวจเครดิต ส่งผลงานปลา ดูอันดับ และติดต่อเจ้าหน้าที่ ช่วยให้ข้อมูลเป็นระบบและตรวจสอบย้อนหลังได้",
      image: "/site/kiangna-lake-aerial-02.jpg",
      alt: "เคียงนา Fishing Lake บ่อตกปลาพะเยาที่ให้บริการผ่าน LINE",
      keywords: ["บ่อตกปลา LINE", "ส่งผลงานปลาผ่าน LINE", "เครดิตบ่อตกปลา"],
    },
    {
      slug: "read-big-fishing-lake-spots",
      title: "อ่านหมายบ่อตกปลาใหญ่ให้เป็น ดูลม แสงแดด และพฤติกรรมปลา",
      detail: "เทคนิคพื้นฐานในการเลือกตำแหน่งริมบ่อ ดูทิศลม จุดน้ำลึก เงาแดด และจังหวะปลากิน เพื่อเพิ่มโอกาสเจอปลาไซซ์ดีในบ่อตกปลาใหญ่",
      image: "/site/kiangna-lake-view-03.jpg",
      alt: "หมายริมน้ำสำหรับตกปลาใหญ่ในพะเยา",
      keywords: ["เทคนิคตกปลาใหญ่", "หมายตกปลา", "บ่อตกปลาใหญ่"],
    },
    {
      slug: "fish-release-schedule-phayao",
      title: "ตารางลงปลาสำคัญแค่ไหนสำหรับคนหาบ่อตกปลาใหญ่พะเยา",
      detail: "การดูตารางลงปลาช่วยให้รู้ชนิดปลา จำนวนตัว น้ำหนักรวม และวันที่ลงปลา เหมาะสำหรับนักตกปลาที่ต้องการวางแผนรอบเข้าใช้บริการอย่างจริงจัง",
      image: "/site/kiangna-lake-aerial-01.jpg",
      alt: "ตารางลงปลาและบรรยากาศบ่อตกปลาใหญ่พะเยา",
      keywords: ["ตารางลงปลา", "รอบลงปลา", "บ่อตกปลาใหญ่พะเยา"],
    },
    {
      slug: "angler-ranking-system",
      title: "Ranking นักตกปลาคืออะไร ทำไมบ่อตกปลายุคใหม่ควรมีระบบตรวจสอบ",
      detail: "ระบบอันดับช่วยให้ผลงานปลา น้ำหนักรวม จำนวนปลา การเข้าใช้บริการ และแต้มสะสมมีความชัดเจน เหมาะกับบ่อที่ต้องการความโปร่งใสและกิจกรรมต่อเนื่อง",
      image: "/site/kiangna-lake-aerial-02.jpg",
      alt: "บ่อตกปลาพะเยาพร้อมระบบ ranking นักตกปลา",
      keywords: ["ranking นักตกปลา", "ผลงานปลา", "บ่อตกปลาพะเยา"],
    },
    {
      slug: "phayao-fishing-trip-plan",
      title: "เที่ยวตกปลาในพะเยาให้สนุก วางแผนครึ่งวันหรือเต็มวันอย่างไรดี",
      detail: "แนวทางจัดทริปตกปลาในพะเยา ทั้งเวลาเดินทาง ช่วงแดด ช่วงเย็น การพักผ่อนริมบ่อ และการติดต่อสอบถามรอบบริการก่อนมา",
      image: "/site/kiangna-lake-view-03.jpg",
      alt: "ทริปตกปลาในพะเยาที่เคียงนา Fishing Lake",
      keywords: ["เที่ยวตกปลาในพะเยา", "บ่อตกปลาในพะเยา", "ตกปลาพะเยา"],
    },
    {
      slug: "why-kiangna-fishing-lake-phayao",
      title: "ทำไมเคียงนา Fishing Lake เหมาะกับคนค้นหาบ่อตกปลาพะเยา ในอำเภอดอกคำใต้",
      detail: "สรุปจุดเด่นของเคียงนา Fishing Lake ทั้งบรรยากาศบ่อ ระบบ LINE ตารางลงปลา แกลลอรี่ผลงาน ติดต่อสะดวก และการดูแลข้อมูลลูกค้าอย่างเป็นระบบ",
      image: "/site/kiangna-lake-aerial-01.jpg",
      alt: "เคียงนา Fishing Lake บ่อตกปลาพะเยาและบ่อตกปลาดอกคำใต้",
      keywords: ["เคียงนา Fishing Lake", "เคียงนาฟิชชิ่งเลค", "เคียงนาfishinglake", "บ่อตกปลาพะเยา", "บ่อตกปลาดอกคำใต้"],
    },
    {
      slug: "bait-basics-for-lake-fishing",
      title: "พื้นฐานการเลือกเหยื่อตกปลาในบ่อให้เหมาะกับปลาและสภาพน้ำ",
      detail: "อธิบายหลักคิดเรื่องเหยื่อ กลิ่น สี ขนาด และความถี่ในการเปลี่ยนเหยื่อ เพื่อช่วยให้นักตกปลาวางแผนได้เหมาะกับบ่อตกปลาในพะเยา",
      image: "/site/kiangna-lake-aerial-02.jpg",
      alt: "คู่มือเลือกเหยื่อตกปลาในบ่อ",
      keywords: ["เหยื่อตกปลา", "เทคนิคตกปลาในบ่อ", "บ่อตกปลาในพะเยา"],
    },
    {
      slug: "rod-and-reel-setup-guide",
      title: "เลือกคันเบ็ดและรอกสำหรับบ่อตกปลาใหญ่ ต้องดูอะไรบ้าง",
      detail: "แนวทางเลือกคันเบ็ด รอก สาย และชุดปลายสายสำหรับคนที่ต้องการลุ้นปลาใหญ่ โดยไม่ทำให้อุปกรณ์หนักหรือใช้งานยากเกินไป",
      image: "/site/kiangna-lake-view-03.jpg",
      alt: "คู่มือเลือกคันเบ็ดและรอกสำหรับตกปลาใหญ่",
      keywords: ["คันเบ็ดตกปลาใหญ่", "รอกตกปลา", "บ่อตกปลาใหญ่พะเยา"],
    },
    {
      slug: "morning-vs-evening-fishing",
      title: "ตกปลาช่วงเช้าหรือช่วงเย็น ช่วงไหนเหมาะกับบ่อตกปลาพะเยา",
      detail: "เปรียบเทียบข้อดีของช่วงเช้าและช่วงเย็น ทั้งแสงแดด อุณหภูมิ พฤติกรรมปลา และความสบายของนักตกปลา",
      image: "/site/kiangna-lake-aerial-01.jpg",
      alt: "บรรยากาศตกปลาช่วงเช้าและช่วงเย็นในพะเยา",
      keywords: ["เวลาตกปลา", "ตกปลาช่วงเย็น", "บ่อตกปลาพะเยา"],
    },
    {
      slug: "weather-and-fish-activity",
      title: "สภาพอากาศมีผลต่อปลากินเหยื่ออย่างไร",
      detail: "สรุปผลของแดด ลม ฝน ความกดอากาศ และอุณหภูมิน้ำต่อพฤติกรรมปลา เพื่อใช้วางแผนวันเข้าบ่อให้มีโอกาสมากขึ้น",
      image: "/site/kiangna-lake-aerial-02.jpg",
      alt: "สภาพอากาศกับพฤติกรรมปลาในบ่อตกปลา",
      keywords: ["สภาพอากาศตกปลา", "ปลากินเหยื่อ", "เทคนิคตกปลา"],
    },
    {
      slug: "fish-fighting-technique",
      title: "เทคนิคสู้ปลาใหญ่ให้ปลอดภัยและลดโอกาสสายขาด",
      detail: "แนะนำการตั้งเบรก การคุมคัน การเดินตามปลา และการประคองแรงดึงเมื่อเจอปลาใหญ่ในบ่อ",
      image: "/site/kiangna-lake-view-03.jpg",
      alt: "เทคนิคสู้ปลาใหญ่ในบ่อตกปลา",
      keywords: ["สู้ปลาใหญ่", "เทคนิคตกปลาใหญ่", "สายขาด"],
    },
    {
      slug: "catch-photo-guide",
      title: "ถ่ายรูปผลงานปลาอย่างไรให้สวยและใช้ส่งผลงานได้ชัดเจน",
      detail: "วิธีจัดมุม ถ่ายน้ำหนัก ถ่ายชนิดปลา และเก็บภาพให้ทีมงานตรวจสอบง่าย เหมาะกับการส่งผลงานปลาและทำแกลลอรี่",
      image: "/site/kiangna-lake-aerial-01.jpg",
      alt: "คู่มือถ่ายรูปผลงานปลา",
      keywords: ["ถ่ายรูปปลา", "ส่งผลงานปลา", "แกลลอรี่ผลงานปลา"],
    },
    {
      slug: "catch-and-release-care",
      title: "ดูแลปลาอย่างไรหลังตกได้ เพื่อความปลอดภัยของปลาและนักตกปลา",
      detail: "แนวทางจับปลา วางปลา พักปลา และคืนปลาลงน้ำอย่างระมัดระวัง เพื่อรักษาคุณภาพปลาและประสบการณ์ของทุกคนในบ่อ",
      image: "/site/kiangna-lake-aerial-02.jpg",
      alt: "การดูแลปลาหลังตกได้ในบ่อตกปลา",
      keywords: ["ดูแลปลา", "ปล่อยปลา", "บ่อตกปลา"],
    },
    {
      slug: "lake-etiquette-guide",
      title: "มารยาทในบ่อตกปลาที่นักตกปลาควรรู้ก่อนเข้าหมาย",
      detail: "ข้อควรรู้เรื่องพื้นที่ตกปลา เสียงรบกวน การใช้ไฟ การเดินผ่านหมาย และการเคารพนักตกปลาคนอื่น",
      image: "/site/kiangna-lake-view-03.jpg",
      alt: "มารยาทและความปลอดภัยในบ่อตกปลา",
      keywords: ["มารยาทตกปลา", "ความปลอดภัยบ่อตกปลา", "นักตกปลา"],
    },
    {
      slug: "family-fishing-trip",
      title: "พาครอบครัวมาตกปลาในพะเยา ควรเตรียมอะไรบ้าง",
      detail: "คำแนะนำสำหรับทริปครอบครัว ทั้งเวลาเดินทาง อุปกรณ์กันแดด ของใช้จำเป็น การพักผ่อน และการติดต่อทีมงานก่อนมา",
      image: "/site/kiangna-lake-aerial-01.jpg",
      alt: "ทริปครอบครัวที่บ่อตกปลาในพะเยา",
      keywords: ["ทริปครอบครัว", "ตกปลาในพะเยา", "บ่อตกปลาในพะเยา"],
    },
    {
      slug: "beginner-fishing-mistakes",
      title: "ข้อผิดพลาดที่มือใหม่มักเจอเมื่อตกปลาในบ่อ",
      detail: "รวมปัญหาที่พบบ่อย เช่น ใช้สายไม่เหมาะ เปลี่ยนเหยื่อเร็วเกินไป ไม่อ่านลม หรือไม่เช็กข้อมูลบ่อก่อนเดินทาง",
      image: "/site/kiangna-lake-aerial-02.jpg",
      alt: "ข้อผิดพลาดของมือใหม่ตกปลาในบ่อ",
      keywords: ["มือใหม่ตกปลา", "สอนตกปลา", "เทคนิคตกปลาในบ่อ"],
    },
    {
      slug: "monthly-fishing-plan",
      title: "วางแผนตกปลารายเดือนด้วยข่าวสาร ตารางลงปลา และอันดับ",
      detail: "การติดตามข่าวสาร ตารางลงปลา และ ranking ช่วยให้นักตกปลาวางแผนรอบเข้าใช้บริการได้คุ้มกว่าเดิม",
      image: "/site/kiangna-lake-view-03.jpg",
      alt: "วางแผนตกปลารายเดือนด้วยตารางลงปลา",
      keywords: ["วางแผนตกปลา", "ข่าวสารบ่อตกปลา", "ตารางลงปลา"],
    },
    {
      slug: "line-credit-safety",
      title: "ใช้เครดิตผ่าน LINE อย่างไรให้ปลอดภัยและตรวจสอบได้",
      detail: "คำแนะนำเรื่องการดูยอดเครดิต ประวัติรายการ คูปอง และการป้องกันการใช้สิทธิ์ผิดบัญชีในระบบบ่อตกปลา",
      image: "/site/kiangna-lake-aerial-01.jpg",
      alt: "ความปลอดภัยของเครดิตผ่าน LINE",
      keywords: ["เครดิตผ่าน LINE", "คูปองบ่อตกปลา", "ระบบบ่อตกปลา"],
    },
    {
      slug: "big-fish-ranking-tips",
      title: "อยากติดอันดับปลาใหญ่ ควรวางแผนอย่างไร",
      detail: "แนวทางดูสถิติรอบลงปลา เลือกช่วงเวลา เตรียมอุปกรณ์ และส่งผลงานให้ครบเพื่อเพิ่มโอกาสใน ranking",
      image: "/site/kiangna-lake-aerial-02.jpg",
      alt: "เทคนิควางแผนติดอันดับปลาใหญ่",
      keywords: ["อันดับปลาใหญ่", "ranking นักตกปลา", "ปลาใหญ่พะเยา"],
    },
    {
      slug: "dok-kham-tai-travel-guide",
      title: "วางแผนเดินทางมาบ่อตกปลาดอกคำใต้ให้สะดวกขึ้น",
      detail: "สรุปวิธีเตรียมตัวก่อนเดินทางมาย่านดอกคำใต้ ทั้งการติดต่อบ่อ ดูแผนที่ เช็กเวลา และเตรียมอุปกรณ์สำหรับวันตกปลา",
      image: "/site/kiangna-lake-view-03.jpg",
      alt: "คู่มือเดินทางมาบ่อตกปลาดอกคำใต้",
      keywords: ["บ่อตกปลาดอกคำใต้", "เดินทางดอกคำใต้", "ตกปลาพะเยา"],
    },
  ],
  en: [
    {
      slug: "fishing-lake-phayao-guide",
      title: "How to Choose a Fishing Lake in Phayao",
      detail: "A practical guide to location, lake atmosphere, fish releases, safety, service channels, and what anglers should check before visiting a fishing lake in Phayao.",
      image: "/site/kiangna-lake-aerial-01.jpg",
      alt: "Aerial view of Kiangna Fishing Lake in Phayao",
      keywords: ["fishing lake Phayao", "Kiangna Fishing Lake", "Phayao fishing"],
    },
    {
      slug: "dok-kham-tai-fishing-lake",
      title: "Fishing Lake in Dok Kham Tai for Relaxed Trophy Sessions",
      detail: "What to look for when planning a fishing session in Dok Kham Tai, from lake conditions and fish activity to LINE-based customer service.",
      image: "/site/kiangna-lake-aerial-02.jpg",
      alt: "Dok Kham Tai fishing lake atmosphere",
      keywords: ["fishing lake Dok Kham Tai", "trophy fishing Phayao", "Kiangna"],
    },
    {
      slug: "big-fish-lake-phayao",
      title: "Planning for Trophy Fish at a Phayao Fishing Lake",
      detail: "Review fish release schedules, species, total release weight, catch records, and the best time windows before targeting bigger fish.",
      image: "/site/kiangna-lake-view-03.jpg",
      alt: "Trophy fishing lake view in Phayao",
      keywords: ["trophy fishing Phayao", "fish release schedule", "big fish lake"],
    },
    {
      slug: "prepare-for-phayao-fishing-lake",
      title: "Before You Visit Kiangna Fishing Lake",
      detail: "A checklist for gear, bait, travel timing, weather, entry QR, and how to contact the team before arriving at the lake.",
      image: "/site/kiangna-lake-aerial-01.jpg",
      alt: "Kiangna Fishing Lake preparation guide",
      keywords: ["fishing checklist", "LINE entry QR", "Phayao fishing lake"],
    },
    {
      slug: "kiangna-line-service-guide",
      title: "How the Kiangna LINE Service Helps Anglers",
      detail: "Use LINE for entry QR, credits, catch submissions, rankings, and staff contact so important records stay organized and auditable.",
      image: "/site/kiangna-lake-aerial-02.jpg",
      alt: "Kiangna Fishing Lake LINE service",
      keywords: ["LINE fishing lake", "catch submission", "fishing credits"],
    },
    {
      slug: "read-big-fishing-lake-spots",
      title: "Reading Wind, Sunlight, and Fish Behavior",
      detail: "Basic lakeside tactics for choosing a spot, watching wind direction, reading shade, and timing fish activity at a managed fishing lake.",
      image: "/site/kiangna-lake-view-03.jpg",
      alt: "Lakeside fishing spot in Phayao",
      keywords: ["fishing tactics", "lakeside spot", "big fish technique"],
    },
    {
      slug: "fish-release-schedule-phayao",
      title: "Why Fish Release Schedules Matter",
      detail: "Fish release updates help anglers understand species, fish count, total weight, and release dates before planning a serious session.",
      image: "/site/kiangna-lake-aerial-01.jpg",
      alt: "Fish release schedule at Kiangna Fishing Lake",
      keywords: ["fish release schedule", "fishing lake planning", "Phayao"],
    },
    {
      slug: "angler-ranking-system",
      title: "How Angler Rankings Make Fishing Fairer",
      detail: "Ranking systems make biggest fish, total weight, fish count, visits, and points clearer for anglers and easier for staff to verify.",
      image: "/site/kiangna-lake-aerial-02.jpg",
      alt: "Angler ranking system at a Phayao fishing lake",
      keywords: ["angler ranking", "verified catches", "fishing records"],
    },
    {
      slug: "phayao-fishing-trip-plan",
      title: "Planning a Half-Day or Full-Day Fishing Trip in Phayao",
      detail: "A simple trip plan covering travel time, sunlight, evening sessions, lakeside rest, and how to check service rounds before visiting.",
      image: "/site/kiangna-lake-view-03.jpg",
      alt: "Fishing trip at Kiangna Fishing Lake Phayao",
      keywords: ["Phayao fishing trip", "fishing lake near me", "Kiangna Fishing Lake"],
    },
    {
      slug: "why-kiangna-fishing-lake-phayao",
      title: "Why Kiangna Fits Phayao, in Dok Kham Tai District, Fishing Searches",
      detail: "A summary of Kiangna Fishing Lake's lake atmosphere, LINE service, fish release updates, catch gallery, easy contact, and organized records.",
      image: "/site/kiangna-lake-aerial-01.jpg",
      alt: "Kiangna Fishing Lake for anglers in Phayao, Dok Kham Tai District",
      keywords: ["Kiangna Fishing Lake", "fishing lake Phayao", "fishing lake Dok Kham Tai"],
    },
    {
      slug: "bait-basics-for-lake-fishing",
      title: "Bait Basics for Managed Lake Fishing",
      detail: "A practical guide to bait scent, color, size, and when to change bait while fishing at a managed lake in Phayao.",
      image: "/site/kiangna-lake-aerial-02.jpg",
      alt: "Bait guide for managed lake fishing",
      keywords: ["fishing bait", "lake fishing tips", "fishing lake Phayao"],
    },
    {
      slug: "rod-and-reel-setup-guide",
      title: "Rod and Reel Setup for Trophy Lake Fishing",
      detail: "How to choose rods, reels, line, and terminal tackle for bigger fish without making the setup too heavy or difficult to use.",
      image: "/site/kiangna-lake-view-03.jpg",
      alt: "Rod and reel setup for trophy fish",
      keywords: ["trophy fishing rod", "fishing reel", "big fish lake Phayao"],
    },
    {
      slug: "morning-vs-evening-fishing",
      title: "Morning or Evening Fishing: Which Session Works Better",
      detail: "Compare morning and evening sessions by sunlight, temperature, fish behavior, and angler comfort before planning a visit.",
      image: "/site/kiangna-lake-aerial-01.jpg",
      alt: "Morning and evening fishing in Phayao",
      keywords: ["best fishing time", "evening fishing", "Phayao fishing lake"],
    },
    {
      slug: "weather-and-fish-activity",
      title: "How Weather Changes Fish Activity",
      detail: "Learn how sun, wind, rain, air pressure, and water temperature affect feeding behavior at a managed fishing lake.",
      image: "/site/kiangna-lake-aerial-02.jpg",
      alt: "Weather and fish activity at a lake",
      keywords: ["fishing weather", "fish activity", "fishing tips"],
    },
    {
      slug: "fish-fighting-technique",
      title: "How to Fight Bigger Fish Without Breaking Line",
      detail: "Tips for drag setting, rod angle, moving with the fish, and controlling pressure when a bigger fish runs hard.",
      image: "/site/kiangna-lake-view-03.jpg",
      alt: "Fighting bigger fish at a fishing lake",
      keywords: ["fight big fish", "big fish technique", "line break"],
    },
    {
      slug: "catch-photo-guide",
      title: "How to Photograph Catches for Clear Submissions",
      detail: "How to capture fish species, weight, and clean catch photos that staff can review easily for ranking and gallery records.",
      image: "/site/kiangna-lake-aerial-01.jpg",
      alt: "Catch photo guide for fishing records",
      keywords: ["catch photo", "catch submission", "fishing gallery"],
    },
    {
      slug: "catch-and-release-care",
      title: "Fish Care After the Catch",
      detail: "Basic handling, resting, and release guidance to protect fish quality and keep the lake experience good for every angler.",
      image: "/site/kiangna-lake-aerial-02.jpg",
      alt: "Fish care after catching at a lake",
      keywords: ["fish care", "catch and release", "fishing lake"],
    },
    {
      slug: "lake-etiquette-guide",
      title: "Fishing Lake Etiquette Every Angler Should Know",
      detail: "Simple etiquette around space, noise, lights, walking behind other anglers, and respecting everyone fishing around the lake.",
      image: "/site/kiangna-lake-view-03.jpg",
      alt: "Fishing lake etiquette and safety",
      keywords: ["fishing etiquette", "lake safety", "anglers"],
    },
    {
      slug: "family-fishing-trip",
      title: "Planning a Family Fishing Trip in Phayao",
      detail: "Prepare travel timing, sun protection, essentials, rest breaks, and staff contact before bringing family to a fishing lake.",
      image: "/site/kiangna-lake-aerial-01.jpg",
      alt: "Family fishing trip in Phayao",
      keywords: ["family fishing trip", "Phayao fishing", "fishing lake Phayao"],
    },
    {
      slug: "beginner-fishing-mistakes",
      title: "Common Beginner Mistakes at Fishing Lakes",
      detail: "Frequent issues include using the wrong line, changing bait too fast, ignoring wind, or not checking lake information before arrival.",
      image: "/site/kiangna-lake-aerial-02.jpg",
      alt: "Beginner mistakes at managed fishing lakes",
      keywords: ["beginner fishing", "learn fishing", "lake fishing tips"],
    },
    {
      slug: "monthly-fishing-plan",
      title: "Monthly Fishing Planning With News, Releases, and Rankings",
      detail: "Following news, fish release updates, and rankings helps anglers choose better visit dates and plan more productive sessions.",
      image: "/site/kiangna-lake-view-03.jpg",
      alt: "Monthly fishing planning with release updates",
      keywords: ["fishing plan", "fishing lake news", "fish release schedule"],
    },
    {
      slug: "line-credit-safety",
      title: "Using LINE Credits Safely at a Fishing Lake",
      detail: "How to check credit balances, transaction history, coupons, and avoid using benefits under the wrong account.",
      image: "/site/kiangna-lake-aerial-01.jpg",
      alt: "LINE credit safety for fishing lake services",
      keywords: ["LINE credits", "fishing coupons", "fishing lake system"],
    },
    {
      slug: "big-fish-ranking-tips",
      title: "How to Plan for Big Fish Rankings",
      detail: "Use release records, timing, gear preparation, and complete catch submissions to improve your chance in angler rankings.",
      image: "/site/kiangna-lake-aerial-02.jpg",
      alt: "Planning for big fish rankings",
      keywords: ["big fish ranking", "angler ranking", "trophy fish Phayao"],
    },
    {
      slug: "dok-kham-tai-travel-guide",
      title: "Travel Planning for a Dok Kham Tai Fishing Lake Visit",
      detail: "Prepare contact details, map directions, timing, and gear before visiting a fishing lake in the Dok Kham Tai area.",
      image: "/site/kiangna-lake-view-03.jpg",
      alt: "Travel guide for Dok Kham Tai fishing lake",
      keywords: ["fishing lake Dok Kham Tai", "Dok Kham Tai travel", "Phayao fishing"],
    },
  ],
} as const;

export type ArticleItem = (typeof articleItems)[Locale][number];

export function articlePath(locale: Locale, slug: string) {
  return `${pagePaths.articles[locale]}/${slug}`;
}

export function latestArticleItems(locale: Locale) {
  return [...articleItems[locale]].reverse();
}

export type ArticleViewMap = Record<string, number>;

export function findArticle(locale: Locale, slug: string) {
  return articleItems[locale].find((article) => article.slug === slug);
}

export function articleDetailMetadata(locale: Locale, slug: string): Metadata {
  const article = findArticle(locale, slug);
  const content = siteContent[locale];

  if (!article) {
    return buildPageMetadata(locale, "articles");
  }

  const url = `${siteUrl}${articlePath(locale, article.slug)}`;
  const title = locale === "th"
    ? `${article.title} | ${content.brand}`
    : `${article.title} | ${content.brand}`;

  return {
    title,
    description: article.detail,
    applicationName: siteContent.th.brand,
    authors: [{ name: content.brand }],
    creator: siteContent.th.brand,
    publisher: siteContent.th.brand,
    category: "Fishing Lake",
    keywords: [
      ...article.keywords,
      "เคียงนา Fishing Lake",
      "Kiangna Fishing Lake",
      "บ่อตกปลาพะเยา",
      "บ่อตกปลาดอกคำใต้",
      "บ่อตกปลาใหญ่พะเยา",
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
      canonical: url,
      languages: {
        th: `${siteUrl}${articlePath("th", article.slug)}`,
        en: `${siteUrl}${articlePath("en", article.slug)}`,
        "x-default": `${siteUrl}${articlePath("th", article.slug)}`,
      },
    },
    openGraph: {
      title,
      description: article.detail,
      url,
      siteName: siteContent.th.brand,
      locale: locale === "th" ? "th_TH" : "en_US",
      type: "article",
      images: [
        {
          url: `${siteUrl}${article.image}`,
          width: 1200,
          height: 900,
          alt: article.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: article.detail,
      images: [`${siteUrl}${article.image}`],
    },
  };
}

export const homeSeoContent = {
  th: {
    serviceTitle: "บ่อตกปลาพะเยา ในอำเภอดอกคำใต้ พร้อมระบบบริการผ่าน LINE",
    serviceIntro:
      "เคียงนา Fishing Lake หรือเคียงนาฟิชชิ่งเลคพะเยา เป็นบ่อตกปลาพะเยา ในอำเภอดอกคำใต้ที่ออกแบบสำหรับผู้ที่ต้องการพักผ่อน ตกปลาใหญ่ และร่วมกิจกรรมอย่างโปร่งใส เหมาะกับคนที่ค้นหาบ่อตกปลาใหญ่พะเยา บ่อตกปลาใหญ่ดอกคำใต้ หรือบ่อตกปลาใกล้ฉัน ลูกค้าดำเนินรายการผ่าน LINE เป็นหลัก ไม่ว่าจะเป็น QR เข้าบ่อ เติมเครดิต ส่งผลงานปลา ดู ranking ใช้คูปอง หรือสอบถามเจ้าหน้าที่",
    serviceBlocks: [
      ["เหมาะสำหรับใคร", "เหมาะกับนักตกปลาที่ค้นหาบ่อตกปลาพะเยา บ่อตกปลาดอกคำใต้ บ่อตกปลาใหญ่พะเยา บ่อตกปลาใหญ่ดอกคำใต้ หรือบ่อตกปลาใกล้ฉัน ที่ต้องการบรรยากาศสงบ ข้อมูลกิจกรรมชัดเจน และบริการผ่านมือถือ"],
      ["ระบบหน้าบ่อ", "เจ้าหน้าที่ตรวจ QR เข้าบ่อและตรวจสอบรายการจากระบบภายใน ส่วนลูกค้าใช้เมนู LINE เพื่อดำเนินรายการสำคัญทั้งหมด"],
      ["ความโปร่งใส", "เครดิต แต้ม คูปอง ผลงานปลา และอันดับถูกผูกกับบัญชี LINE ลดความผิดพลาดและช่วยป้องกันการสวมสิทธิ์"],
    ],
    howToTitle: "วิธีเริ่มใช้งาน เคียงนา Fishing Lake",
    howToSteps: [
      "เพิ่มเพื่อน LINE kingnafishinglake",
      "เปิดเมนูบริการเพื่อดู QR เข้าบ่อ เครดิต การส่งผลงานปลา อันดับ และช่องทางติดต่อเจ้าหน้าที่",
      "เมื่อมาถึงบ่อ ให้แสดง QR เพื่อให้เจ้าหน้าที่สแกนยืนยันการเข้าใช้บริการ",
      "ส่งผลงานปลาผ่าน LINE เพื่อให้เจ้าหน้าที่ตรวจสอบและอัปเดต ranking",
    ],
    keywordsTitle: "เรื่องที่นักตกปลาควรรู้ก่อนมาเคียงนา Fishing Lake",
    keywords: [
      "บ่อตกปลา",
      "บ่อตกปลาพะเยา",
      "บ่อตกปลาดอกคำใต้",
      "บ่อตกปลาใหญ่พะเยา",
      "บ่อตกปลาใหญ่ดอกคำใต้",
      "บ่อตกปลาใกล้ฉัน",
      "เคียงนาฟิชชิ่งเลค",
      "เคียงนาfishinglake",
      "เคียงนาฟิชชิ่งเลคพะเยา",
      "เคียงนาfishinglakeพะเยา",
      "บ่อตกปลาพรีเมียม",
      "บ่อตกปลาใช้ LINE",
      "กิจกรรมลงปลา",
      "ranking นักตกปลา",
      "เติมเครดิตผ่าน LINE",
      "ส่งผลงานปลาผ่าน LINE",
      "คูปองบ่อตกปลา",
      "เคียงนา Fishing Lake",
    ],
    faqTitle: "คำถามที่พบบ่อย",
    faqs: [
      ["ลูกค้าต้องสมัครสมาชิกบนเว็บไซต์หรือไม่", "ไม่ต้อง ลูกค้าดำเนินรายการผ่าน LINE เว็บไซต์นี้ใช้สำหรับดูข้อมูล ข่าวสาร บทความ แกลลอรี่ อันดับ และช่องทางติดต่อ"],
      ["เข้าใช้บ่อต้องทำอย่างไร", "เพิ่มเพื่อน LINE แล้วเปิดเมนูบริการเพื่อแสดง QR เข้าบ่อให้เจ้าหน้าที่สแกน"],
      ["เติมเครดิตและดูแต้มได้ที่ไหน", "ทำผ่านเมนูบริการใน LINE ระบบจะผูกข้อมูลกับบัญชี LINE ของลูกค้า"],
      ["ส่งผลงานปลาเพื่อขึ้น ranking อย่างไร", "เปิดเมนูส่งผลงานปลาใน LINE กรอกชนิดปลา น้ำหนัก และรูปภาพ จากนั้นรอเจ้าหน้าที่ตรวจสอบ"],
      ["เคียงนา Fishing Lake เหมาะกับคนค้นหาบ่อตกปลาในพื้นที่ไหน", "เหมาะสำหรับผู้ที่ค้นหาบ่อตกปลาพะเยา บ่อตกปลาดอกคำใต้ บ่อตกปลาใหญ่พะเยา บ่อตกปลาใหญ่ดอกคำใต้ บ่อตกปลาใกล้ฉัน เคียงนาฟิชชิ่งเลค หรือเคียงนาfishinglakeพะเยา โดยสามารถดูข้อมูลและติดต่อผ่าน LINE ได้ก่อนเดินทาง"],
      ["ติดต่อเคียงนา Fishing Lake ได้ทางไหน", `ติดต่อผ่าน LINE ${siteContact.lineId} โทร ${siteContact.phone} อีเมล ${siteContact.email} หรือ Facebook/TikTok ของเคียงนา Fishing Lake`],
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
      "Add the LINE account kingnafishinglake",
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
      ["How can I contact Kiangna Fishing Lake?", `Contact LINE ${siteContact.lineId}, phone ${siteContact.phone}, email ${siteContact.email}, Facebook, or TikTok.`],
    ],
  },
} as const;
