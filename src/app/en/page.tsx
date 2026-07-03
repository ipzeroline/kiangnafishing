import { buildPageMetadata } from "@/lib/site";
import { HomeSitePage } from "@/components/site/SitePages";

export const metadata = buildPageMetadata("en", "home");
export const dynamic = "force-dynamic";

export default function Page() {
  return <HomeSitePage locale="en" />;
}
