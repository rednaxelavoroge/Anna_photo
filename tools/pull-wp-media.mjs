#!/usr/bin/env node
/**
 * Pulls WordPress media into .wp-export/ for Anna to curate in the cloud.
 * Does not add files to git. Safe to re-run: skips files that already exist.
 *
 *   node tools/pull-wp-media.mjs
 */

import { createWriteStream } from "node:fs";
import { mkdir, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";

const API = "https://www.annamanasaryan.com/wp-json/wp/v2/media";
const OUT = path.join(process.cwd(), ".wp-export");
const UA = "Mozilla/5.0 AnnaPhotoArchive/1.0";
const PER_PAGE = 100;

function safeName(url, id) {
  const raw = decodeURIComponent(url.split("/").pop() || `file-${id}`);
  const clean = raw.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_");
  return `${id}-${clean}`;
}

async function getJson(url) {
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return { json: await res.json(), headers: res.headers };
}

async function download(url, dest) {
  try {
    const existing = await stat(dest);
    if (existing.size > 0) return "skip";
  } catch {
    /* missing */
  }
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok || !res.body) throw new Error(`${res.status} ${url}`);
  await pipeline(res.body, createWriteStream(dest));
  return "ok";
}

async function main() {
  await mkdir(path.join(OUT, "files"), { recursive: true });
  const catalog = [];
  const firstUrl = `${API}?per_page=${PER_PAGE}&page=1&_fields=id,date,mime_type,source_url,alt_text,title`;
  const first = await getJson(firstUrl);
  const total = Number(first.headers.get("x-wp-total") || first.json.length);
  const pages = Number(first.headers.get("x-wp-totalpages") || Math.ceil(total / PER_PAGE));
  console.log(`WordPress media: ${total} files, ${pages} pages`);

  let items = first.json;
  for (let page = 1; page <= pages; page += 1) {
    if (page > 1) {
      const next = await getJson(
        `${API}?per_page=${PER_PAGE}&page=${page}&_fields=id,date,mime_type,source_url,alt_text,title`,
      );
      items = next.json;
    }
    if (!Array.isArray(items)) throw new Error(`Bad page ${page}`);
    for (const item of items) {
      const src = item.source_url;
      if (!src) continue;
      const year = String(item.date || "0000").slice(0, 7);
      const folder = path.join(OUT, "files", year);
      await mkdir(folder, { recursive: true });
      const name = safeName(src, item.id);
      const dest = path.join(folder, name);
      const rel = path.posix.join("files", year, name);
      catalog.push({
        id: item.id,
        date: item.date,
        mime: item.mime_type,
        title: item.title?.rendered || "",
        alt: item.alt_text || "",
        width: "",
        height: "",
        url: src,
        file: rel,
      });
      try {
        const status = await download(src, dest);
        process.stdout.write(`\r${catalog.length}/${total} ${status} ${name.slice(0, 48).padEnd(48)}`);
      } catch (error) {
        console.error(`\nFAIL ${item.id} ${error.message}`);
      }
    }
  }

  const header = "id,date,mime,width,height,title,alt,file,url";
  const rows = catalog.map((row) =>
    [row.id, row.date, row.mime, row.width, row.height, JSON.stringify(row.title), JSON.stringify(row.alt), row.file, row.url].join(","),
  );
  await writeFile(path.join(OUT, "catalog.csv"), `${header}\n${rows.join("\n")}\n`);
  await writeFile(path.join(OUT, "README.txt"), `Архив медиа с WordPress annamanasaryan.com
Скачано: ${catalog.length} файлов
Папки: files/ГГГГ-ММ/
Список: catalog.csv

Как пользоваться:
1. Загрузите всю папку Anna_wordpress_photos (или zip) на Google Drive.
2. Поделитесь ссылкой с Анной.
3. Она отмечает нужные кадры (можно в catalog.csv колонкой keep=yes).
4. Только выбранные файлы кладём на новый сайт — не весь архив в git.
`);
  console.log(`\nDone. ${catalog.length} files in ${OUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
