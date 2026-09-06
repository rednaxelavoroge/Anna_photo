"use client";

import { imageThumb, posterFromUrl, videoThumb } from "@/lib/thumbnail";
import { useSyncExternalStore } from "react";

/**
 * Превью только что загруженных файлов — то, что панель показывает на месте
 * кадра, пока настоящий файл едет на сайт.
 *
 * Зачем это вообще. Панель кладёт файл в репозиторий, а на сайт он попадает
 * выкладкой — это несколько минут. Всё это время `/photos/uploads/...` на
 * сайте отдаёт 404. Раньше превью помнилось в памяти вкладки, и внутри
 * одного захода этого хватало, но стоило обновить страницу (а панель сама
 * просит обновиться, когда данные разъехались) — превью пропадало, и на
 * месте только что загруженной фотографии оставалась пустота с подписью.
 * Заказчица делала из этого единственный разумный вывод: «не загрузилось».
 *
 * Поэтому мини-копия лежит в IndexedDB браузера: она переживает и обновление
 * страницы, и закрытие вкладки. Сервер здесь ни при чём — файл и так уже у
 * человека в браузере, везти его куда-то ради превью незачем.
 *
 * Почему IndexedDB, а не localStorage: в localStorage кладут строки, картинка
 * в нём заняла бы в полтора раза больше места и упёрлась бы в 5 МБ на весь
 * домен. IndexedDB хранит файл как есть и считает место сотнями мегабайт.
 */

const DB_NAME = "anna-panel-previews";
const DB_VERSION = 1;
const STORE = "thumbs";

/** Сколько держать превью. Файл доезжает за минуты; месяц — с большим запасом. */
const KEEP_MS = 30 * 24 * 60 * 60 * 1000;

/** Сколько превью хранить самое большее. Лишние — самые старые — удаляются. */
const KEEP_MAX = 400;

type Row = { src: string; blob: Blob; at: number };

/** Путь на сайте → адрес мини-копии в этой вкладке. */
const URLS = new Map<string, string>();

const listeners = new Set<() => void>();

function announce() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function setUrl(src: string, blob: Blob) {
  const previous = URLS.get(src);
  if (previous) URL.revokeObjectURL(previous);
  URLS.set(src, URL.createObjectURL(blob));
  announce();
}

function dropUrl(src: string) {
  const previous = URLS.get(src);
  if (!previous) return;
  URL.revokeObjectURL(previous);
  URLS.delete(src);
  announce();
}

/**
 * Хранилище браузера. Его может не быть вовсе: в приватном окне Safari
 * IndexedDB отключён. Тогда превью живёт только в памяти вкладки — как
 * раньше, — и ничего не ломается.
 */
let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    if (typeof indexedDB === "undefined") return resolve(null);
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      return resolve(null);
    }
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "src" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });
  return dbPromise;
}

function ask<T>(request: IDBRequest<T>): Promise<T | null> {
  return new Promise((resolve) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

/**
 * Открыть сделку с хранилищем и дождаться, пока она закроется.
 *
 * Ждать обязательно: панель после загрузки нередко перезагружают, а запись,
 * начатая и не закрытая, пропадает вместе со страницей — и превью, ради
 * которого всё затевалось, не переживёт то самое обновление.
 */
async function withStore<T>(
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore) => Promise<T> | T,
): Promise<T | null> {
  const db = await openDb();
  if (!db) return null;
  try {
    const tx = db.transaction(STORE, mode);
    const result = await work(tx.objectStore(STORE));
    await new Promise<void>((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    });
    return result;
  } catch {
    // Место кончилось или хранилище закрылось — превью не главное, молчим.
    return null;
  }
}

/**
 * Поднять сохранённые превью при открытии панели и прибрать старьё.
 *
 * Вызывается один раз из `AdminPanel`. Пока чтение идёт, миниатюры рисуются
 * без превью — а как только оно прочитано, `usePreview` перерисовывает их
 * сам, поэтому ждать здесь нечего.
 */
export async function loadPreviews(): Promise<void> {
  const rows = await withStore("readonly", (store) => ask<Row[]>(store.getAll() as IDBRequest<Row[]>));
  if (!rows?.length) return;

  const fresh = rows.filter((row) => row?.src && row.blob && Date.now() - row.at < KEEP_MS);
  fresh.sort((a, b) => b.at - a.at);
  const keep = fresh.slice(0, KEEP_MAX);

  const stale = rows.filter((row) => !keep.includes(row)).map((row) => row?.src).filter(Boolean);
  if (stale.length) void forgetPreviews(stale);

  keep.forEach((row) => {
    const previous = URLS.get(row.src);
    // Превью этого захода уже в памяти и точно свежее — не трогаем.
    if (!previous) URLS.set(row.src, URL.createObjectURL(row.blob));
  });
  announce();
}

/** Запомнить мини-копию, уже готовую картинкой (первый кадр ролика). */
export async function rememberPreview(src: string, thumb: Blob | null): Promise<void> {
  if (!src || !thumb) return;
  setUrl(src, thumb);
  await withStore("readwrite", (store) => {
    store.put({ src, blob: thumb, at: Date.now() } satisfies Row);
    return true;
  });
}

/**
 * Запомнить загруженный файл: из фотографии мини-копия делается здесь, из
 * ролика берётся первый кадр.
 */
export async function rememberUpload(src: string, file: Blob): Promise<void> {
  if (!src) return;
  const isVideo = /\.(mp4|webm|mov|m4v)$/i.test(src) || file.type.startsWith("video/");
  const thumb = await (isVideo ? videoThumb(file) : imageThumb(file));
  await rememberPreview(src, thumb);
}

/** Файл убрали с сайта — превью тоже больше не нужно. */
export async function forgetPreviews(srcs: string[]): Promise<void> {
  const list = srcs.filter(Boolean);
  if (!list.length) return;
  list.forEach(dropUrl);
  await withStore("readwrite", (store) => {
    list.forEach((src) => store.delete(src));
    return true;
  });
}

/**
 * Снять обложку с ролика, уже лежащего на сайте, и запомнить её.
 *
 * Зачем. Проигрыватель в миниатюре кадр показывает, но тянет ради него кусок
 * файла каждый раз заново, а в «Бэкстейдже» роликов почти тридцать. Снятый
 * один раз кадр ложится в хранилище, и дальше миниатюра — обычная картинка.
 *
 * Роликов много, поэтому кадры снимаются по два за раз и каждый ролик —
 * один раз за заход: тридцать проигрывателей, разом тянущих файл, на
 * телефоне заказчицы ничем не лучше чёрных прямоугольников.
 */
const asked = new Set<string>();
const queue: Array<() => Promise<void>> = [];
let running = 0;

function pump() {
  while (running < 2 && queue.length) {
    const job = queue.shift();
    if (!job) return;
    running += 1;
    void job().finally(() => {
      running -= 1;
      pump();
    });
  }
}

export function capturePoster(src: string, url: string): void {
  if (!src || !url || asked.has(src) || URLS.has(src)) return;
  asked.add(src);
  queue.push(async () => {
    const poster = await posterFromUrl(url);
    if (poster) await rememberPreview(src, poster);
  });
  pump();
}

/**
 * Адрес мини-копии для миниатюры. Пустая строка — превью нет, показывать
 * нечего.
 */
export function usePreview(src: string | null | undefined): string {
  return useSyncExternalStore(
    subscribe,
    () => (src ? (URLS.get(src) ?? "") : ""),
    () => "",
  );
}
