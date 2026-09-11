"use client";

import type { TabProps } from "@/components/admin/types";
import { BTN, BTN_GHOST, Card } from "@/components/admin/ui";
import { formatPostDate } from "@/lib/articles";

export function ArticlesTab({ state, setState, persist, busy }: TabProps) {
  const articlesState = state.articles ?? { enabled: false, articles: {}, items: [] };
  const items = articlesState.items ?? [];
  const enabled = Boolean(articlesState.enabled);
  const articlesMap = articlesState.articles ?? {};

  const setMaster = (nextEnabled: boolean) => {
    setState({
      ...state,
      articles: {
        ...articlesState,
        enabled: nextEnabled,
      },
    });
  };

  const toggleArticle = (slug: string) => {
    const current = Boolean(articlesMap[slug]);
    setState({
      ...state,
      articles: {
        ...articlesState,
        articles: {
          ...articlesMap,
          [slug]: !current,
        },
      },
    });
  };

  const setAll = (value: boolean) => {
    const nextMap: Record<string, boolean> = { ...articlesMap };
    for (const item of items) {
      nextMap[item.slug] = value;
    }
    setState({
      ...state,
      articles: {
        ...articlesState,
        articles: nextMap,
      },
    });
  };

  const activeCount = items.filter((item) => Boolean(articlesMap[item.slug])).length;

  return (
    <section className="mt-8 space-y-8">
      <Card
        title="Раздел «Статьи» на сайте"
        hint="Главный переключатель видимости блога. Если он выключен, пункт «Статьи» не виден в меню и подвале сайта, а раздел закрыт для посетителей."
      >
        <label className="flex cursor-pointer items-start gap-3 rounded-sm border border-line bg-paper p-4">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setMaster(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded-sm border-line accent-ink"
          />
          <div>
            <span className="font-medium text-ink">Показывать раздел «Статьи» на сайте (в меню и футере)</span>
            <p className="mt-1 text-xs text-muted">
              {enabled
                ? "Раздел включен: пункт «Статьи» отображается в навигации сайта. На сайте показываются только те статьи, у которых ниже отмечена галочка."
                : "Раздел выключен: статьи скрыты от посетителей сайта."}
            </p>
          </div>
        </label>
      </Card>

      <Card
        title="Список статей и гидов к съёмке"
        hint={`Всего материалов: ${items.length}. Включено для показа: ${activeCount}. На сайте видны только отмеченные статьи при включенном главном переключателе выше.`}
      >
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            className={BTN_GHOST}
            onClick={() => setAll(true)}
            disabled={busy || items.length === 0}
          >
            Включить все ({items.length})
          </button>
          <button
            type="button"
            className={BTN_GHOST}
            onClick={() => setAll(false)}
            disabled={busy || items.length === 0}
          >
            Выключить все
          </button>
        </div>

        <div className="mt-4 divide-y divide-line border border-line bg-paper">
          {items.map((item, index) => {
            const isVisible = Boolean(articlesMap[item.slug]);
            return (
              <div
                key={item.slug}
                className="flex flex-col gap-3 p-4 transition-colors hover:bg-surface/50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id={`article-${item.slug}`}
                    checked={isVisible}
                    onChange={() => toggleArticle(item.slug)}
                    className="mt-1 h-4 w-4 shrink-0 rounded-sm border-line accent-ink"
                  />
                  {item.cover ? (
                    <img
                      src={item.cover}
                      alt=""
                      className="hidden h-12 w-16 shrink-0 rounded-xs border border-line object-cover sm:block"
                    />
                  ) : null}
                  <div>
                    <label
                      htmlFor={`article-${item.slug}`}
                      className="cursor-pointer font-medium text-ink hover:underline"
                    >
                      {item.title}
                    </label>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                      <span>{formatPostDate(item.date)}</span>
                      <span>·</span>
                      <span className="font-mono text-[11px] text-muted">/blog/{item.slug}</span>
                      {item.draft ? (
                        <>
                          <span>·</span>
                          <span className="rounded-xs bg-line px-1.5 py-0.5 text-[10px] text-muted uppercase">
                            Черновик
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pl-7 sm:pl-0">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] tracking-wider uppercase ${
                      isVisible
                        ? enabled
                          ? "bg-ink/10 text-ink font-medium"
                          : "bg-surface text-muted border border-line"
                        : "bg-surface text-muted"
                    }`}
                  >
                    {isVisible
                      ? enabled
                        ? "Видна на сайте"
                        : "Включена (раздел выкл)"
                      : "Скрыта"}
                  </span>
                </div>
              </div>
            );
          })}
          {items.length === 0 ? (
            <p className="p-4 text-xs text-muted">Статьи не найдены.</p>
          ) : null}
        </div>
      </Card>

      <div>
        <button
          type="button"
          disabled={busy}
          className={BTN}
          onClick={() => void persist(state, "Сохраняю статьи…")}
        >
          Сохранить статьи →
        </button>
      </div>
    </section>
  );
}
