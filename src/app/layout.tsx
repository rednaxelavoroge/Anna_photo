import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SmoothScroll } from "@/components/SmoothScroll";
import { getSite } from "@/lib/content";
import { graphJsonLd, personJsonLd, professionalServiceJsonLd, websiteJsonLd } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";
import type { Metadata, Viewport } from "next";
import "./globals.css";

const site = getSite();

export const metadata: Metadata = {
  metadataBase: new URL(`${getSiteUrl()}/`),
  title: {
    default: `${site.owner} — детский и семейный фотограф в Армении`,
    template: `%s — ${site.brand}`,
  },
  description:
    "Фотосессия новорождённых, детская и семейная съёмка в Армении. Воркшопы, travel и фототур в Ереван. Съёмки в Ереване; связь также из Москвы.",
  applicationName: site.brand,
  authors: [{ name: site.owner, url: getSiteUrl() }],
  creator: site.owner,
  publisher: site.brand,
  keywords: [
    "фотограф Армения",
    "детский фотограф Ереван",
    "фотосессия новорождённых в Армении",
    "семейная фотосессия в Армении",
    "Анна Манасарян",
  ],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "/",
    siteName: site.brand,
    title: `${site.owner} — детский и семейный фотограф в Армении`,
    description: site.tagline,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.owner} — детский и семейный фотограф в Армении`,
    description: site.tagline,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#111111",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <JsonLd data={graphJsonLd([websiteJsonLd(), personJsonLd(), professionalServiceJsonLd()])} />
        <SmoothScroll />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-surface focus:px-4 focus:py-2"
        >
          Перейти к содержимому
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
