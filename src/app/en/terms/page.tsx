import { buildPageMetadata } from "@/lib/site";
import { PolicyPage } from "@/components/site/PolicyPages";

export const metadata = buildPageMetadata("en", "terms");

export default function Page() {
  return <PolicyPage locale="en" type="terms" />;
}
