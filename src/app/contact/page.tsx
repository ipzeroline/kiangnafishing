import { buildPageMetadata } from "@/lib/site";
import { ContactSitePage } from "@/components/site/SitePages";

export const metadata = buildPageMetadata("th", "contact");

export default function Page() {
  return <ContactSitePage locale="th" />;
}
