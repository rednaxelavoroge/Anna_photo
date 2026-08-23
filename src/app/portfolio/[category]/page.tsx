import { AlbumGrid } from "@/components/AlbumGrid";
import { CoverArt } from "@/components/CoverArt";
import { getCategories, getCategory, getPhotos } from "@/lib/content";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

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
  const category = getCategory(slug);
  if (!category) notFound();

  const photos = getPhotos(slug);

  return (
    <article className="px-5 pt-28 pb-20 md:px-8">
      <p className="eyebrow">
        <Link href="/portfolio">Портфолио</Link>
        <span className="mx-3 text-line">/</span>
        {category.menu}
      </p>
      <h1 className="mt-4 max-w-4xl font-display text-4xl leading-[0.95] md:text-6xl">
        {category.title}
      </h1>
      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
        {category.description}
      </p>
      {category.cta ? (
        <Link href={category.cta.href} className="link-line mt-6 inline-block text-xs tracking-[0.2em] uppercase">
          {category.cta.label}
        </Link>
      ) : null}

      {category.albums.length > 0 ? (
        <div className="mt-16 grid gap-px bg-line md:grid-cols-2 lg:grid-cols-3">
          {category.albums.map((album) => (
            <Link
              key={album.slug}
              href={`/portfolio/${category.slug}/${album.slug}`}
              className="group bg-bg"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <div className="tile-zoom h-full">
                  <CoverArt slug={`${category.slug}-${album.slug}`} title={album.menu} />
                </div>
              </div>
              <div className="p-5">
                <p className="font-display text-2xl">{album.menu}</p>
                <p className="mt-2 text-sm text-muted">{album.title}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-14">
          <AlbumGrid photos={photos} slug={slug} />
        </div>
      )}
    </article>
  );
}
