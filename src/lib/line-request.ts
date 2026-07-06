import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function requireLineBrowser(redirectTo = "/line-guide") {
  const requestHeaders = await headers();
  const userAgent = requestHeaders.get("user-agent") || "";
  if (!/\bLine\//i.test(userAgent)) redirect(redirectTo);
}
