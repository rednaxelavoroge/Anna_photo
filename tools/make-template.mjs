/**
 * Шаблон сайта для другого фотографа.
 *
 * Зачем. Этот репозиторий — сайт Анны: в нём её фотографии (два с половиной
 * гигабайта), её тексты, её адрес и её доступы. Отдавать его целиком другому
 * человеку нельзя ни по содержимому, ни по весу.
 *
 * Скрипт собирает рядом папку `template/` — тот же код, но без чужого:
 * фотографий, роликов, статей, текстов о себе и контактов. Данные заменены
 * пустыми заготовками той же формы, чтобы панель открылась и заработала на
 * новом сайте с первого запуска.
 *
 * Запуск: `node tools/make-template.mjs` — соберёт папку и, если рядом есть
 * zip, ещё и архив `template.zip`.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..");
const OUT = path.join(ROOT, "template");

/** Что уезжает в шаблон как есть. */
const COPY = [
  "src",
  ".github/workflows",  // лишние процессы отсеиваются ниже, в DROP
  "public/fonts",
  "public/.htaccess",
  "next.config.ts",
  "next-env.d.ts",
  "postcss.config.mjs",
  "tsconfig.json",
  "package.json",
  "package-lock.json",
  ".gitignore",
  ".gitattributes",
  ".vercelignore",
  ".env.example",
  "tools/fetch-fonts.mjs",
  "tools/compress-video.mjs",
  "tools/export-namecheap.sh",
  "tools/import-folders.mjs",
  "tools/make-posters.mjs",
  "tools/make-template.mjs",
];

/** Пустые данные той же формы, что у настоящих. */
const DATA = {
  "portfolio.json": {
    categories: [
      { slug: "newborn", menu: "Новорождённые", title: "Фотосессия новорождённых", description: "Первые дни малыша.", keywords: [] },
      { slug: "children", menu: "Детская фотосессия", title: "Детская фотосессия", description: "", keywords: [] },
      { slug: "family", menu: "Семейная фотосессия", title: "Семейная фотосессия", description: "", keywords: [] },
      { slug: "individual", menu: "Съёмка для взрослых", title: "Индивидуальная фотосессия", description: "", keywords: [] },
      { slug: "reportage", menu: "Мероприятия, репортаж", title: "Репортажная съёмка", description: "", keywords: [] },
      { slug: "travel", menu: "Путешествия", title: "Съёмки в путешествиях", description: "", keywords: [] },
    ],
  },
  "tags.json": { items: [] },
  "photo-tags.json": { items: [] },
  "backstage.json": { items: [] },
  "galleries.json": { reviews: [], workshops: [], press: [] },
  "publications.json": { items: [], links: [] },
  "about-videos.json": { items: [] },
  "featured.json": { visible: false, eyebrow: "", title: "", subtitle: "" },
  "reviews.json": { items: [] },
  "workshops.json": { items: [] },
  "site.json": {
    owner: "Имя Фамилия",
    brand: "Name Surname",
    domain: "https://example.com",
    portrait: "",
    heroTitle: "Мои фотографии",
    tagline: "Фотограф — город",
    intro: "Несколько слов о себе для главной страницы.",
    about: { eyebrow: "Обо мне", title: "", lead: "", body: [], note: "", videos: [] },
    training: { title: "Обучение фотографии", lead: "", leadNote: "", stat: "", statNote: "", galleryTitle: "", videos: [] },
    phototour: { eyebrow: "", title: "Фототуры", lead: "", cta: "Написать о фототуре", cover: "" },
    contacts: { facebook: "", whatsapp: "", whatsappDigits: "", phone: "", phoneRussia: "", instagram: "", email: "", city: "" },
  },
};

/**
 * Процессы, которые существуют только у этого сайта: сверка каталога с
 * Яндекс.Диском заказчицы и добор файлов из её архива. Новому владельцу они
 * не нужны, а один из них ещё и ссылается на список, которого в шаблоне нет.
 */
const DROP = [".github/workflows/check-site.yml", ".github/workflows/fetch-archive.yml"];

/**
 * Что заменить в скопированных файлах: имя рабочей ветки и адрес сайта.
 *
 * Ветка здесь важнее, чем кажется: процессы выкладки берут код по имени
 * ветки, и без замены новый репозиторий пытался бы выложить чужой.
 */
const REPLACE = [
  [/cursor\/namecheap-static-f40b/g, "main"],
  [/https:\/\/annamanasaryan\.com/g, "https://example.com"],
  [/annamanasaryan\.com/g, "example.com"],
  [/annamanasaryan\.art/g, "example.art"],
];

function copy(rel) {
  const from = path.join(ROOT, rel);
  const to = path.join(OUT, rel);
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.cpSync(from, to, { recursive: true });
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
COPY.forEach(copy);
DROP.forEach((rel) => fs.rmSync(path.join(OUT, rel), { force: true }));

// Имя ветки и адрес сайта — на нейтральные, чтобы шаблон не тянул чужое.
for (const name of fs.readdirSync(path.join(OUT, ".github/workflows"))) {
  const file = path.join(OUT, ".github/workflows", name);
  const text = REPLACE.reduce((acc, [from, to]) => acc.replace(from, to), fs.readFileSync(file, "utf8"));
  fs.writeFileSync(file, text);
}

// Данные — заготовками. Настоящие в шаблон не едут.
for (const [name, value] of Object.entries(DATA)) {
  fs.writeFileSync(path.join(OUT, "src/data", name), `${JSON.stringify(value, null, 2)}\n`);
}

// Папки под файлы: пустые, но в репозитории видны.
for (const dir of ["public/photos", "public/videos"]) {
  fs.mkdirSync(path.join(OUT, dir), { recursive: true });
  fs.writeFileSync(path.join(OUT, dir, ".gitkeep"), "");
}

fs.writeFileSync(path.join(OUT, "README.md"), fs.readFileSync(path.join(ROOT, "docs/shablon.md"), "utf8"));

const files = execFileSync("bash", ["-c", `find ${JSON.stringify(OUT)} -type f | wc -l`]).toString().trim();
const size = execFileSync("bash", ["-c", `du -sh ${JSON.stringify(OUT)} | cut -f1`]).toString().trim();
console.log(`Шаблон собран: ${OUT}\nфайлов: ${files}, размер: ${size}`);

try {
  execFileSync("bash", ["-c", `cd ${JSON.stringify(ROOT)} && rm -f template.zip && zip -qr template.zip template`]);
  console.log(`Архив: ${path.join(ROOT, "template.zip")}`);
} catch {
  console.log("zip рядом не нашёлся — папка собрана, архив сделайте сами.");
}
