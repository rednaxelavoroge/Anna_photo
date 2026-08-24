import { getCategories, getSite } from "@/lib/content";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSite();
  const now = new Date();
  const pages = ["", "/portfolio", "/backstage", "/about", "/training", "/reviews", "/contacts", "/phototour"];
  const categories = getCategories().map((category) => `/portfolio/${category.slug}`);

  return [...pages, ...categories].map((path) => ({
    url: `${site.domain}${path}`,
    lastModified: now,
  }));
}
