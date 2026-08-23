"use client";

import { CoverArt } from "@/components/CoverArt";
import { Lightbox } from "@/components/Lightbox";
import type { Photo } from "@/lib/content";
import { useMemo, useState } from "react";

type SortKey = "featured" | "newest" | "oldest";

export function AlbumGrid({
  photos,
  slug,
}: {
  photos: Photo[];
  slug: string;
}) {
  const [sort, setSort] = useState<SortKey>("featured");
  const [open, setOpen] = useState<number | null>(null);

  const ordered = useMemo(() => {
    const copy = [...photos];
    if (sort === "newest") return copy.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    if (sort === "oldest") return copy.sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
    return copy.sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [photos, sort]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 px-1">
        <p className="text-xs tracking-[0.18em] text-muted uppercase">
          {photos.every((photo) => !photo.src)
            ? "Образцы ритма · не финальные кадры"
            : `${photos.length} кадров · альбом`}
        </p>
        <div className="flex gap-4 text-xs tracking-[0.16em] uppercase">
          {(
            [
              ["featured", "Избранное"],
              ["newest", "Новые"],
              ["oldest", "Ранние"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSort(key)}
              className={sort === key ? "text-ink" : "text-muted hover:text-ink"}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="frame-columns columns-1 sm:columns-2 lg:columns-3">
        {ordered.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setOpen(index)}
            className="group relative block w-full overflow-hidden bg-void"
          >
            <div className="tile-zoom">
              {photo.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo.src} alt={photo.alt} className="w-full" />
              ) : (
                <CoverArt
                  slug={`${slug}-${photo.id}`}
                  title={photo.alt}
                  className={photo.height > photo.width ? "aspect-[3/4]" : "aspect-[4/3]"}
                />
              )}
            </div>
          </button>
        ))}
      </div>

      {open !== null ? (
        <Lightbox
          photos={ordered}
          index={open}
          slug={slug}
          onClose={() => setOpen(null)}
          onPrev={() => setOpen((current) => (current === null ? 0 : (current + ordered.length - 1) % ordered.length))}
          onNext={() => setOpen((current) => (current === null ? 0 : (current + 1) % ordered.length))}
        />
      ) : null}
    </div>
  );
}
