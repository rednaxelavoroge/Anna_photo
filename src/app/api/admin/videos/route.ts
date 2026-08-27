import { isAdmin } from "@/lib/admin-auth";
import { githubBranch, githubRepo } from "@/lib/admin-store";
import { NextResponse } from "next/server";

/**
 * Загрузка ролика в кадр.
 *
 * Заказчица снимает на телефон: клип весит 10–40 МБ. На сайт такое класть
 * нельзя — страница будет грузиться минуту, — а сжать на месте нечем: на
 * общем хостинге нет ffmpeg, да и перекодировать сорок мегабайт ему нечем.
 *
 * Поэтому исходник уезжает в GitHub, а сжимает его машина сборки: там ffmpeg
 * есть. Готовый ролик она кладёт в каталог, и он попадает на сайт обычной
 * выкладкой — как любое сохранение из панели.
 *
 * Пока панель жила на Vercel, ролик не пролезал вовсе: там был предел 3,5 МБ
 * на тело запроса. После переезда на хостинг предела нет, файл берётся целиком.
 */

/** Куда машина сборки кладёт готовый ролик — туда же, куда панель кладёт фото. */
const VIDEO_DIR = "public/photos/uploads";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

/**
 * Служебный выпуск, через который исходник едет на машину сборки.
 *
 * Почему не коммитом: коммит остаётся в истории навсегда, даже если файл
 * потом удалить. Тридцать роликов по 40 МБ — это гигабайт мёртвого веса,
 * который качается при каждом клонировании. Приложения к выпуску в историю
 * не попадают и удаляются насовсем, поэтому исходник едет так.
 */
const INBOX_TAG = "video-inbox";

/** Рабочий процесс, который сжимает ролик. */
const COMPRESS_WORKFLOW = "compress-video.yml";

/**
 * С какой ветки запускать сжатие. Не с рабочей: запуск процесса через API
 * виден только с ветки по умолчанию, иначе GitHub отвечает «не найдено».
 * В главной ветке лежит короткий файл-вызов, а работу делает процесс из
 * рабочей ветки — он же и код сайта оттуда берёт.
 */
const WORKFLOW_REF = process.env.GITHUB_WORKFLOW_REF || "main";

/**
 * Предел на загрузку. Взят с запасом к тому, что даёт телефон: минута съёмки
 * в 4K — около 350 МБ, но заказчица снимает короткие клипы. Предел нужен не
 * ради площадки, а чтобы случайно выбранный часовой файл не занял память
 * приложения на общем хостинге.
 */
const MAX_UPLOAD_BYTES = 200 * 1024 * 1024;

export const dynamic = "force-dynamic";

/** Чем кончилась обработка — это же кладёт машина сборки. */
type JobResult = { ok: boolean; src?: string; error?: string; sizeMb?: number };

type Release = { id: number; assets: Array<{ id: number; name: string }> };

function gh(url: string, init: RequestInit = {}) {
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
}

/** Служебный выпуск: находим, а если его ещё нет — заводим. */
async function inboxRelease(create: boolean): Promise<Release | null> {
  const found = await gh(`https://api.github.com/repos/${githubRepo()}/releases/tags/${INBOX_TAG}`);
  if (found.ok) return (await found.json()) as Release;
  if (found.status !== 404 || !create) return null;

  const made = await gh(`https://api.github.com/repos/${githubRepo()}/releases`, {
    method: "POST",
    body: JSON.stringify({
      tag_name: INBOX_TAG,
      target_commitish: githubBranch(),
      name: "Исходники роликов",
      body:
        "Служебный выпуск. Сюда панель кладёт ролик как он пришёл с телефона, " +
        "машина сборки забирает его отсюда, сжимает и удаляет. " +
        "Ничего постоянного здесь не хранится, удалять выпуск не нужно.",
      prerelease: true,
    }),
  });
  if (!made.ok) return null;
  return (await made.json()) as Release;
}

async function deleteAsset(id: number): Promise<void> {
  await gh(`https://api.github.com/repos/${githubRepo()}/releases/assets/${id}`, {
    method: "DELETE",
  }).catch(() => undefined);
}

/**
 * Панель спрашивает про судьбу загруженного ролика: пока он сжимается — ждёт,
 * а как только машина сборки закончила, показывает, что вышло.
 */
export async function GET(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Нужен вход" }, { status: 401 });

  const job = new URL(request.url).searchParams.get("job");
  if (!job) {
    return NextResponse.json({ maxUploadBytes: MAX_UPLOAD_BYTES });
  }
  if (!GITHUB_TOKEN) {
    return NextResponse.json({ state: "failed", error: "Нет доступа к хранилищу" });
  }

  const release = await inboxRelease(false);
  if (!release) return NextResponse.json({ state: "working" });

  const result = release.assets.find((item) => item.name === `${job}.result.json`);
  if (!result) return NextResponse.json({ state: "working" });

  const res = await gh(`https://api.github.com/repos/${githubRepo()}/releases/assets/${result.id}`, {
    headers: { Accept: "application/octet-stream" },
  });
  const body = (await res.json().catch(() => ({}))) as JobResult;
  // Ответ прочитан — прибираем за собой, чтобы выпуск не зарастал.
  await deleteAsset(result.id);

  return NextResponse.json(
    body.ok
      ? { state: "done", src: body.src, sizeMb: body.sizeMb }
      : { state: "failed", error: body.error || "Ролик не удалось подготовить" },
  );
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Нужен вход" }, { status: 401 });

  if (!GITHUB_TOKEN) {
    return NextResponse.json(
      { error: "Панель не может отправить ролик: не задан доступ к хранилищу." },
      { status: 500 },
    );
  }

  try {
    /*
      Файл приходит как есть, отдельным полем формы, а не строкой в base64:
      base64 раздувает вес на треть, и сорок мегабайт превращались бы в
      пятьдесят три.
    */
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Файл не пришёл" }, { status: 400 });
    }

    /*
      Тип файла проверяем мягко. Браузер сообщает его сам, но не всегда:
      с телефона `.mov` приходит как `video/quicktime`, а иногда тип пустой —
      значит браузер просто не взялся угадывать. Отвергать такое нельзя:
      человек выбрал ролик, он у него есть. Смотрим и на расширение, а
      окончательно судит машина сборки: она пробует файл прочитать и говорит
      внятно, если это не видео.
    */
    const looksLikeVideo =
      file.type.startsWith("video/") || /\.(mp4|mov|m4v|webm|avi|mkv|3gp)$/i.test(file.name || "");
    if (!looksLikeVideo) {
      return NextResponse.json(
        { error: "Похоже, это не видеофайл. Выберите ролик — mp4 или mov." },
        { status: 400 },
      );
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      const mb = Math.round(file.size / (1024 * 1024));
      return NextResponse.json(
        { error: `Ролик слишком тяжёлый: ${mb} МБ. Панель принимает до 200 МБ.` },
        { status: 413 },
      );
    }

    /*
      Имя чистим до букв, цифр и дефисов: дальше оно едет в имя файла на
      сервере и в рабочий процесс, а имя, пришедшее с чужого телефона,
      доверия не заслуживает. Машина сборки проверит его ещё раз.
    */
    const safeName =
      (file.name || "video")
        .replace(/\.[^.]+$/, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40) || "video";
    const target = `${safeName}-${Date.now()}.mp4`;

    const release = await inboxRelease(true);
    if (!release) {
      return NextResponse.json({ error: "Не удалось подготовить хранилище для ролика" }, { status: 502 });
    }

    // Одноимённое приложение оставаться не должно — GitHub такое отвергает.
    const stale = release.assets.find((item) => item.name === target);
    if (stale) await deleteAsset(stale.id);

    const bytes = Buffer.from(await file.arrayBuffer());
    const sent = await fetch(
      `https://uploads.github.com/repos/${githubRepo()}/releases/${release.id}/assets?name=${encodeURIComponent(target)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
          // Длину не выставляем руками: fetch считает её сам, а поставленная
          // вручную в Node либо игнорируется, либо роняет запрос.
          "Content-Type": "application/octet-stream",
        },
        body: new Uint8Array(bytes),
      },
    );
    if (!sent.ok) {
      console.error("Ролик не доехал до хранилища:", sent.status, await sent.text());
      return NextResponse.json({ error: "Ролик не доехал до хранилища. Попробуйте ещё раз." }, { status: 502 });
    }

    const dispatched = await gh(
      `https://api.github.com/repos/${githubRepo()}/actions/workflows/${COMPRESS_WORKFLOW}/dispatches`,
      { method: "POST", body: JSON.stringify({ ref: WORKFLOW_REF, inputs: { target } }) },
    );
    if (!dispatched.ok) {
      console.error("Не удалось запустить сжатие:", dispatched.status, await dispatched.text());
      return NextResponse.json(
        { error: "Ролик загружен, но обработку запустить не вышло. Напишите разработчику." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, job: target, dir: VIDEO_DIR });
  } catch (error) {
    console.error("Ошибка загрузки ролика:", error);
    return NextResponse.json({ error: "Ошибка загрузки ролика" }, { status: 500 });
  }
}
