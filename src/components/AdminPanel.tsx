"use client";

import type { Category, SiteData } from "@/lib/content";
import type { Featured, PhotoItem, StudioState, Tag } from "@/lib/admin-store";
import { mediaUrl } from "@/lib/media-url";
import { slugifyRu } from "@/lib/slugify";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Tab = "photos" | "categories" | "tags" | "featured" | "texts" | "backstage" | "contacts";

const TABS: { id: Tab; label: string }[] = [
  { id: "photos", label: "Кадры" },
  { id: "categories", label: "Разделы портфолио" },
  { id: "tags", label: "Подразделы" },
  { id: "featured", label: "Избранное" },
  { id: "texts", label: "Тексты и обо мне" },
  { id: "backstage", label: "Бэкстейдж" },
  { id: "contacts", label: "Контакты" },
];

async function compress(file: File, max = 1400, quality = 0.85): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Ошибка чтения файла"));
    reader.readAsDataURL(file);
  });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const node = new Image();
    node.onload = () => resolve(node);
    node.onerror = () => reject(new Error("Не удалось загрузить изображение"));
    node.src = dataUrl;
  });
  let width = image.naturalWidth;
  let height = image.naturalHeight;
  if (width > max || height > max) {
    if (width > height) {
      height = Math.round((height * max) / width);
      width = max;
    } else {
      width = Math.round((width * max) / height);
      height = max;
    }
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Ошибка конвертации изображения");
  ctx.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/webp", quality);
}

function move<T>(list: T[], index: number, dir: -1 | 1) {
  const next = index + dir;
  if (next < 0 || next >= list.length) return list;
  const copy = [...list];
  const [item] = copy.splice(index, 1);
  copy.splice(next, 0, item);
  return copy;
}

function emptyPhoto(): PhotoItem {
  return { src: "", alt: "", categories: [], tags: [], images: [], video: "" };
}

function emptyCategory(): Category {
  return { slug: "", menu: "", title: "", description: "", keywords: [] };
}

function youtubeId(value: string) {
  const match = value.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})|^([\w-]{11})$/,
  );
  return (match?.[1] || match?.[2] || value).trim();
}

export function AdminPanel() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("photos");
  const [state, setState] = useState<StudioState | null>(null);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("all");
  const [editing, setEditing] = useState<PhotoItem | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tagDraft, setTagDraft] = useState("");
  const [tagCreate, setTagCreate] = useState("");
  const [categoryDraft, setCategoryDraft] = useState<Category | null>(null);
  const [backstageCaption, setBackstageCaption] = useState("");
  const [backstagePending, setBackstagePending] = useState<string[]>([]);
  const [featuredSearch, setFeaturedSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const auth = await fetch("/api/admin/login", { cache: "no-store" });
        const json = (await auth.json()) as { authenticated?: boolean };
        if (!json.authenticated) {
          router.replace("/admin/login");
          if (!cancelled) setLoadError("Нужен вход в панель");
          return;
        }
        const res = await fetch("/api/admin/state", { cache: "no-store" });
        const payload = (await res.json().catch(() => null)) as StudioState | { error?: string } | null;
        if (!res.ok) {
          const message =
            payload && typeof payload === "object" && "error" in payload && payload.error
              ? payload.error
              : `Не удалось загрузить данные (${res.status})`;
          if (!cancelled) setLoadError(message);
          return;
        }
        if (!cancelled) {
          const studio = payload as StudioState;
          setState({
            ...studio,
            aboutVideos: studio.aboutVideos ?? [],
            reviews: studio.reviews ?? [],
            workshops: studio.workshops ?? [],
            backstage: studio.backstage ?? [],
          });
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "Ошибка сети при загрузке панели");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const photosInSection = useMemo(() => {
    if (!state) return [];
    return state.photos
      .map((photo, index) => ({ photo, index }))
      .filter(({ photo }) => {
        const inSection = section === "all" || photo.categories.includes(section);
        const q = query.trim().toLowerCase();
        const match = !q || photo.alt.toLowerCase().includes(q) || photo.src.toLowerCase().includes(q);
        return inSection && match;
      });
  }, [query, section, state]);

  async function persist(next: StudioState, message?: string) {
    setBusy(true);
    setNote(message ?? "Сохранение…");
    try {
      const res = await fetch("/api/admin/state", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Ошибка сохранения");
      setState(next);
      setNote("✓ Сохранено. На сайте обновится через несколько минут");
    } catch (error) {
      setNote(error instanceof Error ? error.message : "Ошибка сети при сохранении");
    } finally {
      setBusy(false);
    }
  }

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return [] as string[];
    const srcs: string[] = [];
    for (const file of [...files]) {
      setNote("Сжатие и оптимизация фото…");
      const dataUrl = await compress(file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl, filename: file.name }),
      });
      const json = (await res.json()) as { src?: string; error?: string };
      if (!res.ok || !json.src) throw new Error(json.error || "Ошибка оптимизации фото");
      srcs.push(json.src);
    }
    return srcs;
  }

  if (!state) {
    if (loadError) {
      return (
        <div className="mx-auto max-w-md px-5 py-24">
          <p className="eyebrow">Панель управления</p>
          <h1 className="mt-4 font-display text-3xl">Не удалось открыть кабинет</h1>
          <p className="mt-4 text-sm text-muted">{loadError}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-full bg-ink px-4 py-2 text-xs text-snow uppercase"
              onClick={() => window.location.reload()}
            >
              Повторить
            </button>
            <Link href="/admin/login" className="rounded-full border border-line px-4 py-2 text-xs uppercase">
              Перейти ко входу
            </Link>
          </div>
        </div>
      );
    }
    return <p className="px-5 py-24 text-sm text-muted">Загрузка панели управления…</p>;
  }

  const site = state.site;

  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-24 pt-8 md:px-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Панель управления</p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">Anna Manasaryan</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/instrukciya" className="rounded-full border border-line bg-surface px-4 py-2 text-xs font-medium">
            Инструкция
          </Link>
          <a
            href="https://annamanasaryan.com"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-line bg-surface px-4 py-2 text-xs font-medium"
          >
            Открыть сайт ↗
          </a>
          <button
            type="button"
            className="rounded-full border border-line px-4 py-2 text-xs"
            onClick={async () => {
              await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) });
              router.push("/admin/login");
            }}
          >
            Выйти
          </button>
        </div>
      </header>

      <nav className="mt-8 flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-full px-4 py-2 text-xs tracking-[0.12em] uppercase ${
              tab === item.id ? "bg-ink text-snow" : "border border-line text-ink"
            }`}
          >
            {item.label}
            {item.id === "photos" ? ` (${state.photos.length})` : ""}
            {item.id === "categories" ? ` (${state.categories.length})` : ""}
            {item.id === "tags" ? ` (${state.tags.length})` : ""}
            {item.id === "featured" ? ` (${state.featured.photoSrcs.length})` : ""}
            {item.id === "backstage" ? ` (${state.backstage.length})` : ""}
          </button>
        ))}
      </nav>

      {note ? <p className="mt-6 text-sm text-muted">{note}</p> : null}

      {tab === "photos" ? (
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
                  {category.menu}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="rounded-full bg-ink px-4 py-2 text-xs text-snow uppercase"
              onClick={() => {
                setEditing(emptyPhoto());
                setEditingIndex(null);
              }}
            >
              Новый кадр
            </button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photosInSection.map(({ photo, index }, visibleIndex) => (
              <article key={`${photo.src}-${index}`} className="border border-line bg-surface p-3">
                <div className="aspect-[3/4] overflow-hidden bg-void">
                  {photo.src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrl(photo.src)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-snow/50">Нет фото</div>
                  )}
                </div>
                <p className="mt-3 font-display text-lg leading-tight">{photo.alt || "Без названия"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {section !== "all" ? (
                    <>
                      <button type="button" className="text-xs uppercase" disabled={busy} onClick={() => persist({ ...state, photos: move(state.photos, index, -1) })}>
                        ↑
                      </button>
                      <button type="button" className="text-xs uppercase" disabled={busy} onClick={() => persist({ ...state, photos: move(state.photos, index, 1) })}>
                        ↓
                      </button>
                    </>
                  ) : null}
                  <button
                    type="button"
                    className="text-xs uppercase"
                    onClick={() => {
                      setEditing({ ...photo, images: photo.images?.length ? photo.images : [photo.src], tags: photo.tags ?? [] });
                      setEditingIndex(index);
                    }}
                  >
                    Редактировать
                  </button>
                  <button
                    type="button"
                    className="text-xs text-muted uppercase"
                    onClick={() => {
                      if (!confirm(`Удалить кадр «${photo.alt}»?`)) return;
                      persist({ ...state, photos: state.photos.filter((_, i) => i !== index) });
                    }}
                  >
                    Удалить
                  </button>
                </div>
                {section !== "all" ? <p className="mt-2 text-[10px] tracking-[0.16em] text-muted uppercase">{visibleIndex + 1}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {tab === "categories" ? (
        <section className="mt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl">Разделы портфолио</h2>
              <p className="mt-1 max-w-2xl text-sm text-muted">
                Это блоки на главной и пункты в портфолио. Можно завести новое направление, сменить обложку, название и убрать ненужное.
              </p>
            </div>
            <button
              type="button"
              className="rounded-full bg-ink px-5 py-2 text-xs text-snow uppercase"
              onClick={() => setCategoryDraft(emptyCategory())}
            >
              + Добавить новый раздел
            </button>
          </div>
          <div className="mt-6 space-y-3">
            {state.categories.map((category, index) => (
              <div key={category.slug} className="flex flex-col gap-4 border border-line bg-surface p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden bg-void">
                    {category.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={mediaUrl(category.cover)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-snow/50">Нет</div>
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg">{category.menu}</h3>
                      <span className="text-[10px] tracking-[0.14em] text-muted uppercase">/portfolio/{category.slug}</span>
                    </div>
                    <p className="mt-1 max-w-xl text-sm text-muted">{category.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" disabled={busy} onClick={() => persist({ ...state, categories: move(state.categories, index, -1) })}>
                    ↑
                  </button>
                  <button type="button" disabled={busy} onClick={() => persist({ ...state, categories: move(state.categories, index, 1) })}>
                    ↓
                  </button>
                  <button type="button" className="text-xs uppercase" onClick={() => setCategoryDraft({ ...category })}>
                    Редактировать
                  </button>
                  <button
                    type="button"
                    className="text-xs text-muted uppercase"
                    onClick={() => {
                      if (!confirm(`Удалить раздел «${category.menu}»? Кадры останутся, просто снимутся с этого раздела.`)) return;
                      persist({
                        ...state,
                        categories: state.categories.filter((item) => item.slug !== category.slug),
                        photos: state.photos.map((photo) => ({
                          ...photo,
                          categories: photo.categories.filter((item) => item !== category.slug),
                        })),
                      });
                    }}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {tab === "tags" ? (
        <section className="mt-8">
          <p className="max-w-xl text-sm text-muted">
            Подраздел появляется в портфолио, когда метку получает хотя бы один кадр. Стрелки сразу сохраняют порядок.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <input value={tagDraft} onChange={(event) => setTagDraft(event.target.value)} placeholder="Новый подраздел" className="border border-line px-3 py-2" />
            <button
              type="button"
              className="rounded-full bg-ink px-4 py-2 text-xs text-snow uppercase"
              onClick={() => {
                const name = tagDraft.trim();
                if (!name) return;
                const exists = state.tags.find((item) => item.name.toLowerCase() === name.toLowerCase());
                if (exists) {
                  setNote("Такой подраздел уже есть");
                  return;
                }
                persist({ ...state, tags: [...state.tags, { slug: slugifyRu(name), name }] });
                setTagDraft("");
              }}
            >
              + Создать подраздел
            </button>
          </div>
          <ul className="mt-6 space-y-3">
            {state.tags.map((tag, index) => (
              <li key={tag.slug} className="flex flex-wrap items-center gap-3 border border-line bg-surface px-3 py-3">
                <button type="button" disabled={busy} onClick={() => persist({ ...state, tags: move(state.tags, index, -1) })}>
                  ↑
                </button>
                <button type="button" disabled={busy} onClick={() => persist({ ...state, tags: move(state.tags, index, 1) })}>
                  ↓
                </button>
                <input
                  className="min-w-[160px] flex-1 border border-line px-2 py-1"
                  value={tag.name}
                  onChange={(event) => {
                    const tags = state.tags.map((item, i) => (i === index ? { ...item, name: event.target.value } : item));
                    setState({ ...state, tags });
                  }}
                  onBlur={() => persist(state)}
                />
                <span className="text-xs text-muted">/{tag.slug}</span>
                <button
                  type="button"
                  className="text-xs text-muted"
                  onClick={() => {
                    persist({
                      ...state,
                      tags: state.tags.filter((item) => item.slug !== tag.slug),
                      photos: state.photos.map((photo) => ({ ...photo, tags: (photo.tags ?? []).filter((item) => item !== tag.slug) })),
                    });
                  }}
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {tab === "featured" ? (
        <FeaturedTab
          state={state}
          busy={busy}
          search={featuredSearch}
          setSearch={setFeaturedSearch}
          setState={setState}
          persist={persist}
        />
      ) : null}

      {tab === "texts" ? (
        <TextsTab
          state={state}
          site={site}
          busy={busy}
          setState={setState}
          persist={persist}
          onUpload={uploadFiles}
        />
      ) : null}

      {tab === "backstage" ? (
        <section className="mt-8">
          <div className="border border-line bg-surface p-5">
            <h2 className="font-display text-2xl">+ Добавить кадр в бэкстейдж</h2>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
              <label className="flex-1">
                <span className="text-[10px] tracking-[0.16em] text-muted uppercase">Подпись к кадру</span>
                <input
                  className="mt-1 w-full border border-line px-3 py-2"
                  placeholder="Например: Свет перед съёмкой новорождённого"
                  value={backstageCaption}
                  onChange={(event) => setBackstageCaption(event.target.value)}
                />
              </label>
              <label>
                <span className="text-[10px] tracking-[0.16em] text-muted uppercase">Фотография (авто-сжатие)</span>
                <input
                  className="mt-1 block w-full text-sm"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={async (event) => {
                    try {
                      const srcs = await uploadFiles(event.target.files);
                      setBackstagePending((prev) => [...prev, ...srcs]);
                    } catch (error) {
                      setNote(error instanceof Error ? error.message : "Ошибка загрузки");
                    }
                    event.target.value = "";
                  }}
                />
              </label>
              <button
                type="button"
                disabled={busy || !backstagePending.length}
                className="rounded-full bg-ink px-5 py-2 text-xs text-snow uppercase disabled:opacity-40"
                onClick={() => {
                  const caption = backstageCaption.trim() || "Бэкстейдж";
                  persist({
                    ...state,
                    backstage: [...state.backstage, ...backstagePending.map((src) => ({ src, alt: caption }))],
                  });
                  setBackstageCaption("");
                  setBackstagePending([]);
                }}
              >
                Опубликовать
              </button>
            </div>
            {backstagePending.length ? (
              <p className="mt-3 text-xs text-muted">Выбрано кадров: {backstagePending.length}. Нажмите «Опубликовать», чтобы они встали в ленту.</p>
            ) : null}
          </div>
          <p className="mt-6 text-sm text-muted">
            Порядок кадров здесь — это порядок на странице «Бэкстейдж». Стрелки ↑ ↓ сразу сохраняют.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {state.backstage.map((item, index) => (
              <figure key={`${item.src}-${index}`} className="border border-line bg-surface p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mediaUrl(item.src)} alt="" className="aspect-[3/4] w-full object-cover" />
                <p className="mt-2 text-xs">{item.alt}</p>
                <div className="mt-2 flex gap-2 text-xs">
                  <button type="button" disabled={busy} onClick={() => persist({ ...state, backstage: move(state.backstage, index, -1) })}>
                    ↑
                  </button>
                  <button type="button" disabled={busy} onClick={() => persist({ ...state, backstage: move(state.backstage, index, 1) })}>
                    ↓
                  </button>
                  <span className="text-muted">{index + 1}</span>
                  <button
                    type="button"
                    className="ml-auto text-muted"
                    onClick={() => persist({ ...state, backstage: state.backstage.filter((_, i) => i !== index) })}
                  >
                    Удалить
                  </button>
                </div>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {tab === "contacts" ? (
        <section className="mt-8 max-w-xl space-y-3">
          <h2 className="font-display text-2xl">Настройка контактов</h2>
          {(
            [
              ["whatsapp", "Телефон (Армения) и WhatsApp"],
              ["phoneRussia", "Телефон (Россия)"],
              ["instagram", "Instagram (без @)"],
              ["facebook", "Facebook (ссылка на профиль / страницу)"],
              ["email", "Email для связи"],
              ["city", "Город / Локация"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block">
              <span className="text-[10px] tracking-[0.16em] text-muted uppercase">{label}</span>
              <input
                className="mt-1 w-full border border-line px-3 py-2"
                value={site.contacts[key] ?? ""}
                onChange={(event) => {
                  const nextSite = { ...site, contacts: { ...site.contacts, [key]: event.target.value } };
                  if (key === "whatsapp") {
                    nextSite.contacts.whatsappDigits = event.target.value.replace(/\D/g, "");
                    nextSite.contacts.phone = event.target.value;
                  }
                  setState({ ...state, site: nextSite });
                }}
              />
            </label>
          ))}
          <button type="button" disabled={busy} className="mt-4 rounded-full bg-ink px-5 py-2 text-xs text-snow uppercase" onClick={() => persist(state)}>
            Сохранить контакты →
          </button>
        </section>
      ) : null}

      {categoryDraft ? (
        <CategoryEditor
          category={categoryDraft}
          busy={busy}
          existing={state.categories}
          onClose={() => setCategoryDraft(null)}
          onUpload={uploadFiles}
          onSave={(category) => {
            if (!category.menu.trim()) {
              setNote("Укажите название раздела");
              return;
            }
            const slug = category.slug || slugifyRu(category.menu);
            const next = { ...category, slug, title: category.title.trim() || category.menu };
            const categories = state.categories.some((item) => item.slug === slug)
              ? state.categories.map((item) => (item.slug === slug ? next : item))
              : [...state.categories, next];
            persist({ ...state, categories });
            setCategoryDraft(null);
          }}
        />
      ) : null}

      {editing ? (
        <PhotoEditor
          photo={editing}
          categories={state.categories}
          tags={state.tags}
          tagCreate={tagCreate}
          setTagCreate={setTagCreate}
          busy={busy}
          onClose={() => {
            setEditing(null);
            setEditingIndex(null);
          }}
          onUpload={uploadFiles}
          onSave={(photo) => {
            if (!photo.src) {
              setNote("Добавьте хотя бы одну фотографию");
              return;
            }
            if (!photo.alt.trim() || photo.categories.length === 0) {
              setNote("Укажите название и раздел");
              return;
            }
            const photos = [...state.photos];
            if (editingIndex === null) photos.unshift(photo);
            else photos[editingIndex] = photo;
            persist({ ...state, photos });
            setEditing(null);
            setEditingIndex(null);
          }}
          onCreateTag={() => {
            const name = tagCreate.trim();
            if (!name) return "";
            const exists = state.tags.find((item) => item.name.toLowerCase() === name.toLowerCase());
            const slug = exists?.slug ?? slugifyRu(name);
            const tags = exists ? state.tags : [...state.tags, { slug, name }];
            setState({ ...state, tags });
            setTagCreate("");
            return slug;
          }}
        />
      ) : null}
    </div>
  );
}

function FeaturedTab({
  state,
  busy,
  search,
  setSearch,
  setState,
  persist,
}: {
  state: StudioState;
  busy: boolean;
  search: string;
  setSearch: (value: string) => void;
  setState: (state: StudioState) => void;
  persist: (state: StudioState) => void;
}) {
  const featured = state.featured;
  const q = search.trim().toLowerCase();
  const candidates = state.photos.filter((photo) => {
    if (featured.photoSrcs.includes(photo.src)) return false;
    if (!q) return true;
    return photo.alt.toLowerCase().includes(q) || photo.src.toLowerCase().includes(q);
  });

  function patch(patch: Partial<Featured>) {
    setState({ ...state, featured: { ...featured, ...patch } });
  }

  return (
    <section className="mt-8 max-w-3xl">
      <h2 className="font-display text-2xl">Избранное на главной странице</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Лента кадров на главной: свой заголовок, своя подпись и свой состав. Пока ни один кадр не выбран, лента собирается сама — по одному кадру из каждого раздела.
      </p>
      <div className="mt-6 border border-line bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[10px] tracking-[0.16em] text-muted uppercase">Лента избранного на главной</span>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={featured.visible} onChange={(event) => patch({ visible: event.target.checked })} />
            Показывать на сайте
          </label>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-[10px] tracking-[0.16em] text-muted uppercase">Надпись сверху</span>
            <input className="mt-1 w-full border border-line px-3 py-2" value={featured.eyebrow} onChange={(event) => patch({ eyebrow: event.target.value })} />
          </label>
          <label className="block">
            <span className="text-[10px] tracking-[0.16em] text-muted uppercase">Заголовок</span>
            <input className="mt-1 w-full border border-line px-3 py-2" value={featured.title} onChange={(event) => patch({ title: event.target.value })} />
          </label>
        </div>
        <label className="mt-3 block">
          <span className="text-[10px] tracking-[0.16em] text-muted uppercase">Подпись под заголовком</span>
          <input className="mt-1 w-full border border-line px-3 py-2" value={featured.subtitle} onChange={(event) => patch({ subtitle: event.target.value })} />
        </label>
        <p className="mt-5 text-[10px] tracking-[0.16em] text-muted uppercase">Выбранные кадры ({featured.photoSrcs.length})</p>
        {featured.photoSrcs.length === 0 ? (
          <p className="mt-2 border border-dashed border-line px-3 py-2 text-sm text-muted">Пока ничего не выбрано — на сайте лента собирается сама.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {featured.photoSrcs.map((src, index) => {
              const photo = state.photos.find((item) => item.src === src);
              return (
                <li key={src} className="flex items-center gap-2 border border-line px-3 py-2">
                  <span className="flex-1 text-sm">{index + 1}. {photo?.alt ?? src}</span>
                  <button type="button" onClick={() => patch({ photoSrcs: move(featured.photoSrcs, index, -1) })}>↑</button>
                  <button type="button" onClick={() => patch({ photoSrcs: move(featured.photoSrcs, index, 1) })}>↓</button>
                  <button type="button" onClick={() => patch({ photoSrcs: featured.photoSrcs.filter((item) => item !== src) })}>✕</button>
                </li>
              );
            })}
          </ul>
        )}
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Найти кадр по названию…" className="mt-4 w-full border border-line px-3 py-2" />
        <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto border border-line p-2">
          {candidates.slice(0, 40).map((photo) => (
            <li key={photo.src}>
              <button
                type="button"
                className="w-full text-left text-sm"
                onClick={() => patch({ photoSrcs: [...featured.photoSrcs, photo.src] })}
              >
                {photo.alt || photo.src}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <button type="button" disabled={busy} className="mt-6 rounded-full bg-ink px-5 py-2 text-xs text-snow uppercase" onClick={() => persist(state)}>
        Сохранить избранное →
      </button>
    </section>
  );
}

function TextsTab({
  state,
  site,
  busy,
  setState,
  persist,
  onUpload,
}: {
  state: StudioState;
  site: SiteData;
  busy: boolean;
  setState: (state: StudioState) => void;
  persist: (state: StudioState) => void;
  onUpload: (files: FileList | null) => Promise<string[]>;
}) {
  const [videoDraft, setVideoDraft] = useState({ id: "", title: "" });
  const [reviewDraft, setReviewDraft] = useState({ name: "", role: "", text: "" });

  function patchSite(patch: Partial<SiteData>) {
    setState({ ...state, site: { ...site, ...patch } });
  }

  return (
    <section className="mt-8 space-y-8">
      <div className="max-w-2xl space-y-3">
        <h2 className="font-display text-2xl">Тексты сайта и страница «Обо мне»</h2>
        <label className="block">
          <span className="text-[10px] tracking-[0.16em] text-muted uppercase">Имя автора</span>
          <input className="mt-1 w-full border border-line px-3 py-2" value={site.owner} onChange={(event) => patchSite({ owner: event.target.value })} />
        </label>
        <label className="block">
          <span className="text-[10px] tracking-[0.16em] text-muted uppercase">Краткий слоган (на главной под именем)</span>
          <input className="mt-1 w-full border border-line px-3 py-2" value={site.tagline} onChange={(event) => patchSite({ tagline: event.target.value })} />
        </label>
        <label className="block">
          <span className="text-[10px] tracking-[0.16em] text-muted uppercase">История и философия (текст «Обо мне» и на главной)</span>
          <textarea className="mt-1 w-full border border-line px-3 py-2" rows={4} value={site.intro} onChange={(event) => patchSite({ intro: event.target.value })} />
        </label>
        <label className="block">
          <span className="text-[10px] tracking-[0.16em] text-muted uppercase">Обо мне — заголовок</span>
          <input className="mt-1 w-full border border-line px-3 py-2" value={site.about.title} onChange={(event) => patchSite({ about: { ...site.about, title: event.target.value } })} />
        </label>
        <label className="block">
          <span className="text-[10px] tracking-[0.16em] text-muted uppercase">Лид</span>
          <textarea className="mt-1 w-full border border-line px-3 py-2" rows={3} value={site.about.lead} onChange={(event) => patchSite({ about: { ...site.about, lead: event.target.value } })} />
        </label>
        <label className="block">
          <span className="text-[10px] tracking-[0.16em] text-muted uppercase">Рассказ (абзац с новой строки)</span>
          <textarea
            className="mt-1 w-full border border-line px-3 py-2"
            rows={6}
            value={site.about.body.join("\n\n")}
            onChange={(event) => patchSite({ about: { ...site.about, body: event.target.value.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean) } })}
          />
        </label>
        <label className="block">
          <span className="text-[10px] tracking-[0.16em] text-muted uppercase">Примечание внизу страницы</span>
          <textarea className="mt-1 w-full border border-line px-3 py-2" rows={3} value={site.about.note} onChange={(event) => patchSite({ about: { ...site.about, note: event.target.value } })} />
        </label>
        <label className="block">
          <span className="text-[10px] tracking-[0.16em] text-muted uppercase">Портретное фото автора</span>
          <input
            className="mt-1 block w-full text-sm"
            type="file"
            accept="image/*"
            onChange={async (event) => {
              try {
                const srcs = await onUpload(event.target.files);
                if (srcs[0]) patchSite({ portrait: srcs[0] });
              } catch (error) {
                window.alert(error instanceof Error ? error.message : "Ошибка загрузки");
              }
              event.target.value = "";
            }}
          />
          <p className="mt-1 text-xs text-muted">Это фото стоит на первом экране главной и на странице «Обо мне». Встанет после «Сохранить все тексты».</p>
          {site.portrait ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaUrl(site.portrait)} alt="" className="mt-3 h-32 w-24 object-cover" />
          ) : null}
        </label>
      </div>

      <div className="max-w-2xl space-y-3 border border-line bg-surface p-5">
        <h2 className="font-display text-2xl">Обучение</h2>
        <input className="w-full border border-line px-3 py-2" value={site.training.eyebrow} onChange={(event) => patchSite({ training: { ...site.training, eyebrow: event.target.value } })} />
        <input className="w-full border border-line px-3 py-2" value={site.training.title} onChange={(event) => patchSite({ training: { ...site.training, title: event.target.value } })} />
        <input className="w-full border border-line px-3 py-2" value={site.training.stat} onChange={(event) => patchSite({ training: { ...site.training, stat: event.target.value } })} />
        <textarea className="w-full border border-line px-3 py-2" rows={3} value={site.training.lead} onChange={(event) => patchSite({ training: { ...site.training, lead: event.target.value } })} />
        {site.training.formats.map((item, index) => (
          <div key={index} className="grid gap-2 sm:grid-cols-2">
            <input className="border border-line px-3 py-2" value={item.title} onChange={(event) => {
              const formats = site.training.formats.map((row, i) => (i === index ? { ...row, title: event.target.value } : row));
              patchSite({ training: { ...site.training, formats } });
            }} />
            <textarea className="border border-line px-3 py-2" rows={2} value={item.text} onChange={(event) => {
              const formats = site.training.formats.map((row, i) => (i === index ? { ...row, text: event.target.value } : row));
              patchSite({ training: { ...site.training, formats } });
            }} />
          </div>
        ))}
      </div>

      <div className="max-w-2xl space-y-3 border border-line bg-surface p-5">
        <h2 className="font-display text-2xl">Фототур</h2>
        <input className="w-full border border-line px-3 py-2" value={site.phototour.eyebrow} onChange={(event) => patchSite({ phototour: { ...site.phototour, eyebrow: event.target.value } })} />
        <input className="w-full border border-line px-3 py-2" value={site.phototour.title} onChange={(event) => patchSite({ phototour: { ...site.phototour, title: event.target.value } })} />
        <textarea className="w-full border border-line px-3 py-2" rows={3} value={site.phototour.lead} onChange={(event) => patchSite({ phototour: { ...site.phototour, lead: event.target.value } })} />
        <input className="w-full border border-line px-3 py-2" value={site.phototour.cta} onChange={(event) => patchSite({ phototour: { ...site.phototour, cta: event.target.value } })} />
      </div>

      <div className="max-w-2xl space-y-3 border border-line bg-surface p-5">
        <h2 className="font-display text-2xl">Видео на странице «Обо мне»</h2>
        <ul className="space-y-2">
          {state.aboutVideos.map((video, index) => (
            <li key={`${video.id}-${index}`} className="flex flex-wrap items-center gap-2 border border-line px-3 py-2">
              <span className="flex-1 text-sm">{video.title} · {video.id}</span>
              <button type="button" onClick={() => setState({ ...state, aboutVideos: move(state.aboutVideos, index, -1) })}>↑</button>
              <button type="button" onClick={() => setState({ ...state, aboutVideos: move(state.aboutVideos, index, 1) })}>↓</button>
              <button type="button" onClick={() => setState({ ...state, aboutVideos: state.aboutVideos.filter((_, i) => i !== index) })}>✕</button>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <input className="flex-1 border border-line px-3 py-2" placeholder="YouTube id или ссылка" value={videoDraft.id} onChange={(event) => setVideoDraft({ ...videoDraft, id: event.target.value })} />
          <input className="flex-1 border border-line px-3 py-2" placeholder="Название" value={videoDraft.title} onChange={(event) => setVideoDraft({ ...videoDraft, title: event.target.value })} />
          <button
            type="button"
            className="text-xs uppercase"
            onClick={() => {
              const id = youtubeId(videoDraft.id);
              if (!id) return;
              setState({ ...state, aboutVideos: [...state.aboutVideos, { id, title: videoDraft.title.trim() || id }] });
              setVideoDraft({ id: "", title: "" });
            }}
          >
            + Добавить видео
          </button>
        </div>
      </div>

      <div className="max-w-2xl space-y-3 border border-line bg-surface p-5">
        <h2 className="font-display text-2xl">Отзывы</h2>
        <ul className="space-y-2">
          {state.reviews.map((review, index) => (
            <li key={review.id} className="border border-line px-3 py-2">
              <div className="flex gap-2">
                <input className="flex-1 border border-line px-2 py-1 text-sm" value={review.name} onChange={(event) => setState({ ...state, reviews: state.reviews.map((item, i) => (i === index ? { ...item, name: event.target.value } : item)) })} />
                <input className="flex-1 border border-line px-2 py-1 text-sm" value={review.role} onChange={(event) => setState({ ...state, reviews: state.reviews.map((item, i) => (i === index ? { ...item, role: event.target.value } : item)) })} />
                <button type="button" onClick={() => setState({ ...state, reviews: state.reviews.filter((_, i) => i !== index) })}>✕</button>
              </div>
              <textarea className="mt-2 w-full border border-line px-2 py-1 text-sm" rows={2} value={review.text} onChange={(event) => setState({ ...state, reviews: state.reviews.map((item, i) => (i === index ? { ...item, text: event.target.value } : item)) })} />
            </li>
          ))}
        </ul>
        <div className="space-y-2">
          <input className="w-full border border-line px-3 py-2" placeholder="Имя" value={reviewDraft.name} onChange={(event) => setReviewDraft({ ...reviewDraft, name: event.target.value })} />
          <input className="w-full border border-line px-3 py-2" placeholder="Роль / съёмка" value={reviewDraft.role} onChange={(event) => setReviewDraft({ ...reviewDraft, role: event.target.value })} />
          <textarea className="w-full border border-line px-3 py-2" rows={2} placeholder="Текст отзыва" value={reviewDraft.text} onChange={(event) => setReviewDraft({ ...reviewDraft, text: event.target.value })} />
          <button
            type="button"
            className="text-xs uppercase"
            onClick={() => {
              if (!reviewDraft.name.trim() || !reviewDraft.text.trim()) return;
              setState({
                ...state,
                reviews: [...state.reviews, { id: `r${Date.now()}`, ...reviewDraft }],
              });
              setReviewDraft({ name: "", role: "", text: "" });
            }}
          >
            + Добавить отзыв
          </button>
        </div>
      </div>

      <button type="button" disabled={busy} className="rounded-full bg-ink px-5 py-2 text-xs text-snow uppercase" onClick={() => persist(state)}>
        Сохранить все тексты →
      </button>
    </section>
  );
}

function CategoryEditor({
  category,
  busy,
  existing,
  onClose,
  onSave,
  onUpload,
}: {
  category: Category;
  busy: boolean;
  existing: Category[];
  onClose: () => void;
  onSave: (category: Category) => void;
  onUpload: (files: FileList | null) => Promise<string[]>;
}) {
  const [draft, setDraft] = useState(category);
  const isNew = !category.slug;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/40 p-4">
      <div className="mx-auto max-w-xl bg-paper p-5">
        <p className="eyebrow">{isNew ? "Новый раздел портфолио" : "Редактирование раздела"}</p>
        <label className="mt-4 block text-[10px] tracking-[0.16em] text-muted uppercase">Название в меню *</label>
        <input className="mt-1 w-full border border-line px-3 py-2" value={draft.menu} onChange={(event) => setDraft({ ...draft, menu: event.target.value })} />
        <label className="mt-3 block text-[10px] tracking-[0.16em] text-muted uppercase">Заголовок страницы</label>
        <input className="mt-1 w-full border border-line px-3 py-2" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
        <label className="mt-3 block text-[10px] tracking-[0.16em] text-muted uppercase">Описание</label>
        <textarea className="mt-1 w-full border border-line px-3 py-2" rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
        <label className="mt-3 block text-[10px] tracking-[0.16em] text-muted uppercase">Ключевые слова через запятую</label>
        <input
          className="mt-1 w-full border border-line px-3 py-2"
          value={draft.keywords.join(", ")}
          onChange={(event) => setDraft({ ...draft, keywords: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })}
        />
        {!isNew ? <p className="mt-2 text-xs text-muted">Адрес /portfolio/{draft.slug} не меняется при переименовании</p> : null}
        {isNew ? (
          <p className="mt-2 text-xs text-muted">Адрес страница сделает сама из названия. Потом его лучше не трогать — ссылки сохранятся.</p>
        ) : null}
        <label className="mt-3 block text-[10px] tracking-[0.16em] text-muted uppercase">Обложка раздела</label>
        <input
          className="mt-1 block w-full text-sm"
          type="file"
          accept="image/*"
          onChange={async (event) => {
            try {
              const srcs = await onUpload(event.target.files);
              if (srcs[0]) setDraft({ ...draft, cover: srcs[0] });
            } catch (error) {
              window.alert(error instanceof Error ? error.message : "Ошибка загрузки");
            }
            event.target.value = "";
          }}
        />
        {draft.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(draft.cover)} alt="" className="mt-3 h-24 w-20 object-cover" />
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy}
            className="rounded-full bg-ink px-5 py-2 text-xs text-snow uppercase"
            onClick={() => {
              if (isNew && existing.some((item) => item.slug === slugifyRu(draft.menu))) {
                window.alert("Раздел с таким адресом уже есть");
                return;
              }
              onSave(draft);
            }}
          >
            Сохранить раздел ✓
          </button>
          <button type="button" className="text-xs uppercase" onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

function PhotoEditor({
  photo,
  categories,
  tags,
  tagCreate,
  setTagCreate,
  busy,
  onClose,
  onSave,
  onUpload,
  onCreateTag,
}: {
  photo: PhotoItem;
  categories: Category[];
  tags: Tag[];
  tagCreate: string;
  setTagCreate: (value: string) => void;
  busy: boolean;
  onClose: () => void;
  onSave: (photo: PhotoItem) => void;
  onUpload: (files: FileList | null) => Promise<string[]>;
  onCreateTag: () => string;
}) {
  const [draft, setDraft] = useState(photo);
  const images = draft.images?.length ? draft.images : draft.src ? [draft.src] : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/40 p-4">
      <div className="mx-auto max-w-2xl bg-paper p-5">
        <p className="eyebrow">Редактирование кадра</p>
        <label className="mt-4 block text-[10px] tracking-[0.16em] text-muted uppercase">Название</label>
        <input className="mt-1 w-full border border-line px-3 py-2" value={draft.alt} onChange={(event) => setDraft({ ...draft, alt: event.target.value })} />
        <p className="mt-5 text-[10px] tracking-[0.16em] text-muted uppercase">Разделы</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {categories.map((category) => {
            const on = draft.categories.includes(category.slug);
            return (
              <button
                key={category.slug}
                type="button"
                className={`rounded-full px-3 py-1 text-xs ${on ? "bg-ink text-snow" : "border border-line"}`}
                onClick={() =>
                  setDraft({
                    ...draft,
                    categories: on ? draft.categories.filter((item) => item !== category.slug) : [...draft.categories, category.slug],
                  })
                }
              >
                {on ? "✓ " : "+ "}
                {category.menu}
              </button>
            );
          })}
        </div>
        <p className="mt-5 text-[10px] tracking-[0.16em] text-muted uppercase">Подразделы и темы</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((tag) => {
            const on = (draft.tags ?? []).includes(tag.slug);
            return (
              <button
                key={tag.slug}
                type="button"
                className={`rounded-full px-3 py-1 text-xs ${on ? "bg-ink text-snow" : "border border-line"}`}
                onClick={() => {
                  const current = draft.tags ?? [];
                  setDraft({ ...draft, tags: on ? current.filter((item) => item !== tag.slug) : [...current, tag.slug] });
                }}
              >
                {on ? "✓ " : "+ "}
                {tag.name}
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-[10px] tracking-[0.16em] text-muted uppercase">Нет нужного подраздела? Создайте свой</p>
        <div className="mt-2 flex gap-2">
          <input className="flex-1 border border-line px-3 py-2" value={tagCreate} onChange={(event) => setTagCreate(event.target.value)} />
          <button
            type="button"
            className="text-xs uppercase"
            onClick={() => {
              const slug = onCreateTag();
              if (!slug) return;
              setDraft({ ...draft, tags: [...new Set([...(draft.tags ?? []), slug])] });
            }}
          >
            + Создать подраздел
          </button>
        </div>
        <p className="mt-5 text-[10px] tracking-[0.16em] text-muted uppercase">Фотографии</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {images.map((src, index) => (
            <div key={`${src}-${index}`} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mediaUrl(src)} alt="" className="aspect-[3/4] w-full object-cover" />
              {index === 0 ? <span className="absolute top-1 left-1 bg-ink px-1 text-[10px] text-snow">Обложка</span> : null}
              <div className="mt-1 flex justify-between text-xs">
                <button type="button" onClick={() => setDraft({ ...draft, images: move(images, index, -1), src: move(images, index, -1)[0] ?? "" })}>
                  ←
                </button>
                <button type="button" onClick={() => setDraft({ ...draft, images: move(images, index, 1), src: move(images, index, 1)[0] ?? "" })}>
                  →
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = images.filter((_, i) => i !== index);
                    setDraft({ ...draft, images: next, src: next[0] ?? "" });
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
        <input
          className="mt-3 block w-full text-sm"
          type="file"
          accept="image/*"
          multiple
          onChange={async (event) => {
            try {
              const srcs = await onUpload(event.target.files);
              const next = [...images, ...srcs];
              setDraft({ ...draft, images: next, src: next[0] ?? "" });
            } catch (error) {
              window.alert(error instanceof Error ? error.message : "Ошибка загрузки фото");
            }
            event.target.value = "";
          }}
        />
        <label className="mt-5 block text-[10px] tracking-[0.16em] text-muted uppercase">Видео (YouTube id или ссылка)</label>
        <input className="mt-1 w-full border border-line px-3 py-2" value={draft.video ?? ""} onChange={(event) => setDraft({ ...draft, video: event.target.value })} />
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" disabled={busy} className="rounded-full bg-ink px-5 py-2 text-xs text-snow uppercase" onClick={() => onSave({ ...draft, src: images[0] ?? "", images })}>
            Сохранить кадр ✓
          </button>
          <button type="button" className="text-xs uppercase" onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
