import { SiteChrome } from "@/components/SiteChrome";
import { ThemeScript } from "@/components/ThemeScript";
import { getSite } from "@/lib/content";
import type { Metadata, Viewport } from "next";
import "./globals.css";

const site = getSite();
const DEMO_URL = "https://annamanasaryan-photo.vercel.app";
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
      <body>
        <ThemeScript />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
