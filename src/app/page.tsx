import { CoverArt } from "@/components/CoverArt";
import { MeetSections } from "@/components/MeetSection";
import { SplitReveal } from "@/components/SplitReveal";
import { getCategories, getSite } from "@/lib/content";
import Link from "next/link";

const HOME_MEET = ["newborn", "children", "family", "armenian-costumes", "travel", "reportage"];

export default function HomePage() {
  const site = getSite();
  const categories = getCategories();
  const meeting = categories.filter((item) => HOME_MEET.includes(item.slug));
  const rest = categories.filter((item) => !HOME_MEET.includes(item.slug));

  return (
    <>
      <SplitReveal wordLeft="АННА" wordRight="МАНАСАРЯН">
        <div className="relative flex min-h-svh flex-col justify-end bg-paper px-5 pb-16 text-snow md:px-12 md:pb-24">
          <div className="absolute inset-0">
            <CoverArt slug="home-hero" title={site.owner} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent" />
          <div className="relative max-w-2xl">
            <p className="eyebrow text-snow/75">Фотограф · Ереван</p>
            <h1 className="mt-5 font-display text-4xl leading-[0.95] md:text-6xl">
              {site.tagline}
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-snow/80 md:text-base">
              {site.intro}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-xs tracking-[0.2em] uppercase">
              <Link href="/portfolio" className="link-line">
                Портфолио
              </Link>
              <Link href="/phototour" className="link-line">
                Фототур
              </Link>
            </div>
            <p className="mt-6 text-[10px] tracking-[0.18em] text-snow/50 uppercase">
              Временное превью
            </p>
          </div>
        </div>
      </SplitReveal>

      <MeetSections categories={meeting} />

      <section className="border-t border-line bg-paper px-5 py-20 md:px-8">
        <div className="mx-auto max-w-[1500px]">
          <p className="eyebrow">Ещё альбомы</p>
          <div className="mt-10 grid gap-[var(--frame-gap)] sm:grid-cols-2 lg:grid-cols-5">
            {rest.map((item) => (
              <Link
                key={item.slug}
                href={`/portfolio/${item.slug}`}
                className="gallery-print group"
              >
                <div className="aspect-[4/5] overflow-hidden bg-void">
                  <div className="tile-zoom h-full">
                    <CoverArt slug={item.slug} title={item.menu} />
                  </div>
                </div>
                <span className="gallery-print-name">{item.menu}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
