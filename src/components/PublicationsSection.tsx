"use client";

import { Lightbox } from "@/components/Lightbox";
import type { Photo, PressLink, Publication } from "@/lib/content";
import { useState } from "react";

function toPhotos(pub: Publication): Photo[] {
  return (pub.images ?? []).map((src, index) => ({
    id: `${pub.id}-${index + 1}`,
    src,
    alt: `${pub.title} — ${index + 1}`,
    width: 1200,
    height: 800,
  }));
}

export function PublicationsSection({
  publications,
  links,
}: {
  publications: Publication[];
  links: PressLink[];
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [open, setOpen] = useState<{ pub: string; index: number } | null>(null);
  const openPub = open ? publications.find((item) => item.id === open.pub) : undefined;
  const openPhotos = openPub ? toPhotos(openPub) : [];

  return (
    <section className="mt-24 border-t border-line pt-16">
      <p className="eyebrow">Публикации и СМИ</p>
      <h2 className="mt-4 max-w-2xl font-display text-3xl md:text-5xl">Пресса обо мне</h2>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
        Статьи, интервью и фоторяды в изданиях. Тексты и страницы публикаций сохранены здесь,
        ссылки ведут на оригиналы.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {publications.map((pub) => {
          const isOpen = activeId === pub.id;
          const photos = toPhotos(pub);
          return (
            <div
              key={pub.id}
              className="flex min-w-0 flex-col justify-between border border-line bg-snow p-6 transition-shadow duration-300 hover:shadow-xs md:p-8"
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

                <h3 className="mt-4 font-display text-xl leading-tight text-ink md:text-2xl">{pub.title}</h3>

                {pub.author ? <p className="mt-1.5 text-xs text-muted">{pub.author}</p> : null}

                {photos.length > 0 ? (
                  <div className="mt-5 flex max-w-full gap-2 overflow-x-auto pb-1">
                    {photos.map((photo, index) => (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => setOpen({ pub: pub.id, index })}
                        className="group/thumb h-20 w-20 shrink-0 overflow-hidden bg-paper md:h-24 md:w-24"
                        aria-label={`Открыть кадр ${index + 1} из публикации «${pub.title}»`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.src}
                          alt={photo.alt}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover/thumb:scale-105"
                        />
                      </button>
                    ))}
                  </div>
                ) : null}

                <p className="mt-4 text-sm leading-relaxed text-ink/80">{pub.lead}</p>

                {isOpen ? (
                  <div className="mt-6 space-y-4 border-t border-line pt-6 text-sm leading-relaxed text-ink/90">
                    {pub.paragraphs.map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line/60 pt-4">
                {pub.paragraphs.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setActiveId(isOpen ? null : pub.id)}
                    className="link-line text-xs font-medium tracking-[0.16em] text-ink uppercase"
                  >
                    {isOpen ? "Свернуть статью ↑" : "Читать статью ↓"}
                  </button>
                ) : (
                  <span className="text-[11px] tracking-[0.16em] text-muted uppercase">Страница издания</span>
                )}

                {pub.link ? (
                  <a
                    href={pub.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] tracking-wider text-muted uppercase transition-colors hover:text-ink"
                  >
                    Оригинал ↗
                  </a>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {links.length > 0 ? (
        <div className="mt-20 border-t border-line pt-14">
          <h3 className="font-display text-2xl md:text-3xl">Ссылки на публикации</h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            Статьи и новости на сайтах изданий — открываются на сайте самого издания.
          </p>
          <ul className="mt-8 max-w-4xl divide-y divide-line border-y border-line">
            {links.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-1.5 py-5 md:flex-row md:items-baseline md:justify-between md:gap-8"
                >
                  <span className="font-display text-base leading-snug text-ink group-hover:underline md:text-lg">{item.title}</span>
                  <span className="shrink-0 text-xs tracking-[0.16em] text-muted uppercase">{item.media} ↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {open && openPhotos.length > 0 ? (
        <Lightbox
          photos={openPhotos}
          index={open.index}
          slug={open.pub}
          onClose={() => setOpen(null)}
          onPrev={() =>
            setOpen((current) =>
              current ? { ...current, index: (current.index + openPhotos.length - 1) % openPhotos.length } : current,
            )
          }
          onNext={() =>
            setOpen((current) => (current ? { ...current, index: (current.index + 1) % openPhotos.length } : current))
          }
        />
      ) : null}
    </section>
  );
}
