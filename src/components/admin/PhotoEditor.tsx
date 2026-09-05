"use client";

import { Arrows, BTN, BTN_TEXT, FilePick, INPUT, Modal, Thumb, VideoUploader, isVideoFile, move } from "@/components/admin/ui";
import type { PhotoItem, Tag } from "@/lib/admin-store";
import type { Category } from "@/lib/content";
import { useDragOrder, withMoved } from "@/lib/use-drag-order";
import type { VideoStage } from "@/lib/use-video-upload";
import { useState } from "react";

/**
 * Окно кадра: название, разделы, подразделы, файлы кадра (фото и ролики),
 * ролик с телефона, ссылка на YouTube.
 *
 * Первый файл — обложка. На сайте показываются все файлы кадра, по порядку.
 */
export function PhotoEditor({
  photo,
  categories,
  tags,
  busy,
  onClose,
  onSave,
  onUpload,
  onCreateTag,
}: {
  photo: PhotoItem;
  categories: Category[];
  tags: Tag[];
  busy: boolean;
  onClose: () => void;
  onSave: (photo: PhotoItem, removedFiles: string[]) => void;
  onUpload: (files: FileList | null) => Promise<string[]>;
  onCreateTag: (name: string) => string;
}) {
  const [draft, setDraft] = useState(photo);
  const [tagCreate, setTagCreate] = useState("");
  const [videoStage, setVideoStage] = useState<VideoStage>("idle");
  const [error, setError] = useState("");
  const original = photo.images?.length ? photo.images : photo.src ? [photo.src] : [];
  const images = draft.images?.length ? draft.images : draft.src ? [draft.src] : [];
  const videoBusy = videoStage === "sending" || videoStage === "working";

  const setImages = (next: string[]) => setDraft({ ...draft, images: next, src: next[0] ?? "" });
  const imageDrag = useDragOrder((from, to) => setImages(withMoved(images, from, to)));

  return (
    <Modal title={photo.src ? "Редактирование кадра" : "Новый кадр"} onClose={onClose}>
      <label className="mt-4 block text-[10px] tracking-[0.16em] text-muted uppercase">Название</label>
      <input className={INPUT} value={draft.alt} onChange={(event) => setDraft({ ...draft, alt: event.target.value })} />

      <p className="mt-5 text-[10px] tracking-[0.16em] text-muted uppercase">Разделы — кадр может стоять в нескольких</p>
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

      <p className="mt-5 text-[10px] tracking-[0.16em] text-muted uppercase">Подразделы</p>
      <p className="mt-1 text-xs text-muted">Подраздел показывается полоской внутри раздела: например, «Путешествия → Армения».</p>
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
      <div className="mt-2 flex gap-2">
        <input className="flex-1 border border-line bg-surface px-3 py-2 text-sm" placeholder="Новый подраздел" value={tagCreate} onChange={(event) => setTagCreate(event.target.value)} />
        <button
          type="button"
          className={BTN_TEXT}
          onClick={() => {
            const slug = onCreateTag(tagCreate.trim());
            if (!slug) return;
            setTagCreate("");
            setDraft({ ...draft, tags: [...new Set([...(draft.tags ?? []), slug])] });
          }}
        >
          + Создать
        </button>
      </div>

      <p className="mt-5 text-[10px] tracking-[0.16em] text-muted uppercase">Файлы кадра</p>
      <p className="mt-1 text-xs text-muted">
        Первый — обложка; на сайте видны все файлы по порядку. Перетащите мышью или пальцем (нажать и подержать), стрелки ← → тоже работают.
      </p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {images.map((src, index) => (
          <div key={`${src}-${index}`} {...imageDrag.itemProps(index)} className={`relative transition ${imageDrag.itemClass(index)}`}>
            <Thumb src={src} className="aspect-[3/4] w-full" />
            {index === 0 ? <span className="absolute top-1 left-1 bg-ink px-1 text-[10px] text-snow">Обложка</span> : null}
            {isVideoFile(src) ? <span className="absolute top-1 right-1 bg-ink px-1 text-[10px] text-snow">Ролик</span> : null}
            <div className="mt-1 flex justify-between text-xs">
              <Arrows horizontal onUp={() => setImages(move(images, index, -1))} onDown={() => setImages(move(images, index, 1))} />
              <button type="button" className={BTN_TEXT} onClick={() => setImages(images.filter((_, i) => i !== index))} aria-label="Убрать файл">
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-start gap-3">
        <FilePick
          label="Добавить фотографии"
          accept="image/*"
          multiple
          disabled={busy}
          onFiles={async (files) => {
            try {
              setError("");
              const srcs = await onUpload(files);
              setImages([...images, ...srcs]);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Ошибка загрузки фото");
            }
          }}
        />
        <VideoUploader label="Ролик с телефона" onDone={(src) => setImages([...images, src])} onStage={setVideoStage} disabled={busy} />
      </div>
      <p className="mt-2 text-xs text-muted">Ролик до 200 МБ — панель сама его уменьшит. Готовый встанет в список выше и покажется на сайте проигрывателем.</p>

      <label className="mt-5 block text-[10px] tracking-[0.16em] text-muted uppercase">Видео на YouTube (ссылка), если есть</label>
      <input className={INPUT} value={draft.video ?? ""} onChange={(event) => setDraft({ ...draft, video: event.target.value })} />

      {error ? <p className="mt-3 text-sm text-ink">{error}</p> : null}
      {videoBusy ? <p className="mt-3 text-sm text-muted">Сохранить можно будет, когда ролик будет готов.</p> : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy || videoBusy}
          className={BTN}
          onClick={() => {
            if (images.length === 0) return setError("Добавьте хотя бы одну фотографию или ролик");
            if (!draft.alt.trim()) return setError("Укажите название");
            if (draft.categories.length === 0) return setError("Выберите хотя бы один раздел");
            const removed = original.filter((src) => !images.includes(src));
            onSave({ ...draft, alt: draft.alt.trim(), src: images[0], images, tags: draft.tags ?? [] }, removed);
          }}
        >
          Сохранить кадр ✓
        </button>
        <button type="button" className={BTN_TEXT} onClick={onClose}>
          Отмена
        </button>
      </div>
    </Modal>
  );
}
