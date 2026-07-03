import { buildPageMetadata } from "@/lib/site";
import { AboutSitePage } from "@/components/site/SitePages";

export const metadata = buildPageMetadata("th", "about");

export default function Page() {
  return <AboutSitePage locale="th" />;
}
