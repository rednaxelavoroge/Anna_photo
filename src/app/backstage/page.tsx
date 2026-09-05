import { AlbumGrid } from "@/components/AlbumGrid";
import { getBackstagePhotos } from "@/lib/photos";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Бэкстейдж",
  description: "Бэкстейдж — это магия, которая происходит за кадром. Кадры и ролики с площадки Анны Манасарян.",
  keywords: ["бэкстейдж фотосессии", "за кадром фотограф Ереван"],
};

export default function BackstagePage() {
  const photos = getBackstagePhotos();

  return (
    <article className="px-5 pt-28 pb-20 md:px-8">
      <h1 className="font-display text-4xl md:text-6xl">Бэкстейдж</h1>
      <p className="mt-6 max-w-2xl font-display text-2xl leading-snug text-ink md:text-3xl">
        Бэкстейдж — это магия, которая происходит за кадром.
      </p>
      <div className="mt-14">
        <AlbumGrid photos={photos} slug="backstage" />
      </div>
    </article>
  );
}
