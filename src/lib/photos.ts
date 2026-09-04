import { getPhotos as getPlaceholderPhotos, getBackstagePhotos as getPlaceholderBackstage, getTaggedPhotos, getAllTaggedPhotos, getBackstageEntries, getCategories, type Photo } from "@/lib/content";
import { getPreviewCover } from "@/lib/preview";
import fs from "node:fs";
import path from "node:path";

const PHOTO_EXT = /\.(jpe?g|png|webp|avif)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov)$/i;
const MEDIA_EXT = /\.(jpe?g|png|webp|avif|mp4|webm|mov)$/i;

const FOLDER_ALIASES: Record<string, string[]> = {
  bloom: ["bloom", "blooming"],
  blooming: ["blooming", "bloom"],
  product: ["product", "objects"],
  objects: ["objects", "product"],
};

function resolveDir(segments: string[]): { dir: string; segs: string[] } | null {
  const primary = path.join(process.cwd(), "public", "photos", ...segments);
  if (fs.existsSync(primary) && fs.statSync(primary).isDirectory()) {
    return { dir: primary, segs: segments };
  }
  const last = segments[segments.length - 1];
  const aliases = FOLDER_ALIASES[last] || [];
  for (const alias of aliases) {
    const candidate = [...segments.slice(0, -1), alias];
    const candDir = path.join(process.cwd(), "public", "photos", ...candidate);
    if (fs.existsSync(candDir) && fs.statSync(candDir).isDirectory()) {
      return { dir: candDir, segs: candidate };
    }
  }
  return null;
}

function readAlbumDir(segments: string[], altPrefix: string): Photo[] | null {
  const resolved = resolveDir(segments);
  if (!resolved) return null;

  const files = fs
    .readdirSync(resolved.dir)
    .filter((name) => MEDIA_EXT.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
  if (files.length === 0) return null;

  return files.map((file, index) => ({
    id: `${resolved.segs.join("/")}/${file}`,
    src: `/photos/${[...resolved.segs, file].join("/")}`,
    alt: `${altPrefix} — ${index + 1}`,
    width: 1600,
    height: VIDEO_EXT.test(file) ? 900 : 1200,
    featured: index === 0,
    kind: VIDEO_EXT.test(file) ? "video" : "image",
  }));
}

function previewAsAlbum(slug: string, alt: string): Photo[] | null {
  const src = getPreviewCover(slug);
  if (!src) return null;
  return [
    {
      id: `preview-${slug}`,
      src,
      alt,
      width: 1600,
      height: 1200,
      featured: true,
    },
  ];
}

function mergePhotos(...lists: Photo[][]): Photo[] {
  const byKey = new Map<string, Photo>();
  for (const list of lists) {
    for (const photo of list) {
      const key = photo.src ?? photo.id;
      if (!byKey.has(key)) byKey.set(key, photo);
    }
  }
  return [...byKey.values()];
}

export function getLibraryPhotos(): Photo[] {
  const tagged = getAllTaggedPhotos();
  if (tagged.length > 0) return tagged;
  const categories = getCategories();
  const collected: Photo[] = [];
  for (const cat of categories) {
    const albumPhotos = getPhotos(cat.slug);
    if (albumPhotos.length > 0) {
      collected.push(...albumPhotos.slice(0, 2));
    }
  }
  if (collected.length > 0) return collected;
  return getPlaceholderPhotos("portfolio");
}

export function getPhotos(categorySlug: string): Photo[] {
  const fromFolder = readAlbumDir([categorySlug], categorySlug) ?? [];
  const tagged = getTaggedPhotos(categorySlug);
  const merged = mergePhotos(fromFolder, tagged);
  if (merged.length > 0) return merged;
  return previewAsAlbum(categorySlug, categorySlug) ?? getPlaceholderPhotos(categorySlug);
}

export function getBackstagePhotos(): Photo[] {
  const fromJson = getBackstageEntries();
  if (fromJson.length > 0) {
    return fromJson.map((item, index) => ({
      id: item.src,
      src: item.src,
      alt: item.alt,
      width: 1600,
      height: 1200,
      featured: index === 0,
    }));
  }
  return readAlbumDir(["backstage"], "Бэкстейдж") ?? previewAsAlbum("backstage", "Бэкстейдж") ?? getPlaceholderBackstage();
}
