import type { Metadata } from "next";
import { AboutSitePage } from "@/components/site/SitePages";
import { siteContact, siteUrl } from "@/lib/site";

const title = "เกี่ยวกับเคียงนา Fishing Lake | บ่อตกปลาพะเยา ในอำเภอดอกคำใต้";
const description = "รู้จักเคียงนา Fishing Lake หรือเคียงนาฟิชชิ่งเลคพะเยา บ่อตกปลาพะเยา ในอำเภอดอกคำใต้ สำหรับคนค้นหาบ่อตกปลาใหญ่พะเยา บ่อตกปลาใหญ่ดอกคำใต้ และบ่อตกปลาใกล้ฉัน";
const image = `${siteUrl}/site/kiangna-lake-aerial-02.jpg`;

export const metadata: Metadata = {
  title,
  description,
  applicationName: "เคียงนา Fishing Lake",
  keywords: [
    "เกี่ยวกับเคียงนา Fishing Lake",
    "เคียงนา Fishing Lake",
    "เคียงนาฟิชชิ่งเลค",
    "เคียงนาfishinglake",
    "เคียงนาฟิชชิ่งเลคพะเยา",
    "เคียงนาfishinglakeพะเยา",
    "บ่อตกปลาพะเยา",
    "บ่อตกปลาดอกคำใต้",
    "บ่อตกปลาใหญ่พะเยา",
    "บ่อตกปลาใหญ่ดอกคำใต้",
    "บ่อตกปลาใกล้ฉัน",
    "บ่อตกปลาระบบทันสมัย",
    "ระบบบ่อตกปลา",
    "QR เข้าบ่อ",
    "เติมเครดิตตกปลา",
    "ส่งผลงานปลา",
    "อันดับนักตกปลา",
    "แกลลอรี่ผลงานปลา",
    "กิจกรรมตกปลาพะเยา",
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
    canonical: `${siteUrl}/about`,
    languages: {
      th: `${siteUrl}/about`,
      en: `${siteUrl}/en/about`,
      "x-default": `${siteUrl}/about`,
    },
  },
  openGraph: {
    title,
    description,
    url: `${siteUrl}/about`,
    siteName: "เคียงนา Fishing Lake",
    locale: "th_TH",
    type: "website",
    images: [{ url: image, width: 1200, height: 900, alt: "เคียงนา Fishing Lake บ่อตกปลาพะเยา" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [image],
  },
  other: {
    "business:contact_data:phone_number": siteContact.phone,
    "business:contact_data:email": siteContact.email,
  },
};

export default function Page() {
  return <AboutSitePage locale="th" />;
}
