import type { MetadataRoute } from "next";
import { pagePaths, siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = Object.values(pagePaths).flatMap((paths) => [
    {
      url: `${siteUrl}${paths.th}`,
      lastModified: new Date(),
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
      lastModified: new Date(),
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

  return [
    ...pages,
    {
      url: `${siteUrl}/rankings`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.85,
    },
  ];
}
