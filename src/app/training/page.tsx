import { AlbumGrid } from "@/components/AlbumGrid";
import { getSite } from "@/lib/content";
import { getGalleryPhotos } from "@/lib/photos";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Обучение фотографии — 45 воркшопов",
  description:
    "Обучение фотографии: индивидуальные, групповые и онлайн-обучения Анны Манасарян, 45 авторских воркшопов в Москве.",
  keywords: ["обучение фотографии Армения", "воркшоп фотографии Москва", "мастер-класс фотограф Ереван"],
};

/**
 * Структура страницы — по правкам заказчицы от 05.09.2026: один заголовок,
 * две крупные строки с мелкими пояснениями, видео мастер-класса, заголовок
 * «45 авторских воркшопов в Москве» и сразу ровная сетка коллажей.
 */
export default function TrainingPage() {
  const { training } = getSite();
  const workshopPhotos = getGalleryPhotos("workshops");
  const videos = training.videos ?? [];

  return (
    <article className="px-5 pt-28 pb-24 md:px-8">
      <h1 className="font-display text-4xl md:text-6xl">{training.title}</h1>

      <p className="mt-8 max-w-3xl font-display text-2xl leading-snug text-ink md:text-3xl">{training.lead}</p>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted md:text-base">{training.leadNote}</p>

      <p className="mt-10 max-w-3xl font-display text-2xl leading-snug text-ink md:text-3xl">{training.stat}</p>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted md:text-base">{training.statNote}</p>

      {videos.length > 0 ? (
        <section className="mt-20 border-t border-line pt-14">
          <p className="eyebrow">Мастер-классы</p>
          <h2 className="mt-3 font-display text-3xl md:text-4xl">Видео с мастер-класса</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {videos.map((video) => (
              <figure key={video.src} className="border border-line bg-snow p-4">
                <video src={video.src} controls playsInline preload="metadata" className="aspect-video w-full bg-paper object-contain" />
                <figcaption className="mt-3 text-sm font-medium text-ink">{video.title}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {workshopPhotos.length > 0 ? (
        <section className="mt-20 border-t border-line pt-14">
          <h2 className="font-display text-3xl md:text-4xl">{training.galleryTitle}</h2>
          <div className="mt-8">
            <AlbumGrid photos={workshopPhotos} slug="workshops" layout="square" />
          </div>
        </section>
      ) : null}
    </article>
  );
}
