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
          Оба алфавита шрифта просим заранее: страница на этом хостинге
          приходит за полторы секунды, и без предзагрузки шрифт вставал в
          очередь за всем остальным. Файлов ровно два — Unbounded с осью
          веса, один файл на алфавит (см. tools/fetch-fonts.mjs).

          Имя «Anna Manasaryan» этого ожидания не ждёт вовсе: восемь его
          букв вшиты в стили, см. src/app/fonts-name.css.
        */}
        {["unbounded-latin", "unbounded-cyrillic"].map((font) => (
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
