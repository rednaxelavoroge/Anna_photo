"use client";

import type { AboutVideo } from "@/lib/content";
import { useState } from "react";

/**
 * Эфиры на YouTube плитками с превью.
 *
 * История. Сначала здесь стоял 21 встроенный плеер — страница у заказчицы
 * не грузилась, и 05.09.2026 их заменили простым текстовым списком. Список
 * ей не понравился: «пусть будут квадратики с превьюшками, как на старом
 * сайте».
 *
 * Поэтому здесь ни одного плеера, пока по плитке не нажали: тайл — это
 * картинка превью с i.ytimg.com (один запрос на ролик вместо целого плеера),
 * а iframe появляется только у того ролика, который открыли. Двадцать
 * одна картинка грузится в разы легче двадцати одного плеера, и подгружаются
 * они лениво.
 *
 * Если картинка не пришла (YouTube недоступен, реклама вырезана
 * расширением) — на её месте остаётся тёмная плитка с названием эфира,
 * и ссылка на YouTube под ней работает по-прежнему.
 */
export function YoutubeGrid({ videos }: { videos: AboutVideo[] }) {
  const [playing, setPlaying] = useState<string | null>(null);
  const [broken, setBroken] = useState<Record<string, true>>({});

  if (videos.length === 0) return null;

  return (
    <ul className="mt-[var(--frame-gap)] grid gap-[var(--frame-gap)] sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        // Рамка и подпись — те же, что у двух роликов выше: заказчица
        // просила «такие же квадратики», а не другую сетку.
        <li key={video.id} className="bg-snow p-[var(--print-mat)]">
          <div className="relative aspect-video w-full overflow-hidden bg-void">
            {playing === video.id ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(video.id)}
                className="group absolute inset-0 h-full w-full"
                aria-label={`Смотреть: ${video.title}`}
              >
                {broken[video.id] ? (
                  <span className="flex h-full w-full items-center justify-center px-4 text-center text-xs leading-snug text-snow/70">
                    {video.title}
                  </span>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                    alt={video.title}
                    loading="lazy"
                    decoding="async"
                    onError={() => setBroken((current) => ({ ...current, [video.id]: true }))}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                )}
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink/70 backdrop-blur-xs transition-colors group-hover:bg-ink/85">
                    <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-snow" aria-hidden>
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </span>
              </button>
            )}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">{video.title}</p>
          <a
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="link-line mt-1.5 inline-block text-[10px] tracking-[0.16em] text-muted uppercase"
          >
            Открыть на YouTube ↗
          </a>
        </li>
      ))}
    </ul>
  );
}
