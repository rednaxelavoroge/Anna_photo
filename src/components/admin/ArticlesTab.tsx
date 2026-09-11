"use client";

import type { TabProps } from "@/components/admin/types";
import { BTN, BTN_GHOST, Card, INPUT } from "@/components/admin/ui";
import type { BlogArticleSetting } from "@/lib/articles";
import { formatPostDate } from "@/lib/articles";
import type { StudioState } from "@/lib/admin-store";
import { useEffect, useRef, useState } from "react";

const AUTOSAVE_MS = 60_000;

export function ArticlesTab({ state, setState, persist, busy }: TabProps) {
  const articlesState = state.articles ?? { enabled: false, articles: {}, items: [] };
  const items = articlesState.items ?? [];
  const enabled = Boolean(articlesState.enabled);
  const articlesMap = articlesState.articles ?? {};
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const editing = items.find((item) => item.slug === editingSlug) ?? null;

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

  const listedCount = items.filter((item) => Boolean(articlesMap[item.slug])).length;

  return (
    <section className="mt-8 space-y-8">
      <Card
        title="Раздел «Статьи» на сайте"
        hint="Главный переключатель списка. Если он выключен, пункта «Статьи» нет в меню и подвале, а /blog не показывает карточки. Прямые ссылки на статьи продолжают открываться — ими можно делиться до публикации."
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
                ? "Раздел включён: пункт «Статьи» в навигации. В списке на /blog только статьи с галочкой ниже. Выключенные по прямой ссылке всё равно открываются."
                : "Раздел выключен: списка в меню нет. Прямые ссылки /blog/… продолжают работать."}
            </p>
          </div>
        </label>
      </Card>

      <Card
        title="Список статей и гидов к съёмке"
        hint={`Всего материалов: ${items.length}. В списке на сайте: ${listedCount}. Выключенная статья не показывается на /blog, но открывается по адресу /blog/…`}
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
          {items.map((item) => {
            const isListed = Boolean(articlesMap[item.slug]);
            return (
              <div
                key={item.slug}
                className="flex flex-col gap-3 p-4 transition-colors hover:bg-surface/50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id={`article-${item.slug}`}
                    checked={isListed}
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
                      <a
                        href={`https://annamanasaryan.com/blog/${item.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-[11px] text-muted underline-offset-2 hover:underline"
                      >
                        /blog/{item.slug}
                      </a>
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
                  <button
                    type="button"
                    className={BTN_GHOST}
                    disabled={busy}
                    onClick={() => setEditingSlug(item.slug)}
                  >
                    Править
                  </button>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] tracking-wider uppercase ${
                      isListed
                        ? enabled
                          ? "bg-ink/10 text-ink font-medium"
                          : "bg-surface text-muted border border-line"
                        : "bg-surface text-muted"
                    }`}
                  >
                    {isListed ? (enabled ? "В списке на сайте" : "Включена (раздел выкл)") : "Не в списке"}
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

      {editing ? (
        <ArticleEditor
          key={editing.slug}
          item={editing}
          state={state}
          persist={persist}
          busy={busy}
          onClose={() => setEditingSlug(null)}
        />
      ) : null}
    </section>
  );
}

function ArticleEditor({
  item,
  state,
  persist,
  busy,
  onClose,
}: {
  item: BlogArticleSetting;
  state: StudioState;
  persist: TabProps["persist"];
  busy: boolean;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [body, setBody] = useState(item.body ?? "");
  const [status, setStatus] = useState<"idle" | "dirty" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");
  const saved = useRef({ title: item.title, body: item.body ?? "" });
  const latest = useRef({ title, body, state, item, persist });
  const inFlight = useRef(false);
  latest.current = { title, body, state, item, persist };

  const dirty = title !== saved.current.title || body !== saved.current.body;
  const bodyMissing = item.body === undefined;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function save(reason: "manual" | "auto") {
    if (inFlight.current) return false;
    const current = latest.current;
    const nextTitle = current.title.trim();
    if (!nextTitle) {
      setStatus("error");
      setError("Нужен заголовок");
      return false;
    }
    if (current.item.body === undefined) {
      setStatus("error");
      setError("Текст статьи не загрузился — сохранение отменено, чтобы не стереть файл");
      return false;
    }
    inFlight.current = true;
    setStatus("saving");
    setError("");
    const articlesState = current.state.articles ?? { enabled: false, articles: {}, items: [] };
    const items = (articlesState.items ?? []).map((entry) =>
      entry.slug === current.item.slug ? { ...entry, title: nextTitle, body: current.body } : entry,
    );
    const next = { ...current.state, articles: { ...articlesState, items } };
    try {
      const ok = await current.persist(next, reason === "auto" ? "Автосохранение…" : "Сохраняю статью…");
      if (ok) {
        saved.current = { title: nextTitle, body: current.body };
        setTitle(nextTitle);
        setStatus("saved");
        return true;
      }
      setStatus("error");
      setError("Не удалось сохранить");
      return false;
    } finally {
      inFlight.current = false;
    }
  }

  useEffect(() => {
    if (!dirty || busy || bodyMissing) return;
    setStatus("dirty");
    const timer = window.setTimeout(() => {
      void save("auto");
    }, AUTOSAVE_MS);
    return () => window.clearTimeout(timer);
  }, [title, body, dirty, busy, bodyMissing]);

  const statusText =
    status === "saving"
      ? "Сохраняю…"
      : status === "saved"
        ? "Сохранено"
        : status === "error"
          ? error
          : status === "dirty"
            ? "Автосохранение"
            : "";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/40 p-4">
      <div className="mx-auto max-w-3xl bg-paper p-5">
        <p className="eyebrow">Править статью</p>
        <h2 className="mt-2 font-display text-2xl">{item.title}</h2>
        <p className="mt-2 font-mono text-[11px] text-muted">/blog/{item.slug}</p>

        {bodyMissing ? (
          <p className="mt-4 border border-line bg-surface px-3 py-2 text-sm text-muted">
            Текст не удалось прочитать из файла. Сохранение заблокировано, чтобы не затереть статью пустым полем.
          </p>
        ) : null}

        <label className="mt-5 block">
          <span className="text-[10px] tracking-[0.16em] text-muted uppercase">Заголовок</span>
          <input
            className={INPUT}
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setStatus("dirty");
            }}
          />
        </label>

        <label className="mt-4 block">
          <span className="text-[10px] tracking-[0.16em] text-muted uppercase">Текст</span>
          <textarea
            className={`${INPUT} min-h-[22rem] font-mono text-[13px] leading-relaxed`}
            value={body}
            onChange={(event) => {
              setBody(event.target.value);
              setStatus("dirty");
            }}
            spellCheck
          />
          <span className="mt-1 block text-xs text-muted">
            Разметка как на сайте: заголовки ## / ###, списки, **жирный**, ссылки. После сохранения на сайте
            обновится через несколько минут (выкладка на хостинг).
          </span>
        </label>

        <p className="mt-3 min-h-[1.25rem] text-sm text-muted" role="status">
          {statusText}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className={BTN}
            disabled={busy || bodyMissing || status === "saving"}
            onClick={() => void save("manual")}
          >
            Сохранить
          </button>
          <button type="button" className={BTN_GHOST} disabled={status === "saving"} onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
