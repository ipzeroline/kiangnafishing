import { buildPageMetadata } from "@/lib/site";
import { HomeSitePage } from "@/components/site/SitePages";
import { redirect } from "next/navigation";

export const metadata = buildPageMetadata("en", "home");
export const dynamic = "force-dynamic";

function safeLiffStateTarget(value: string | string[] | undefined) {
  const state = Array.isArray(value) ? value[0] : value;
  if (!state) return "";
  const decoded = decodeURIComponent(state);
  return /^\/(line\/entry|line\/wallet|line\/catch|ranking)([/?#].*)?$/.test(decoded) ? decoded : "";
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const liffTarget = safeLiffStateTarget(params?.["liff.state"]);
  if (liffTarget) redirect(liffTarget);

  return <HomeSitePage locale="en" />;
}
