import { AlbumGrid } from "@/components/AlbumGrid";
import { CoverArt } from "@/components/CoverArt";
import { PublicationsSection } from "@/components/PublicationsSection";
import { getAboutVideos, getPressLinks, getPublications, getSite } from "@/lib/content";
import { getPressPhotos } from "@/lib/photos";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "О фотографе Анне Манасарян",
  description:
    "Детский и семейный фотограф в Ереване. Новорождённые, дети, семьи, travel и обучение.",
  keywords: ["фотограф Анна Манасарян", "детский фотограф Ереван", "семейный фотограф Армения"],
};

/** Ролики из архива заказчицы, лежат на сайте, не на YouTube. */
const LOCAL_VIDEOS = [
  { src: "/videos/press-news-2015.mp4", title: "Новости — выставка фотографий новорождённых, 2015" },
  {
    src: "/videos/press-medical-congress-2015.mp4",
    title: "IV Международный медицинский конгресс Армении — выставка «Из роддома в фотокадр», 2015",
  },
];

export default function AboutPage() {
  const site = getSite();
  const { about } = site;
  const videos = getAboutVideos();
  const publications = getPublications();
  const pressLinks = getPressLinks();
  const pressPhotos = getPressPhotos();

  return (
    <article className="px-5 pt-28 pb-24 md:px-8">
      <p className="eyebrow">{about.eyebrow}</p>
      <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[0.95] md:text-6xl">
        {about.title}
      </h1>
      <div className="relative mt-10 aspect-[2/3] max-w-md overflow-hidden bg-paper shadow-xs">
        <CoverArt slug="home-hero" title={about.title} src={site.portrait} contain />
      </div>
      <p className="mt-8 max-w-2xl text-lg leading-relaxed">{about.lead}</p>
      <div className="mt-10 max-w-2xl space-y-5 text-sm leading-relaxed text-muted md:text-base">
        {about.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <p className="mt-12 max-w-2xl text-xs leading-relaxed text-ash">{about.note}</p>

      <PublicationsSection publications={publications} links={pressLinks} />

      <section className="mt-24 border-t border-line pt-16">
        <p className="eyebrow">Эфиры и сюжеты</p>
        <h2 className="mt-4 max-w-2xl font-display text-3xl md:text-4xl">Телевидение о фотографе</h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
          Сюжеты армянских и российских каналов о съёмках новорождённых, выставках и проектах.
        </p>
        <div className="mt-10 grid gap-[var(--frame-gap)] md:grid-cols-2">
          {LOCAL_VIDEOS.map((video) => (
            <figure key={video.src} className="bg-snow p-[var(--print-mat)]">
              <video
                src={video.src}
                controls
                playsInline
                preload="metadata"
                className="aspect-video w-full bg-void object-contain"
              />
              <figcaption className="mt-3 text-xs leading-relaxed text-muted">{video.title}</figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-[var(--frame-gap)] grid gap-[var(--frame-gap)] sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <figure key={video.id} className="bg-snow p-[var(--print-mat)]">
              <div className="relative aspect-video overflow-hidden bg-void">
                <iframe
                  title={video.title}
                  src={`https://www.youtube-nocookie.com/embed/${video.id}`}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  loading="lazy"
                  allowFullScreen
                />
              </div>
              <figcaption className="mt-3 text-xs leading-relaxed text-muted">{video.title}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {pressPhotos.length > 0 ? (
        <section className="mt-24 border-t border-line pt-16">
          <p className="eyebrow">Фотоархив</p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl md:text-4xl">Выставки, эфиры, страницы изданий</h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            Кадры с телевизионных съёмок, открытий выставок и развороты журналов и газет, где выходили публикации.
          </p>
          <div className="mt-10">
            <AlbumGrid photos={pressPhotos} slug="press" />
          </div>
        </section>
      ) : null}

      <Link href="/contacts" className="link-line mt-12 inline-block text-xs tracking-[0.2em] uppercase">
        Написать
      </Link>
    </article>
  );
}
