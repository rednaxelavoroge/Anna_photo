import { getPhotos as getPlaceholderPhotos, getBackstagePhotos as getPlaceholderBackstage, getTaggedPhotos, getAllTaggedPhotos, getBackstageEntries, type Photo } from "@/lib/content";
import { getPreviewCover } from "@/lib/preview";
import fs from "node:fs";
import path from "node:path";

const PHOTO_EXT = /\.(jpe?g|png|webp|avif)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov)$/i;
const MEDIA_EXT = /\.(jpe?g|png|webp|avif|mp4|webm|mov)$/i;

function readAlbumDir(segments: string[], altPrefix: string): Photo[] | null {
  const dir = path.join(process.cwd(), "public", "photos", ...segments);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return null;

  const files = fs.readdirSync(dir).filter((name) => MEDIA_EXT.test(name)).sort();
  if (files.length === 0) return null;

  return files.map((file, index) => ({
    id: `${segments.join("/")}/${file}`,
    src: `/photos/${[...segments, file].join("/")}`,
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
