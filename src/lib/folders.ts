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
export const VIDEO_EXT = /\.(mp4|webm|mov|m4v)$/i;

/**
 * Убрать из списка файлов обложки роликов.
 *
 * Обложка — картинка с тем же именем, что у ролика: `back-7.mp4` →
 * `back-7.jpg`. Её делает `tools/make-posters.mjs`, чтобы вместо чёрного
 * прямоугольника был виден кадр.
 *
 * Это служебный файл, а не кадр. Без этой прополки он попал бы и на сайт
 * (файлы папки, не упомянутые в данных, дописываются в конец раздела), и в
 * панель — кнопка «Проверить папку» предложила бы добавить двадцать девять
 * «новых фотографий», которые на деле обложки.
 */
export function withoutPosters(files: string[]): string[] {
  const stems = new Set(files.filter((file) => VIDEO_EXT.test(file)).map((file) => file.replace(/\.[^.]+$/, "")));
  return files.filter((file) => !(/\.jpe?g$/i.test(file) && stems.has(file.replace(/\.[^.]+$/, ""))));
}
