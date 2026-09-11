import { getPosts } from "@/lib/blog";
import { getCategories } from "@/lib/content";
import { getSiteUrl } from "@/lib/site-url";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  const hubs: MetadataRoute.Sitemap = [
    { path: "", priority: 1, changeFrequency: "weekly" as const },
    { path: "/portfolio", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/blog", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/contacts", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/training", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/phototour", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/reviews", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/backstage", priority: 0.4, changeFrequency: "monthly" as const },
  ].map((item) => ({
    url: `${base}${item.path}`,
    lastModified: now,
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }));

  const categories = getCategories().flatMap((category) => [
    {
      url: `${base}/portfolio/${category.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    ...category.albums.map((album) => ({
      url: `${base}/portfolio/${category.slug}/${album.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.55,
    })),
  ]);

  const posts = getPosts().map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: post.draft ? 0.5 : 0.75,
  }));

  return [...hubs, ...categories, ...posts];
}
