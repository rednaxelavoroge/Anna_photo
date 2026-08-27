import type { NextConfig } from "next";
import path from "node:path";
import { LEGACY_ALBUM_REDIRECTS, LEGACY_CATEGORY_REDIRECTS } from "./src/lib/legacy-routes";

/**
 * NAMECHEAP_EXPORT=1 собирает сайт папкой готовых файлов (out/), которую можно
 * положить на обычный хостинг. Нужно из-за того, что Vercel в России придушен.
 */
const isExport = process.env.NAMECHEAP_EXPORT === "1";

/**
 * PANEL_BUILD=1 собирает панель для переезда на хостинг заказчицы, где она
 * открывается без ВПН.
 *
 * `standalone` кладёт рядом со сборкой маленький сервер и ровно те
 * зависимости, которые нужны в работе: на хостинг уезжает папка в десятки
 * мегабайт вместо всего проекта, и `npm install` там не нужен — его там
 * и не запустить.
 *
 * Оптимизатор картинок выключен намеренно. Фотографии каталога везти к панели
 * незачем: она берёт их прямо с сайта, по адресу из NEXT_PUBLIC_MEDIA_BASE.
 */
const isPanel = process.env.PANEL_BUILD === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isExport ? { output: "export" as const, trailingSlash: true } : {}),
  ...(isPanel ? { output: "standalone" as const } : {}),
  outputFileTracingRoot: path.join(__dirname),
  outputFileTracingIncludes: {
    "/api/admin/**/*": ["./src/data/**/*.json"],
  },
  images: isExport || isPanel
    ? { unoptimized: true }
    : {
        formats: ["image/webp"],
        deviceSizes: [375, 640, 828, 1080, 1200, 1600],
        imageSizes: [96, 160, 256, 384],
      },
  ...(isExport
    ? {}
    : {
        async redirects() {
          return [
            ...LEGACY_CATEGORY_REDIRECTS.map((item) => ({
              source: `/portfolio/${item.from}`,
              destination: `/portfolio/${item.to}`,
              permanent: true,
            })),
            ...LEGACY_ALBUM_REDIRECTS.map((item) => ({
              source: `/portfolio/${item.category}/${item.album}`,
              destination: `/portfolio/${item.to}`,
              permanent: true,
            })),
          ];
        },
      }),
};

export default nextConfig;
