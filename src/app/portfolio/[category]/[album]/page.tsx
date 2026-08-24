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

export default async function AlbumRedirectPage({ params }: { params: Promise<Params> }) {
  const { category, album } = await params;
  const to = resolveLegacyAlbum(category, album);
  if (to) redirect(`/portfolio/${to}`);
  if (getCategory(category)) redirect(`/portfolio/${category}`);
  notFound();
}
