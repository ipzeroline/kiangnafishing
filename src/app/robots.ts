import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/login", "/member", "/line/", "/wallet", "/entry", "/catch"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
