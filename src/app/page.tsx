import { CoverArt } from "@/components/CoverArt";
import { MeetSections } from "@/components/MeetSection";
import { SplitReveal } from "@/components/SplitReveal";
import { getCategories, getFeaturedFeed, getFeaturedPhotos, getSite } from "@/lib/content";
import { getPhotos } from "@/lib/photos";
import Link from "next/link";

export default function HomePage() {
  const site = getSite();
  const rawCategories = getCategories();
  const feed = getFeaturedFeed();
  const featured = getFeaturedPhotos();

  // На первую страницу попадают только разделы, в которых уже лежат
  // настоящие фотографии. Пустой раздел (сейчас — «ИИ-проекты») остаётся в
  // меню и в портфолио, но серую заглушку на главной не показывает.
  const categories = rawCategories
    .map((cat) => ({
      ...cat,
      cover: cat.cover || getPhotos(cat.slug).find((photo) => Boolean(photo.src))?.src,
    }))
    .filter((cat) => Boolean(cat.cover));

  return (
    <>
      <SplitReveal wordLeft="АННА" wordRight="МАНАСАРЯН">
        <div className="relative flex min-h-svh flex-col justify-end bg-paper px-5 pb-16 text-snow md:px-12 md:pb-24">
          <div className="absolute inset-0">
            <CoverArt slug="home-hero" title={site.owner} src={site.portrait} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent" />
          <div className="relative max-w-2xl">
            <p className="eyebrow text-snow/75">Фотограф · Ереван</p>
            <h1 className="mt-5 max-w-[18ch] font-display text-[1.55rem] leading-[1.15] text-balance md:max-w-none md:text-5xl md:leading-[1.05]">
              {site.tagline}
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-pretty text-snow/80 md:text-base">
              {site.intro}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-xs tracking-[0.2em] uppercase">
              <Link href="/portfolio" className="link-line">
                Портфолио
              </Link>
              <Link href="/contacts" className="link-line">
                Контакты
              </Link>
            </div>
          </div>
        </div>
      </SplitReveal>

      {feed.visible && featured.length > 0 ? (
        <section className="border-t border-line bg-paper px-5 py-16 md:px-12">
          <p className="eyebrow">{feed.eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl md:text-5xl">{feed.title}</h2>
          {feed.subtitle ? <p className="mt-4 max-w-xl text-sm text-muted">{feed.subtitle}</p> : null}
          <div className="mt-10 flex gap-4 overflow-x-auto pb-4">
            {featured.map((photo) => (
              <figure key={photo.id} className="w-[min(72vw,280px)] shrink-0">
                <div className="aspect-[2/3] overflow-hidden bg-paper shadow-xs">
                  {photo.src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo.src} alt={photo.alt} className="h-full w-full object-contain" />
                  ) : null}
                </div>
                <figcaption className="mt-3 text-sm">{photo.alt}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      <MeetSections categories={categories} />
    </>
  );
}
