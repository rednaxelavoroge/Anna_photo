/**
 * Обложки роликов: рядом с каждым `имя.mp4` кладётся `имя.jpg` — кадр с
 * половины секунды.
 *
 * Зачем. Проигрыватель без обложки рисует чёрный прямоугольник: браузер сам
 * кадр не показывает, пока ролик не тронули. Из-за этого в панели половина
 * «Бэкстейджа» была чёрной — это не поломанные файлы, это 29 роликов из 49.
 * Обложка — обычная картинка в 40 КБ, её видно сразу, ничего не декодируя и
 * не скачивая ролик.
 *
 * Полсекунды, а не начало: первый кадр у телефонных роликов часто чёрный.
 *
 * Кадр выбирается не вслепую: пробуем несколько мест ролика и берём самый
 * светлый. Иначе у клипа, который начинается в темноте, обложка выходит
 * чёрной — то есть ровно тем, от чего уходим.
 *
 * Запуск: `node tools/make-posters.mjs` (нужен ffmpeg). Готовые обложки не
 * трогает — можно запускать сколько угодно раз.
 *   `--force`            — перезаписать существующие;
 *   `--file <путь>`      — сделать обложку одному ролику (так её делает
 *                          рабочий процесс сжатия для каждого нового).
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..", "public");
const VIDEO = /\.(mp4|mov|webm|m4v)$/i;
const force = process.argv.includes("--force");
const fileFlag = process.argv.indexOf("--file");
const only = fileFlag > -1 ? process.argv[fileFlag + 1] : "";

/** Где искать кадр: начало, но не самое; дальше — если ролик длинный. */
const SPOTS = [0.5, 2, 5, 10];

function seconds(video) {
  try {
    const out = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video]);
    const value = Number(String(out).trim());
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

/** Средняя яркость кадра, 0–255. По ней и выбираем, какой кадр брать. */
function brightness(file) {
  try {
    const raw = execFileSync("ffmpeg", ["-v", "error", "-i", file, "-vf", "scale=8:8,format=gray", "-f", "rawvideo", "-"], {
      maxBuffer: 1 << 20,
    });
    if (!raw.length) return 0;
    return raw.reduce((sum, value) => sum + value, 0) / raw.length;
  } catch {
    return 0;
  }
}

function grab(video, at, out) {
  execFileSync("ffmpeg", [
    "-nostdin", "-v", "error", "-y",
    ...(at ? ["-ss", String(at)] : []),
    "-i", video,
    "-frames:v", "1",
    "-vf", "scale='min(640,iw)':-2",
    "-q:v", "4",
    out,
  ]);
}

/** Обложка одному ролику: самый светлый кадр из нескольких мест. */
function makePoster(video, poster) {
  const duration = seconds(video);
  const spots = SPOTS.filter((at) => at < duration || duration === 0);
  const tries = spots.length ? spots : [0];
  const temp = `${poster}.try.jpg`;
  let best = -1;

  for (const at of tries) {
    try {
      grab(video, at, temp);
    } catch {
      continue;
    }
    const light = brightness(temp);
    if (light > best) {
      best = light;
      fs.copyFileSync(temp, poster);
    }
    // Кадр уже приличной яркости — дальше искать незачем.
    if (best > 70) break;
  }
  fs.rmSync(temp, { force: true });
  if (best < 0) throw new Error("кадр не вышел");
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (VIDEO.test(entry.name)) out.push(full);
  }
  return out;
}

const videos = only ? [path.resolve(only)] : walk(ROOT).sort();
let made = 0;
let kept = 0;
const failed = [];

for (const video of videos) {
  const poster = video.replace(VIDEO, ".jpg");
  if (!force && fs.existsSync(poster)) {
    kept += 1;
    continue;
  }
  try {
    makePoster(video, poster);
    made += 1;
    console.log(`обложка: ${path.relative(ROOT, poster)}`);
  } catch {
    failed.push(path.relative(ROOT, video));
  }
}

console.log(`\nроликов: ${videos.length}, сделано обложек: ${made}, уже были: ${kept}`);
if (failed.length) {
  console.log("не вышло:", failed.join(", "));
  process.exitCode = 1;
}
