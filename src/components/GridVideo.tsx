"use client";

import { useEffect, useRef } from "react";

/**
 * Ролик в сетке альбома. Не грузится целиком заранее: браузер берёт только
 * заголовок файла и первый кадр (preload="metadata").
 *
 * Обложка — картинка рядом с роликом (`back-7.mp4` → `back-7.jpg`, их делает
 * `tools/make-posters.mjs`). Без неё на телефоне, где ролик сам не играет,
 * в сетке стоял чёрный прямоугольник: браузер не рисует кадр, пока ролик не
 * тронули.
 *
 * На широком экране ролик без звука сам играет, пока виден, и
 * останавливается, когда ушёл из окна. На телефоне и при включённой
 * экономии трафика сам не играет: в бэкстейдже почти тридцать роликов,
 * и листать их с автопроигрыванием — это сотни мегабайт по мобильной сети.
 * Там ролик открывается по нажатию, в полноэкранном просмотре.
 */
export function GridVideo({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const wide = window.matchMedia("(min-width: 768px)").matches;
    if (!wide || connection?.saveData) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.play().catch(() => {});
          } else {
            node.pause();
          }
        }
      },
      { rootMargin: "120px 0px", threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={src.replace(/\.(mp4|mov|webm|m4v)$/i, ".jpg")}
      muted
      loop
      playsInline
      preload="metadata"
      className={className}
    />
  );
}
