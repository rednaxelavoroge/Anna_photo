"use client";

import { fetchUnlisted, unusedFiles, type TabProps } from "@/components/admin/types";
import { Arrows, BTN, BTN_GHOST, BTN_TEXT, DRAG_HINT, FilePick, Thumb, VideoUploader, move } from "@/components/admin/ui";
import type { StudioState, Unlisted } from "@/lib/admin-store";
import type { GalleryItem } from "@/lib/content";
import { useDragOrder, withMoved } from "@/lib/use-drag-order";
import { useState } from "react";

/**
 * Галерея без разделов: бэкстейдж, отзывы, воркшопы, фотоархив прессы.
 * Одна и та же вкладка, разные списки: добавить фото и ролики, подписать,
 * переставить, удалить.
 */
export function GalleryTab({
  title,
  hint,
  items,
  apply,
  scanKey,
  allowVideo = true,
  square,
  state,
  setState,
  persist,
  busy,
  upload,
  notify,
}: TabProps & {
  title: string;
  hint: string;
  items: GalleryItem[];
  /** Как положить новый список в состояние. */
  apply: (state: StudioState, items: GalleryItem[]) => StudioState;
  scanKey: (unlisted: Unlisted) => string[];
  allowVideo?: boolean;
  /** Квадратные миниатюры — для коллажей воркшопов. */
  square?: boolean;
}) {
  const [caption, setCaption] = useState("");
  const [pending, setPending] = useState<string[]>([]);
  const [unlisted, setUnlisted] = useState<string[] | null>(null);
  const [scanning, setScanning] = useState(false);
  const [videoBusy, setVideoBusy] = useState(false);

  const save = (next: GalleryItem[], message?: string, deleteFiles?: string[]) => persist(apply(state, next), message, deleteFiles);
  const drag = useDragOrder((from, to) => void save(withMoved(items, from, to), "Меняю порядок…"), !busy);

  return (
    <section className="mt-8">
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted">{hint}</p>

      <div className="mt-6 border border-line bg-surface p-5">
        <p className="text-[10px] tracking-[0.16em] text-muted uppercase">Добавить</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start">
          <input
            className="min-w-[220px] flex-1 border border-line bg-paper px-3 py-2 text-sm"
            placeholder="Подпись (необязательно)"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
          />
          <FilePick
            label="Фотографии"
            accept="image/*"
            multiple
            disabled={busy}
            onFiles={async (files) => {
              try {
                const srcs = await upload(files);
                setPending((prev) => [...prev, ...srcs]);
              } catch (error) {
                notify(error instanceof Error ? error.message : "Ошибка загрузки");
              }
            }}
          />
          {allowVideo ? (
            <VideoUploader
              label="Ролик с телефона"
              onDone={(src) => setPending((prev) => [...prev, src])}
              onStage={(stage) => setVideoBusy(stage === "sending" || stage === "working")}
              disabled={busy}
            />
          ) : null}
        </div>
        {pending.length ? (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {pending.map((src, index) => (
                <div key={`${src}-${index}`} className="relative">
                  <Thumb src={src} className="h-20 w-20" />
                  <button type="button" className="absolute top-0 right-0 bg-ink px-1 text-[10px] text-snow" onClick={() => setPending(pending.filter((_, i) => i !== index))} aria-label="Убрать">
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              disabled={busy || videoBusy}
              className={`${BTN} mt-3`}
              onClick={async () => {
                const alt = caption.trim();
                await save([...items, ...pending.map((src, index) => ({ src, alt: alt || `${title} — ${items.length + index + 1}` }))], "Публикую…");
                setPending([]);
                setCaption("");
              }}
            >
              Опубликовать ({pending.length}) →
            </button>
            {videoBusy ? <p className="mt-2 text-xs text-muted">Опубликовать можно будет, когда ролик будет готов.</p> : null}
          </div>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className={BTN_GHOST}
            disabled={scanning || busy}
            onClick={async () => {
              setScanning(true);
              try {
                const found = scanKey(await fetchUnlisted());
                setUnlisted(found);
                notify(found.length ? `В папке есть ${found.length} файлов, которых нет в списке` : "Все файлы из папки уже в списке");
              } catch (error) {
                notify(error instanceof Error ? error.message : "Не удалось просмотреть папку");
              } finally {
                setScanning(false);
              }
            }}
          >
            {scanning ? "Смотрю папку…" : "Проверить папку"}
          </button>
          {unlisted && unlisted.length ? (
            <button
              type="button"
              className={BTN}
              disabled={busy}
              onClick={async () => {
                await save([...items, ...unlisted.map((src, index) => ({ src, alt: `${title} — ${items.length + index + 1}` }))], "Добавляю из папки…");
                setUnlisted(null);
              }}
            >
              Добавить {unlisted.length} из папки
            </button>
          ) : null}
        </div>
      </div>

      <p className="mt-6 text-sm text-muted">
        Порядок здесь — порядок на сайте. {DRAG_HINT} Подпись правится прямо под кадром и записывается, когда уходите из поля. Всего: {items.length}.
      </p>
      <div className={`mt-6 grid gap-4 sm:grid-cols-3 ${square ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
        {items.map((item, index) => (
          <figure key={`${item.src}-${index}`} {...drag.itemProps(index)} className={`border border-line bg-surface p-2 transition ${drag.itemClass(index)}`}>
            <Thumb src={item.src} className={`w-full ${square ? "aspect-square bg-white object-contain" : "aspect-[3/4]"}`} />
            <input
              className="mt-2 w-full border border-line bg-paper px-2 py-1 text-xs"
              value={item.alt}
              onChange={(event) => setState(apply(state, items.map((row, i) => (i === index ? { ...row, alt: event.target.value } : row))))}
              onBlur={() => void save(items, "Сохраняю подпись…")}
            />
            <div className="mt-2 flex items-center gap-2 text-xs">
              <Arrows disabled={busy} onUp={() => void save(move(items, index, -1))} onDown={() => void save(move(items, index, 1))} />
              <span className="text-muted">{index + 1}</span>
              <button
                type="button"
                className={`${BTN_TEXT} ml-auto text-muted`}
                disabled={busy}
                onClick={() => {
                  if (!confirm("Удалить с сайта? Файл тоже удалится.")) return;
                  const next = items.filter((_, i) => i !== index);
                  const files = unusedFiles([item.src], apply(state, next));
                  void save(next, "Удаляю…", files);
                }}
              >
                Удалить
              </button>
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
}
