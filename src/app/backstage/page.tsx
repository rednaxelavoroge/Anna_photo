import { AlbumGrid } from "@/components/AlbumGrid";
import { JsonLd } from "@/components/JsonLd";
import { getBackstagePhotos } from "@/lib/photos";
import { breadcrumbJsonLd, graphJsonLd, imageGalleryJsonLd, pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Бэкстейдж съёмок",
  description: "Кадры с площадки: подготовка, свет, работа с героями. Не альбом портфолио, а ход съёмки.",
  path: "/backstage",
  keywords: ["бэкстейдж фотосессии", "за кадром фотограф Ереван"],
});

export default function BackstagePage() {
  const photos = getBackstagePhotos();

  return (
    <article className="px-5 pt-28 pb-20 md:px-8">
      <JsonLd
        data={graphJsonLd([
          breadcrumbJsonLd([
            { name: "Главная", path: "/" },
            { name: "Бэкстейдж", path: "/backstage" },
          ]),
          imageGalleryJsonLd({
            name: "Бэкстейдж съёмок",
            description: "Кадры с площадки: подготовка, свет, работа с героями.",
            path: "/backstage",
            photos,
          }),
        ])}
      />
      <p className="eyebrow">За кадром</p>
      <h1 className="mt-4 font-display text-4xl md:text-6xl">Бэкстейдж съёмок</h1>
      <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted md:text-base">
        То, что обычно не попадает в альбом: свет, подготовка, пауза между кадрами.
      </p>
      <div className="mt-14">
        <AlbumGrid photos={photos} slug="backstage" />
      </div>
    </article>
  );
}
