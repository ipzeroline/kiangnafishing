import { notFound } from "next/navigation";
import { ArticleDetailPage } from "@/components/site/SitePages";
import { articleDetailMetadata, articleItems, findArticle } from "@/lib/site";

export function generateStaticParams() {
  return articleItems.th.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return articleDetailMetadata("th", slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = findArticle("th", slug);

  if (!article) {
    notFound();
  }

  return <ArticleDetailPage locale="th" article={article} />;
}
