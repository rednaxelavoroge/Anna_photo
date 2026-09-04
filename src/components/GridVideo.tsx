"use client";

import { useEffect, useRef } from "react";

/**
 * Ролик в сетке альбома. Не грузится целиком заранее: браузер берёт только
 * заголовок файла (preload="metadata"), а воспроизведение без звука
 * начинается, когда ролик попал в окно, и останавливается, когда ушёл из него.
 * Иначе страница с пятью роликами тянула бы десятки мегабайт сразу.
 */
export function GridVideo({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
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

  return <video ref={ref} src={src} muted loop playsInline preload="metadata" className={className} />;
}
