import { resolveLegacyAlbum } from "@/lib/legacy-routes";
import { LEGACY_ALBUM_REDIRECTS } from "@/lib/legacy-routes";
import { getCategory } from "@/lib/content";
import { notFound, redirect } from "next/navigation";

type Params = { category: string; album: string };

export function generateStaticParams() {
  return LEGACY_ALBUM_REDIRECTS.map((item) => ({
    category: item.category,
    album: item.album,
  }));
}

function targetPath(category: string, album: string) {
  const to = resolveLegacyAlbum(category, album);
  if (to) return `/portfolio/${to}`;
  if (getCategory(category)) return `/portfolio/${category}`;
  return null;
}

export default async function AlbumRedirectPage({ params }: { params: Promise<Params> }) {
  const { category, album } = await params;
  const href = targetPath(category, album);
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
