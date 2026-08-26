import { CoverArt } from "@/components/CoverArt";
import { getAboutVideos, getSite } from "@/lib/content";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "О фотографе Анне Манасарян",
  description:
    "Детский и семейный фотограф в Ереване. Новорождённые, дети, семьи, travel и обучение.",
  keywords: ["фотограф Анна Манасарян", "детский фотограф Ереван", "семейный фотограф Армения"],
};

export default function AboutPage() {
  const site = getSite();
  const { about } = site;
  const videos = getAboutVideos();

  return (
    <article className="px-5 pt-28 pb-24 md:px-8">
      <p className="eyebrow">{about.eyebrow}</p>
      <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[0.95] md:text-6xl">
        {about.title}
      </h1>
      <div className="relative mt-10 aspect-[3/4] max-w-md overflow-hidden bg-void">
        <CoverArt slug="home-hero" title={about.title} src={site.portrait} />
      </div>
      <p className="mt-8 max-w-2xl text-lg leading-relaxed">{about.lead}</p>
      <div className="mt-10 max-w-2xl space-y-5 text-sm leading-relaxed text-muted md:text-base">
        {about.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <p className="mt-12 max-w-2xl text-xs leading-relaxed text-ash">{about.note}</p>

      <section className="mt-24">
        <p className="eyebrow">Эфиры и сюжеты</p>
        <h2 className="mt-4 max-w-2xl font-display text-3xl md:text-4xl">
          Видео с действующего сайта — без повтора ради колонки
        </h2>
        <div className="mt-10 grid gap-[var(--frame-gap)] sm:grid-cols-2 lg:grid-cols-3">
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

      <Link href="/contacts" className="link-line mt-12 inline-block text-xs tracking-[0.2em] uppercase">
        Написать
      </Link>
    </article>
  );
}
