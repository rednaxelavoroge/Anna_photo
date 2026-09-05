/**
 * Раздел портфолио → папка в public/photos, если имена не совпадают.
 * Симлинков в public нет: их не переживает FTP.
 */
export const FOLDER_ALIASES: Record<string, string> = {
  bloom: "blooming",
  product: "objects",
};

export function folderOfCategory(slug: string) {
  return FOLDER_ALIASES[slug] ?? slug;
}

export const MEDIA_EXT = /\.(jpe?g|png|webp|avif|mp4|webm|mov)$/i;
export const VIDEO_EXT = /\.(mp4|webm|mov)$/i;
