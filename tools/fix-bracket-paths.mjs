/**
 * Убирает квадратные скобки из путей к скриптам в статической выгрузке.
 *
 * Next кладёт скрипт страницы раздела в папку
 * _next/static/chunks/app/portfolio/[category]/ — по имени маршрута. На
 * хостинге заказчицы такая папка не открывается: проверка живого сайта
 * 04.09.2026 показала 404 на этом файле со всех страниц портфолио, при том
 * что остальные тысяча файлов отдавались нормально. Причина в цепочке
 * FTP → Apache, чинить её на хостинге нечем, поэтому папки переименовываются
 * здесь, после сборки: [category] → _category_, [album] → _album_, и все
 * ссылки на них в HTML и в данных страниц (index.txt) переписываются.
 *
 * В JS-файлах этих путей нет (проверено grep по out/), поэтому они не
 * трогаются: там строки вида "/portfolio/[category]" — образцы маршрутов
 * для роутера, их менять нельзя.
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve(process.argv[2] ?? "out");
const CHUNKS = path.join(OUT, "_next", "static", "chunks");

const renames = [];
function walkDirs(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    walkDirs(full);
    if (/[[\]]/.test(entry.name)) {
      const safe = entry.name.replace(/^\[(.+)\]$/, "_$1_");
      fs.renameSync(full, path.join(dir, safe));
      renames.push([entry.name, safe]);
    }
  }
}
if (fs.existsSync(CHUNKS)) walkDirs(CHUNKS);

if (renames.length === 0) {
  console.log("fix-bracket-paths: папок со скобками нет, ничего не сделано");
  process.exit(0);
}

const encoded = renames.map(([from, to]) => [encodeURIComponent(from), to]);
let touched = 0;
function walkFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full);
      continue;
    }
    if (!/\.(html|txt)$/.test(entry.name)) continue;
    const before = fs.readFileSync(full, "utf8");
    let after = before;
    for (const [from, to] of encoded) after = after.split(from).join(to);
    for (const [from, to] of renames) after = after.split(`/chunks/app/${from}`).join(`/chunks/app/${to}`);
    if (after !== before) {
      fs.writeFileSync(full, after);
      touched += 1;
    }
  }
}
walkFiles(OUT);
console.log(
  `fix-bracket-paths: переименовано папок ${renames.length} (${renames.map(([a, b]) => `${a} → ${b}`).join(", ")}), ссылки поправлены в ${touched} файлах`,
);

const leftovers = [];
function check(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (/[[\]]/.test(entry.name)) leftovers.push(path.join(dir, entry.name));
    if (entry.isDirectory()) check(path.join(dir, entry.name));
  }
}
check(OUT);
if (leftovers.length) {
  console.error("fix-bracket-paths: остались имена со скобками:", leftovers);
  process.exit(1);
}
