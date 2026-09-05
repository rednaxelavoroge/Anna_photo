"use client";

import { AboutTab } from "@/components/admin/AboutTab";
import { CategoriesTab } from "@/components/admin/CategoriesTab";
import { ContactsTab } from "@/components/admin/ContactsTab";
import { GalleryTab } from "@/components/admin/GalleryTab";
import { PhotosTab } from "@/components/admin/PhotosTab";
import { PhototourTab } from "@/components/admin/PhototourTab";
import { TagsTab } from "@/components/admin/TagsTab";
import { TrainingTab } from "@/components/admin/TrainingTab";
import type { TabProps } from "@/components/admin/types";
import { BTN_GHOST } from "@/components/admin/ui";
import type { StudioState } from "@/lib/admin-store";
import { rememberUpload } from "@/lib/media-url";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Tab = "photos" | "categories" | "tags" | "backstage" | "reviews" | "training" | "about" | "phototour" | "contacts";

const TABS: { id: Tab; label: string }[] = [
  { id: "photos", label: "Кадры" },
  { id: "categories", label: "Разделы" },
  { id: "tags", label: "Подразделы" },
  { id: "backstage", label: "Бэкстейдж" },
  { id: "reviews", label: "Отзывы" },
  { id: "training", label: "Обучение" },
  { id: "about", label: "Обо мне и СМИ" },
  { id: "phototour", label: "Фототуры" },
  { id: "contacts", label: "Контакты" },
];

/** Фото ужимается в браузере до отправки: на хостинг уезжает уже лёгкий файл. */
async function compress(file: File, max = 2000, quality = 0.85): Promise<Blob> {
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
  // Blob, а не строка base64: файл уезжает телом запроса как есть — на треть
  // меньше байт и без мегабайтной строки в JSON. toBlob есть везде, кроме
  // совсем старых браузеров, поэтому запасной путь через toDataURL оставлен.
  const blob = await new Promise<Blob | null>((resolve) => {
    if (typeof canvas.toBlob !== "function") return resolve(null);
    canvas.toBlob(resolve, "image/jpeg", quality);
  });
  if (blob) return blob;
  const encoded = canvas.toDataURL("image/jpeg", quality).split(",")[1] ?? "";
  const bytes = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
  return new Blob([bytes], { type: "image/jpeg" });
}

/** Что ответил сервер: разбираем JSON, а если пришло не оно — говорим прямо. */
async function readAnswer(res: Response) {
  const text = await res.text();
  try {
    return { ok: res.ok, ...(JSON.parse(text) as { src?: string; error?: string }) };
  } catch {
    // Хостинг умеет отвечать своей страницей ошибки вместо нашего JSON —
    // раньше на этом месте панель молча падала и человек видел только,
    // что «фотография не добавилась».
    const snippet = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 140);
    return { ok: false, error: `Хостинг ответил ${res.status}${snippet ? `: ${snippet}` : ""}` };
  }
}

export function AdminPanel() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("photos");
  const [state, setState] = useState<StudioState | null>(null);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

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
          const message = payload && "error" in payload && payload.error ? payload.error : `Не удалось загрузить данные (${res.status})`;
          if (!cancelled) setLoadError(message);
          return;
        }
        if (!cancelled) setState(payload as StudioState);
      } catch (error) {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : "Ошибка сети при загрузке панели");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function persist(next: StudioState, message?: string, deleteFiles: string[] = []) {
    setBusy(true);
    setNote(message ?? "Сохранение…");
    try {
      const res = await fetch("/api/admin/state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...next, deleteFiles }),
      });
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

  async function upload(files: FileList | null) {
    if (!files?.length) return [] as string[];
    const srcs: string[] = [];
    let n = 0;
    for (const file of [...files]) {
      n += 1;
      setNote(`Сжимаю и отправляю фото ${n} из ${files.length}…`);
      const blob = await compress(file);

      // Основной способ — файл телом запроса, как у роликов.
      let answer = await readAnswer(
        await fetch("/api/admin/upload", {
          method: "POST",
          headers: { "Content-Type": blob.type || "image/jpeg", "X-Filename": encodeURIComponent(file.name) },
          body: blob,
        }),
      );

      // Не прошло — пробуем по-старому, строкой в JSON. Способы ломаются на
      // хостинге по разным причинам, и терять фотографию из-за одного из них
      // незачем.
      if (!answer.ok || !answer.src) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error("Ошибка чтения файла"));
          reader.readAsDataURL(blob);
        });
        answer = await readAnswer(
          await fetch("/api/admin/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dataUrl, filename: file.name }),
          }),
        );
      }

      if (!answer.ok || !answer.src) throw new Error(answer.error || "Ошибка загрузки фото");
      // На сайт файл попадёт выкладкой, минуты через две-три. Чтобы всё это
      // время панель не показывала на его месте пустоту, превью берётся из
      // выбранного файла.
      rememberUpload(answer.src, blob);
      srcs.push(answer.src);
    }
    setNote(`Фото загружены: ${srcs.length}. Не забудьте нажать «Сохранить».`);
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
            <button type="button" className="rounded-full bg-ink px-4 py-2 text-xs text-snow uppercase" onClick={() => window.location.reload()}>
              Повторить
            </button>
            <Link href="/admin/login" className={BTN_GHOST}>
              Перейти ко входу
            </Link>
          </div>
        </div>
      );
    }
    return <p className="px-5 py-24 text-sm text-muted">Загрузка панели управления…</p>;
  }

  const props: TabProps = { state, setState, persist, busy, upload, notify: setNote };
  const counts: Partial<Record<Tab, number>> = {
    photos: state.photos.length,
    categories: state.categories.length,
    tags: state.tags.length,
    backstage: state.backstage.length,
    reviews: state.galleries.reviews.length,
  };

  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-24 pt-8 md:px-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Панель управления</p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">Anna Manasaryan</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/instrukciya" className={BTN_GHOST}>
            Инструкция
          </Link>
          <a href="https://annamanasaryan.com" target="_blank" rel="noreferrer" className={BTN_GHOST}>
            Открыть сайт ↗
          </a>
          <button
            type="button"
            className={BTN_GHOST}
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
            className={`rounded-full px-4 py-2 text-xs tracking-[0.12em] uppercase ${tab === item.id ? "bg-ink text-snow" : "border border-line text-ink"}`}
          >
            {item.label}
            {counts[item.id] !== undefined ? ` (${counts[item.id]})` : ""}
          </button>
        ))}
      </nav>

      {note ? (
        <p className="sticky top-2 z-30 mt-6 inline-block border border-line bg-paper px-3 py-2 text-sm text-muted shadow-xs" aria-live="polite">
          {note}
        </p>
      ) : null}

      {tab === "photos" ? <PhotosTab {...props} /> : null}
      {tab === "categories" ? <CategoriesTab {...props} /> : null}
      {tab === "tags" ? <TagsTab {...props} /> : null}
      {tab === "backstage" ? (
        <GalleryTab
          {...props}
          title="Бэкстейдж"
          hint="Кадры и ролики со съёмок — страница «Бэкстейдж»."
          items={state.backstage}
          apply={(current, items) => ({ ...current, backstage: items })}
          scanKey={(unlisted) => unlisted.backstage}
        />
      ) : null}
      {tab === "reviews" ? (
        <GalleryTab
          {...props}
          title="Отзывы"
          hint="Скриншоты отзывов из WhatsApp, Instagram и VK — страница «Отзывы»."
          items={state.galleries.reviews}
          apply={(current, items) => ({ ...current, galleries: { ...current.galleries, reviews: items } })}
          scanKey={(unlisted) => unlisted.galleries.reviews}
          allowVideo={false}
        />
      ) : null}
      {tab === "training" ? <TrainingTab {...props} /> : null}
      {tab === "about" ? <AboutTab {...props} /> : null}
      {tab === "phototour" ? <PhototourTab {...props} /> : null}
      {tab === "contacts" ? <ContactsTab {...props} /> : null}
    </div>
  );
}
