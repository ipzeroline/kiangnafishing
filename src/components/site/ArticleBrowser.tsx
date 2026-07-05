"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { articlePath, type ArticleViewMap, type Locale } from "@/lib/site";

type ArticleBrowserItem = {
  slug: string;
  title: string;
  detail: string;
  alt: string;
  keywords: readonly string[];
};

const PAGE_SIZE = 9;

function ArticleCover({ article, index, locale }: { article: ArticleBrowserItem; index: number; locale: Locale }) {
  const coverNumber = String((index % 10) + 1);
  const label = locale === "th" ? "คู่มือตกปลา" : "Fishing Guide";

  return (
    <div className="article-cover" data-cover={coverNumber} aria-label={article.alt}>
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

export default function ArticleBrowser({
  locale,
  articles,
  viewCounts,
}: {
  locale: Locale;
  articles: readonly ArticleBrowserItem[];
  viewCounts: ArticleViewMap;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const numberLocale = locale === "th" ? "th-TH" : "en-US";
  const labels = locale === "th"
    ? {
        search: "ค้นหาบทความ",
        placeholder: "ค้นหา เช่น เหยื่อ ปลาใหญ่ ดอกคำใต้ LINE ranking",
        all: "บทความทั้งหมด",
        results: "ผลลัพธ์",
        reads: "ยอดอ่าน",
        noResults: "ไม่พบบทความที่ตรงกับคำค้นหา",
        clear: "ล้างคำค้นหา",
        previous: "ก่อนหน้า",
        next: "ถัดไป",
        read: "อ่านบทความ",
        page: "หน้า",
        of: "จาก",
      }
    : {
        search: "Search articles",
        placeholder: "Search bait, trophy fish, Dok Kham Tai, LINE, ranking",
        all: "All articles",
        results: "results",
        reads: "reads",
        noResults: "No articles match your search.",
        clear: "Clear search",
        previous: "Previous",
        next: "Next",
        read: "Read article",
        page: "Page",
        of: "of",
      };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return articles;
    return articles.filter((article) => {
      const haystack = `${article.title} ${article.detail} ${article.keywords.join(" ")}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [articles, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const totalViews = articles.reduce((sum, article) => sum + Number(viewCounts[article.slug] || 0), 0);

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <section className="article-browser" aria-label={labels.all}>
      <div className="article-browser-tools">
        <label>
          <span>{labels.search}</span>
          <input value={search} onChange={(event) => updateSearch(event.target.value)} placeholder={labels.placeholder} />
        </label>
        <div className="article-browser-stats">
          <span><strong>{articles.length.toLocaleString(numberLocale)}</strong>{labels.all}</span>
          <span><strong>{filtered.length.toLocaleString(numberLocale)}</strong>{labels.results}</span>
          <span><strong>{totalViews.toLocaleString(numberLocale)}</strong>{labels.reads}</span>
        </div>
      </div>

      {paged.length > 0 ? (
        <div className="article-grid">
          {paged.map((article) => {
            const originalIndex = articles.findIndex((item) => item.slug === article.slug);
            const index = originalIndex >= 0 ? originalIndex : 0;
            return (
              <Link key={article.title} href={articlePath(locale, article.slug)} className="article-card" aria-label={article.title}>
                <ArticleCover article={article} index={index} locale={locale} />
                <div className="article-card-body">
                  <p>{String(index + 1).padStart(2, "0")}</p>
                  <h2>{article.title}</h2>
                  <span>{article.detail}</span>
                  <small className="article-views">
                    {Number(viewCounts[article.slug] || 0).toLocaleString(numberLocale)} {labels.reads}
                  </small>
                  <div className="article-tags" aria-label={locale === "th" ? "คีย์เวิร์ดบทความ" : "Article keywords"}>
                    {article.keywords.map((keyword) => <b key={keyword}>{keyword}</b>)}
                  </div>
                </div>
                <span className="article-readmore">{labels.read}</span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="article-empty">
          <p>{labels.noResults}</p>
          <button type="button" onClick={() => updateSearch("")}>{labels.clear}</button>
        </div>
      )}

      <div className="article-pagination" aria-label={locale === "th" ? "แบ่งหน้าบทความ" : "Article pagination"}>
        <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={safePage <= 1}>
          {labels.previous}
        </button>
        <span>{labels.page} {safePage.toLocaleString(numberLocale)} {labels.of} {totalPages.toLocaleString(numberLocale)}</span>
        <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={safePage >= totalPages}>
          {labels.next}
        </button>
      </div>
    </section>
  );
}
