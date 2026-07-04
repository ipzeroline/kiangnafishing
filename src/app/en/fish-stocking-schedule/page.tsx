import { buildPageMetadata } from "@/lib/site";
import { FishStockingSitePage } from "@/components/site/SitePages";

export const metadata = buildPageMetadata("en", "fishStocking");
export const dynamic = "force-dynamic";

export default function Page() {
  return <FishStockingSitePage locale="en" />;
}
