import { buildPageMetadata } from "@/lib/site";
import { PolicyPage } from "@/components/site/PolicyPages";

export const metadata = buildPageMetadata("en", "privacy");

export default function Page() {
  return <PolicyPage locale="en" type="privacy" />;
}
