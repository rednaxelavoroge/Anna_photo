"use client";

import { useEffect, useRef } from "react";

/**
 * Ролик на странице сайта.
 *
 * Превью: браузер не рисует кадр, пока ролик не запустят (Safari показывает
 * серый прямоугольник). Метка `#t=0.5` в адресе заставляет его подгрузить и
 * показать кадр на половине секунды — этого хватает вместо отдельной картинки.
 *
 * Звук: когда запускают один ролик, остальные на странице ставятся на паузу —
 * иначе два мастер-класса говорят одновременно.
 */
export function SiteVideo({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const onPlay = () => {
      document.querySelectorAll<HTMLVideoElement>("video[data-site-video]").forEach((other) => {
        if (other !== node && !other.paused) other.pause();
      });
    };
    node.addEventListener("play", onPlay);
    return () => node.removeEventListener("play", onPlay);
  }, []);

  return (
    <video
      ref={ref}
      data-site-video=""
      src={`${src}#t=0.5`}
      controls
      playsInline
      preload="metadata"
      className={className}
    />
  );
}
