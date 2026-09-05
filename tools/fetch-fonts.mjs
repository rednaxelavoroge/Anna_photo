import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public", "fonts");
const CSS_OUT = join(ROOT, "src", "app", "fonts.css");

// Один шрифт на весь сайт — правка заказчицы 05.09.2026. Manrope убран.
const FAMILIES = [
  "Unbounded:wght@300;400;500;600",
];

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const WANTED_SUBSETS = new Set(["cyrillic", "latin"]);
const url = `https://fonts.googleapis.com/css2?family=${FAMILIES.join("&family=")}&display=swap`;
const css = await fetch(url, { headers: { "user-agent": UA } }).then((r) => {
  if (!r.ok) throw new Error(`Google Fonts ответил ${r.status}`);
  return r.text();
});

await mkdir(OUT_DIR, { recursive: true });

const blocks = css.split("/*").slice(1);
const out = [
  "/** Локальные шрифты. Файл собирает `npm run fonts`, руками не править. */",
  "",
];
let saved = 0;

for (const raw of blocks) {
  const subset = raw.slice(0, raw.indexOf("*/")).trim();
  const body = raw.slice(raw.indexOf("*/") + 2);
  if (!WANTED_SUBSETS.has(subset)) continue;

  const family = body.match(/font-family:\s*'([^']+)'/)?.[1];
  const weight = body.match(/font-weight:\s*(\d+)/)?.[1];
  const style = body.match(/font-style:\s*(\w+)/)?.[1] ?? "normal";
  const src = body.match(/url\((https:[^)]+)\)/)?.[1];
  const range = body.match(/unicode-range:\s*([^;]+);/)?.[1];
  if (!family || !weight || !src) continue;

  const name = `${family.toLowerCase().replace(/\s+/g, "-")}-${weight}-${subset}.woff2`;
  const bytes = Buffer.from(await fetch(src).then((r) => r.arrayBuffer()));
  await writeFile(join(OUT_DIR, name), bytes);
  saved += 1;

  out.push(`@font-face {
  font-family: "${family}";
  font-style: ${style};
  font-weight: ${weight};
  font-display: swap;
  src: url("/fonts/${name}") format("woff2");
  unicode-range: ${range};
}
`);
}

await writeFile(CSS_OUT, out.join("\n"));
console.log(`Saved ${saved} font files → public/fonts`);
