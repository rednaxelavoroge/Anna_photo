"use client";

import { mediaUrl } from "@/lib/media-url";
import { useVideoUpload, type VideoStage } from "@/lib/use-video-upload";
import { useEffect, useId, useState, type ReactNode } from "react";

export const BTN = "rounded-full bg-ink px-5 py-2 text-xs tracking-[0.08em] text-snow uppercase disabled:opacity-40";
export const BTN_GHOST = "rounded-full border border-line bg-surface px-4 py-2 text-xs tracking-[0.08em] text-ink uppercase disabled:opacity-40";
export const BTN_TEXT = "text-xs tracking-[0.08em] uppercase disabled:opacity-40";
export const INPUT = "mt-1 w-full border border-line bg-surface px-3 py-2 text-sm";

export function isVideoFile(src: string) {
  return /\.(mp4|webm|mov)$/i.test(src);
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-[0.16em] text-muted uppercase">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function Card({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="max-w-3xl space-y-3 border border-line bg-surface p-5">
      <h2 className="font-display text-2xl">{title}</h2>
      {hint ? <p className="text-sm text-muted">{hint}</p> : null}
      {children}
    </div>
  );
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h4.2l1.8 2h9A1.5 1.5 0 0 1 21 9.5v8A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5v-10Z" />
    </svg>
  );
}

/**
 * Кнопка выбора файлов вместо голого браузерного поля: заказчица просила
 * «картинку типа папки». Само поле спрятано, нажимается кнопка-подпись.
 */
export function FilePick({
  label,
  accept,
  multiple,
  disabled,
  onFiles,
  ghost,
}: {
  label: string;
  accept: string;
  multiple?: boolean;
  disabled?: boolean;
  onFiles: (files: FileList) => void | Promise<void>;
  ghost?: boolean;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={`inline-flex cursor-pointer items-center gap-2 ${ghost ? BTN_GHOST : BTN} ${disabled ? "pointer-events-none opacity-40" : ""}`}
    >
      <FolderIcon />
      {label}
      <input
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={async (event) => {
          const files = event.target.files;
          // Поле очищаем сразу: иначе повторный выбор того же файла браузер
          // не считает изменением и ничего не произойдёт.
          const list = files && files.length ? files : null;
          event.target.value = "";
          if (list) await onFiles(list);
        }}
      />
    </label>
  );
}

/** Полоса отправки с процентами. */
export function Progress({ percent }: { percent: number }) {
  return (
    <span className="mt-2 block h-1.5 w-full overflow-hidden bg-line">
      <span className="block h-full bg-ink transition-[width]" style={{ width: `${percent}%` }} />
    </span>
  );
}

/** Полоса «идёт работа» — движется, и рядом бегут секунды: видно, что панель не зависла. */
export function Working({ label }: { label: string }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return (
    <span className="mt-2 block">
      <span className="block h-1.5 w-full overflow-hidden bg-line">
        <span className="admin-indeterminate block h-full w-1/3 bg-ink" />
      </span>
      <span className="mt-1 block text-xs text-muted">
        {label} · {mm}:{ss}
      </span>
    </span>
  );
}

/**
 * Загрузка ролика с телефона: кнопка, проценты отправки, полоса сжатия.
 * Готовый путь отдаётся наружу; о состоянии сообщает, чтобы окно могло
 * погасить «Сохранить», пока ролик не готов.
 */
export function VideoUploader({
  label = "Выбрать ролик",
  onDone,
  onStage,
  disabled,
}: {
  label?: string;
  onDone: (src: string) => void;
  onStage?: (stage: VideoStage) => void;
  disabled?: boolean;
}) {
  const video = useVideoUpload();
  useEffect(() => {
    onStage?.(video.stage);
  }, [video.stage, onStage]);
  const busy = video.stage === "sending" || video.stage === "working";
  return (
    <div>
      <FilePick
        label={label}
        accept="video/*"
        ghost
        disabled={disabled || busy}
        onFiles={async (files) => {
          const src = await video.send(files[0]);
          if (src) onDone(src);
        }}
      />
      {video.note ? (
        <p className={`mt-2 text-xs ${video.stage === "failed" ? "text-ink" : "text-muted"}`}>{video.note}</p>
      ) : null}
      {video.stage === "sending" ? <Progress percent={video.percent} /> : null}
      {video.stage === "working" ? <Working label="Сжимаю ролик, это минута-две" /> : null}
    </div>
  );
}

/** Миниатюра файла: ролик — проигрывателем без звука, иначе он выглядит как битая картинка. */
export function Thumb({ src, className = "" }: { src: string; className?: string }) {
  if (!src) return <div className={`flex items-center justify-center bg-void text-xs text-snow/50 ${className}`}>Нет файла</div>;
  if (isVideoFile(src)) {
    return <video src={mediaUrl(src)} className={`bg-void object-cover ${className}`} muted playsInline preload="metadata" />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={mediaUrl(src)} alt="" loading="lazy" decoding="async" className={`bg-void object-cover ${className}`} />;
}

export function Arrows({ onUp, onDown, disabled, horizontal }: { onUp: () => void; onDown: () => void; disabled?: boolean; horizontal?: boolean }) {
  return (
    <>
      <button type="button" className={BTN_TEXT} disabled={disabled} onClick={onUp} aria-label="Выше">
        {horizontal ? "←" : "↑"}
      </button>
      <button type="button" className={BTN_TEXT} disabled={disabled} onClick={onDown} aria-label="Ниже">
        {horizontal ? "→" : "↓"}
      </button>
    </>
  );
}

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/40 p-4">
      <div className="mx-auto max-w-2xl bg-paper p-5">
        <p className="eyebrow">{title}</p>
        {children}
      </div>
    </div>
  );
}

export function move<T>(list: T[], index: number, dir: -1 | 1) {
  const next = index + dir;
  if (next < 0 || next >= list.length) return list;
  const copy = [...list];
  const [item] = copy.splice(index, 1);
  copy.splice(next, 0, item);
  return copy;
}

export const DRAG_HINT = "Порядок меняется перетаскиванием: мышью, а на телефоне — нажать, подержать и вести пальцем. Стрелки тоже работают.";
