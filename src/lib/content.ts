import portfolioData from "@/data/portfolio.json";
import reviewsData from "@/data/reviews.json";
import siteData from "@/data/site.json";
import workshopsData from "@/data/workshops.json";

export type Album = {
  slug: string;
  menu: string;
  title: string;
  description: string;
};

export type Category = {
  slug: string;
  menu: string;
  title: string;
  description: string;
  keywords: string[];
  albums: Album[];
  cta?: { href: string; label: string };
};

export type Photo = {
  id: string;
  src?: string;
  alt: string;
  width: number;
  height: number;
  featured?: boolean;
  year?: number;
};

export function getSite() {
  return siteData;
}

export function getCategories(): Category[] {
  return portfolioData.categories as Category[];
}

export function getCategory(slug: string): Category | undefined {
  return getCategories().find((item) => item.slug === slug);
}

export function getAlbum(categorySlug: string, albumSlug: string): Album | undefined {
  return getCategory(categorySlug)?.albums.find((item) => item.slug === albumSlug);
}

export function getReviews() {
  return reviewsData.items;
}

export function getWorkshops() {
  return workshopsData.items;
}

export function getPhotos(categorySlug: string, albumSlug?: string): Photo[] {
  const seed = `${categorySlug}-${albumSlug ?? "all"}`;
  return Array.from({ length: albumSlug ? 12 : 16 }, (_, index) => {
    const portrait = (index + seed.length) % 3 !== 0;
    return {
      id: `${seed}-${index + 1}`,
      alt: albumSlug
        ? `Образец ритма ${index + 1} — ${albumSlug}`
        : `Образец ритма ${index + 1} — ${categorySlug}`,
      width: portrait ? 1200 : 1600,
      height: portrait ? 1600 : 1100,
      featured: index === 0,
      year: 2024 - (index % 4),
    };
  });
}

export function getBackstagePhotos(): Photo[] {
  return Array.from({ length: 18 }, (_, index) => ({
    id: `backstage-${index + 1}`,
    alt: `Образец бэкстейджа ${index + 1}`,
    width: index % 2 === 0 ? 1600 : 1200,
    height: index % 2 === 0 ? 1100 : 1600,
    year: 2023 + (index % 3),
  }));
}
