import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SmoothScroll } from "@/components/SmoothScroll";
import { getSite } from "@/lib/content";
import type { Metadata, Viewport } from "next";
import "./globals.css";

const site = getSite();

function resolveBaseUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return new URL(explicit);
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return new URL(`https://${vercel}`);
  return new URL(site.domain);
}

export const metadata: Metadata = {
  metadataBase: resolveBaseUrl(),
  title: {
    default: `${site.owner} — детский и семейный фотограф в Армении`,
    template: `%s — ${site.brand}`,
  },
  description:
    "Фотосессия новорождённых, детская и семейная съёмка в Армении. Воркшопы, travel и фототур в Ереван.",
  keywords: [
    "фотограф Армения",
    "детский фотограф Ереван",
    "фотосессия новорождённых в Армении",
    "семейная фотосессия в Армении",
  ],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: site.brand,
    title: `${site.owner} — фотограф`,
    description: site.tagline,
  },
};

export const viewport: Viewport = {
  themeColor: "#111111",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
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
