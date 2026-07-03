import { buildPageMetadata } from "@/lib/site";
import { HomeSitePage } from "@/components/site/SitePages";

export const metadata = buildPageMetadata("th", "home");
export const dynamic = "force-dynamic";

export default function Page() {
  return <HomeSitePage locale="th" />;
}
