import { AlbumGrid } from "@/components/AlbumGrid";
import { CoverArt } from "@/components/CoverArt";
import { PublicationsSection } from "@/components/PublicationsSection";
import { RichText } from "@/components/RichText";
import { SiteVideo } from "@/components/SiteVideo";
import { YoutubeGrid } from "@/components/YoutubeGrid";
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

export default function AboutPage() {
  const site = getSite();
  const { about } = site;
  const videos = getAboutVideos();
  const publications = getPublications();
  const pressLinks = getPressLinks();
  const pressPhotos = getPressPhotos();
  // Ролики из архива заказчицы, лежат на сайте, не на YouTube; список правится в панели.
  const localVideos = about.videos ?? [];

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
      {/* Каждый год — с новой строки: одна запись массива, одна строка. */}
      <div className="mt-10 max-w-2xl space-y-3 text-sm leading-relaxed text-muted md:text-base">
        {about.body.map((line) => (
          <p key={line}>
            <RichText text={line} />
          </p>
        ))}
      </div>
      <p className="mt-12 max-w-2xl text-xs leading-relaxed text-ash">{about.note}</p>

      <PublicationsSection publications={publications} links={pressLinks} />

      <section className="mt-24 border-t border-line pt-16">
        <p className="eyebrow">Телевидение</p>
        <h2 className="mt-4 max-w-2xl font-display text-3xl md:text-4xl">ТВ обо мне</h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
          Эфиры и сюжеты армянских и российских телеканалов о фотографе и её проектах.
        </p>
        {/* Ролики с сайта и эфиры с YouTube показаны одинаковыми плитками:
            заказчица видела два ролика квадратами, а остальные списком, и
            просила «такие же квадратики» для всех. */}
        <div className="mt-10 grid gap-[var(--frame-gap)] sm:grid-cols-2 lg:grid-cols-3">
          {localVideos.map((video) => (
            <figure key={video.src} className="bg-snow p-[var(--print-mat)]">
              <SiteVideo src={video.src} className="aspect-video w-full bg-void object-contain" />
              <figcaption className="mt-3 text-xs leading-relaxed text-muted">{video.title}</figcaption>
            </figure>
          ))}
        </div>
        {/* Эфиры плитками с превью из YouTube; плеер появляется только у
            того ролика, по которому нажали, — см. YoutubeGrid. */}
        <YoutubeGrid videos={videos} />
      </section>

      {pressPhotos.length > 0 ? (
        <section className="mt-24 border-t border-line pt-16">
          <p className="eyebrow">Фотоархив</p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl md:text-4xl">Выставки и эфиры</h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            Фотографии с телевизионных съёмок, открытий выставок и встреч.
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
