import type { MetadataRoute } from "next";
import { articleItems, articlePath, pagePaths, siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const pages = Object.values(pagePaths).flatMap((paths) => [
    {
      url: `${siteUrl}${paths.th}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: paths.th === "/" ? 1 : 0.8,
      alternates: {
        languages: {
          th: `${siteUrl}${paths.th}`,
          en: `${siteUrl}${paths.en}`,
          "x-default": `${siteUrl}${paths.th}`,
        },
      },
    },
    {
      url: `${siteUrl}${paths.en}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: paths.en === "/en" ? 0.95 : 0.75,
      alternates: {
        languages: {
          th: `${siteUrl}${paths.th}`,
          en: `${siteUrl}${paths.en}`,
          "x-default": `${siteUrl}${paths.th}`,
        },
      },
    },
  ]);
  const articlePages = articleItems.th.flatMap((article) => [
    {
      url: `${siteUrl}${articlePath("th", article.slug)}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.72,
      alternates: {
        languages: {
          th: `${siteUrl}${articlePath("th", article.slug)}`,
          en: `${siteUrl}${articlePath("en", article.slug)}`,
          "x-default": `${siteUrl}${articlePath("th", article.slug)}`,
        },
      },
    },
    {
      url: `${siteUrl}${articlePath("en", article.slug)}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.68,
      alternates: {
        languages: {
          th: `${siteUrl}${articlePath("th", article.slug)}`,
          en: `${siteUrl}${articlePath("en", article.slug)}`,
          "x-default": `${siteUrl}${articlePath("th", article.slug)}`,
        },
      },
    },
  ]);

  return [
    ...pages,
    ...articlePages,
    {
      url: `${siteUrl}/rankings`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.85,
    },
  ];
}
