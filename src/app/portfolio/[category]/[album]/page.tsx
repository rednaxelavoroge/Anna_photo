import { AlbumGrid } from "@/components/AlbumGrid";
import { getAlbum, getCategories, getCategory } from "@/lib/content";
import { getPhotos } from "@/lib/photos";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Params = { category: string; album: string };

export function generateStaticParams() {
  return getCategories().flatMap((category) =>
    category.albums.map((album) => ({ category: category.slug, album: album.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { category: categorySlug, album: albumSlug } = await params;
  const album = getAlbum(categorySlug, albumSlug);
  if (!album) return {};
  return {
    title: album.title,
    description: album.description,
  };
}

export default async function AlbumPage({ params }: { params: Promise<Params> }) {
  const { category: categorySlug, album: albumSlug } = await params;
  const category = getCategory(categorySlug);
  const album = getAlbum(categorySlug, albumSlug);
  if (!category || !album) notFound();

  const photos = getPhotos(categorySlug, albumSlug);

  return (
    <article className="px-5 pt-28 pb-20 md:px-8">
      <p className="eyebrow">
        <Link href="/portfolio">Портфолио</Link>
        <span className="mx-3 text-line">/</span>
        <Link href={`/portfolio/${category.slug}`}>{category.menu}</Link>
        <span className="mx-3 text-line">/</span>
        {album.menu}
      </p>
      <h1 className="mt-4 max-w-4xl font-display text-4xl leading-[0.95] md:text-6xl">
        {album.title}
      </h1>
      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
        {album.description}
      </p>
      <div className="mt-14">
        <AlbumGrid photos={photos} slug={`${categorySlug}-${albumSlug}`} />
      </div>
    </article>
  );
}
