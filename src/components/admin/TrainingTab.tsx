"use client";

import { ClipsEditor } from "@/components/admin/ClipsEditor";
import { GalleryTab } from "@/components/admin/GalleryTab";
import type { TabProps } from "@/components/admin/types";
import { BTN, Card, Field, INPUT } from "@/components/admin/ui";
import type { SiteData } from "@/lib/content";
import { useState } from "react";

/** Вкладка «Обучение»: тексты страницы, видео мастер-классов, коллажи воркшопов. */
export function TrainingTab(props: TabProps) {
  const { state, setState, persist, busy } = props;
  const { training } = state.site;
  const [videoBusy, setVideoBusy] = useState(false);
  const patch = (next: Partial<SiteData["training"]>) => setState({ ...state, site: { ...state.site, training: { ...training, ...next } } });
  const text = (key: "title" | "lead" | "leadNote" | "stat" | "statNote" | "galleryTitle", label: string) => (
    <Field key={key} label={label}>
      <input className={INPUT} value={training[key]} onChange={(event) => patch({ [key]: event.target.value })} />
    </Field>
  );

  return (
    <section className="mt-8 space-y-8">
      <Card title="Тексты страницы «Обучение»" hint="Сверху вниз так же, как на странице.">
        {text("title", "Заголовок")}
        {text("lead", "Крупная строка под заголовком")}
        {text("leadNote", "Мелкая строка под ней")}
        {text("stat", "Крупная строка про воркшопы")}
        {text("statNote", "Мелкая строка под ней")}
        {text("galleryTitle", "Заголовок над кадрами воркшопов")}
      </Card>
      <Card title="Видео с мастер-класса" hint="Ролики лежат на сайте. Подпись показывается под роликом.">
        <ClipsEditor
          clips={training.videos ?? []}
          disabled={busy}
          onStage={setVideoBusy}
          onChange={(videos) => patch({ videos })}
        />
      </Card>
      <button type="button" disabled={busy || videoBusy} className={BTN} onClick={() => void persist(state, "Сохраняю обучение…")}>
        Сохранить тексты и видео →
      </button>
      {videoBusy ? <p className="text-xs text-muted">Сохранить можно будет, когда ролик будет готов.</p> : null}

      <div className="border-t border-line pt-8">
        <GalleryTab
          {...props}
          title="Воркшопы"
          hint="Коллажи воркшопов под заголовком «45 авторских воркшопов в Москве». На сайте стоят одинаковыми квадратами."
          items={state.galleries.workshops}
          apply={(current, items) => ({ ...current, galleries: { ...current.galleries, workshops: items } })}
          scanKey={(unlisted) => unlisted.galleries.workshops}
          allowVideo={false}
          square
        />
      </div>
    </section>
  );
}
