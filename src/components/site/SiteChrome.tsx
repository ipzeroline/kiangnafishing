import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { Locale, SitePage, pagePaths, siteContact, siteContent } from "@/lib/site";

const navItems = ["home", "news", "articles", "fishStocking", "gallery", "about", "contact"] as const;

function SocialIcon({ type }: { type: "facebook" | "instagram" | "tiktok" }) {
  if (type === "facebook") {
    return (
      <span className="site-social-icon site-social-icon-facebook" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M14.2 8.1h2.2V4.4a29 29 0 0 0-3.2-.2c-3.2 0-5.4 2-5.4 5.6V13H4.4v4.2h3.4V24h4.2v-6.8h3.3l.5-4.2H12V10.2c0-1.2.3-2.1 2.2-2.1Z" />
        </svg>
      </span>
    );
  }
  if (type === "instagram") {
    return (
      <span className="site-social-icon site-social-icon-instagram" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M7.2 2h9.6A5.2 5.2 0 0 1 22 7.2v9.6a5.2 5.2 0 0 1-5.2 5.2H7.2A5.2 5.2 0 0 1 2 16.8V7.2A5.2 5.2 0 0 1 7.2 2Zm0 2.1a3.1 3.1 0 0 0-3.1 3.1v9.6a3.1 3.1 0 0 0 3.1 3.1h9.6a3.1 3.1 0 0 0 3.1-3.1V7.2a3.1 3.1 0 0 0-3.1-3.1H7.2Zm4.8 3.6a4.3 4.3 0 1 1 0 8.6 4.3 4.3 0 0 1 0-8.6Zm0 2.1a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4Zm5.1-2.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
        </svg>
      </span>
    );
  }
  return (
    <span className="site-social-icon site-social-icon-tiktok" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d="M16.7 3c.4 2.7 1.9 4.4 4.3 4.6v4.1a8.2 8.2 0 0 1-4.2-1.2v5.7c0 4.3-2.7 6.8-6.5 6.8-3.4 0-6.2-2.5-6.2-5.9 0-3.9 3-6.3 7-5.8v4.3c-1.7-.5-2.9.3-2.9 1.6 0 1.1.9 1.8 2 1.8 1.4 0 2.3-.8 2.3-2.8V3h4.2Z" />
      </svg>
    </span>
  );
}

export default function SiteChrome({
  locale,
  page,
  alternateHref,
  children,
}: {
  locale: Locale;
  page: SitePage;
  alternateHref?: string;
  children: React.ReactNode;
}) {
  const content = siteContent[locale];
  const otherLocale: Locale = locale === "th" ? "en" : "th";
  const langLabel = otherLocale === "en" ? "English" : "ไทย";

  return (
    <div className="site-shell">
      <header className="site-header">
        <Link href={pagePaths.home[locale]} className="site-brand" aria-label={content.brand}>
          <span className="site-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 28 28" role="img">
              <path d="M4 15.5c5.4-5.5 11.6-5.5 18 0-6.4 5.5-12.6 5.5-18 0Z" />
              <path d="M21.5 15.5 25 12v7l-3.5-3.5Z" />
              <circle cx="9.2" cy="14.5" r="1.15" />
              <path d="M13 9.4c1.9-3.2 5.4-4.5 8.4-2.8" />
            </svg>
          </span>
          <span>{content.brand}</span>
        </Link>
        <nav className="site-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item} href={pagePaths[item][locale]} className={item === page ? "active" : ""}>
              {content.nav[item]}
            </Link>
          ))}
        </nav>
        <div className="site-actions">
          <details className="mobile-menu">
            <summary aria-label={locale === "th" ? "เปิดเมนู" : "Open menu"} title={locale === "th" ? "เมนู" : "Menu"}>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </summary>
            <div className="mobile-menu-panel">
              <div className="mobile-menu-heading">
                <span>{locale === "th" ? "เมนูเว็บไซต์" : "Website Menu"}</span>
                <small>{content.brand}</small>
              </div>
              <div className="mobile-menu-section">
                {navItems.map((item) => (
                  <Link key={item} href={pagePaths[item][locale]} className={item === page ? "active" : ""}>
                    {content.nav[item]}
                  </Link>
                ))}
              </div>
              <div className="mobile-menu-section">
                <p>{locale === "th" ? "ช่องทางติดต่อ" : "Contact Channels"}</p>
                <a href={siteContact.phoneHref}>{siteContact.phone}</a>
                <a href={siteContact.emailHref}>{siteContact.email}</a>
                <a href={siteContact.lineHref}>LINE {siteContact.lineId}</a>
                <a href={siteContact.facebookHref}><SocialIcon type="facebook" />Facebook</a>
                <a href={siteContact.instagramHref}><SocialIcon type="instagram" />Instagram</a>
                <a href={siteContact.tiktokHref}><SocialIcon type="tiktok" />TikTok</a>
              </div>
            </div>
          </details>
          <ThemeToggle label={locale === "th" ? "เปลี่ยนโหมดสี" : "Toggle color mode"} />
          <Link
            href={alternateHref || pagePaths[page][otherLocale]}
            className="site-lang"
            aria-label={otherLocale === "en" ? "Switch to English" : "เปลี่ยนเป็นภาษาไทย"}
            title={otherLocale === "en" ? "English" : "ภาษาไทย"}
          >
            <span aria-hidden="true">{otherLocale === "en" ? "🇬🇧" : "🇹🇭"}</span>
            <b>{langLabel}</b>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 6l4 4 4-4" />
            </svg>
          </Link>
        </div>
      </header>
      {children}
      <footer className="site-footer">
        <div className="site-footer-main">
          <div className="site-footer-about">
            <p className="site-footer-brand">{content.brand}</p>
            <p>
              {locale === "th"
                ? "บ่อตกปลาพรีเมียมในพื้นที่พะเยาและดอกคำใต้ ให้บริการลูกค้าผ่าน LINE เพื่อให้เครดิต แต้ม คูปอง QR เข้าบ่อ และผลงานปลาอยู่ในระบบที่ตรวจสอบได้"
                : "A premium fishing lake serving anglers through the LINE account, keeping credits, points, coupons, entry QR, and catch records organized and auditable."}
            </p>
            <div className="site-footer-line">
              <span>LINE</span>
              <strong>{siteContact.lineId}</strong>
            </div>
            <div className="site-footer-contact">
              <a href={siteContact.phoneHref}>{siteContact.phone}</a>
              <a href={siteContact.emailHref}>{siteContact.email}</a>
              <a href={siteContact.facebookHref} target="_blank" rel="noopener noreferrer"><SocialIcon type="facebook" />Facebook</a>
              <a href={siteContact.instagramHref} target="_blank" rel="noopener noreferrer"><SocialIcon type="instagram" />Instagram</a>
              <a href={siteContact.tiktokHref} target="_blank" rel="noopener noreferrer"><SocialIcon type="tiktok" />TikTok</a>
            </div>
          </div>
          <div className="site-footer-col">
            <h2>{locale === "th" ? "เว็บไซต์" : "Website"}</h2>
            {navItems.map((item) => (
              <Link key={item} href={pagePaths[item][locale]}>{content.nav[item]}</Link>
            ))}
          </div>
          <div className="site-footer-col">
            <h2>{locale === "th" ? "บริการผ่าน LINE" : "LINE Services"}</h2>
            <p>{locale === "th" ? "QR เข้าบ่อ" : "Entry QR"}</p>
            <p>{locale === "th" ? "เครดิตและแต้ม" : "Credits and points"}</p>
            <p>{locale === "th" ? "ส่งผลงานปลาและดูอันดับ" : "Catch submissions and ranking"}</p>
            <p>{locale === "th" ? "คูปองและรางวัล" : "Coupons and rewards"}</p>
          </div>
          <div className="site-footer-col">
            <h2>{locale === "th" ? "ข้อมูลสำคัญ" : "Important Information"}</h2>
            <Link href={pagePaths.privacy[locale]}>{locale === "th" ? "นโยบายความเป็นส่วนตัว" : "Privacy Policy"}</Link>
            <Link href={pagePaths.terms[locale]}>{locale === "th" ? "ข้อกำหนดและเงื่อนไข" : "Terms and Conditions"}</Link>
            <Link href={pagePaths.contact[locale]}>{content.nav.contact}</Link>
            <a href={siteContact.phoneHref}>{siteContact.phone}</a>
            <a href={siteContact.emailHref}>{siteContact.email}</a>
            <a href={siteContact.facebookHref} target="_blank" rel="noopener noreferrer"><SocialIcon type="facebook" />Facebook</a>
            <a href={siteContact.instagramHref} target="_blank" rel="noopener noreferrer"><SocialIcon type="instagram" />Instagram</a>
            <a href={siteContact.tiktokHref} target="_blank" rel="noopener noreferrer"><SocialIcon type="tiktok" />TikTok</a>
          </div>
        </div>
        <div className="site-footer-bottom">
          <p>Copyright © 2026 {content.brand}. {locale === "th" ? "สงวนสิทธิ์ทุกประการ" : "All rights reserved."}</p>
          <div>
            <Link href={pagePaths.privacy[locale]}>{locale === "th" ? "ความเป็นส่วนตัว" : "Privacy"}</Link>
            <Link href={pagePaths.terms[locale]}>{locale === "th" ? "เงื่อนไข" : "Terms"}</Link>
            <span>{locale === "th" ? "ไทย" : "English"}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
