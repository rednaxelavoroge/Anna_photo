"use client";

import type { Category } from "@/lib/content";
import type { Featured, PhotoItem, StudioState, Tag } from "@/lib/admin-store";
import { slugifyRu } from "@/lib/slugify";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Tab = "photos" | "categories" | "tags" | "texts" | "backstage" | "contacts";

const TABS: { id: Tab; label: string }[] = [
  { id: "photos", label: "Кадры" },
  { id: "categories", label: "Разделы портфолио" },
  { id: "tags", label: "Подразделы" },
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

export function AdminPanel() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("photos");
  const [state, setState] = useState<StudioState | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("all");
  const [editing, setEditing] = useState<PhotoItem | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tagDraft, setTagDraft] = useState("");
  const [tagCreate, setTagCreate] = useState("");

  useEffect(() => {
    void (async () => {
      const auth = await fetch("/api/admin/login");
      const json = (await auth.json()) as { authenticated?: boolean };
      if (!json.authenticated) {
        router.push("/admin/login");
        return;
      }
      const res = await fetch("/api/admin/state");
      if (!res.ok) {
        setNote("Не удалось загрузить данные");
        return;
      }
      setState((await res.json()) as StudioState);
    })();
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
    return <p className="px-5 py-24 text-sm text-muted">Загрузка панели управления…</p>;
  }

  const site = state.site as {
    owner: string;
    brand: string;
    tagline: string;
    intro: string;
    about: { eyebrow: string; title: string; lead: string; body: string[]; note: string };
    contacts: {
      whatsapp: string;
      whatsappDigits: string;
      phone: string;
      phoneRussia: string;
      instagram: string;
      email: string;
      city: string;
    };
  };

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
                    <img src={photo.src} alt="" className="h-full w-full object-cover" />
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
        <section className="mt-8 space-y-4">
          {state.categories.map((category, index) => (
            <div key={category.slug} className="border border-line bg-surface p-4">
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={busy} onClick={() => persist({ ...state, categories: move(state.categories, index, -1) })}>
                  ↑
                </button>
                <button type="button" disabled={busy} onClick={() => persist({ ...state, categories: move(state.categories, index, 1) })}>
                  ↓
                </button>
              </div>
              <label className="mt-3 block text-[10px] tracking-[0.16em] text-muted uppercase">Название в меню</label>
              <input
                className="mt-1 w-full border border-line px-3 py-2"
                value={category.menu}
                onChange={(event) => {
                  const categories = state.categories.map((item, i) => (i === index ? { ...item, menu: event.target.value } : item));
                  setState({ ...state, categories });
                }}
              />
              <label className="mt-3 block text-[10px] tracking-[0.16em] text-muted uppercase">Заголовок страницы</label>
              <input
                className="mt-1 w-full border border-line px-3 py-2"
                value={category.title}
                onChange={(event) => {
                  const categories = state.categories.map((item, i) => (i === index ? { ...item, title: event.target.value } : item));
                  setState({ ...state, categories });
                }}
              />
              <label className="mt-3 block text-[10px] tracking-[0.16em] text-muted uppercase">Описание</label>
              <textarea
                className="mt-1 w-full border border-line px-3 py-2"
                rows={3}
                value={category.description}
                onChange={(event) => {
                  const categories = state.categories.map((item, i) => (i === index ? { ...item, description: event.target.value } : item));
                  setState({ ...state, categories });
                }}
              />
              <p className="mt-2 text-xs text-muted">Адрес страницы: /portfolio/{category.slug} — не меняется при переименовании</p>
            </div>
          ))}
          <button type="button" disabled={busy} className="rounded-full bg-ink px-5 py-2 text-xs text-snow uppercase" onClick={() => persist(state)}>
            Сохранить разделы →
          </button>
        </section>
      ) : null}

      {tab === "tags" ? (
        <section className="mt-8">
          <p className="max-w-xl text-sm text-muted">
            Подраздел появляется в каталоге, когда метку получает хотя бы один кадр. Стрелки сразу сохраняют порядок.
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

      {tab === "texts" ? (
        <TextsTab
          state={state}
          site={site}
          busy={busy}
          setState={setState}
          persist={persist}
        />
      ) : null}

      {tab === "backstage" ? (
        <section className="mt-8">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={async (event) => {
              try {
                const srcs = await uploadFiles(event.target.files);
                persist({
                  ...state,
                  backstage: [...state.backstage, ...srcs.map((src) => ({ src, alt: "Бэкстейдж" }))],
                });
              } catch (error) {
                setNote(error instanceof Error ? error.message : "Ошибка загрузки");
              }
              event.target.value = "";
            }}
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {state.backstage.map((item, index) => (
              <figure key={`${item.src}-${index}`} className="border border-line bg-surface p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.src} alt="" className="aspect-[3/4] w-full object-cover" />
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
                    ✕
                  </button>
                </div>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {tab === "contacts" ? (
        <section className="mt-8 max-w-xl space-y-3">
          {(
            [
              ["whatsapp", "WhatsApp / Армения"],
              ["phoneRussia", "Россия"],
              ["email", "Почта"],
              ["instagram", "Instagram"],
              ["city", "Город"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block">
              <span className="text-[10px] tracking-[0.16em] text-muted uppercase">{label}</span>
              <input
                className="mt-1 w-full border border-line px-3 py-2"
                value={site.contacts[key]}
                onChange={(event) => {
                  const nextSite = { ...site, contacts: { ...site.contacts, [key]: event.target.value } };
                  if (key === "whatsapp") nextSite.contacts.whatsappDigits = event.target.value.replace(/\D/g, "");
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

function TextsTab({
  state,
  site,
  busy,
  setState,
  persist,
}: {
  state: StudioState;
  site: {
    owner: string;
    tagline: string;
    intro: string;
    about: { eyebrow: string; title: string; lead: string; body: string[]; note: string };
  };
  busy: boolean;
  setState: (state: StudioState) => void;
  persist: (state: StudioState) => void;
}) {
  const featured = state.featured;
  const [search, setSearch] = useState("");
  const found = state.photos.filter((photo) => {
    const q = search.trim().toLowerCase();
    return q && (photo.alt.toLowerCase().includes(q) || photo.src.toLowerCase().includes(q));
  });

  function patchFeatured(patch: Partial<Featured>) {
    setState({ ...state, featured: { ...featured, ...patch } });
  }

  return (
    <section className="mt-8 space-y-8">
      <div className="max-w-2xl space-y-3">
        <label className="block">
          <span className="text-[10px] tracking-[0.16em] text-muted uppercase">Слоган</span>
          <input className="mt-1 w-full border border-line px-3 py-2" value={site.tagline} onChange={(event) => setState({ ...state, site: { ...site, tagline: event.target.value } })} />
        </label>
        <label className="block">
          <span className="text-[10px] tracking-[0.16em] text-muted uppercase">Вступление</span>
          <textarea className="mt-1 w-full border border-line px-3 py-2" rows={4} value={site.intro} onChange={(event) => setState({ ...state, site: { ...site, intro: event.target.value } })} />
        </label>
        <label className="block">
          <span className="text-[10px] tracking-[0.16em] text-muted uppercase">Обо мне — заголовок</span>
          <input className="mt-1 w-full border border-line px-3 py-2" value={site.about.title} onChange={(event) => setState({ ...state, site: { ...site, about: { ...site.about, title: event.target.value } } })} />
        </label>
        <label className="block">
          <span className="text-[10px] tracking-[0.16em] text-muted uppercase">Лид</span>
          <textarea className="mt-1 w-full border border-line px-3 py-2" rows={3} value={site.about.lead} onChange={(event) => setState({ ...state, site: { ...site, about: { ...site.about, lead: event.target.value } } })} />
        </label>
        <label className="block">
          <span className="text-[10px] tracking-[0.16em] text-muted uppercase">Рассказ (абзац с новой строки)</span>
          <textarea
            className="mt-1 w-full border border-line px-3 py-2"
            rows={6}
            value={site.about.body.join("\n\n")}
            onChange={(event) => setState({ ...state, site: { ...site, about: { ...site.about, body: event.target.value.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean) } } })}
          />
        </label>
      </div>

      <div className="border border-line bg-surface p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl">Лента избранного на главной</h2>
          <label className="flex items-center gap-2 text-sm">
            Показывать на сайте
            <input type="checkbox" checked={featured.visible} onChange={(event) => patchFeatured({ visible: event.target.checked })} />
          </label>
        </div>
        <label className="mt-4 block text-[10px] tracking-[0.16em] text-muted uppercase">Надпись сверху</label>
        <input className="mt-1 w-full border border-line px-3 py-2" value={featured.eyebrow} onChange={(event) => patchFeatured({ eyebrow: event.target.value })} />
        <label className="mt-3 block text-[10px] tracking-[0.16em] text-muted uppercase">Заголовок</label>
        <input className="mt-1 w-full border border-line px-3 py-2" value={featured.title} onChange={(event) => patchFeatured({ title: event.target.value })} />
        <label className="mt-3 block text-[10px] tracking-[0.16em] text-muted uppercase">Подпись под заголовком</label>
        <input className="mt-1 w-full border border-line px-3 py-2" value={featured.subtitle} onChange={(event) => patchFeatured({ subtitle: event.target.value })} />
        <p className="mt-5 text-[10px] tracking-[0.16em] text-muted uppercase">Выбранные кадры ({featured.photoSrcs.length})</p>
        <ul className="mt-2 space-y-2">
          {featured.photoSrcs.map((src, index) => {
            const photo = state.photos.find((item) => item.src === src);
            return (
              <li key={src} className="flex items-center gap-2 border border-line px-3 py-2">
                <span className="flex-1 text-sm">{index + 1}. {photo?.alt ?? src}</span>
                <button type="button" onClick={() => patchFeatured({ photoSrcs: move(featured.photoSrcs, index, -1) })}>↑</button>
                <button type="button" onClick={() => patchFeatured({ photoSrcs: move(featured.photoSrcs, index, 1) })}>↓</button>
                <button type="button" onClick={() => patchFeatured({ photoSrcs: featured.photoSrcs.filter((item) => item !== src) })}>✕</button>
              </li>
            );
          })}
        </ul>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Найти кадр по названию…" className="mt-4 w-full border border-line px-3 py-2" />
        <ul className="mt-2 space-y-1">
          {found.map((photo) => (
            <li key={photo.src}>
              <button
                type="button"
                className="text-left text-sm"
                onClick={() => {
                  if (featured.photoSrcs.includes(photo.src)) return;
                  patchFeatured({ photoSrcs: [...featured.photoSrcs, photo.src] });
                  setSearch("");
                }}
              >
                {photo.alt}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button type="button" disabled={busy} className="rounded-full bg-ink px-5 py-2 text-xs text-snow uppercase" onClick={() => persist(state)}>
        Сохранить все тексты →
      </button>
    </section>
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
              <img src={src} alt="" className="aspect-[3/4] w-full object-cover" />
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
            const srcs = await onUpload(event.target.files);
            const next = [...images, ...srcs];
            setDraft({ ...draft, images: next, src: next[0] ?? "" });
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
