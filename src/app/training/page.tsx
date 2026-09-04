import { AlbumGrid } from "@/components/AlbumGrid";
import { CoverArt } from "@/components/CoverArt";
import { getSite, getWorkshops } from "@/lib/content";
import { getPhotos } from "@/lib/photos";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Обучение фотографии — 45 воркшопов",
  description:
    "Обучение фотографии: 45 проведённых воркшопов, индивидуальное и онлайн-обучение Анны Манасарян.",
  keywords: ["обучение фотографии Армения", "воркшоп фотографии Москва", "мастер-класс фотограф Ереван"],
};

export default function TrainingPage() {
  const { training } = getSite();
  const workshops = getWorkshops();
  const workshopPhotos = getPhotos("workshops");

  return (
    <article className="px-5 pt-28 pb-24 md:px-8">
      <p className="eyebrow">{training.eyebrow}</p>
      <h1 className="mt-4 font-display text-4xl md:text-6xl">{training.title}</h1>
      <p className="mt-4 font-display text-2xl text-muted md:text-3xl">{training.stat}</p>
      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
        {training.lead}
      </p>

      <div className="relative mt-12 aspect-[3/2] max-w-4xl overflow-hidden bg-paper shadow-xs">
        <CoverArt slug="training" title={training.title} contain />
      </div>

      <div className="mt-14 grid gap-[var(--frame-gap)] md:grid-cols-2">
        {training.formats.map((item) => (
          <div key={item.title} className="bg-snow p-6">
            <h2 className="font-display text-2xl">{item.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{item.text}</p>
          </div>
        ))}
      </div>

      <section className="mt-20 border-t border-line pt-14">
        <p className="eyebrow">Мастер-классы</p>
        <h2 className="mt-3 font-display text-3xl md:text-4xl">Видео с практических занятий</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <figure className="border border-line bg-snow p-4">
            <video
              src="/videos/Мастер-класс-2015(1).mp4"
              controls
              playsInline
              preload="metadata"
              className="aspect-video w-full bg-paper object-contain"
            />
            <figcaption className="mt-3 text-sm font-medium text-ink">
              Мастер-класс по съёмке новорождённых — Часть 1
            </figcaption>
          </figure>
          <figure className="border border-line bg-snow p-4">
            <video
              src="/videos/Мастер-класс-2015(2).mp4"
              controls
              playsInline
              preload="metadata"
              className="aspect-video w-full bg-paper object-contain"
            />
            <figcaption className="mt-3 text-sm font-medium text-ink">
              Мастер-класс по съёмке новорождённых — Часть 2
            </figcaption>
          </figure>
        </div>
      </section>

      {workshopPhotos.length > 0 ? (
        <section className="mt-20 border-t border-line pt-14">
          <p className="eyebrow">Галерея воркшопов</p>
          <h2 className="mt-3 font-display text-3xl md:text-4xl">Кадры с практических занятий</h2>
          <div className="mt-10">
            <AlbumGrid photos={workshopPhotos} slug="workshops" />
          </div>
        </section>
      ) : (
        <div className="mt-16 grid gap-[var(--frame-gap)] sm:grid-cols-2 lg:grid-cols-3">
          {workshops.map((item) => (
            <article key={item.id} className="bg-snow p-5">
              <p className="eyebrow">
                {String(item.n).padStart(2, "0")} · {item.year}
              </p>
              <h2 className="mt-3 font-display text-xl">{item.title}</h2>
              <p className="mt-2 text-sm text-muted">{item.place}</p>
            </article>
          ))}
        </div>
      )}
    </article>
  );
}
