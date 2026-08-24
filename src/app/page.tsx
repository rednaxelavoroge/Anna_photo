import { CoverArt } from "@/components/CoverArt";
import { MeetSections } from "@/components/MeetSection";
import { SplitReveal } from "@/components/SplitReveal";
import { getCategories, getSite } from "@/lib/content";
import Link from "next/link";

const HOME_MEET = ["newborn", "babies", "children", "family", "armenian-costumes", "travel"];

export default function HomePage() {
  const site = getSite();
  const categories = getCategories();
  const meeting = categories.filter((item) => HOME_MEET.includes(item.slug));

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
            <p className="mt-6 text-[10px] tracking-[0.18em] text-snow/50 uppercase">
              Временное превью
            </p>
          </div>
        </div>
      </SplitReveal>

      <MeetSections categories={meeting} />

      <section className="border-t border-line bg-paper px-5 py-20 md:px-8">
        <div className="mx-auto max-w-[1500px]">
          <p className="eyebrow">Все съёмки</p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl md:text-5xl">
            Дальше портфолио идёт длинным списком — без подразделов.
          </h2>
          <p className="mt-5 max-w-xl text-sm text-muted md:text-base">
            Новый год, цветение, осень, животные и ИИ — каждый пункт сам по себе. Одно фото может быть в нескольких лентах.
          </p>
          <Link href="/portfolio" className="link-line mt-8 inline-block text-xs tracking-[0.2em] uppercase">
            Смотреть весь список
          </Link>
        </div>
      </section>
    </>
  );
}
