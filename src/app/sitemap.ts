import { getCategories, getSite } from "@/lib/content";
import { getCategoryTags } from "@/lib/photos";
import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSite();
  const now = new Date();
  // /portfolio — список разделов, /portfolio/all — сплошная лента всех кадров.
  const pages = [
    "",
    "/portfolio",
    "/portfolio/all",
    "/backstage",
    "/about",
    "/training",
    "/reviews",
    "/contacts",
    "/phototour",
  ];
  const categories = getCategories().map((category) => `/portfolio/${category.slug}`);
  const tagPages = getCategories().flatMap((category) =>
    getCategoryTags(category.slug).map((tag) => `/portfolio/${category.slug}/${tag.slug}`),
  );

  return [...pages, ...categories, ...tagPages].map((path) => ({
    url: `${site.domain}${path}`,
    lastModified: now,
  }));
}
