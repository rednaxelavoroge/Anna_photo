"use client";

import type { TabProps } from "@/components/admin/types";
import { Arrows, BTN, BTN_TEXT, DRAG_HINT, move } from "@/components/admin/ui";
import { slugifyRu } from "@/lib/slugify";
import { useDragOrder, withMoved } from "@/lib/use-drag-order";
import { useState } from "react";

/** Вкладка «Подразделы»: метки на кадрах, показываются полоской внутри раздела. */
export function TagsTab({ state, setState, persist, busy, notify }: TabProps) {
  const [draft, setDraft] = useState("");
  const drag = useDragOrder((from, to) => {
    void persist({ ...state, tags: withMoved(state.tags, from, to) }, "Меняю порядок…");
  }, !busy);

  return (
    <section className="mt-8">
      <h2 className="font-display text-2xl">Подразделы</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Подраздел — это метка на кадре. Внутри раздела на сайте появляется полоска «Все · Армения · Италия…», как только метку получил хотя бы один кадр этого раздела. Метку кадру ставят в окне кадра. {DRAG_HINT}
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Новый подраздел, например Италия" className="border border-line bg-surface px-3 py-2 text-sm" />
        <button
          type="button"
          className={BTN}
          disabled={busy}
          onClick={() => {
            const name = draft.trim();
            if (!name) return;
            if (state.tags.some((item) => item.name.toLowerCase() === name.toLowerCase())) return notify("Такой подраздел уже есть");
            void persist({ ...state, tags: [...state.tags, { slug: slugifyRu(name), name }] });
            setDraft("");
          }}
        >
          + Создать подраздел
        </button>
      </div>
      <ul className="mt-6 space-y-3">
        {state.tags.map((tag, index) => {
          const count = state.photos.filter((photo) => (photo.tags ?? []).includes(tag.slug)).length;
          return (
            <li key={tag.slug} {...drag.itemProps(index)} className={`flex flex-wrap items-center gap-3 border border-line bg-surface px-3 py-3 transition ${drag.itemClass(index)}`}>
              <Arrows
                disabled={busy}
                onUp={() => void persist({ ...state, tags: move(state.tags, index, -1) })}
                onDown={() => void persist({ ...state, tags: move(state.tags, index, 1) })}
              />
              <input
                className="min-w-[160px] flex-1 border border-line bg-paper px-2 py-1 text-sm"
                value={tag.name}
                onChange={(event) => setState({ ...state, tags: state.tags.map((item, i) => (i === index ? { ...item, name: event.target.value } : item)) })}
                onBlur={() => void persist(state, "Сохраняю название…")}
              />
              <span className="text-xs text-muted">кадров: {count}</span>
              <button
                type="button"
                className={`${BTN_TEXT} text-muted`}
                disabled={busy}
                onClick={() => {
                  if (!confirm(`Удалить подраздел «${tag.name}»? Кадры останутся, метка снимется.`)) return;
                  void persist({
                    ...state,
                    tags: state.tags.filter((item) => item.slug !== tag.slug),
                    photos: state.photos.map((photo) => ({ ...photo, tags: (photo.tags ?? []).filter((item) => item !== tag.slug) })),
                  });
                }}
              >
                Удалить
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
