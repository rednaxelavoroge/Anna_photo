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

/**
 * Как статья раскладывается по правке заказчицы 05.09.2026.
 *
 * Было: все снимки страницы одной полосой миниатюр сверху, весь текст —
 * ниже. Заказчица прямо сказала: пусть выглядит так, как статья и написана —
 * снимок, текст, снимок, текст.
 *
 * Поэтому снимки раскладываются по абзацам: первый идёт перед текстом,
 * остальные равномерно между абзацами. У «Пармиджани» пять снимков на
 * тринадцать абзацев — они встают через два-три абзаца, как в журнале.
 *
 * Исключение — публикации-фоторяды: у ImYerevan 21 снимок на четыре абзаца,
 * у NewMag 26 на три. Ставить их по одному между абзацами — это полоса
 * длиной в экран на каждый абзац. Поэтому между абзацами идёт столько,
 * сколько влезает по одному на абзац, а остаток — сеткой под текстом.
 */
function layout(photos: Photo[], paragraphCount: number) {
  if (paragraphCount === 0) return { slots: [] as (Photo | null)[], rest: photos };
  // Мест под снимки: перед первым абзацем и после каждого.
  const slotCount = paragraphCount + 1;
  const inline = photos.slice(0, slotCount);
  const rest = photos.slice(slotCount);
  const slots: (Photo | null)[] = Array.from({ length: slotCount }, () => null);
  // Раскладываем по всей длине текста, а не подряд сверху.
  inline.forEach((photo, index) => {
    const at = inline.length === 1 ? 0 : Math.round((index * (slotCount - 1)) / (inline.length - 1));
    let target = at;
    while (target < slotCount && slots[target]) target += 1;
    if (target >= slotCount) {
      target = slots.lastIndexOf(null);
      if (target < 0) return;
    }
    slots[target] = photo;
  });
  return { slots, rest };
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
      <p className="eyebrow">Публикации</p>
      {/* Заголовок по правке заказчицы 05.09.2026: было «Пресса обо мне». */}
      <h2 className="mt-4 max-w-2xl font-display text-3xl md:text-5xl">СМИ обо мне</h2>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
        Статьи, интервью и фоторяды в изданиях. Тексты и страницы публикаций сохранены здесь,
        ссылки ведут на оригиналы.
      </p>

      <div className="mt-12 grid items-start gap-6 md:grid-cols-2">
        {publications.map((pub) => {
          const isOpen = activeId === pub.id;
          const photos = toPhotos(pub);
          const hasText = pub.paragraphs.length > 0;
          // У четырёх публикаций анонс — это дословно первый абзац статьи.
          // Анонс стоит над текстом всегда, поэтому в самом тексте его не
          // повторяем: иначе раскрытая статья начинается дважды одним и тем
          // же абзацем.
          const body =
            pub.paragraphs[0]?.trim() === pub.lead.trim() ? pub.paragraphs.slice(1) : pub.paragraphs;
          const { slots, rest } = layout(photos, isOpen ? body.length : 0);
          const openAt = (photo: Photo) =>
            setOpen({ pub: pub.id, index: photos.findIndex((item) => item.id === photo.id) });

          const frame = (photo: Photo, big = false) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => openAt(photo)}
              className="group/frame block w-full overflow-hidden bg-paper"
              aria-label={`Открыть кадр из публикации «${pub.title}»`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                decoding="async"
                className={`w-full object-cover transition-transform duration-500 group-hover/frame:scale-[1.02] ${
                  big ? "h-auto" : "h-24"
                }`}
              />
            </button>
          );

          return (
            <div
              key={pub.id}
              className={`flex min-w-0 flex-col justify-between border border-line bg-snow p-6 transition-shadow duration-300 hover:shadow-xs md:p-8 ${
                // Раскрытая статья занимает обе колонки: читать колонку в
                // половину экрана неудобно, а это именно чтение.
                isOpen ? "md:col-span-2" : ""
              }`}
            >
              <div className={isOpen ? "mx-auto w-full max-w-3xl" : undefined}>
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

                {/* Свёрнутая карточка: один кадр как в анонсе. Развёрнутая —
                    кадры внутри текста, поэтому здесь их нет. */}
                {!isOpen && photos.length > 0 ? (
                  <div className="mt-5">{frame(photos[0], true)}</div>
                ) : null}

                <p className="mt-4 text-sm leading-relaxed text-ink/80">{pub.lead}</p>

                {isOpen ? (
                  <div className="mt-6 border-t border-line pt-6 text-sm leading-relaxed text-ink/90">
                    {slots[0] ? <div className="mb-6">{frame(slots[0], true)}</div> : null}
                    {body.map((para, i) => (
                      <div key={i}>
                        <p className={i === 0 ? "" : "mt-4"}>{para}</p>
                        {slots[i + 1] ? <div className="mt-6 mb-6">{frame(slots[i + 1]!, true)}</div> : null}
                      </div>
                    ))}
                    {rest.length > 0 ? (
                      <div className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                        {rest.map((photo) => frame(photo))}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {/* Публикация без текста — только страницы издания: показываем
                    их все, читать нечего. */}
                {!hasText && photos.length > 1 ? (
                  <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {photos.slice(1).map((photo) => frame(photo))}
                  </div>
                ) : null}
              </div>

              <div
                className={`mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line/60 pt-4 ${
                  isOpen ? "mx-auto w-full max-w-3xl" : ""
                }`}
              >
                {hasText ? (
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
