import { PhotoTape } from "@/components/PhotoTape";
import { PortfolioNav } from "@/components/PortfolioNav";
import { getCategories } from "@/lib/content";
import { getLibraryPhotos } from "@/lib/photos";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Портфолио фотографа в Армении",
  description:
    "Плоский список съёмок: новорождённые, малыши, дети, семья, национальные костюмы, животные, сезон, коммерция, travel и ИИ-проекты.",
  keywords: [
    "портфолио фотографа Армения",
    "фотосессия новорождённых в Армении",
    "детская фотосессия в Армении",
    "семейная фотосессия в Армении",
  ],
};

export default function PortfolioPage() {
  const categories = getCategories();
  const photos = getLibraryPhotos();

  return (
    <div className="tape-page">
      <PortfolioNav categories={categories} activeSlug="portfolio" />
      <PhotoTape photos={photos} slug="portfolio" />
    </div>
  );
}
