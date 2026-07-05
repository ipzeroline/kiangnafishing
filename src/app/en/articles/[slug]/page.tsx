import { notFound } from "next/navigation";
import { ArticleDetailPage } from "@/components/site/SitePages";
import { articleDetailMetadata, articleItems, findArticle } from "@/lib/site";

export function generateStaticParams() {
  return articleItems.en.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return articleDetailMetadata("en", slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = findArticle("en", slug);

  if (!article) {
    notFound();
  }

  return <ArticleDetailPage locale="en" article={article} />;
}
