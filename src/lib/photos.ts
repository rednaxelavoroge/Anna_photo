import {
  getBackstageEntries,
  getCategories,
  getGalleries,
  getPhotoEntries,
  getPublications,
  getStudioTags,
  type GalleryItem,
  type GalleryKey,
  type Photo,
  type PhotoTag,
  type StudioTag,
} from "@/lib/content";
import { FOLDER_ALIASES, MEDIA_EXT, VIDEO_EXT } from "@/lib/folders";
import { getPreviewCover } from "@/lib/preview";
import fs from "node:fs";
import path from "node:path";

/**
 * Откуда сайт берёт кадры.
 *
 * Источник — данные панели (`src/data/*.json`): порядок, подписи, разделы и
 * подразделы задаёт заказчица. Папки `public/photos` — хранилище файлов.
 *
 * Файл, который лежит в папке, но в данных не упомянут (положили руками через
 * git, не через панель), не пропадает: он дописывается в конец своего раздела.
 * Панель умеет такие файлы «подобрать» и сделать обычными кадрами.
 */

export { FOLDER_ALIASES };

const GALLERY_FOLDERS: Record<GalleryKey, string> = {
  reviews: "reviews",
  workshops: "workshops",
  press: "press",
};

function isVideo(src: string) {
  return VIDEO_EXT.test(src);
}

function toPhoto(src: string, alt: string, index: number, tags?: string[]): Photo {
  const video = isVideo(src);
  return {
    id: src,
    src,
    alt,
    width: 1600,
    height: video ? 900 : 1200,
    featured: index === 0,
    kind: video ? "video" : "image",
    tags,
  };
}

/** Файлы папки public/photos/<name> по имени, с числами по порядку. */
export function listFolder(name: string): string[] {
  const dir = path.join(process.cwd(), "public", "photos", name);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => MEDIA_EXT.test(file) && fs.statSync(path.join(dir, file)).isFile())
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
    .map((file) => `/photos/${name}/${file}`);
}

/** Все файлы, которые упомянуты в кадрах портфолио. */
function referencedByEntries(entries: PhotoTag[]): Set<string> {
  return new Set(entries.flatMap((item) => (item.images?.length ? item.images : [item.src])));
}

/** Запись панели → кадры на сайте: каждый файл кадра виден, не только обложка. */
function expandEntry(item: PhotoTag, out: Photo[], seen: Set<string>) {
  const files = item.images?.length ? item.images : [item.src];
  for (const src of files) {
    if (!src || seen.has(src)) continue;
    seen.add(src);
    out.push(toPhoto(src, item.alt, out.length, item.tags ?? []));
  }
}

function folderOf(categorySlug: string) {
  return FOLDER_ALIASES[categorySlug] ?? categorySlug;
}

/** Не упомянутые в данных файлы папки раздела — в конец, чтобы не потерялись. */
function strayFiles(folder: string, referenced: Set<string>): string[] {
  return listFolder(folder).filter((src) => !referenced.has(src));
}

function previewAsAlbum(slug: string, alt: string): Photo[] {
  const src = getPreviewCover(slug);
  return src ? [{ id: `preview-${slug}`, src, alt, width: 1600, height: 1200, featured: true }] : [];
}

/** Кадры раздела в порядке панели плюс файлы, которых панель ещё не видела. */
export function getPhotos(categorySlug: string): Photo[] {
  const entries = getPhotoEntries();
  const out: Photo[] = [];
  const seen = new Set<string>();
  for (const item of entries) {
    if (item.categories.includes(categorySlug)) expandEntry(item, out, seen);
  }
  for (const src of strayFiles(folderOf(categorySlug), referencedByEntries(entries))) {
    if (!seen.has(src)) {
      seen.add(src);
      out.push(toPhoto(src, `${categorySlug} — ${out.length + 1}`, out.length));
    }
  }
  return out.length > 0 ? out : previewAsAlbum(categorySlug, categorySlug);
}

/** Кадры раздела с меткой подраздела. */
export function getTagPhotos(categorySlug: string, tagSlug: string): Photo[] {
  const out: Photo[] = [];
  const seen = new Set<string>();
  for (const item of getPhotoEntries()) {
    if (item.categories.includes(categorySlug) && (item.tags ?? []).includes(tagSlug)) expandEntry(item, out, seen);
  }
  return out;
}

/** Подразделы, у которых в этом разделе есть хотя бы один кадр — в порядке панели. */
export function getCategoryTags(categorySlug: string): StudioTag[] {
  const used = new Set<string>();
  for (const item of getPhotoEntries()) {
    if (item.categories.includes(categorySlug)) (item.tags ?? []).forEach((tag) => used.add(tag));
  }
  return getStudioTags().filter((tag) => used.has(tag.slug));
}

/** Все кадры портфолио: лента «Все кадры». */
export function getLibraryPhotos(): Photo[] {
  const entries = getPhotoEntries();
  const out: Photo[] = [];
  const seen = new Set<string>();
  for (const item of entries) expandEntry(item, out, seen);
  const referenced = referencedByEntries(entries);
  for (const category of getCategories()) {
    for (const src of strayFiles(folderOf(category.slug), referenced)) {
      if (!seen.has(src)) {
        seen.add(src);
        out.push(toPhoto(src, category.menu, out.length));
      }
    }
  }
  return out;
}

function galleryToPhotos(items: GalleryItem[], folder: string, alt: string, exclude: Set<string> = new Set()): Photo[] {
  const out: Photo[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    if (!item.src || seen.has(item.src)) continue;
    seen.add(item.src);
    out.push(toPhoto(item.src, item.alt, out.length));
  }
  for (const src of listFolder(folder)) {
    if (seen.has(src) || exclude.has(src)) continue;
    seen.add(src);
    out.push(toPhoto(src, `${alt} — ${out.length + 1}`, out.length));
  }
  return out;
}

/** Отзывы, воркшопы, фотоархив прессы — из панели, плюс неучтённые файлы папки. */
export function getGalleryPhotos(key: GalleryKey): Photo[] {
  const galleries = getGalleries();
  // Страницы изданий отданы публикациям («Пресса обо мне») и в архиве не повторяются.
  const exclude = key === "press" ? new Set(getPublications().flatMap((pub) => pub.images ?? [])) : new Set<string>();
  const alt = key === "reviews" ? "Отзыв" : key === "workshops" ? "Воркшоп" : "Выставки и эфиры";
  return galleryToPhotos(galleries[key], GALLERY_FOLDERS[key], alt, exclude).filter(
    (photo) => key !== "press" || photo.kind !== "video",
  );
}

export function getPressPhotos(): Photo[] {
  return getGalleryPhotos("press");
}

export function getBackstagePhotos(): Photo[] {
  const list = galleryToPhotos(getBackstageEntries(), "backstage", "Бэкстейдж");
  return list.length > 0 ? list : previewAsAlbum("backstage", "Бэкстейдж");
}
