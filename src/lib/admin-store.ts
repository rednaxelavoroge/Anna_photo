import type { Category } from "@/lib/content";
import { slugifyRu } from "@/lib/slugify";
import fs from "node:fs/promises";
import path from "node:path";

export type Tag = { slug: string; name: string };

export type PhotoItem = {
  src: string;
  alt: string;
  categories: string[];
  tags?: string[];
  images?: string[];
  video?: string;
};

export type Featured = {
  visible: boolean;
  eyebrow: string;
  title: string;
  subtitle: string;
  photoSrcs: string[];
};

export type BackstageItem = { src: string; alt: string };

export type StudioState = {
  categories: Category[];
  tags: Tag[];
  photos: PhotoItem[];
  featured: Featured;
  site: unknown;
  backstage: BackstageItem[];
};

const FILES = {
  portfolio: "src/data/portfolio.json",
  tags: "src/data/tags.json",
  photos: "src/data/photo-tags.json",
  featured: "src/data/featured.json",
  site: "src/data/site.json",
  backstage: "src/data/backstage.json",
};

function githubRepo() {
  return process.env.GITHUB_REPO || "rednaxelavoroge/Anna_photo";
}

function githubBranch() {
  return process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || "main";
}

function githubHeaders() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function readLocal(rel: string) {
  return fs.readFile(path.join(process.cwd(), rel), "utf8");
}

async function readGithub(rel: string) {
  const url = `https://api.github.com/repos/${githubRepo()}/contents/${rel}?ref=${encodeURIComponent(githubBranch())}`;
  const res = await fetch(url, { headers: githubHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(`GitHub ${rel}: ${res.status}`);
  const json = (await res.json()) as { content: string };
  return Buffer.from(json.content.replace(/\n/g, ""), "base64").toString("utf8");
}

async function readText(rel: string) {
  if (process.env.GITHUB_TOKEN) return readGithub(rel);
  return readLocal(rel);
}

export async function loadStudio(): Promise<StudioState> {
  const [portfolioRaw, tagsRaw, photosRaw, featuredRaw, siteRaw, backstageRaw] = await Promise.all([
    readText(FILES.portfolio),
    readText(FILES.tags),
    readText(FILES.photos),
    readText(FILES.featured),
    readText(FILES.site),
    readText(FILES.backstage),
  ]);
  const portfolio = JSON.parse(portfolioRaw) as { categories: Category[] };
  const tags = JSON.parse(tagsRaw) as { items: Tag[] };
  const photos = JSON.parse(photosRaw) as { items: PhotoItem[] };
  const featured = JSON.parse(featuredRaw) as Featured;
  const site = JSON.parse(siteRaw);
  const backstage = JSON.parse(backstageRaw) as { items: BackstageItem[] };
  return {
    categories: portfolio.categories,
    tags: tags.items ?? [],
    photos: (photos.items ?? []).map((item) => ({
      ...item,
      tags: item.tags ?? [],
      images: item.images?.length ? item.images : [item.src],
    })),
    featured,
    site,
    backstage: backstage.items ?? [],
  };
}

async function writeLocal(files: { path: string; content: Buffer }[]) {
  for (const file of files) {
    const abs = path.join(process.cwd(), file.path);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, file.content);
  }
}

async function writeGithub(files: { path: string; content: Buffer }[], message: string) {
  const headers = { ...githubHeaders(), "Content-Type": "application/json" };
  const base = `https://api.github.com/repos/${githubRepo()}`;
  const refRes = await fetch(`${base}/git/ref/heads/${githubBranch()}`, { headers, cache: "no-store" });
  if (!refRes.ok) throw new Error(`GitHub ref: ${refRes.status}`);
  const ref = (await refRes.json()) as { object: { sha: string } };
  const commitRes = await fetch(`${base}/git/commits/${ref.object.sha}`, { headers, cache: "no-store" });
  const commit = (await commitRes.json()) as { tree: { sha: string } };

  const treeItems = [];
  for (const file of files) {
    const blobRes = await fetch(`${base}/git/blobs`, {
      method: "POST",
      headers,
      body: JSON.stringify({ content: file.content.toString("base64"), encoding: "base64" }),
    });
    const blob = (await blobRes.json()) as { sha?: string; message?: string };
    if (!blob.sha) throw new Error(blob.message || "GitHub blob failed");
    treeItems.push({ path: file.path, mode: "100644", type: "blob", sha: blob.sha });
  }

  const treeRes = await fetch(`${base}/git/trees`, {
    method: "POST",
    headers,
    body: JSON.stringify({ base_tree: commit.tree.sha, tree: treeItems }),
  });
  const tree = (await treeRes.json()) as { sha?: string; message?: string };
  if (!tree.sha) throw new Error(tree.message || "GitHub tree failed");

  const newCommitRes = await fetch(`${base}/git/commits`, {
    method: "POST",
    headers,
    body: JSON.stringify({ message, tree: tree.sha, parents: [ref.object.sha] }),
  });
  const newCommit = (await newCommitRes.json()) as { sha?: string; message?: string };
  if (!newCommit.sha) throw new Error(newCommit.message || "GitHub commit failed");

  const patch = await fetch(`${base}/git/refs/heads/${githubBranch()}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ sha: newCommit.sha }),
  });
  if (!patch.ok) throw new Error(`GitHub update ref: ${patch.status}`);
}

export async function saveStudio(state: StudioState, message = "Обновление с панели управления") {
  const files = [
    {
      path: FILES.portfolio,
      content: Buffer.from(`${JSON.stringify({ categories: state.categories }, null, 2)}\n`),
    },
    {
      path: FILES.tags,
      content: Buffer.from(`${JSON.stringify({ items: state.tags }, null, 2)}\n`),
    },
    {
      path: FILES.photos,
      content: Buffer.from(`${JSON.stringify({ items: state.photos }, null, 2)}\n`),
    },
    {
      path: FILES.featured,
      content: Buffer.from(`${JSON.stringify(state.featured, null, 2)}\n`),
    },
    {
      path: FILES.site,
      content: Buffer.from(`${JSON.stringify(state.site, null, 2)}\n`),
    },
    {
      path: FILES.backstage,
      content: Buffer.from(`${JSON.stringify({ items: state.backstage }, null, 2)}\n`),
    },
  ];
  if (process.env.GITHUB_TOKEN) await writeGithub(files, message);
  else await writeLocal(files);
}

export async function saveUpload(filename: string, data: Buffer) {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
  const rel = `public/photos/uploads/${Date.now()}-${safe}`;
  if (process.env.GITHUB_TOKEN) await writeGithub([{ path: rel, content: data }], `Фото: ${safe}`);
  else await writeLocal([{ path: rel, content: data }]);
  return `/${rel.replace(/^public\//, "")}`;
}

export function uniqueTagSlug(name: string, existing: Tag[]) {
  const base = slugifyRu(name);
  const hit = existing.find((item) => item.name.trim().toLowerCase() === name.trim().toLowerCase());
  if (hit) return hit.slug;
  if (!existing.some((item) => item.slug === base)) return base;
  let i = 2;
  while (existing.some((item) => item.slug === `${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}
