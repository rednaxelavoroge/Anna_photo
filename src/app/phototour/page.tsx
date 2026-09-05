import { CoverArt } from "@/components/CoverArt";
import { getSite } from "@/lib/content";
import { getPhotos } from "@/lib/photos";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Фототуры",
  description:
    "Фототуры с Анной Манасарян: Италия, Армения, Испания, Грузия. Не обучение, а путешествие с фотографом и ваша съёмка в дороге.",
  keywords: ["фототур", "фототур в Армению", "фототур Италия", "фототур Грузия", "travel фотограф"],
};

export default function PhototourPage() {
  const { phototour, contacts } = getSite();
  // Обложка из панели; если не задана — первый кадр раздела «Путешествия».
  const cover = phototour.cover || getPhotos("travel").find((photo) => Boolean(photo.src))?.src;

  return (
    <article className="pt-20">
      <div className="grid min-h-[80svh] md:grid-cols-2">
        <div className="flex flex-col justify-center px-5 py-16 md:px-12">
          <p className="eyebrow">{phototour.eyebrow}</p>
          <h1 className="mt-4 font-display text-4xl leading-[0.95] md:text-6xl">
            {phototour.title}
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted md:text-base">
            {phototour.lead}
          </p>
          <div className="mt-10 flex flex-wrap gap-6 text-xs tracking-[0.2em] uppercase">
            <a href={`https://wa.me/${contacts.whatsappDigits}`} className="link-line">
              {phototour.cta}
            </a>
            <Link href="/portfolio/travel" className="link-line">
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
