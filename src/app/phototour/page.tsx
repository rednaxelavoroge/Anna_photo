import { CoverArt } from "@/components/CoverArt";
import { getSite } from "@/lib/content";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Фототур в Армению",
  description:
    "Фототур в Армению: travel-съёмка для гостей Еревана. Не обучение, а путешествие с фотографом.",
  keywords: ["фототур в Армению", "фотосессия для туристов Ереван", "travel фотограф Армения"],
};

export default function PhototourPage() {
  const { phototour, contacts } = getSite();

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
        <div className="relative min-h-[50svh] bg-paper flex items-center justify-center p-4">
          <div className="relative aspect-[2/3] w-full max-w-md overflow-hidden bg-paper shadow-xs">
            <CoverArt slug="phototour" title={phototour.title} contain />
          </div>
        </div>
      </div>
    </article>
  );
}
