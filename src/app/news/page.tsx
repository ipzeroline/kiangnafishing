import { buildPageMetadata } from "@/lib/site";
import { NewsSitePage } from "@/components/site/SitePages";

export const metadata = buildPageMetadata("th", "news");

export default function Page() {
  return <NewsSitePage locale="th" />;
}
