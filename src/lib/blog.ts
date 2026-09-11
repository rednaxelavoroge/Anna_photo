import { parseFrontmatter, type BlogFrontmatter } from "@/lib/frontmatter";
import fs from "node:fs";
import path from "node:path";

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
  return { ...data, slug, body };
}

export function getPosts(): BlogPost[] {
  return getPostSlugs()
    .map((slug) => getPost(slug))
    .filter((post): post is BlogPost => Boolean(post))
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

export function getRelatedPosts(post: BlogPost): BlogPost[] {
  const missing = post.relatedSlugs.filter((slug) => !getPost(slug));
  if (missing.length > 0) {
    throw new Error(`Неизвестные relatedSlugs в ${post.slug}: ${missing.join(", ")}`);
  }
  return post.relatedSlugs
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

export function formatPostDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return date;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
