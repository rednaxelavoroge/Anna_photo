"use client";

import type { TabProps } from "@/components/admin/types";
import { BTN, BTN_TEXT, Card, Field, FilePick, INPUT, Thumb } from "@/components/admin/ui";
import type { SiteData } from "@/lib/content";

/** Вкладка «Фототуры»: тексты страницы и обложка. */
export function PhototourTab({ state, setState, persist, busy, upload, notify }: TabProps) {
  const { phototour } = state.site;
  const patch = (next: Partial<SiteData["phototour"]>) => setState({ ...state, site: { ...state.site, phototour: { ...phototour, ...next } } });

  return (
    <section className="mt-8 space-y-8">
      <Card title="Страница «Фототуры»" hint="Пункт «Фототуры» стоит в меню сайта. Кнопка «Написать» ведёт в WhatsApp на активный номер из вкладки «Контакты».">
        <Field label="Мелкая надпись над заголовком">
          <input className={INPUT} value={phototour.eyebrow} onChange={(event) => patch({ eyebrow: event.target.value })} />
        </Field>
        <Field label="Заголовок">
          <input className={INPUT} value={phototour.title} onChange={(event) => patch({ title: event.target.value })} />
        </Field>
        <Field label="Текст">
          <textarea className={INPUT} rows={4} value={phototour.lead} onChange={(event) => patch({ lead: event.target.value })} />
        </Field>
        <Field label="Надпись на кнопке">
          <input className={INPUT} value={phototour.cta} onChange={(event) => patch({ cta: event.target.value })} />
        </Field>
        <p className="text-[10px] tracking-[0.16em] text-muted uppercase">Обложка справа</p>
        <p className="text-xs text-muted">Пусто — обложкой станет первый кадр раздела «Путешествия».</p>
        <div className="flex items-center gap-3">
          {phototour.cover ? <Thumb src={phototour.cover} className="h-28 w-20" /> : null}
          <FilePick
            label="Выбрать обложку"
            accept="image/*"
            ghost
            disabled={busy}
            onFiles={async (files) => {
              try {
                const srcs = await upload(files);
                if (srcs[0]) patch({ cover: srcs[0] });
              } catch (error) {
                notify(error instanceof Error ? error.message : "Ошибка загрузки");
              }
            }}
          />
          {phototour.cover ? (
            <button type="button" className={BTN_TEXT} onClick={() => patch({ cover: "" })}>
              Убрать
            </button>
          ) : null}
        </div>
      </Card>
      <button type="button" disabled={busy} className={BTN} onClick={() => void persist(state, "Сохраняю фототуры…")}>
        Сохранить →
      </button>
    </section>
  );
}
