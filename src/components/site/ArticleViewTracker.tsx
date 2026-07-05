"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/site";

export default function ArticleViewTracker({
  slug,
  initialCount,
  locale,
}: {
  slug: string;
  initialCount: number;
  locale: Locale;
}) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/articles/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
      keepalive: true,
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (!cancelled && typeof data?.viewCount === "number") {
          setCount(data.viewCount);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <p className="article-detail-views">
      {count.toLocaleString(locale === "th" ? "th-TH" : "en-US")} {locale === "th" ? "ยอดอ่าน" : "reads"}
    </p>
  );
}
