import { buildPageMetadata } from "@/lib/site";
import { ArticlesSitePage } from "@/components/site/SitePages";

export const metadata = buildPageMetadata("en", "articles");

export default function Page() {
  return <ArticlesSitePage locale="en" />;
}
