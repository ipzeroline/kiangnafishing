import type { Locale } from "@/lib/site";

type ArticleCoverItem = {
  slug: string;
  alt: string;
  keywords: readonly string[];
};

function coverTopic(slug: string) {
  if (slug.includes("bait")) return "bait";
  if (slug.includes("rod") || slug.includes("reel")) return "gear";
  if (slug.includes("morning") || slug.includes("weather")) return "weather";
  if (slug.includes("fighting") || slug.includes("big-fish") || slug.includes("ranking")) return "trophy";
  if (slug.includes("photo")) return "camera";
  if (slug.includes("release") || slug.includes("monthly")) return "calendar";
  if (slug.includes("line") || slug.includes("credit")) return "line";
  if (slug.includes("family")) return "family";
  if (slug.includes("travel") || slug.includes("dok-kham-tai")) return "map";
  if (slug.includes("etiquette") || slug.includes("care")) return "care";
  return "lake";
}

function TopicScene({ topic }: { topic: string }) {
  return (
    <svg className="article-cover-scene" viewBox="0 0 320 190" aria-hidden="true">
      <path className="scene-water" d="M0 138c32-14 62-14 96 0s64 14 96 0 64-14 128 0v52H0Z" />
      <path className="scene-shore" d="M0 154c52-10 96-5 132 8 42 15 89 8 188-12v40H0Z" />
      {topic === "bait" && (
        <>
          <path className="scene-line" d="M72 24c38 34 50 67 36 100" />
          <circle className="scene-dot" cx="110" cy="126" r="11" />
          <path className="scene-small" d="M176 94c29-26 62-26 98 0-36 26-69 26-98 0Z" />
          <circle className="scene-eye" cx="192" cy="90" r="3" />
        </>
      )}
      {topic === "gear" && (
        <>
          <path className="scene-line" d="M48 128 228 34" />
          <circle className="scene-ring" cx="92" cy="107" r="18" />
          <circle className="scene-dot" cx="92" cy="107" r="5" />
          <path className="scene-small" d="M220 104c24-19 50-19 78 0-28 19-54 19-78 0Z" />
        </>
      )}
      {topic === "weather" && (
        <>
          <circle className="scene-sun" cx="74" cy="56" r="28" />
          <path className="scene-cloud" d="M146 68c8-18 33-22 46-8 17-5 34 7 34 24h-96c0-9 7-16 16-16Z" />
          <path className="scene-line" d="M208 26c22 20 32 43 29 70" />
        </>
      )}
      {topic === "trophy" && (
        <>
          <path className="scene-fish" d="M82 88c52-43 111-43 176 0-65 43-124 43-176 0Z" />
          <path className="scene-tail" d="M250 88 292 54v68Z" />
          <circle className="scene-eye" cx="112" cy="80" r="5" />
          <path className="scene-small" d="M140 38h70l-10 24h-50Z" />
        </>
      )}
      {topic === "camera" && (
        <>
          <rect className="scene-card" x="78" y="52" width="150" height="92" rx="18" />
          <circle className="scene-ring" cx="153" cy="98" r="28" />
          <circle className="scene-dot" cx="153" cy="98" r="11" />
          <path className="scene-small" d="M212 74h34v22h-34Z" />
        </>
      )}
      {topic === "calendar" && (
        <>
          <rect className="scene-card" x="70" y="44" width="156" height="108" rx="16" />
          <path className="scene-line" d="M70 76h156" />
          <path className="scene-small" d="M98 102h24M138 102h24M178 102h24M98 128h24M138 128h24" />
          <path className="scene-fish" d="M220 122c22-16 43-16 67 0-24 16-45 16-67 0Z" />
        </>
      )}
      {topic === "line" && (
        <>
          <rect className="scene-card" x="84" y="42" width="126" height="104" rx="25" />
          <path className="scene-small" d="M116 78h62M116 102h44M116 126h70" />
          <circle className="scene-dot" cx="226" cy="62" r="20" />
          <path className="scene-line" d="M220 62h12M226 56v12" />
        </>
      )}
      {topic === "family" && (
        <>
          <circle className="scene-dot" cx="98" cy="76" r="17" />
          <circle className="scene-dot" cx="146" cy="68" r="21" />
          <circle className="scene-dot" cx="198" cy="78" r="16" />
          <path className="scene-card" d="M72 145c8-36 45-43 72-18 27-25 66-18 82 18Z" />
          <path className="scene-line" d="M216 40c23 20 30 44 22 75" />
        </>
      )}
      {topic === "map" && (
        <>
          <path className="scene-card" d="M72 54 132 34l62 20 62-20v104l-62 20-62-20-60 20Z" />
          <path className="scene-line" d="M132 34v104M194 54v104" />
          <path className="scene-dot" d="M164 80c0-18 27-18 27 0 0 13-14 30-14 30s-13-17-13-30Z" />
        </>
      )}
      {topic === "care" && (
        <>
          <path className="scene-fish" d="M76 94c44-34 92-34 145 0-53 34-101 34-145 0Z" />
          <path className="scene-tail" d="M214 94 248 68v52Z" />
          <path className="scene-small" d="M128 50c15-22 44-22 59 0 15-22 44-22 59 0" />
          <circle className="scene-eye" cx="104" cy="88" r="4" />
        </>
      )}
      {topic === "lake" && (
        <>
          <path className="scene-line" d="M64 130c40-70 95-96 168-78" />
          <path className="scene-fish" d="M128 102c34-26 73-26 117 0-44 26-83 26-117 0Z" />
          <circle className="scene-sun" cx="78" cy="54" r="22" />
        </>
      )}
    </svg>
  );
}

export default function ArticleCover({
  article,
  index,
  locale,
  large = false,
}: {
  article: ArticleCoverItem;
  index: number;
  locale: Locale;
  large?: boolean;
}) {
  const coverNumber = String((index % 10) + 1);
  const label = locale === "th" ? "คู่มือตกปลา" : "Fishing Guide";
  const topic = coverTopic(article.slug);

  return (
    <div className={large ? "article-cover article-cover-large" : "article-cover"} data-cover={coverNumber} data-topic={topic} aria-label={article.alt}>
      <TopicScene topic={topic} />
      <div className="article-cover-mark" aria-hidden="true">
        <svg viewBox="0 0 28 28">
          <path d="M4 15.5c5.4-5.5 11.6-5.5 18 0-6.4 5.5-12.6 5.5-18 0Z" />
          <path d="M21.5 15.5 25 12v7l-3.5-3.5Z" />
          <circle cx="9.2" cy="14.5" r="1.15" />
        </svg>
      </div>
      <div className="article-cover-copy">
        <p>{label}</p>
        <strong>{article.keywords[0]}</strong>
        <span>{article.keywords.slice(1).join(" / ")}</span>
      </div>
    </div>
  );
}
