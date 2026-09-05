import { PhotoTape } from "@/components/PhotoTape";
import { PortfolioNav } from "@/components/PortfolioNav";
import { TagStrip } from "@/components/TagStrip";
import { LEGACY_ALBUM_REDIRECTS, resolveLegacyAlbum } from "@/lib/legacy-routes";
import { getCategories, getCategory, getStudioTags } from "@/lib/content";
import { getCategoryTags, getTagPhotos } from "@/lib/photos";
import { extrasFor } from "@/lib/portfolio-extras";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

type Params = { category: string; album: string };

/**
 * /portfolio/<раздел>/<подраздел> — страница подраздела (метки из панели):
 * «Путешествия → Армения». Старые вложенные адреса WordPress, которые
 * совпадают с этим же путём, по-прежнему переадресуются в раздел.
 */
export function generateStaticParams() {
  const tagPages = getCategories().flatMap((category) =>
    getCategoryTags(category.slug).map((tag) => ({ category: category.slug, album: tag.slug })),
  );
  const legacy = LEGACY_ALBUM_REDIRECTS.map((item) => ({ category: item.category, album: item.album }));
  const seen = new Set<string>();
  return [...tagPages, ...legacy].filter((item) => {
    const key = `${item.category}/${item.album}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isTagPage(category: string, album: string) {
  return Boolean(getCategory(category)) && getTagPhotos(category, album).length > 0;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category: slug, album } = await params;
  if (!isTagPage(slug, album)) return {};
  const category = getCategory(slug)!;
  const tag = getStudioTags().find((item) => item.slug === album);
  return {
    title: `${category.menu} — ${tag?.name ?? album}`,
    description: category.description,
    keywords: category.keywords,
  };
}

function targetPath(category: string, album: string) {
  const to = resolveLegacyAlbum(category, album);
  if (to) return `/portfolio/${to}`;
  if (getCategory(category)) return `/portfolio/${category}`;
  return null;
}

export default async function AlbumPage({ params }: { params: Promise<Params> }) {
  const { category: slug, album } = await params;

  if (isTagPage(slug, album)) {
    const category = getCategory(slug)!;
    return (
      <article className="tape-page">
        <PortfolioNav categories={getCategories()} activeSlug={slug} categoryName={category.menu} />
        <TagStrip categorySlug={slug} tags={getCategoryTags(slug)} activeTag={album} extras={extrasFor(slug)} />
        <PhotoTape photos={getTagPhotos(slug, album)} slug={`${slug}-${album}`} />
      </article>
    );
  }

  const href = targetPath(slug, album);
  if (!href) notFound();

  // Static HTML export cannot use next/navigation redirect().
  if (process.env.NAMECHEAP_EXPORT === "1") {
    const dest = `${href}/`;
    return (
      <p className="px-5 py-24 text-sm">
        <script dangerouslySetInnerHTML={{ __html: `location.replace(${JSON.stringify(dest)});` }} />
        <a href={dest}>Перейти в раздел</a>
      </p>
    );
  }

  redirect(href);
}
