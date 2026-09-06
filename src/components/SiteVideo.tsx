"use client";

import { useEffect, useRef } from "react";

/**
 * Ролик на странице сайта.
 *
 * Превью: браузер не рисует кадр, пока ролик не запустят (Safari показывает
 * серый прямоугольник). Рядом с роликом лежит обложка — картинка с тем же
 * именем (`tools/make-posters.mjs`), она рисуется сразу и ничего не качает.
 * Метка `#t=0.5` в адресе оставлена запасным путём: если обложки почему-то
 * нет, браузер подгрузит и покажет кадр на половине секунды.
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
      poster={src.replace(/\.(mp4|mov|webm|m4v)$/i, ".jpg")}
      controls
      playsInline
      preload="metadata"
      className={className}
    />
  );
}
