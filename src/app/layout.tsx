import { SiteChrome } from "@/components/SiteChrome";
import { ThemeScript } from "@/components/ThemeScript";
import { getSite } from "@/lib/content";
import type { Metadata, Viewport } from "next";
import "./globals.css";

const site = getSite();
const DEMO_URL =
  process.env.NAMECHEAP_EXPORT === "1"
    ? site.domain.replace(/\/$/, "")
    : "https://annamanasaryan-photo.vercel.app";
const titleDefault = `${site.owner} — детский и семейный фотограф в Армении`;
const descriptionDefault =
  "Фотосессия новорождённых, детская и семейная съёмка в Армении. Воркшопы, travel и фототур в Ереван.";

function resolveBaseUrl(): URL {
  return new URL(DEMO_URL);
}

export const metadata: Metadata = {
  metadataBase: resolveBaseUrl(),
  title: {
    default: titleDefault,
    template: `%s — ${site.brand}`,
  },
  description: descriptionDefault,
  keywords: [
    "фотограф Армения",
    "детский фотограф Ереван",
    "фотосессия новорождённых в Армении",
    "семейная фотосессия в Армении",
  ],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: DEMO_URL,
    siteName: site.brand,
    title: titleDefault,
    description: descriptionDefault,
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: `${site.owner} — семейная фотосессия в Армении`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: titleDefault,
    description: descriptionDefault,
    images: ["/og.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#F3EFE8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        {/*
          Начертания, которые нужны первому экрану, просим заранее.

          Без этого имя на первом экране успевало показаться чужим шрифтом:
          у «шторок» вес 500, а его файл — отдельный, и до его загрузки
          браузер честно рисует запасным (font-display: swap). Заказчица
          именно это и увидела: «наверху шрифт другой». Шапка тем временем
          уже своя — у неё вес 300, он приходит первым.
        */}
        {[
          "unbounded-300-latin",
          "unbounded-300-cyrillic",
          "unbounded-400-cyrillic",
          "unbounded-500-latin",
        ].map((font) => (
          <link
            key={font}
            rel="preload"
            as="font"
            type="font/woff2"
            href={`/fonts/${font}.woff2`}
            crossOrigin="anonymous"
          />
        ))}
      </head>
      <body>
        <ThemeScript />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
