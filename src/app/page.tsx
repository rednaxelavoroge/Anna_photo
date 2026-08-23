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
        <div className="relative flex min-h-svh flex-col justify-end bg-void px-5 pb-16 text-bg md:px-12 md:pb-24">
          <div className="absolute inset-0 opacity-50">
            <CoverArt slug="home-hero" title={site.owner} />
          </div>
          <div className="relative max-w-2xl">
            <p className="eyebrow text-bg/70">Фотограф · Ереван</p>
            <h1 className="mt-5 font-display text-4xl leading-[0.95] md:text-6xl">
              {site.tagline}
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-bg/75 md:text-base">
              {site.intro}
            </p>
            <div className="mt-8 flex flex-wrap gap-6 text-xs tracking-[0.2em] uppercase">
              <Link href="/portfolio" className="link-line">
                Портфолио
              </Link>
              <Link href="/phototour" className="link-line">
                Фототур
              </Link>
            </div>
          </div>
        </div>
      </SplitReveal>

      <MeetSections categories={meeting} />

      <section className="border-t border-line bg-bg px-5 py-20 md:px-8">
        <div className="mx-auto max-w-[1500px]">
          <p className="eyebrow">Ещё альбомы</p>
          <div className="mt-10 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-5">
            {rest.map((item) => (
              <Link
                key={item.slug}
                href={`/portfolio/${item.slug}`}
                className="group bg-bg p-6"
              >
                <p className="font-display text-2xl">{item.menu}</p>
                <p className="mt-3 text-sm text-muted">{item.description}</p>
                <span className="mt-6 inline-block text-xs tracking-[0.18em] uppercase">
                  Открыть →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
