import { buildPageMetadata } from "@/lib/site";
import { PolicyPage } from "@/components/site/PolicyPages";

export const metadata = buildPageMetadata("th", "privacy");

export default function Page() {
  return <PolicyPage locale="th" type="privacy" />;
}
