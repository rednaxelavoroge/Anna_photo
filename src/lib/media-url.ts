/**
 * Панель показывает превью фотографий, а сами файлы лежат на боевом сайте.
 *
 * Пути в данных хранятся от корня — `/photos/uploads/....jpg`. Пока панель
 * живёт на Vercel рядом с сайтом, такой путь открывается сам. На хостинге
 * заказчицы у панели свой адрес (admin.annamanasaryan.com) и своя папка, и
 * каталога в ней нет: везти его туда незачем, он уже на сайте. Поэтому
 * NEXT_PUBLIC_MEDIA_BASE приклеивает к пути адрес сайта.
 *
 * Переменная пустая — ничего не меняется, путь остаётся прежним.
 * NEXT_PUBLIC_* вшивается на этапе сборки, поэтому задавать её надо в
 * workflow выкладки, а не только в панели хостинга.
 */
const BASE = (process.env.NEXT_PUBLIC_MEDIA_BASE || "").replace(/\/+$/, "");

/**
 * Файлы, загруженные в этот заход панели: путь на сайте → картинка из
 * браузера.
 *
 * Зачем. Панель кладёт файл в репозиторий, а на сайт он попадает выкладкой —
 * это несколько минут. Всё это время `/photos/uploads/...` на сайте отдаёт
 * 404, и панель показывала на месте только что выбранной обложки пустоту.
 * Заказчица из этого справедливо заключала, что фотография «не добавилась».
 * Здесь помнится сам выбранный файл, и превью видно сразу.
 */
const JUST_UPLOADED = new Map<string, string>();

export function rememberUpload(src: string, file: Blob) {
  if (typeof URL === "undefined" || !src) return;
  const previous = JUST_UPLOADED.get(src);
  if (previous) URL.revokeObjectURL(previous);
  JUST_UPLOADED.set(src, URL.createObjectURL(file));
}

export function mediaUrl(src: string | null | undefined): string {
  if (!src) return "";
  const local = JUST_UPLOADED.get(src);
  if (local) return local;
  if (!BASE) return src;
  // Готовый адрес, картинка прямо в странице или файл, только что выбранный
  // в браузере, — трогать нельзя.
  if (/^[a-z][a-z0-9+.-]*:/i.test(src) || src.startsWith("//")) return src;
  return src.startsWith("/") ? `${BASE}${src}` : `${BASE}/${src}`;
}
