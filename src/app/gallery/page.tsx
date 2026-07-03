import { buildPageMetadata } from "@/lib/site";
import { GallerySitePage } from "@/components/site/SitePages";

export const metadata = buildPageMetadata("th", "gallery");

export default function Page() {
  return <GallerySitePage locale="th" />;
}
