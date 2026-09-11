import fs from "fs";
import path from "path";
import { parseFrontmatter, type BlogFrontmatter } from "@/lib/frontmatter";
import {
  getBlogSettings,
  isArticleEnabled,
  isArticleListed,
  isArticleVisible,
  isBlogEnabled,
  formatPostDate,
  type BlogArticleSetting,
  type BlogSettings,
} from "@/lib/articles";

export {
  getBlogSettings,
  isArticleEnabled,
  isArticleListed,
  isArticleVisible,
  isBlogEnabled,
  formatPostDate,
  type BlogArticleSetting,
  type BlogSettings,
};

export type BlogPost = BlogFrontmatter & {
  slug: string;
  body: string;
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export function getPostSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((name) => name.endsWith(".md"))
    .map((name) => name.replace(/\.md$/, ""))
    .sort();
}

export function getPost(slug: string): BlogPost | undefined {
  const file = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return undefined;
  const raw = fs.readFileSync(file, "utf8");
  const { data, body } = parseFrontmatter(raw);
  const cover = data.cover || data.image;
  return { ...data, cover, slug, body };
}

export function getAllPosts(): BlogPost[] {
  return getPostSlugs()
    .map((slug) => getPost(slug))
    .filter((post): post is BlogPost => Boolean(post))
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

/** Только статьи из публичного списка. Прямой URL живёт отдельно — см. getPost. */
export function getPosts(): BlogPost[] {
  if (!isBlogEnabled()) return [];
  return getAllPosts().filter((post) => isArticleListed(post.slug));
}

export function getRelatedPosts(post: BlogPost): BlogPost[] {
  if (!isBlogEnabled()) return [];
  return post.relatedSlugs
    .filter((slug) => isArticleListed(slug))
    .map((slug) => getPost(slug))
    .filter((item): item is BlogPost => Boolean(item));
}

export const CATEGORY_GUIDES: Record<string, string[]> = {
  newborn: ["podgotovka-k-fotosessii-novorozhdennogo", "bezopasnaya-syomka-novorozhdennyh"],
  children: ["fotosessiya-malyshej-1-12-mesyacev", "kak-podgotovit-rebyonka-k-fotosessii"],
  family: ["semejnaya-fotosessiya-v-erevane", "kak-podgotovit-rebyonka-k-fotosessii"],
  "armenian-costumes": ["fotosessiya-v-armyanskih-nacionalnyh-kostyumah", "semejnaya-fotosessiya-v-erevane"],
  seasonal: ["sezonnye-fotosessii-v-armenii", "skazochnye-fotosessii-dlya-detej"],
  travel: ["semejnaya-fotosessiya-v-erevane", "kak-zapisatsya-na-fotosessiyu-armeniya-moskva"],
  reportage: ["semejnaya-fotosessiya-v-erevane", "kak-zapisatsya-na-fotosessiyu-armeniya-moskva"],
};
