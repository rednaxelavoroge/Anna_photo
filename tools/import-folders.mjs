// Перенос содержимого папок public/photos в данные панели.
//
// Сайт раньше читал фотографии прямо из папок, а панель знала только про
// девятнадцать «кадров»-заглушек. Теперь всё, что лежит в папках, становится
// записями в src/data: кадры портфолио — в photo-tags.json (с разделом по
// имени папки), отзывы, воркшопы и фотоархив прессы — в galleries.json,
// бэкстейдж — в backstage.json. Порядок — как в папке (по имени, с числами).
//
// Запускать повторно безопасно: файлы, которые уже есть в данных, не
// дублируются, новые дописываются в конец своего раздела.
//
//   node tools/import-folders.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");
const PHOTOS = path.join(ROOT, "public", "photos");
const MEDIA = /\.(jpe?g|png|webp|avif|mp4|webm|mov)$/i;
const FOLDER_ALIASES = { bloom: "blooming", product: "objects" };

const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
const write = (rel, data) => fs.writeFileSync(path.join(ROOT, rel), `${JSON.stringify(data, null, 2)}\n`);

function listDir(name) {
  const dir = path.join(PHOTOS, name);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => MEDIA.test(file) && fs.statSync(path.join(dir, file)).isFile())
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
    .map((file) => `/photos/${name}/${file}`);
}

// --- Кадры портфолио ---
const portfolio = read("src/data/portfolio.json");
const photoTags = read("src/data/photo-tags.json");
const items = photoTags.items ?? [];
const known = new Set(items.flatMap((item) => (item.images?.length ? item.images : [item.src])));
let addedPhotos = 0;
for (const category of portfolio.categories) {
  const folder = FOLDER_ALIASES[category.slug] ?? category.slug;
  const files = listDir(folder).filter((src) => !known.has(src));
  files.forEach((src, index) => {
    known.add(src);
    items.push({
      src,
      alt: `${category.menu} — ${index + 1}`,
      categories: [category.slug],
      // Путешествия пока только по Армении — сразу метка «Армения».
      tags: category.slug === "travel" ? ["armeniya"] : [],
      images: [src],
    });
    addedPhotos += 1;
  });
}
write("src/data/photo-tags.json", { items });
console.log(`кадры портфолио: +${addedPhotos}, всего ${items.length}`);

// --- Галереи ---
const galleriesPath = "src/data/galleries.json";
const galleries = fs.existsSync(path.join(ROOT, galleriesPath))
  ? read(galleriesPath)
  : { reviews: [], workshops: [], press: [] };
const publications = read("src/data/publications.json");
const takenByPublications = new Set((publications.items ?? []).flatMap((pub) => pub.images ?? []));
const GALLERY_FOLDERS = {
  reviews: { folder: "reviews", alt: "Отзыв" },
  workshops: { folder: "workshops", alt: "Воркшоп" },
  press: { folder: "press", alt: "Выставки и эфиры" },
};
for (const [key, { folder, alt }] of Object.entries(GALLERY_FOLDERS)) {
  const list = galleries[key] ?? [];
  const have = new Set(list.map((item) => item.src));
  let added = 0;
  for (const src of listDir(folder)) {
    if (have.has(src)) continue;
    // Страницы изданий отданы публикациям, в фотоархиве им не место.
    if (key === "press" && takenByPublications.has(src)) continue;
    list.push({ src, alt: `${alt} — ${list.length + 1}` });
    added += 1;
  }
  galleries[key] = list;
  console.log(`${key}: +${added}, всего ${list.length}`);
}
write(galleriesPath, galleries);

// --- Бэкстейдж ---
const backstage = read("src/data/backstage.json");
const bs = backstage.items ?? [];
const haveBs = new Set(bs.map((item) => item.src));
let addedBs = 0;
for (const src of listDir("backstage")) {
  if (haveBs.has(src)) continue;
  bs.push({ src, alt: `Бэкстейдж — ${bs.length + 1}` });
  addedBs += 1;
}
write("src/data/backstage.json", { items: bs });
console.log(`бэкстейдж: +${addedBs}, всего ${bs.length}`);
