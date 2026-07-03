import { buildPageMetadata } from "@/lib/site";
import { ContactSitePage } from "@/components/site/SitePages";

export const metadata = buildPageMetadata("en", "contact");

export default function Page() {
  return <ContactSitePage locale="en" />;
}
