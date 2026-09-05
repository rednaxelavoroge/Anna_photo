import { isAdmin } from "@/lib/admin-auth";
import { saveUpload } from "@/lib/admin-store";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Загрузка фотографии из панели.
 *
 * Почему два способа. Изначально файл ехал только строкой base64 внутри JSON.
 * За всё время работы панели в репозитории не появилось ни одного коммита
 * «Фото: …», хотя сохранения текста из той же панели идут исправно и тем же
 * ключом GitHub, — то есть до записи дело не доходило вовсе. Ролики при этом
 * грузятся: они уезжают сырым телом запроса, без JSON и без base64.
 *
 * Поэтому основной путь теперь тот же, что у роликов: файл идёт телом
 * запроса как есть. Это на треть меньше байт (base64 раздувает файл в 4/3)
 * и никакого разбора мегабайтной строки на общем хостинге. Приём JSON
 * оставлен запасным — панель падает на него, если первый способ не прошёл.
 */

/** Столько весит снимок после сжатия в браузере; выше — что-то не так. */
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

function stemOf(raw: string | null | undefined, fallback = "frame") {
  if (!raw) return fallback;
  let name = raw;
  try {
    name = decodeURIComponent(raw);
  } catch {
    // Имя пришло не в процентах — берём как есть.
  }
  return name.replace(/\.[^.]+$/, "").trim() || fallback;
}

async function store(stem: string, ext: string, buffer: Buffer) {
  if (buffer.byteLength === 0) return NextResponse.json({ error: "Пустой файл" }, { status: 400 });
  if (buffer.byteLength > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Файл больше 25 МБ — так фотографии не грузим" }, { status: 413 });
  }
  try {
    const src = await saveUpload(`${stem}.${ext}`, buffer);
    return NextResponse.json({ src });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Загрузка не удалась" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Нужен вход" }, { status: 401 });

  const type = (request.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();

  // Основной путь: файл сырым телом запроса.
  if (EXT[type]) {
    const buffer = Buffer.from(await request.arrayBuffer());
    return store(stemOf(request.headers.get("x-filename")), EXT[type], buffer);
  }

  // Запасной путь: тот же файл строкой внутри JSON.
  const body = (await request.json().catch(() => null)) as { dataUrl?: string; filename?: string } | null;
  const match = (body?.dataUrl ?? "").match(/^data:image\/([\w+.-]+);base64,(.+)$/);
  if (!match) {
    return NextResponse.json(
      { error: `Не понял, что за файл прислали (тип «${type || "не указан"}»)` },
      { status: 400 },
    );
  }
  const ext = EXT[`image/${match[1].toLowerCase()}`] ?? match[1].toLowerCase();
  return store(stemOf(body?.filename), ext, Buffer.from(match[2], "base64"));
}
