"use client";

import { CoverArt } from "@/components/CoverArt";
import { GridVideo } from "@/components/GridVideo";
import { Lightbox } from "@/components/Lightbox";
import type { Photo } from "@/lib/content";
import { useState } from "react";

/**
 * Сетка альбома: отзывы, бэкстейдж, воркшопы, фотоархив прессы.
 *
 * Счётчика «N кадров · альбом» и кнопок сортировки больше нет — заказчица
 * попросила убрать их везде (05.09.2026). Годы у кадров были условными,
 * сортировать было нечего. Порядок кадров — как в папке.
 *
 * `layout="square"` — жёсткая сетка одинаковых квадратов для коллажей
 * воркшопов: колонки-«кирпичи» давали разную высоту, и ряд «плыл». Коллажи
 * не квадратные (5:4), поэтому вписываются целиком на белом, без обрезки —
 * иначе срезалось бы название в кружке.
 */
export function AlbumGrid({
  photos,
  slug,
  layout = "columns",
}: {
  photos: Photo[];
  slug: string;
  layout?: "columns" | "square";
}) {
  const [open, setOpen] = useState<number | null>(null);
  const square = layout === "square";

  return (
    <div>
      <div
        className={
          square
            ? "grid grid-cols-2 gap-[var(--frame-gap)] bg-paper p-[var(--frame-gap)] sm:grid-cols-3 lg:grid-cols-4"
            : "frame-columns columns-1 sm:columns-2 lg:columns-3"
        }
      >
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setOpen(index)}
            className={
              square
                ? "group relative block w-full overflow-hidden bg-white shadow-xs transition-shadow duration-300 hover:shadow-md"
                : "gallery-print group"
            }
            aria-label={photo.alt}
          >
            <div className={`overflow-hidden ${square ? "aspect-square bg-white" : "bg-paper"}`}>
              <div className={`tile-zoom ${square ? "h-full w-full" : ""}`}>
                {photo.src ? (
                  photo.kind === "video" || /\.(mp4|webm|mov)$/i.test(photo.src) ? (
                    <GridVideo src={photo.src} className="block h-auto w-full" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      loading={index < 6 ? "eager" : "lazy"}
                      decoding="async"
                      className={square ? "block h-full w-full object-contain" : "block h-auto w-full"}
                    />
                  )
                ) : (
                  <CoverArt
                    slug={`${slug}-${photo.id}`}
                    title={photo.alt}
                    className={square ? "h-full w-full" : photo.height > photo.width ? "aspect-[2/3]" : "aspect-[3/2]"}
                    contain
                  />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {open !== null ? (
        <Lightbox
          photos={photos}
          index={open}
          slug={slug}
          onClose={() => setOpen(null)}
          onPrev={() => setOpen((current) => (current === null ? 0 : (current + photos.length - 1) % photos.length))}
          onNext={() => setOpen((current) => (current === null ? 0 : (current + 1) % photos.length))}
        />
      ) : null}
    </div>
  );
}
