import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Thai } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-aura",
  subsets: ["thai", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kiangnafishinglake.com"),
  title: {
    default: "เคียงนา Fishing Lake",
    template: "%s",
  },
  description: "เคียงนา Fishing Lake หรือเคียงนาฟิชชิ่งเลคพะเยา บ่อตกปลาพะเยา ในอำเภอดอกคำใต้ สำหรับบ่อตกปลาใหญ่พะเยา บ่อตกปลาใหญ่ดอกคำใต้ และบ่อตกปลาใกล้ฉัน พร้อมบริการผ่าน LINE",
  applicationName: "เคียงนา Fishing Lake",
  keywords: [
    "เคียงนา Fishing Lake",
    "เคียงนาฟิชชิ่งเลค",
    "เคียงนาfishinglake",
    "เคียงนาฟิชชิ่งเลคพะเยา",
    "เคียงนาfishinglakeพะเยา",
    "บ่อตกปลา",
    "บ่อตกปลาพะเยา",
    "บ่อตกปลาดอกคำใต้",
    "บ่อตกปลาใหญ่พะเยา",
    "บ่อตกปลาใหญ่ดอกคำใต้",
    "บ่อตกปลาใกล้ฉัน",
    "Fishing Lake Thailand",
    "บ่อตกปลาพรีเมียม",
    "LINE",
  ],
  authors: [{ name: "เคียงนา Fishing Lake" }],
  creator: "เคียงนา Fishing Lake",
  publisher: "เคียงนา Fishing Lake",
  alternates: { canonical: "/" },
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
    title: "เคียงนา Fishing Lake",
    description: "เคียงนา Fishing Lake หรือเคียงนาฟิชชิ่งเลคพะเยา บ่อตกปลาพะเยา ในอำเภอดอกคำใต้ พร้อมบริการผ่าน LINE",
    url: "https://kiangnafishinglake.com",
    siteName: "เคียงนา Fishing Lake",
    locale: "th_TH",
    type: "website",
    images: [{ url: "/site/kiangna-lake-aerial-01.jpg", width: 1200, height: 900, alt: "เคียงนา Fishing Lake บ่อตกปลาพะเยา" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "เคียงนา Fishing Lake",
    description: "บ่อตกปลาพะเยา ในอำเภอดอกคำใต้ บ่อตกปลาใหญ่พะเยา และบ่อตกปลาใกล้ฉัน พร้อมบริการผ่าน LINE",
    images: ["/site/kiangna-lake-aerial-01.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      { rel: "icon", url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { rel: "icon", url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  formatDetection: { telephone: false },
};
export const viewport: Viewport = {
  width: "device-width", initialScale: 1, themeColor: "#0a3540",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${inter.variable} ${notoSansThai.variable}`}>
      <body className="min-h-dvh bg-surface">
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-LL0CD6S5L4" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-LL0CD6S5L4');
          `}
        </Script>
        <div className="min-h-dvh w-full bg-surface">
          {children}
        </div>
      </body>
    </html>
  );
}
