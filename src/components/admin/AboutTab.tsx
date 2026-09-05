"use client";

import { ClipsEditor } from "@/components/admin/ClipsEditor";
import { GalleryTab } from "@/components/admin/GalleryTab";
import { unusedFiles, type TabProps } from "@/components/admin/types";
import { Arrows, BTN, BTN_GHOST, BTN_TEXT, Card, Field, FilePick, INPUT, Thumb, move } from "@/components/admin/ui";
import type { PressLink, Publication, SiteData } from "@/lib/content";
import { slugifyRu } from "@/lib/slugify";
import { useDragOrder, withMoved } from "@/lib/use-drag-order";
import { useState } from "react";

function youtubeId(value: string) {
  const match = value.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})|^([\w-]{11})$/);
  return (match?.[1] || match?.[2] || value).trim();
}

/** Вкладка «Обо мне и пресса»: главная, биография, публикации, ссылки, ТВ, фотоархив. */
export function AboutTab(props: TabProps) {
  const { state, setState, persist, busy, upload, notify } = props;
  const site = state.site;
  const { about } = site;
  const [videoBusy, setVideoBusy] = useState(false);
  const [videoDraft, setVideoDraft] = useState({ id: "", title: "" });
  const [linkDraft, setLinkDraft] = useState<PressLink>({ id: "", title: "", media: "", href: "" });
  const [removed, setRemoved] = useState<string[]>([]);

  const patchSite = (next: Partial<SiteData>) => setState({ ...state, site: { ...site, ...next } });
  const patchAbout = (next: Partial<SiteData["about"]>) => patchSite({ about: { ...about, ...next } });

  const save = () => {
    void persist(state, "Сохраняю…", unusedFiles(removed, state));
    setRemoved([]);
  };

  return (
    <section className="mt-8 space-y-8">
      <Card title="Первый экран главной">
        <Field label="Имя автора">
          <input className={INPUT} value={site.owner} onChange={(event) => patchSite({ owner: event.target.value })} />
        </Field>
        <Field label="Подпись под портретом на главной">
          <input className={INPUT} value={site.heroTitle ?? ""} onChange={(event) => patchSite({ heroTitle: event.target.value })} />
        </Field>
        <Field label="Слоган в подвале сайта">
          <input className={INPUT} value={site.tagline} onChange={(event) => patchSite({ tagline: event.target.value })} />
        </Field>
        <p className="text-[10px] tracking-[0.16em] text-muted uppercase">Портретное фото</p>
        <p className="text-xs text-muted">Стоит на первом экране главной и на странице «Обо мне».</p>
        <div className="flex items-center gap-3">
          {site.portrait ? <Thumb src={site.portrait} className="h-32 w-24" /> : null}
          <FilePick
            label="Выбрать портрет"
            accept="image/*"
            ghost
            disabled={busy}
            onFiles={async (files) => {
              try {
                const srcs = await upload(files);
                if (srcs[0]) patchSite({ portrait: srcs[0] });
              } catch (error) {
                notify(error instanceof Error ? error.message : "Ошибка загрузки");
              }
            }}
          />
        </div>
      </Card>

      <Card title="Страница «Обо мне»">
        <Field label="Мелкая надпись над заголовком">
          <input className={INPUT} value={about.eyebrow} onChange={(event) => patchAbout({ eyebrow: event.target.value })} />
        </Field>
        <Field label="Заголовок">
          <input className={INPUT} value={about.title} onChange={(event) => patchAbout({ title: event.target.value })} />
        </Field>
        <Field label="Первый абзац крупно">
          <textarea className={INPUT} rows={3} value={about.lead} onChange={(event) => patchAbout({ lead: event.target.value })} />
        </Field>
        <Field label="Биография" hint="Каждая строка — через пустую строку. Выделить жирным: **две звёздочки** по краям.">
          <textarea
            className={INPUT}
            rows={10}
            value={about.body.join("\n\n")}
            onChange={(event) => patchAbout({ body: event.target.value.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean) })}
          />
        </Field>
        <Field label="Примечание мелким внизу">
          <textarea className={INPUT} rows={2} value={about.note} onChange={(event) => patchAbout({ note: event.target.value })} />
        </Field>
      </Card>

      <PublicationsEditor
        publications={state.publications}
        busy={busy}
        upload={upload}
        notify={notify}
        onChange={(publications, removedSrcs) => {
          setState({ ...state, publications });
          if (removedSrcs?.length) setRemoved((prev) => [...prev, ...removedSrcs]);
        }}
      />

      <Card title="Ссылки на публикации" hint="Статьи на сайтах изданий, у которых здесь только ссылка. Показываются списком под публикациями.">
        <ul className="space-y-2">
          {state.pressLinks.map((link, index) => (
            <li key={`${link.id}-${index}`} className="flex flex-wrap items-center gap-2 border border-line bg-paper px-3 py-2">
              <input className="min-w-[200px] flex-1 border border-line bg-surface px-2 py-1 text-sm" value={link.title} placeholder="Заголовок" onChange={(event) => setState({ ...state, pressLinks: state.pressLinks.map((row, i) => (i === index ? { ...row, title: event.target.value } : row)) })} />
              <input className="w-40 border border-line bg-surface px-2 py-1 text-sm" value={link.media} placeholder="Издание" onChange={(event) => setState({ ...state, pressLinks: state.pressLinks.map((row, i) => (i === index ? { ...row, media: event.target.value } : row)) })} />
              <input className="min-w-[200px] flex-1 border border-line bg-surface px-2 py-1 text-sm" value={link.href} placeholder="https://…" onChange={(event) => setState({ ...state, pressLinks: state.pressLinks.map((row, i) => (i === index ? { ...row, href: event.target.value } : row)) })} />
              <Arrows disabled={busy} onUp={() => setState({ ...state, pressLinks: move(state.pressLinks, index, -1) })} onDown={() => setState({ ...state, pressLinks: move(state.pressLinks, index, 1) })} />
              <button type="button" className={`${BTN_TEXT} text-muted`} onClick={() => setState({ ...state, pressLinks: state.pressLinks.filter((_, i) => i !== index) })}>
                ✕
              </button>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <input className="min-w-[200px] flex-1 border border-line bg-paper px-3 py-2 text-sm" placeholder="Заголовок" value={linkDraft.title} onChange={(event) => setLinkDraft({ ...linkDraft, title: event.target.value })} />
          <input className="w-40 border border-line bg-paper px-3 py-2 text-sm" placeholder="Издание" value={linkDraft.media} onChange={(event) => setLinkDraft({ ...linkDraft, media: event.target.value })} />
          <input className="min-w-[200px] flex-1 border border-line bg-paper px-3 py-2 text-sm" placeholder="https://…" value={linkDraft.href} onChange={(event) => setLinkDraft({ ...linkDraft, href: event.target.value })} />
          <button
            type="button"
            className={BTN_GHOST}
            onClick={() => {
              if (!linkDraft.title.trim() || !linkDraft.href.trim()) return notify("Нужны заголовок и ссылка");
              setState({ ...state, pressLinks: [...state.pressLinks, { ...linkDraft, id: `${slugifyRu(linkDraft.title).slice(0, 40)}-${Date.now().toString(36)}` }] });
              setLinkDraft({ id: "", title: "", media: "", href: "" });
            }}
          >
            + Добавить ссылку
          </button>
        </div>
      </Card>

      <Card title="ТВ обо мне" hint="Два блока: ролики, которые лежат на сайте (с проигрывателем), и список эфиров со ссылками на YouTube — он показывается текстом.">
        <p className="text-[10px] tracking-[0.16em] text-muted uppercase">Ролики на сайте</p>
        <ClipsEditor clips={about.videos ?? []} disabled={busy} onStage={setVideoBusy} onChange={(videos) => patchAbout({ videos })} />
        <p className="pt-4 text-[10px] tracking-[0.16em] text-muted uppercase">Эфиры на YouTube — текстовый список</p>
        <ul className="space-y-2">
          {state.aboutVideos.map((video, index) => (
            <li key={`${video.id}-${index}`} className="flex flex-wrap items-center gap-2 border border-line bg-paper px-3 py-2">
              <input className="min-w-[200px] flex-1 border border-line bg-surface px-2 py-1 text-sm" value={video.title} onChange={(event) => setState({ ...state, aboutVideos: state.aboutVideos.map((row, i) => (i === index ? { ...row, title: event.target.value } : row)) })} />
              <span className="text-xs text-muted">{video.id}</span>
              <Arrows disabled={busy} onUp={() => setState({ ...state, aboutVideos: move(state.aboutVideos, index, -1) })} onDown={() => setState({ ...state, aboutVideos: move(state.aboutVideos, index, 1) })} />
              <button type="button" className={`${BTN_TEXT} text-muted`} onClick={() => setState({ ...state, aboutVideos: state.aboutVideos.filter((_, i) => i !== index) })}>
                ✕
              </button>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <input className="flex-1 border border-line bg-paper px-3 py-2 text-sm" placeholder="Ссылка на YouTube" value={videoDraft.id} onChange={(event) => setVideoDraft({ ...videoDraft, id: event.target.value })} />
          <input className="flex-1 border border-line bg-paper px-3 py-2 text-sm" placeholder="Канал — дата" value={videoDraft.title} onChange={(event) => setVideoDraft({ ...videoDraft, title: event.target.value })} />
          <button
            type="button"
            className={BTN_GHOST}
            onClick={() => {
              const id = youtubeId(videoDraft.id);
              if (!id) return;
              setState({ ...state, aboutVideos: [...state.aboutVideos, { id, title: videoDraft.title.trim() || id }] });
              setVideoDraft({ id: "", title: "" });
            }}
          >
            + Добавить эфир
          </button>
        </div>
      </Card>

      <button type="button" disabled={busy || videoBusy} className={BTN} onClick={save}>
        Сохранить всё на этой вкладке →
      </button>
      {videoBusy ? <p className="text-xs text-muted">Сохранить можно будет, когда ролик будет готов.</p> : null}

      <div className="border-t border-line pt-8">
        <GalleryTab
          {...props}
          title="Фотоархив"
          hint="Блок «Выставки и эфиры» внизу страницы «Обо мне»: фотографии с телевидения, выставок и встреч. Страницы изданий сюда не кладите — им место в публикациях."
          items={state.galleries.press}
          apply={(current, items) => ({ ...current, galleries: { ...current.galleries, press: items } })}
          scanKey={(unlisted) => unlisted.galleries.press}
          allowVideo={false}
        />
      </div>
    </section>
  );
}

function emptyPublication(): Publication {
  return { id: "", title: "", media: "", date: "", badge: "Статья", lead: "", paragraphs: [], link: "", images: [] };
}

/** Публикации в блоке «Пресса обо мне»: карточки со страницами изданий и текстом. */
function PublicationsEditor({
  publications,
  busy,
  upload,
  notify,
  onChange,
}: {
  publications: Publication[];
  busy: boolean;
  upload: (files: FileList | null) => Promise<string[]>;
  notify: (message: string) => void;
  onChange: (publications: Publication[], removedSrcs?: string[]) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const update = (index: number, next: Partial<Publication>) => onChange(publications.map((row, i) => (i === index ? { ...row, ...next } : row)));

  return (
    <Card title="Пресса обо мне" hint="Каждая карточка — одна статья или страница издания. Откройте карточку, чтобы поправить текст и страницы.">
      <ul className="space-y-2">
        {publications.map((pub, index) => {
          const open = openId === pub.id;
          return (
            <li key={pub.id} className="border border-line bg-paper">
              <div className="flex flex-wrap items-center gap-3 px-3 py-2">
                <button type="button" className="flex-1 text-left" onClick={() => setOpenId(open ? null : pub.id)}>
                  <span className="font-display text-base">{pub.title || "Без названия"}</span>
                  <span className="ml-2 text-xs text-muted">
                    {pub.media} · {pub.date} · страниц: {pub.images?.length ?? 0}
                  </span>
                </button>
                <Arrows disabled={busy} onUp={() => onChange(move(publications, index, -1))} onDown={() => onChange(move(publications, index, 1))} />
                <button type="button" className={BTN_TEXT} onClick={() => setOpenId(open ? null : pub.id)}>
                  {open ? "Свернуть" : "Открыть"}
                </button>
                <button
                  type="button"
                  className={`${BTN_TEXT} text-muted`}
                  onClick={() => {
                    if (!confirm(`Удалить публикацию «${pub.title}»?`)) return;
                    onChange(publications.filter((_, i) => i !== index), pub.images ?? []);
                  }}
                >
                  Удалить
                </button>
              </div>
              {open ? <PublicationFields pub={pub} busy={busy} upload={upload} notify={notify} onChange={(next, removedSrcs) => { update(index, next); if (removedSrcs?.length) onChange(publications.map((row, i) => (i === index ? { ...row, ...next } : row)), removedSrcs); }} /> : null}
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        className={BTN_GHOST}
        onClick={() => {
          const id = `pub-${Date.now().toString(36)}`;
          onChange([{ ...emptyPublication(), id }, ...publications]);
          setOpenId(id);
        }}
      >
        + Новая публикация
      </button>
    </Card>
  );
}

function PublicationFields({
  pub,
  busy,
  upload,
  notify,
  onChange,
}: {
  pub: Publication;
  busy: boolean;
  upload: (files: FileList | null) => Promise<string[]>;
  notify: (message: string) => void;
  onChange: (next: Partial<Publication>, removedSrcs?: string[]) => void;
}) {
  const images = pub.images ?? [];
  const drag = useDragOrder((from, to) => onChange({ images: withMoved(images, from, to) }), !busy);
  const text = (key: "title" | "media" | "date" | "badge" | "author" | "link", label: string, hint?: string) => (
    <Field key={key} label={label} hint={hint}>
      <input className={INPUT} value={pub[key] ?? ""} onChange={(event) => onChange({ [key]: event.target.value })} />
    </Field>
  );
  return (
    <div className="space-y-3 border-t border-line px-3 py-4">
      {text("title", "Заголовок")}
      <div className="grid gap-3 sm:grid-cols-3">
        {text("media", "Издание")}
        {text("date", "Дата или номер")}
        {text("badge", "Метка", "Статья, Интервью, Новость…")}
      </div>
      {text("author", "Автор (необязательно)")}
      {text("link", "Ссылка на оригинал (необязательно)")}
      <Field label="Короткое описание — видно всегда">
        <textarea className={INPUT} rows={3} value={pub.lead} onChange={(event) => onChange({ lead: event.target.value })} />
      </Field>
      <Field label="Полный текст статьи" hint="Абзацы через пустую строку. Пусто — кнопки «Читать статью» не будет, останутся страницы издания.">
        <textarea className={INPUT} rows={6} value={pub.paragraphs.join("\n\n")} onChange={(event) => onChange({ paragraphs: event.target.value.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean) })} />
      </Field>
      <p className="text-[10px] tracking-[0.16em] text-muted uppercase">Страницы и кадры публикации</p>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {images.map((src, index) => (
          <div key={`${src}-${index}`} {...drag.itemProps(index)} className={`relative transition ${drag.itemClass(index)}`}>
            <Thumb src={src} className="aspect-square w-full" />
            <button
              type="button"
              className="absolute top-0 right-0 bg-ink px-1 text-[10px] text-snow"
              onClick={() => onChange({ images: images.filter((_, i) => i !== index) }, [src])}
              aria-label="Убрать"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <FilePick
        label="Добавить страницы"
        accept="image/*"
        multiple
        ghost
        disabled={busy}
        onFiles={async (files) => {
          try {
            const srcs = await upload(files);
            onChange({ images: [...images, ...srcs] });
          } catch (error) {
            notify(error instanceof Error ? error.message : "Ошибка загрузки");
          }
        }}
      />
    </div>
  );
}
