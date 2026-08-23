"use client";

import { CoverArt } from "@/components/CoverArt";
import type { Photo } from "@/lib/content";
import { useEffect } from "react";

export function Lightbox({
  photos,
  index,
  slug,
  onClose,
  onPrev,
  onNext,
}: {
  photos: Photo[];
  index: number;
  slug: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const photo = photos[index];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrev();
      if (event.key === "ArrowRight") onNext();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onNext, onPrev]);

  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-void/96 text-bg"
      role="dialog"
      aria-modal="true"
      aria-label="Просмотр кадра"
    >
      <div className="flex items-center justify-between px-5 py-4 text-xs tracking-[0.2em] uppercase">
        <span>
          {String(index + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
        </span>
        <button type="button" onClick={onClose} className="link-line">
          Закрыть
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center px-4 pb-8">
        <button type="button" onClick={onPrev} className="hidden px-4 text-2xl md:block" aria-label="Предыдущий">
          ‹
        </button>
        <button type="button" onClick={onNext} className="max-h-[80svh] w-full max-w-5xl" aria-label="Следующий кадр">
          {photo.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo.src} alt={photo.alt} className="mx-auto max-h-[80svh] w-auto object-contain" />
          ) : (
            <CoverArt slug={`${slug}-${photo.id}`} title={photo.alt} className="mx-auto max-h-[80svh]" />
          )}
        </button>
        <button type="button" onClick={onNext} className="hidden px-4 text-2xl md:block" aria-label="Следующий">
          ›
        </button>
      </div>
    </div>
  );
}
