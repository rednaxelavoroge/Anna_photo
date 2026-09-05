import { PhotoTape } from "@/components/PhotoTape";
import { PortfolioNav } from "@/components/PortfolioNav";
import { getCategories } from "@/lib/content";
import { getLibraryPhotos } from "@/lib/photos";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Все кадры — портфолио фотографа в Армении",
  description:
    "Сплошная лента всех съёмок: новорождённые, малыши, дети, семья, национальные костюмы, животные, сезон, коммерция, travel и ИИ-проекты.",
  keywords: [
    "портфолио фотографа Армения",
    "фотосессия новорождённых в Армении",
    "детская фотосессия в Армении",
    "семейная фотосессия в Армении",
  ],
};

/**
 * Сплошная лента всех кадров. Раньше жила по адресу /portfolio; переехала
 * сюда 05.09.2026, когда заказчица попросила убрать «решётку» из адреса
 * (`/#portfolio`). Теперь /portfolio — это список разделов, а лента — здесь.
 */
export default function AllFramesPage() {
  return (
    <div className="tape-page">
      <PortfolioNav categories={getCategories()} activeSlug="all" />
      <PhotoTape photos={getLibraryPhotos()} slug="portfolio" />
    </div>
  );
}
