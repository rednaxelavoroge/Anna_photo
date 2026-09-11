export type BlogFrontmatter = {
  title: string;
  description: string;
  date: string;
  draft: boolean;
  tags: string[];
  relatedSlugs: string[];
  targetQueries: string[];
  portfolioHref?: string;
  aboutHref?: string;
  contactsHref?: string;
};

const STRING_KEYS = new Set([
  "title",
  "description",
  "date",
  "portfolioHref",
  "aboutHref",
  "contactsHref",
]);

const BOOL_KEYS = new Set(["draft"]);
const LIST_KEYS = new Set(["tags", "relatedSlugs", "targetQueries"]);

export function parseFrontmatter(raw: string): { data: BlogFrontmatter; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    throw new Error("Статья без YAML-frontmatter");
  }

  const data: Record<string, unknown> = {
    draft: false,
    tags: [],
    relatedSlugs: [],
    targetQueries: [],
  };

  const lines = match[1].split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trimStart().startsWith("#")) {
      i += 1;
      continue;
    }

    const kv = line.match(/^([A-Za-z][A-Za-z0-9]*)\s*:\s*(.*)$/);
    if (!kv) {
      i += 1;
      continue;
    }

    const key = kv[1];
    const rest = kv[2];

    if (LIST_KEYS.has(key) && rest === "") {
      const values: string[] = [];
      i += 1;
      while (i < lines.length) {
        const item = lines[i].match(/^\s+-\s+(.+)$/);
        if (!item) break;
        values.push(unwrap(item[1]));
        i += 1;
      }
      data[key] = values;
      continue;
    }

    if (LIST_KEYS.has(key)) {
      data[key] = parseInlineList(rest);
    } else if (BOOL_KEYS.has(key)) {
      data[key] = rest.trim() === "true";
    } else if (STRING_KEYS.has(key)) {
      data[key] = unwrap(rest);
    }

    i += 1;
  }

  if (typeof data.title !== "string" || typeof data.description !== "string" || typeof data.date !== "string") {
    throw new Error("Во frontmatter нужны title, description и date");
  }

  return { data: data as BlogFrontmatter, body: match[2].trim() };
}

function unwrap(value: string) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseInlineList(value: string): string[] {
  const trimmed = value.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed
      .slice(1, -1)
      .split(",")
      .map((item) => unwrap(item.trim()))
      .filter(Boolean);
  }
  if (!trimmed) return [];
  return [unwrap(trimmed)];
}
