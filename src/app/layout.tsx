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
  description: "เคียงนา Fishing Lake บ่อตกปลาพะเยา บ่อตกปลาดอกคำใต้ และบ่อตกปลาใหญ่พะเยา พร้อมบริการผ่าน LINE",
  applicationName: "เคียงนา Fishing Lake",
  keywords: [
    "เคียงนา Fishing Lake",
    "บ่อตกปลา",
    "บ่อตกปลาพะเยา",
    "บ่อตกปลาดอกคำใต้",
    "บ่อตกปลาใหญ่พะเยา",
    "บ่อตกปลาใหญ่ดอกคำใต้",
    "Fishing Lake Thailand",
    "บ่อตกปลาพรีเมียม",
    "LINE",
  ],
  authors: [{ name: "เคียงนา Fishing Lake" }],
  creator: "เคียงนา Fishing Lake",
  publisher: "เคียงนา Fishing Lake",
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
