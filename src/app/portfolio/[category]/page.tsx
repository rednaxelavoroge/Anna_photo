import { PhotoTape } from "@/components/PhotoTape";
import { PortfolioNav } from "@/components/PortfolioNav";
import { LEGACY_CATEGORY_REDIRECTS } from "@/lib/legacy-routes";
import { getCategories, getCategory } from "@/lib/content";
import { getPhotos } from "@/lib/photos";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

type Params = { category: string };

export function generateStaticParams() {
  return getCategories().map((item) => ({ category: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};
  return {
    title: category.title,
    description: category.description,
    keywords: category.keywords,
  };
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { category: slug } = await params;
  const legacy = LEGACY_CATEGORY_REDIRECTS.find((item) => item.from === slug);
  if (legacy && process.env.NAMECHEAP_EXPORT !== "1") redirect(`/portfolio/${legacy.to}`);

  const category = getCategory(slug);
  if (!category) notFound();

  const photos = getPhotos(slug);
  const categories = getCategories();

  return (
    <article className="tape-page">
      <PortfolioNav categories={categories} activeSlug={slug} categoryName={category.menu} />
      <PhotoTape photos={photos} slug={slug} />
    </article>
  );
}
