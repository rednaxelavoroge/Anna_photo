"use client";

import type { Publication } from "@/lib/content";
import { useState } from "react";

export function PublicationsSection({ publications }: { publications: Publication[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <section className="mt-24 border-t border-line pt-16">
      <p className="eyebrow">Публикации и СМИ</p>
      <h2 className="mt-4 max-w-2xl font-display text-3xl md:text-5xl">
        Пресса и выставки
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
        Статьи, интервью и обзоры в профильных изданиях и на телевидении. Все тексты сохранены на сайте, а ссылки ведут на оригинальные источники.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {publications.map((pub) => {
          const isOpen = activeId === pub.id;
          return (
            <div
              key={pub.id}
              className="flex flex-col justify-between border border-line bg-snow p-6 md:p-8 transition-shadow duration-300 hover:shadow-xs"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] tracking-[0.2em] text-muted uppercase">
                    {pub.media} · {pub.date}
                  </span>
                  <span className="rounded-full bg-paper px-2.5 py-0.5 text-[10px] font-medium tracking-wider text-ink/80 uppercase">
                    {pub.badge}
                  </span>
                </div>

                <h3 className="mt-4 font-display text-xl leading-tight text-ink md:text-2xl">
                  {pub.title}
                </h3>

                {pub.author ? (
                  <p className="mt-1.5 text-xs text-muted">{pub.author}</p>
                ) : null}

                <p className="mt-4 text-sm leading-relaxed text-ink/80">
                  {pub.lead}
                </p>

                {isOpen ? (
                  <div className="mt-6 space-y-4 border-t border-line pt-6 text-sm leading-relaxed text-ink/90">
                    {pub.paragraphs.map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line/60 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveId(isOpen ? null : pub.id)}
                  className="link-line text-xs tracking-[0.16em] uppercase text-ink font-medium"
                >
                  {isOpen ? "Свернуть статью ↑" : "Читать статью ↓"}
                </button>

                {pub.link ? (
                  <a
                    href={pub.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted hover:text-ink transition-colors flex items-center gap-1 tracking-wider uppercase text-[11px]"
                  >
                    Оригинал ↗
                  </a>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
