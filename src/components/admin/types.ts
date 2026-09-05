import type { StudioState } from "@/lib/admin-store";

/** Что получает каждая вкладка панели. */
export type TabProps = {
  state: StudioState;
  /** Поменять данные на экране, не записывая. */
  setState: (state: StudioState) => void;
  /** Записать: один запрос, один коммит. deleteFiles — какие файлы убрать из репозитория. */
  persist: (state: StudioState, message?: string, deleteFiles?: string[]) => Promise<void>;
  busy: boolean;
  /** Сжать и загрузить фотографии, вернуть их пути. */
  upload: (files: FileList | null) => Promise<string[]>;
  notify: (message: string) => void;
};

/** Файлы, которые больше ни один кадр не использует, — можно удалять из репозитория. */
export function unusedFiles(candidates: string[], state: StudioState, except?: { photoIndex?: number }): string[] {
  const used = new Set<string>();
  state.photos.forEach((item, index) => {
    if (except?.photoIndex === index) return;
    (item.images?.length ? item.images : [item.src]).forEach((src) => used.add(src));
  });
  state.backstage.forEach((item) => used.add(item.src));
  Object.values(state.galleries).forEach((list) => list.forEach((item) => used.add(item.src)));
  state.publications.forEach((pub) => (pub.images ?? []).forEach((src) => used.add(src)));
  state.categories.forEach((category) => category.cover && used.add(category.cover));
  if (state.site.portrait) used.add(state.site.portrait);
  if (state.site.phototour.cover) used.add(state.site.phototour.cover);
  return candidates.filter((src) => src && !used.has(src));
}

/** Спросить у сервера, какие файлы в папках панель ещё не знает. */
export async function fetchUnlisted(): Promise<import("@/lib/admin-store").Unlisted> {
  const res = await fetch("/api/admin/state?scan=1", { cache: "no-store" });
  const json = (await res.json().catch(() => null)) as { unlisted?: import("@/lib/admin-store").Unlisted; error?: string } | null;
  if (!res.ok || !json?.unlisted) throw new Error(json?.error || "Не удалось просмотреть папки");
  return json.unlisted;
}
