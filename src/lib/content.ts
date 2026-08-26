import aboutVideos from "@/data/about-videos.json";
import backstageData from "@/data/backstage.json";
import featuredData from "@/data/featured.json";
import photoTags from "@/data/photo-tags.json";
import portfolioData from "@/data/portfolio.json";
import reviewsData from "@/data/reviews.json";
import siteData from "@/data/site.json";
import tagsData from "@/data/tags.json";
import workshopsData from "@/data/workshops.json";

export type Category = {
  slug: string;
  menu: string;
  title: string;
  description: string;
  keywords: string[];
  cover?: string;
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
  kind?: "image" | "video";
};

export type AboutVideo = {
  id: string;
  title: string;
};

export type PhotoTag = {
  src: string;
  alt: string;
  categories: string[];
  tags?: string[];
  images?: string[];
  video?: string;
};

export type StudioTag = { slug: string; name: string };

export type FeaturedFeed = {
  visible: boolean;
  eyebrow: string;
  title: string;
  subtitle: string;
  photoSrcs: string[];
};

export type Review = { id: string; name: string; role: string; text: string };

export type Workshop = { id: string; n: number; title: string; place: string; year: number };

export type SiteContacts = {
  whatsapp: string;
  whatsappDigits: string;
  phone: string;
  phoneRussia: string;
  instagram: string;
  facebook?: string;
  email: string;
  city: string;
};

export type SiteData = {
  owner: string;
  brand: string;
  domain: string;
  tagline: string;
  intro: string;
  portrait?: string;
  about: { eyebrow: string; title: string; lead: string; body: string[]; note: string };
  training: {
    eyebrow: string;
    title: string;
    stat: string;
    lead: string;
    formats: { title: string; text: string }[];
  };
  phototour: { eyebrow: string; title: string; lead: string; cta: string };
  contacts: SiteContacts;
};

export function getSite() {
  return siteData as SiteData;
}

export function getCategories(): Category[] {
  return portfolioData.categories as Category[];
}

export function getCategory(slug: string): Category | undefined {
  return getCategories().find((item) => item.slug === slug);
}

export function getReviews(): Review[] {
  return reviewsData.items as Review[];
}

export function getWorkshops(): Workshop[] {
  return workshopsData.items as Workshop[];
}

export function getAboutVideos(): AboutVideo[] {
  const seen = new Set<string>();
  return (aboutVideos.items as AboutVideo[]).filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function getAllTaggedPhotos(): Photo[] {
  const seen = new Set<string>();
  const out: Photo[] = [];
  for (const item of photoTags.items as PhotoTag[]) {
    if (seen.has(item.src)) continue;
    seen.add(item.src);
    out.push({
      id: item.src,
      src: item.src,
      alt: item.alt,
      width: 1600,
      height: 1200,
      featured: out.length === 0,
    });
  }
  return out;
}

export function getTaggedPhotos(categorySlug: string): Photo[] {
  return (photoTags.items as PhotoTag[])
    .filter((item) => item.categories.includes(categorySlug))
    .map((item, index) => ({
      id: item.src,
      src: item.src,
      alt: item.alt,
      width: 1600,
      height: 1200,
      featured: index === 0,
    }));
}

export function getStudioTags(): StudioTag[] {
  return (tagsData.items ?? []) as StudioTag[];
}

export function getFeaturedFeed(): FeaturedFeed {
  return featuredData as FeaturedFeed;
}

export function getFeaturedPhotos(): Photo[] {
  const feed = getFeaturedFeed();
  if (!feed.visible) return [];
  const items = photoTags.items as PhotoTag[];
  const selected = feed.photoSrcs
    .map((src) => items.find((item) => item.src === src))
    .filter((item): item is PhotoTag => Boolean(item));
  const list = selected.length > 0 ? selected : fallbackFeatured(items);
  return list.map((item, index) => ({
    id: item.src,
    src: item.src,
    alt: item.alt,
    width: 1600,
    height: 1200,
    featured: index === 0,
  }));
}

function fallbackFeatured(items: PhotoTag[]): PhotoTag[] {
  const seen = new Set<string>();
  const out: PhotoTag[] = [];
  for (const category of getCategories()) {
    const hit = items.find((item) => item.categories.includes(category.slug) && !seen.has(item.src));
    if (hit) {
      seen.add(hit.src);
      out.push(hit);
    }
  }
  return out;
}

export function getBackstageEntries() {
  return (backstageData.items ?? []) as { src: string; alt: string }[];
}

export function getPhotos(categorySlug: string): Photo[] {
  const seed = `${categorySlug}-tape`;
  return Array.from({ length: 10 }, (_, index) => {
    const portrait = (index + seed.length) % 3 !== 0;
    return {
      id: `${seed}-${index + 1}`,
      alt: `Кадр ${index + 1} — ${categorySlug}`,
      width: portrait ? 1200 : 1600,
      height: portrait ? 1600 : 1100,
      featured: index === 0,
      year: 2024 - (index % 4),
    };
  });
}

export function getBackstagePhotos(): Photo[] {
  const entries = getBackstageEntries();
  if (entries.length > 0) {
    return entries.map((item, index) => ({
      id: item.src,
      src: item.src,
      alt: item.alt,
      width: 1600,
      height: 1200,
      featured: index === 0,
    }));
  }
  return Array.from({ length: 18 }, (_, index) => ({
    id: `backstage-${index + 1}`,
    alt: `Образец бэкстейджа ${index + 1}`,
    width: index % 2 === 0 ? 1600 : 1200,
    height: index % 2 === 0 ? 1100 : 1600,
    year: 2023 + (index % 3),
  }));
}

