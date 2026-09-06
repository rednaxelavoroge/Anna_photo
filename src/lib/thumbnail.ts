"use client";

/**
 * Мини-копия выбранного файла — та самая картинка, которую панель показывает
 * на месте кадра, пока настоящий файл едет на сайт.
 *
 * Почему копия, а не сам файл. Превью живёт в браузере заказчицы (см.
 * `upload-previews.ts`) и должно пережить обновление страницы, а держать там
 * сотни снимков по полмегабайта — значит однажды упереться в предел хранилища
 * и потерять всё разом. Мини-копия в 512 точек весит 30–60 КБ: сотни таких
 * помещаются свободно.
 *
 * Для ролика мини-копия делается из первого кадра: показать «что залито»
 * иначе нечем, а сам ролик — это десятки мегабайт, их в браузере не хранят.
 */

/** Больше этого превью не нужно: его показывают в клетке шириной 300–400 точек. */
const MAX_SIDE = 512;

/** Качество JPEG. Ниже — заметны квадраты, выше — лишний вес без разницы на глаз. */
const QUALITY = 0.65;

/** Сколько ждать браузер, читающий ролик. Дольше — значит он его не осилил. */
const VIDEO_TIMEOUT_MS = 10000;

function fit(width: number, height: number) {
  if (width <= MAX_SIDE && height <= MAX_SIDE) return { width, height };
  return width > height
    ? { width: MAX_SIDE, height: Math.max(1, Math.round((height * MAX_SIDE) / width)) }
    : { width: Math.max(1, Math.round((width * MAX_SIDE) / height)), height: MAX_SIDE };
}

function draw(source: CanvasImageSource, width: number, height: number): Promise<Blob | null> {
  const size = fit(width, height);
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);
  ctx.drawImage(source, 0, 0, size.width, size.height);
  return new Promise((resolve) => {
    if (typeof canvas.toBlob !== "function") return resolve(null);
    canvas.toBlob(resolve, "image/jpeg", QUALITY);
  });
}

/** Мини-копия фотографии. Не вышло — null, панель просто обойдётся без превью. */
export async function imageThumb(source: Blob): Promise<Blob | null> {
  try {
    // createImageBitmap разбирает файл в стороне от главного потока: выбор
    // двадцати снимков разом не подвешивает панель.
    if (typeof createImageBitmap === "function") {
      const bitmap = await createImageBitmap(source);
      try {
        return await draw(bitmap, bitmap.width, bitmap.height);
      } finally {
        bitmap.close?.();
      }
    }
  } catch {
    // Старый браузер или формат, который он так не читает, — идём длинным путём.
  }

  const url = URL.createObjectURL(source);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const node = new Image();
      node.onload = () => resolve(node);
      node.onerror = () => reject(new Error("не читается"));
      node.src = url;
    });
    return await draw(image, image.naturalWidth, image.naturalHeight);
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Первый кадр ролика.
 *
 * С телефона приходит `.mov`, и его кодек браузер знает не всегда: тогда
 * кадра не будет, и это не поломка — панель покажет ролик значком, как
 * показывала раньше. Поэтому здесь всё обёрнуто в срок ожидания: подвиснуть
 * на нечитаемом файле нельзя, человек ждёт загрузку.
 */
export async function videoThumb(source: Blob): Promise<Blob | null> {
  const url = URL.createObjectURL(source);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "metadata";
  // Без этого Safari на телефоне отказывается готовить кадр невидимого ролика.
  video.setAttribute("muted", "");
  video.src = url;

  const wait = (event: string) =>
    new Promise<boolean>((resolve) => {
      const timer = window.setTimeout(() => resolve(false), VIDEO_TIMEOUT_MS);
      const done = (ok: boolean) => () => {
        window.clearTimeout(timer);
        resolve(ok);
      };
      video.addEventListener(event, done(true), { once: true });
      video.addEventListener("error", done(false), { once: true });
    });

  try {
    if (!(await wait("loadeddata"))) return null;
    // Первый кадр часто чёрный — берём чуть позже, но не дальше трети ролика,
    // чтобы у совсем коротких клипов не уехать в конец.
    const at = Math.min(0.6, (Number.isFinite(video.duration) ? video.duration : 1) / 3);
    if (at > 0) {
      video.currentTime = at;
      await wait("seeked");
    }
    if (!video.videoWidth || !video.videoHeight) return null;
    return await draw(video, video.videoWidth, video.videoHeight);
  } catch {
    return null;
  } finally {
    video.src = "";
    URL.revokeObjectURL(url);
  }
}
