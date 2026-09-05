import aboutVideosFile from "@/data/about-videos.json";
import backstageFile from "@/data/backstage.json";
import galleriesFile from "@/data/galleries.json";
import photosFile from "@/data/photo-tags.json";
import portfolioFile from "@/data/portfolio.json";
import publicationsFile from "@/data/publications.json";
import siteFile from "@/data/site.json";
import tagsFile from "@/data/tags.json";
import type {
  AboutVideo,
  Category,
  Galleries,
  GalleryItem,
  GalleryKey,
  PhotoTag,
  PressLink,
  Publication,
  SiteData,
} from "@/lib/content";
import { MEDIA_EXT, folderOfCategory } from "@/lib/folders";
import { slugifyRu } from "@/lib/slugify";
import fs from "node:fs/promises";
import path from "node:path";

export type Tag = { slug: string; name: string };

export type PhotoItem = PhotoTag;

export type BackstageItem = GalleryItem;

/**
 * Всё, чем управляет панель. Один объект — один запрос на сохранение:
 * так не бывает половинчатых состояний, когда кадр записан, а раздел нет.
 */
export type StudioState = {
  categories: Category[];
  tags: Tag[];
  photos: PhotoItem[];
  site: SiteData;
  backstage: GalleryItem[];
  galleries: Galleries;
  aboutVideos: AboutVideo[];
  publications: Publication[];
  pressLinks: PressLink[];
};

/** Файлы в папках, которых панель ещё не знает — можно подобрать одной кнопкой. */
export type Unlisted = {
  photos: Record<string, string[]>;
  backstage: string[];
  galleries: Record<GalleryKey, string[]>;
};

const FILES = {
  portfolio: "src/data/portfolio.json",
  tags: "src/data/tags.json",
  photos: "src/data/photo-tags.json",
  site: "src/data/site.json",
  backstage: "src/data/backstage.json",
  galleries: "src/data/galleries.json",
  aboutVideos: "src/data/about-videos.json",
  publications: "src/data/publications.json",
};

// Экспортируются, чтобы приёмник роликов брал те же репозиторий и ветку,
// а не завёл рядом вторую пару значений, которая однажды разойдётся.
export function githubRepo() {
  return process.env.GITHUB_REPO || "rednaxelavoroge/Anna_photo";
}

export function githubBranch() {
  return process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || "cursor/namecheap-static-f40b";
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

const BUNDLED: Record<string, string> = {
  [FILES.portfolio]: JSON.stringify(portfolioFile),
  [FILES.tags]: JSON.stringify(tagsFile),
  [FILES.photos]: JSON.stringify(photosFile),
  [FILES.site]: JSON.stringify(siteFile),
  [FILES.backstage]: JSON.stringify(backstageFile),
  [FILES.galleries]: JSON.stringify(galleriesFile),
  [FILES.aboutVideos]: JSON.stringify(aboutVideosFile),
  [FILES.publications]: JSON.stringify(publicationsFile),
};

async function readText(rel: string) {
  if (process.env.GITHUB_TOKEN) {
    try {
      return await readGithub(rel);
    } catch {
      // fall through to local / bundle so the panel still opens
    }
  }
  try {
    return await readLocal(rel);
  } catch {
    const bundled = BUNDLED[rel];
    if (bundled) return bundled;
    throw new Error(`Нет файла ${rel}`);
  }
}

export async function loadStudio(): Promise<StudioState> {
  const [portfolioRaw, tagsRaw, photosRaw, siteRaw, backstageRaw, galleriesRaw, videosRaw, publicationsRaw] =
    await Promise.all([
      readText(FILES.portfolio),
      readText(FILES.tags),
      readText(FILES.photos),
      readText(FILES.site),
      readText(FILES.backstage),
      readText(FILES.galleries).catch(() => JSON.stringify({ reviews: [], workshops: [], press: [] })),
      readText(FILES.aboutVideos).catch(() => JSON.stringify({ items: [] })),
      readText(FILES.publications).catch(() => JSON.stringify({ items: [], links: [] })),
    ]);
  const portfolio = JSON.parse(portfolioRaw) as { categories: Category[] };
  const tags = JSON.parse(tagsRaw) as { items: Tag[] };
  const photos = JSON.parse(photosRaw) as { items: PhotoItem[] };
  const site = JSON.parse(siteRaw) as SiteData;
  const backstage = JSON.parse(backstageRaw) as { items: GalleryItem[] };
  const galleries = JSON.parse(galleriesRaw) as Partial<Galleries>;
  const videos = JSON.parse(videosRaw) as { items: AboutVideo[] };
  const publications = JSON.parse(publicationsRaw) as { items?: Publication[]; links?: PressLink[] };
  return {
    categories: portfolio.categories,
    tags: tags.items ?? [],
    photos: (photos.items ?? []).map((item) => ({
      ...item,
      tags: item.tags ?? [],
      images: item.images?.length ? item.images : [item.src],
    })),
    site: {
      ...site,
      contacts: { facebook: "", ...site.contacts },
      portrait: site.portrait ?? "",
      about: { ...site.about, videos: site.about.videos ?? [] },
      training: { ...site.training, videos: site.training.videos ?? [] },
      phototour: { ...site.phototour, cover: site.phototour.cover ?? "" },
    },
    backstage: backstage.items ?? [],
    galleries: {
      reviews: galleries.reviews ?? [],
      workshops: galleries.workshops ?? [],
      press: galleries.press ?? [],
    },
    aboutVideos: videos.items ?? [],
    publications: publications.items ?? [],
    pressLinks: publications.links ?? [],
  };
}

type FileWrite = { path: string; content: Buffer };

async function writeLocal(files: FileWrite[], deletions: string[] = []) {
  for (const file of files) {
    const abs = path.join(process.cwd(), file.path);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, file.content);
  }
  for (const rel of deletions) {
    await fs.rm(path.join(process.cwd(), rel), { force: true });
  }
}

/**
 * Один коммит на сохранение: записанные файлы и удалённые вместе.
 * Удаление — запись в дереве с пустым sha, так GitHub понимает «убрать».
 */
async function writeGithub(files: FileWrite[], message: string, deletions: string[] = []) {
  const headers = { ...githubHeaders(), "Content-Type": "application/json" };
  const base = `https://api.github.com/repos/${githubRepo()}`;
  const refRes = await fetch(`${base}/git/ref/heads/${githubBranch()}`, { headers, cache: "no-store" });
  if (!refRes.ok) throw new Error(`GitHub ref: ${refRes.status}`);
  const ref = (await refRes.json()) as { object: { sha: string } };
  const commitRes = await fetch(`${base}/git/commits/${ref.object.sha}`, { headers, cache: "no-store" });
  const commit = (await commitRes.json()) as { tree: { sha: string } };

  const treeItems: { path: string; mode: string; type: string; sha: string | null }[] = [];
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
  for (const rel of deletions) {
    treeItems.push({ path: rel, mode: "100644", type: "blob", sha: null });
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

/** Пути `/photos/...` с сайта → пути файлов в репозитории. Чужое не трогаем. */
function toRepoPaths(srcs: string[]): string[] {
  return srcs
    .filter((src) => /^\/(photos|videos)\/[^?#]+$/.test(src) && !src.includes(".."))
    .map((src) => `public${src}`);
}

export async function saveStudio(
  state: StudioState,
  message = "Обновление с панели управления",
  deleteSrcs: string[] = [],
) {
  const json = (data: unknown) => Buffer.from(`${JSON.stringify(data, null, 2)}\n`);
  const files: FileWrite[] = [
    { path: FILES.portfolio, content: json({ categories: state.categories }) },
    { path: FILES.tags, content: json({ items: state.tags }) },
    { path: FILES.photos, content: json({ items: state.photos }) },
    { path: FILES.site, content: json(state.site) },
    { path: FILES.backstage, content: json({ items: state.backstage }) },
    { path: FILES.galleries, content: json(state.galleries) },
    { path: FILES.aboutVideos, content: json({ items: state.aboutVideos }) },
    { path: FILES.publications, content: json({ items: state.publications, links: state.pressLinks }) },
  ];
  const deletions = toRepoPaths(deleteSrcs);
  if (process.env.GITHUB_TOKEN) {
    await writeGithub(files, message, deletions);
    return;
  }
  if (process.env.VERCEL) {
    throw new Error(
      "На Vercel задайте GITHUB_TOKEN (право repo), GITHUB_REPO=rednaxelavoroge/Anna_photo и GITHUB_BRANCH — иначе сохранения не попадут в GitHub",
    );
  }
  await writeLocal(files, deletions);
}

export async function saveUpload(filename: string, data: Buffer) {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
  const rel = `public/photos/uploads/${Date.now()}-${safe}`;
  if (process.env.GITHUB_TOKEN) {
    await writeGithub([{ path: rel, content: data }], `Фото: ${safe}`);
  } else if (process.env.VERCEL) {
    throw new Error(
      "На Vercel задайте GITHUB_TOKEN (право repo) — иначе загруженные фото не сохранятся в GitHub",
    );
  } else {
    await writeLocal([{ path: rel, content: data }]);
  }
  return `/${rel.replace(/^public\//, "")}`;
}

/** Все файлы под public/photos: локально — с диска, на хостинге — из репозитория. */
async function listRepoPhotos(): Promise<string[]> {
  let githubError: string | null = null;
  if (process.env.GITHUB_TOKEN) {
    const url = `https://api.github.com/repos/${githubRepo()}/git/trees/${encodeURIComponent(githubBranch())}?recursive=1`;
    const res = await fetch(url, { headers: githubHeaders(), cache: "no-store" }).catch(() => null);
    if (res?.ok) {
      const json = (await res.json()) as { tree: { path: string; type: string }[] };
      return json.tree
        .filter((item) => item.type === "blob" && item.path.startsWith("public/photos/") && MEDIA_EXT.test(item.path))
        .map((item) => item.path.replace(/^public/, ""));
    }
    githubError = `GitHub tree: ${res ? res.status : "нет связи"}`;
  }
  // Репозиторий недоступен или токена нет — смотрим папки рядом, как readText.
  const root = path.join(process.cwd(), "public", "photos");
  const out: string[] = [];
  async function walk(dir: string) {
    let entries: import("node:fs").Dirent[] = [];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(abs);
      else if (MEDIA_EXT.test(entry.name)) out.push(`/photos/${path.relative(root, abs).split(path.sep).join("/")}`);
    }
  }
  await walk(root);
  if (out.length === 0 && githubError) throw new Error(githubError);
  return out;
}

const byName = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });

/**
 * Файлы, которые лежат в папках, но в данных панели не упомянуты: положили
 * через git, а не через панель. Сайт их и так показывает в конце раздела,
 * панель предлагает подобрать их и сделать обычными кадрами.
 */
export async function scanUnlisted(state: StudioState): Promise<Unlisted> {
  const all = await listRepoPhotos();
  const known = new Set<string>([
    ...state.photos.flatMap((item) => (item.images?.length ? item.images : [item.src])),
    ...state.backstage.map((item) => item.src),
    ...Object.values(state.galleries).flatMap((list) => list.map((item) => item.src)),
    ...state.publications.flatMap((pub) => pub.images ?? []),
    ...state.categories.map((category) => category.cover ?? ""),
    state.site.portrait ?? "",
    state.site.phototour.cover ?? "",
  ]);
  const inFolder = (folder: string) =>
    all.filter((src) => src.startsWith(`/photos/${folder}/`) && !src.slice(`/photos/${folder}/`.length).includes("/") && !known.has(src)).sort(byName);

  const photos: Record<string, string[]> = {};
  for (const category of state.categories) {
    const list = inFolder(folderOfCategory(category.slug));
    if (list.length) photos[category.slug] = list;
  }
  return {
    photos,
    backstage: inFolder("backstage"),
    galleries: {
      reviews: inFolder("reviews"),
      workshops: inFolder("workshops"),
      press: inFolder("press"),
    },
  };
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
