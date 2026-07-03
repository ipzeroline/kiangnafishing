import { buildPageMetadata } from "@/lib/site";
import { NewsSitePage } from "@/components/site/SitePages";

export const metadata = buildPageMetadata("en", "news");

export default function Page() {
  return <NewsSitePage locale="en" />;
}
