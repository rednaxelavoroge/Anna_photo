import { getPhotos as getPlaceholderPhotos, getBackstagePhotos as getPlaceholderBackstage, getAlbum, getCategory, type Photo } from "@/lib/content";
import fs from "node:fs";
import path from "node:path";

const PHOTO_EXT = /\.(jpe?g|png|webp|avif)$/i;

function readAlbumDir(segments: string[], altPrefix: string): Photo[] | null {
  const dir = path.join(process.cwd(), "public", "photos", ...segments);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return null;

  const files = fs.readdirSync(dir).filter((name) => PHOTO_EXT.test(name)).sort();
  if (files.length === 0) return null;

  return files.map((file, index) => ({
    id: file,
    src: `/photos/${[...segments, file].join("/")}`,
    alt: `${altPrefix} — кадр ${index + 1}`,
    width: 1600,
    height: 1200,
    featured: index === 0,
  }));
}

export function getPhotos(categorySlug: string, albumSlug?: string): Photo[] {
  const category = getCategory(categorySlug);
  const album = albumSlug ? getAlbum(categorySlug, albumSlug) : undefined;
  const altPrefix = album?.title ?? category?.title ?? "Фотография";
  const segments = albumSlug ? [categorySlug, albumSlug] : [categorySlug];
  return readAlbumDir(segments, altPrefix) ?? getPlaceholderPhotos(categorySlug, albumSlug, altPrefix);
}

export function getBackstagePhotos(): Photo[] {
  return readAlbumDir(["backstage"], "Бэкстейдж") ?? getPlaceholderBackstage();
}
