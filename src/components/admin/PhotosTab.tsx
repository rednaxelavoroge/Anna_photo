"use client";

import { PhotoEditor } from "@/components/admin/PhotoEditor";
import { fetchUnlisted, unusedFiles, type TabProps } from "@/components/admin/types";
import { Arrows, BTN, BTN_GHOST, BTN_TEXT, DRAG_HINT, Thumb, move } from "@/components/admin/ui";
import type { PhotoItem, Unlisted } from "@/lib/admin-store";
import { slugifyRu } from "@/lib/slugify";
import { useDragOrder, withMoved } from "@/lib/use-drag-order";
import { useMemo, useState } from "react";

function emptyPhoto(): PhotoItem {
  return { src: "", alt: "", categories: [], tags: [], images: [], video: "" };
}

/** Вкладка «Кадры»: все фотографии и ролики портфолио. */
export function PhotosTab({ state, setState, persist, busy, upload, notify }: TabProps) {
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("all");
  const [editing, setEditing] = useState<PhotoItem | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [unlisted, setUnlisted] = useState<Unlisted | null>(null);
  const [scanning, setScanning] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.photos
      .map((photo, index) => ({ photo, index }))
      .filter(({ photo }) => {
        const inSection = section === "all" || photo.categories.includes(section);
        const match = !q || photo.alt.toLowerCase().includes(q) || photo.src.toLowerCase().includes(q);
        return inSection && match;
      });
  }, [query, section, state.photos]);

  // Список отфильтрован, поэтому позиции с экрана переводятся в позиции в
  // полном списке — иначе кадр уезжал бы не туда.
  const drag = useDragOrder((from, to) => {
    const fromReal = visible[from]?.index;
    const toReal = visible[to]?.index;
    if (fromReal === undefined || toReal === undefined) return;
    void persist({ ...state, photos: withMoved(state.photos, fromReal, toReal) }, "Меняю порядок…");
  }, !busy);

  const menuOf = (slug: string) => state.categories.find((item) => item.slug === slug)?.menu ?? slug;
  const unlistedCount = unlisted ? Object.values(unlisted.photos).reduce((sum, list) => sum + list.length, 0) : 0;

  return (
    <section className="mt-8">
      <div className="flex flex-wrap gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск по названию…"
          className="min-w-[220px] flex-1 border border-line bg-surface px-3 py-2 text-sm"
        />
        <select value={section} onChange={(event) => setSection(event.target.value)} className="border border-line bg-surface px-3 py-2 text-sm">
          <option value="all">Все разделы</option>
          {state.categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.menu} ({state.photos.filter((photo) => photo.categories.includes(category.slug)).length})
            </option>
          ))}
        </select>
        <button
          type="button"
          className={BTN}
          onClick={() => {
            setEditing({ ...emptyPhoto(), categories: section === "all" ? [] : [section] });
            setEditingIndex(null);
          }}
        >
          + Новый кадр
        </button>
        <button
          type="button"
          className={BTN_GHOST}
          disabled={scanning || busy}
          onClick={async () => {
            setScanning(true);
            try {
              const found = await fetchUnlisted();
              setUnlisted(found);
              const count = Object.values(found.photos).reduce((sum, list) => sum + list.length, 0);
              notify(count ? `В папках есть ${count} файлов, которых нет в списке кадров` : "Все файлы из папок уже в списке");
            } catch (error) {
              notify(error instanceof Error ? error.message : "Не удалось просмотреть папки");
            } finally {
              setScanning(false);
            }
          }}
        >
          {scanning ? "Смотрю папки…" : "Проверить папки"}
        </button>
      </div>

      {unlisted && unlistedCount > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 border border-line bg-surface px-4 py-3 text-sm">
          <span>
            Не в списке: {Object.entries(unlisted.photos).map(([slug, list]) => `${menuOf(slug)} — ${list.length}`).join(", ")}
          </span>
          <button
            type="button"
            className={BTN}
            disabled={busy}
            onClick={async () => {
              const added: PhotoItem[] = [];
              for (const [slug, list] of Object.entries(unlisted.photos)) {
                list.forEach((src, index) => added.push({ src, alt: `${menuOf(slug)} — новый ${index + 1}`, categories: [slug], tags: [], images: [src] }));
              }
              await persist({ ...state, photos: [...state.photos, ...added] }, "Добавляю кадры из папок…");
              setUnlisted(null);
            }}
          >
            Добавить их в кадры
          </button>
        </div>
      ) : null}

      <p className="mt-6 text-xs text-muted">
        {DRAG_HINT} Стрелки ↑ ↓ показаны, когда выбран раздел. Показано: {visible.length} из {state.photos.length}.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map(({ photo, index }, visibleIndex) => (
          <article key={`${photo.src}-${index}`} {...drag.itemProps(visibleIndex)} className={`border border-line bg-surface p-3 transition ${drag.itemClass(visibleIndex)}`}>
            <Thumb src={photo.src} className="aspect-[3/4] w-full" />
            <p className="mt-3 font-display text-lg leading-tight">{photo.alt || "Без названия"}</p>
            <p className="mt-1 text-[11px] text-muted">
              {photo.categories.map(menuOf).join(" · ")}
              {(photo.images?.length ?? 1) > 1 ? ` · файлов: ${photo.images?.length}` : ""}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {section !== "all" ? (
                <Arrows
                  disabled={busy}
                  onUp={() => void persist({ ...state, photos: move(state.photos, index, -1) })}
                  onDown={() => void persist({ ...state, photos: move(state.photos, index, 1) })}
                />
              ) : null}
              <button
                type="button"
                className={BTN_TEXT}
                onClick={() => {
                  setEditing({ ...photo, images: photo.images?.length ? photo.images : [photo.src], tags: photo.tags ?? [] });
                  setEditingIndex(index);
                }}
              >
                Редактировать
              </button>
              <button
                type="button"
                className={`${BTN_TEXT} text-muted`}
                disabled={busy}
                onClick={() => {
                  if (!confirm(`Удалить кадр «${photo.alt}» с сайта? Файлы тоже удалятся.`)) return;
                  const files = unusedFiles(photo.images?.length ? photo.images : [photo.src], state, { photoIndex: index });
                  void persist({ ...state, photos: state.photos.filter((_, i) => i !== index) }, "Удаляю кадр…", files);
                }}
              >
                Удалить
              </button>
              {section !== "all" ? <span className="ml-auto text-[10px] tracking-[0.16em] text-muted uppercase">{visibleIndex + 1}</span> : null}
            </div>
          </article>
        ))}
      </div>

      {editing ? (
        <PhotoEditor
          photo={editing}
          categories={state.categories}
          tags={state.tags}
          busy={busy}
          onClose={() => {
            setEditing(null);
            setEditingIndex(null);
          }}
          onUpload={upload}
          onCreateTag={(name) => {
            if (!name) return "";
            const exists = state.tags.find((item) => item.name.toLowerCase() === name.toLowerCase());
            const slug = exists?.slug ?? slugifyRu(name);
            if (!exists) setState({ ...state, tags: [...state.tags, { slug, name }] });
            return slug;
          }}
          onSave={(photo, removed) => {
            const photos = [...state.photos];
            if (editingIndex === null) photos.unshift(photo);
            else photos[editingIndex] = photo;
            const next = { ...state, photos };
            const files = unusedFiles(removed, next);
            void persist(next, "Сохраняю кадр…", files);
            setEditing(null);
            setEditingIndex(null);
          }}
        />
      ) : null}
    </section>
  );
}
