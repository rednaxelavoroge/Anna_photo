import articlesData from "@/data/articles.json";

export type BlogArticleSetting = {
  slug: string;
  title: string;
  date: string;
  draft: boolean;
  cover?: string;
  /** Текст статьи из markdown. В articles.json не пишется — только в панели и в content/blog. */
  body?: string;
  description?: string;
  tags?: string[];
  relatedSlugs?: string[];
  targetQueries?: string[];
  portfolioHref?: string;
  aboutHref?: string;
  contactsHref?: string;
  coverAlt?: string;
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

/**
 * Статья в публичных списках: карточки /blog, меню, футер, sitemap, «ещё гиды».
 * Выключенная статья по прямой ссылке /blog/[slug] всё равно открывается.
 */
export function isArticleListed(slug: string): boolean {
  const settings = getBlogSettings();
  if (!settings.enabled) return false;
  return Boolean(settings.articles?.[slug]);
}

/** @deprecated Используйте isArticleListed — это про список, а не про доступ к URL. */
export function isArticleVisible(slug: string): boolean {
  return isArticleListed(slug);
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
