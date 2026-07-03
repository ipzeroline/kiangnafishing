import { buildPageMetadata } from "@/lib/site";
import { ArticlesSitePage } from "@/components/site/SitePages";

export const metadata = buildPageMetadata("th", "articles");

export default function Page() {
  return <ArticlesSitePage locale="th" />;
}
