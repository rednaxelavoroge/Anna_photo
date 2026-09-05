import { CoverArt } from "@/components/CoverArt";
import { getCategories } from "@/lib/content";
import { getPhotos } from "@/lib/photos";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Портфолио фотографа в Армении",
  description:
    "Разделы съёмок: новорождённые, малыши, дети, семья, национальные костюмы, животные, сезон, коммерция, travel и ИИ-проекты.",
  keywords: [
    "портфолио фотографа Армения",
    "фотосессия новорождённых в Армении",
    "детская фотосессия в Армении",
    "семейная фотосессия в Армении",
  ],
};

/**
 * Страница разделов портфолио.
 *
 * Появилась 05.09.2026 по правке заказчицы: пункт меню «Портфолио» вёл на
 * якорь `/#portfolio` — то есть на главную, к блокам разделов, — и в адресной
 * строке оставалась «решётка». Теперь у списка разделов свой честный адрес
 * `/portfolio/`, а сплошная лента всех кадров переехала на `/portfolio/all`.
 *
 * Содержимое то же, что видно на главной: те же разделы, в том же порядке,
 * с теми же обложками и описаниями из панели.
 */
export default function PortfolioPage() {
  const categories = getCategories().map((category) => ({
    ...category,
    cover: category.cover || getPhotos(category.slug).find((photo) => Boolean(photo.src))?.src,
  }));

  return (
    <article className="px-5 pt-28 pb-24 md:px-8">
      <p className="eyebrow">Портфолио</p>
      <h1 className="mt-4 font-display text-4xl leading-[0.95] md:text-6xl">Съёмки</h1>
      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
        Разделы съёмок — откройте любой, чтобы посмотреть кадры.
      </p>
      <p className="mt-6">
        <Link href="/portfolio/all" className="link-line text-xs tracking-[0.2em] uppercase">
          Смотреть все кадры одной лентой →
        </Link>
      </p>

      <div className="mt-14 grid gap-x-[var(--frame-gap)] gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link key={category.slug} href={`/portfolio/${category.slug}`} className="group block">
            <div className="relative aspect-[4/5] overflow-hidden bg-paper">
              {category.cover ? (
                <div className="tile-zoom h-full w-full">
                  <CoverArt slug={category.slug} title={category.menu} src={category.cover} />
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center border border-line px-6 text-center text-[11px] tracking-[0.2em] text-muted uppercase">
                  Раздел наполняется
                </div>
              )}
            </div>
            <h2 className="mt-4 font-display text-lg leading-tight text-ink group-hover:underline md:text-xl">
              {category.menu}
            </h2>
            {category.description ? (
              <p className="mt-2 text-sm leading-relaxed text-muted">{category.description}</p>
            ) : null}
          </Link>
        ))}
      </div>
    </article>
  );
}
