import entity from "@/data/entity.json";
import { getSite } from "@/lib/content";
import type { Photo } from "@/lib/content";
import { absoluteUrl, getSiteUrl } from "@/lib/site-url";
import type { Metadata } from "next";

export type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
  image?: string;
};

export function personId() {
  return `${getSiteUrl()}/#person`;
}

export function websiteId() {
  return `${getSiteUrl()}/#website`;
}

export function serviceId() {
  return `${getSiteUrl()}/#service`;
}

export function pageMetadata({
  title,
  description,
  path,
  keywords,
  type = "website",
  publishedTime,
  modifiedTime,
  noIndex,
  image,
}: PageMetaInput): Metadata {
  const site = getSite();
  const url = absoluteUrl(path);
  const branded = `${title} — ${site.brand}`;
  const documentTitle = path === "/" ? { absolute: `${site.owner} — ${title}` } : title;

  return {
    title: documentTitle,
    description,
    keywords,
    authors: [{ name: site.owner, url: getSiteUrl() }],
    creator: site.owner,
    publisher: site.brand,
    alternates: { canonical: path },
    robots: noIndex
      ? { index: false, follow: true }
      : {
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
    openGraph: {
      type,
      locale: "ru_RU",
      url,
      siteName: site.brand,
      title: branded,
      description,
      ...(image ? { images: [{ url: absoluteUrl(image) }] } : {}),
      ...(type === "article"
        ? {
            publishedTime,
            modifiedTime: modifiedTime ?? publishedTime,
            authors: [site.owner],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: branded,
      description,
      ...(image ? { images: [absoluteUrl(image)] } : {}),
    },
  };
}

export function websiteJsonLd() {
  const site = getSite();
  return {
    "@type": "WebSite",
    "@id": websiteId(),
    name: site.brand,
    alternateName: site.owner,
    url: `${getSiteUrl()}/`,
    inLanguage: "ru-RU",
    description: site.tagline,
    publisher: { "@id": personId() },
  };
}

export function personJsonLd() {
  const site = getSite();
  const { contacts } = site;
  return {
    "@type": "Person",
    "@id": personId(),
    name: site.owner,
    alternateName: site.brand,
    url: `${getSiteUrl()}/`,
    jobTitle: "Детский и семейный фотограф",
    description:
      "Детский и семейный фотограф. Первой в Армении начала профессионально снимать новорождённых. Съёмки в Армении, работа и воркшопы также связаны с Москвой.",
    knowsAbout: entity.knowsAbout,
    nationality: { "@type": "Country", name: "Армения" },
    address: {
      "@type": "PostalAddress",
      addressLocality: contacts.city,
      addressCountry: "AM",
    },
    telephone: contacts.phone,
    sameAs: entity.sameAs,
    worksFor: { "@id": serviceId() },
    subjectOf: entity.press.map((item) => ({
      "@type": "CreativeWork",
      name: item.title,
      publisher: item.outlet,
      ...(item.year ? { datePublished: String(item.year) } : {}),
    })),
  };
}

export function professionalServiceJsonLd() {
  const site = getSite();
  return {
    "@type": "ProfessionalService",
    "@id": serviceId(),
    name: `${site.brand} — детская и семейная фотография`,
    url: `${getSiteUrl()}/`,
    description:
      "Фотосессии новорождённых, детей и семей в Армении. Воркшопы для фотографов. Съёмки в Ереване; российский номер для связи, опыт работы в Москве.",
    inLanguage: "ru",
    founder: { "@id": personId() },
    employee: { "@id": personId() },
    telephone: site.contacts.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ереван",
      addressCountry: "AM",
    },
    areaServed: entity.areas.map((area) => ({
      "@type": area.type,
      name: area.name,
      ...(area.country === "AM" || area.country === "RU"
        ? {
            containedInPlace: {
              "@type": "Country",
              name: area.country === "AM" ? "Армения" : "Россия",
            },
          }
        : {}),
    })),
    availableLanguage: ["ru"],
  };
}

export function graphJsonLd(nodes: object[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  date: string;
  updated?: string;
  tags: string[];
  draft?: boolean;
  image?: string;
}) {
  return {
    "@type": "Article",
    headline: input.title,
    description: input.description,
    inLanguage: "ru-RU",
    url: absoluteUrl(input.path),
    mainEntityOfPage: absoluteUrl(input.path),
    datePublished: input.date,
    dateModified: input.updated ?? input.date,
    ...(input.image ? { image: absoluteUrl(input.image) } : {}),
    author: { "@id": personId() },
    publisher: { "@id": personId() },
    keywords: input.tags.join(", "),
    ...(input.draft ? { creativeWorkStatus: "Draft" } : {}),
  };
}

export function imageGalleryJsonLd(input: {
  name: string;
  description: string;
  path: string;
  photos: Photo[];
}) {
  const real = input.photos.filter((photo) => photo.src);
  return {
    "@type": "ImageGallery",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    author: { "@id": personId() },
    ...(real.length
      ? {
          associatedMedia: real.slice(0, 16).map((photo) => ({
            "@type": "ImageObject",
            contentUrl: absoluteUrl(photo.src as string),
            description: photo.alt,
            copyrightHolder: { "@id": personId() },
          })),
        }
      : {}),
  };
}
