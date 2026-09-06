"use client";

import type { TabProps } from "@/components/admin/types";
import { Arrows, BTN, BTN_TEXT, DRAG_HINT, FilePick, INPUT, Modal, Thumb, move } from "@/components/admin/ui";
import type { Category } from "@/lib/content";
import { slugifyRu } from "@/lib/slugify";
import { useDragOrder, withMoved } from "@/lib/use-drag-order";
import { useState } from "react";

function emptyCategory(): Category {
  return { slug: "", menu: "", title: "", description: "", keywords: [] };
}

/** Вкладка «Разделы»: блоки на главной и пункты портфолио. */
export function CategoriesTab({ state, persist, busy, upload, notify }: TabProps) {
  const [draft, setDraft] = useState<Category | null>(null);

  /*
    Обложка, которую раздел показывает на сайте, если своя не выбрана, —
    его первый кадр (`src/app/page.tsx` и `src/app/portfolio/page.tsx`
    берут её так же).

    Панель показывает то же самое. Раньше на этом месте чернел прямоугольник
    «нет файла» — у четырнадцати разделов из девятнадцати своя обложка не
    выбрана, — и получалось, будто у раздела обложки нет вовсе. На сайте
    она есть.
  */
  const autoCover = (slug: string) => {
    const photo = state.photos.find((item) => item.categories.includes(slug));
    return photo ? (photo.images?.[0] ?? photo.src) : "";
  };
  const drag = useDragOrder((from, to) => {
    void persist({ ...state, categories: withMoved(state.categories, from, to) }, "Меняю порядок…");
  }, !busy);

  return (
    <section className="mt-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl">Разделы портфолио</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Это блоки на главной и пункты в портфолио, в этом же порядке. Можно завести новый, сменить обложку, название и описание, убрать ненужный. {DRAG_HINT}
          </p>
        </div>
        <button type="button" className={BTN} onClick={() => setDraft(emptyCategory())}>
          + Добавить раздел
        </button>
      </div>
      <div className="mt-6 space-y-3">
        {state.categories.map((category, index) => {
          const count = state.photos.filter((photo) => photo.categories.includes(category.slug)).length;
          return (
            <div
              key={category.slug}
              {...drag.itemProps(index)}
              className={`flex flex-col gap-4 border border-line bg-surface p-4 transition md:flex-row md:items-center md:justify-between ${drag.itemClass(index)}`}
            >
              <div className="flex items-start gap-4">
                <Thumb src={category.cover || autoCover(category.slug)} className="h-16 w-16 shrink-0" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg">{category.menu}</h3>
                    <span className="text-[10px] tracking-[0.14em] text-muted uppercase">
                      /portfolio/{category.slug} · кадров: {count}
                      {category.cover ? "" : " · обложка: первый кадр"}
                    </span>
                  </div>
                  <p className="mt-1 max-w-xl text-sm text-muted">{category.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Arrows
                  disabled={busy}
                  onUp={() => void persist({ ...state, categories: move(state.categories, index, -1) })}
                  onDown={() => void persist({ ...state, categories: move(state.categories, index, 1) })}
                />
                <button type="button" className={BTN_TEXT} onClick={() => setDraft({ ...category })}>
                  Редактировать
                </button>
                <button
                  type="button"
                  className={`${BTN_TEXT} text-muted`}
                  disabled={busy}
                  onClick={() => {
                    if (!confirm(`Удалить раздел «${category.menu}»? Кадры останутся, просто снимутся с этого раздела.`)) return;
                    void persist({
                      ...state,
                      categories: state.categories.filter((item) => item.slug !== category.slug),
                      photos: state.photos.map((photo) => ({ ...photo, categories: photo.categories.filter((item) => item !== category.slug) })),
                    });
                  }}
                >
                  Удалить
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {draft ? (
        <CategoryEditor
          category={draft}
          autoCover={autoCover(draft.slug)}
          busy={busy}
          onClose={() => setDraft(null)}
          onUpload={upload}
          onSave={(category) => {
            if (!category.menu.trim()) return notify("Укажите название раздела");
            const slug = category.slug || slugifyRu(category.menu);
            if (!category.slug && state.categories.some((item) => item.slug === slug)) return notify("Раздел с таким адресом уже есть");
            const next = { ...category, slug, title: category.title.trim() || category.menu };
            const categories = state.categories.some((item) => item.slug === slug)
              ? state.categories.map((item) => (item.slug === slug ? next : item))
              : [...state.categories, next];
            void persist({ ...state, categories });
            setDraft(null);
          }}
        />
      ) : null}
    </section>
  );
}

function CategoryEditor({
  category,
  autoCover,
  busy,
  onClose,
  onSave,
  onUpload,
}: {
  category: Category;
  /** Что стоит обложкой на сайте, пока своя не выбрана, — первый кадр раздела. */
  autoCover: string;
  busy: boolean;
  onClose: () => void;
  onSave: (category: Category) => void;
  onUpload: (files: File[] | null) => Promise<string[]>;
}) {
  const [draft, setDraft] = useState(category);
  const isNew = !category.slug;
  return (
    <Modal title={isNew ? "Новый раздел портфолио" : "Редактирование раздела"} onClose={onClose}>
      <label className="mt-4 block text-[10px] tracking-[0.16em] text-muted uppercase">Название в меню *</label>
      <input className={INPUT} value={draft.menu} onChange={(event) => setDraft({ ...draft, menu: event.target.value })} />
      <label className="mt-3 block text-[10px] tracking-[0.16em] text-muted uppercase">Заголовок страницы (для поиска)</label>
      <input className={INPUT} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
      <label className="mt-3 block text-[10px] tracking-[0.16em] text-muted uppercase">Описание — под названием на главной</label>
      <textarea className={INPUT} rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
      <label className="mt-3 block text-[10px] tracking-[0.16em] text-muted uppercase">Ключевые слова через запятую</label>
      <input
        className={INPUT}
        value={draft.keywords.join(", ")}
        onChange={(event) => setDraft({ ...draft, keywords: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })}
      />
      <p className="mt-2 text-xs text-muted">
        {isNew ? "Адрес страницы сделается сам из названия; потом он не меняется, ссылки сохранятся." : `Адрес /portfolio/${draft.slug} при переименовании не меняется.`}
      </p>
      <p className="mt-4 text-[10px] tracking-[0.16em] text-muted uppercase">Обложка раздела</p>
      <p className="mt-1 text-xs text-muted">
        {draft.cover ? "Своя обложка выбрана." : "Своя обложка не выбрана — на сайте стоит первый кадр раздела, он и показан."}
      </p>
      <div className="mt-2 flex items-center gap-3">
        {draft.cover || autoCover ? <Thumb src={draft.cover || autoCover} className="h-24 w-20" /> : null}
        <FilePick
          label="Выбрать обложку"
          accept="image/*"
          ghost
          disabled={busy}
          onFiles={async (files) => {
            try {
              const srcs = await onUpload(files);
              if (srcs[0]) setDraft({ ...draft, cover: srcs[0] });
            } catch (error) {
              window.alert(error instanceof Error ? error.message : "Ошибка загрузки");
            }
          }}
        />
        {draft.cover ? (
          <button type="button" className={BTN_TEXT} onClick={() => setDraft({ ...draft, cover: undefined })}>
            Убрать
          </button>
        ) : null}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" disabled={busy} className={BTN} onClick={() => onSave(draft)}>
          Сохранить раздел ✓
        </button>
        <button type="button" className={BTN_TEXT} onClick={onClose}>
          Отмена
        </button>
      </div>
    </Modal>
  );
}
