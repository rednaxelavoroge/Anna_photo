import { CoverArt } from "@/components/CoverArt";
import { PortfolioNav } from "@/components/PortfolioNav";
import { TagStrip } from "@/components/TagStrip";
import { getCategories, getSite } from "@/lib/content";
import { getCategoryTags, getPhotos } from "@/lib/photos";
import { PHOTOTOUR_CATEGORY, extrasFor } from "@/lib/portfolio-extras";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Фототуры",
  description:
    "Фототуры с Анной Манасарян: Италия, Армения, Испания, Грузия. Не обучение, а путешествие с фотографом и ваша съёмка в дороге.",
  keywords: ["фототур", "фототур в Армению", "фототур Италия", "фототур Грузия", "travel фотограф"],
};

/**
 * Фототуры — подраздел «Путешествий».
 *
 * До 05.09.2026 это был отдельный пункт главного меню. Заказчица попросила
 * убрать пункт и держать фототуры внутри «Путешествий», рядом с Арменией и
 * Италией. Адрес страницы оставлен прежним: на него уже есть ссылки снаружи,
 * а статическая выгрузка переадресацию не умеет. Шапка и строка подразделов
 * здесь те же, что на `/portfolio/travel`, поэтому страница читается как
 * часть раздела, а не как отдельная ветка сайта.
 */
export default function PhototourPage() {
  const { phototour, contacts } = getSite();
  const categories = getCategories();
  const category = categories.find((item) => item.slug === PHOTOTOUR_CATEGORY);
  // Обложка из панели; если не задана — первый кадр раздела «Путешествия».
  const cover = phototour.cover || getPhotos(PHOTOTOUR_CATEGORY).find((photo) => Boolean(photo.src))?.src;

  return (
    <article className="pt-20">
      <PortfolioNav
        categories={categories}
        activeSlug={PHOTOTOUR_CATEGORY}
        categoryName={category?.menu ?? "Путешествия"}
      />
      <TagStrip
        categorySlug={PHOTOTOUR_CATEGORY}
        tags={getCategoryTags(PHOTOTOUR_CATEGORY)}
        extras={extrasFor(PHOTOTOUR_CATEGORY, "phototour")}
      />

      <div className="grid md:grid-cols-2">
        <div className="flex flex-col justify-center px-5 py-14 md:px-12">
          <p className="eyebrow">{phototour.eyebrow}</p>
          <h1 className="mt-4 font-display text-4xl leading-[0.95] md:text-6xl">{phototour.title}</h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted md:text-base">{phototour.lead}</p>
          <div className="mt-10 flex flex-wrap gap-6 text-xs tracking-[0.2em] uppercase">
            <a href={`https://wa.me/${contacts.whatsappDigits}`} className="link-line">
              {phototour.cta}
            </a>
            <Link href={`/portfolio/${PHOTOTOUR_CATEGORY}`} className="link-line">
              Кадры путешествий
            </Link>
          </div>
        </div>
        <div className="relative flex min-h-[50svh] items-center justify-center bg-paper p-4">
          <div className="relative aspect-[2/3] w-full max-w-md overflow-hidden bg-paper shadow-xs">
            <CoverArt slug="phototour" title={phototour.title} src={cover} />
          </div>
        </div>
      </div>
    </article>
  );
}
