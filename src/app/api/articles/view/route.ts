import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { execute, queryOne, transaction, uid } from "@/lib/db";
import { articleItems, type Locale } from "@/lib/site";

const VIEW_COOKIE = "kfl_article_visitor";
const ONE_YEAR = 60 * 60 * 24 * 365;

function isKnownSlug(slug: string) {
  return (["th", "en"] as Locale[]).some((locale) => articleItems[locale].some((article) => article.slug === slug));
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const slug = String(body.slug || "").trim();

  if (!slug || !isKnownSlug(slug)) {
    return NextResponse.json({ error: "invalid slug" }, { status: 400 });
  }

  const store = await cookies();
  let visitorId = store.get(VIEW_COOKIE)?.value || "";
  let shouldSetCookie = false;

  if (!/^[a-f0-9]{24}$/.test(visitorId)) {
    visitorId = uid();
    shouldSetCookie = true;
  }

  let counted = false;
  await transaction(async (client) => {
    const existing = await queryOne<{ id: string }>(
      "SELECT id FROM article_view_events WHERE slug=? AND visitorId=? LIMIT 1",
      [slug, visitorId],
      client
    );
    if (existing) return;

    await execute(
      "INSERT INTO article_view_events (id, slug, visitorId) VALUES (?,?,?)",
      [uid(), slug, visitorId],
      client
    );
    await execute(
      "INSERT INTO article_views (slug, viewCount) VALUES (?,1) ON DUPLICATE KEY UPDATE viewCount=viewCount+1",
      [slug],
      client
    );
    counted = true;
  });

  const row = await queryOne<{ viewCount: number }>("SELECT viewCount FROM article_views WHERE slug=? LIMIT 1", [slug]);
  const res = NextResponse.json({ ok: true, counted, viewCount: Number(row?.viewCount || 0) });
  if (shouldSetCookie) {
    res.cookies.set(VIEW_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: ONE_YEAR,
    });
  }
  return res;
}
