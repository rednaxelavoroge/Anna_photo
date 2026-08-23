import { MeetSections } from "@/components/MeetSection";
import { getCategories } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Портфолио фотографа в Армении",
  description:
    "Альбомы: новорождённые, дети, семья, travel, национальные костюмы, коммерческая и репортажная съёмка в Армении.",
  keywords: [
    "портфолио фотографа Армения",
    "фотосессия новорождённых в Армении",
    "детская фотосессия в Армении",
    "семейная фотосессия в Армении",
  ],
};

export default function PortfolioPage() {
  const categories = getCategories();

  return (
    <div className="pt-20">
      <header className="px-5 py-16 md:px-8 md:py-24">
        <p className="eyebrow">Портфолио</p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[0.95] md:text-6xl">
          Фотосессии в Армении — портфолио Анны Манасарян
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted md:text-base">
          Короткие названия в меню — внутри страниц полные SEO-заголовки. Листайте: половины сходятся навстречу.
        </p>
      </header>
      <MeetSections categories={categories} />
    </div>
  );
}
