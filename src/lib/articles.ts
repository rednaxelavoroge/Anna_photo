import articlesData from "@/data/articles.json";

export type BlogArticleSetting = {
  slug: string;
  title: string;
  date: string;
  draft: boolean;
};

export type BlogSettings = {
  enabled: boolean;
  articles: Record<string, boolean>;
  items?: BlogArticleSetting[];
};

export function getBlogSettings(): BlogSettings {
  const data = articlesData as Partial<BlogSettings>;
  return {
    enabled: Boolean(data.enabled),
    articles: data.articles ?? {},
    items: data.items ?? [],
  };
}

export function isBlogEnabled(): boolean {
  return getBlogSettings().enabled;
}

export function isArticleEnabled(slug: string): boolean {
  return Boolean(getBlogSettings().articles?.[slug]);
}

export function isArticleVisible(slug: string): boolean {
  const settings = getBlogSettings();
  if (!settings.enabled) return false;
  return Boolean(settings.articles?.[slug]);
}

export function formatPostDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return date;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
