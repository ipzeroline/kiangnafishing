import type { MetadataRoute } from "next";
import { pagePaths, siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return Object.values(pagePaths).flatMap((paths) => [
    {
      url: `${siteUrl}${paths.th}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: paths.th === "/" ? 1 : 0.8,
      alternates: {
        languages: {
          th: `${siteUrl}${paths.th}`,
          en: `${siteUrl}${paths.en}`,
        },
      },
    },
    {
      url: `${siteUrl}${paths.en}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: paths.en === "/en" ? 0.95 : 0.75,
      alternates: {
        languages: {
          th: `${siteUrl}${paths.th}`,
          en: `${siteUrl}${paths.en}`,
        },
      },
    },
  ]);
}
