import { isAdmin } from "@/lib/admin-auth";
import { loadStudio, saveStudio, scanUnlisted, type StudioState } from "@/lib/admin-store";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

/** GET — данные панели; GET ?scan=1 — файлы в папках, которых панель не знает. */
export async function GET(request: Request) {
  if (!(await isAdmin())) return json({ error: "Нужен вход" }, 401);
  try {
    const state = await loadStudio();
    if (new URL(request.url).searchParams.get("scan") === "1") {
      return json({ unlisted: await scanUnlisted(state) });
    }
    return json(state);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Не удалось прочитать данные" }, 500);
  }
}

/** PUT — сохранить всё; поле deleteFiles — какие файлы убрать из репозитория. */
export async function PUT(request: Request) {
  if (!(await isAdmin())) return json({ error: "Нужен вход" }, 401);
  const body = (await request.json().catch(() => null)) as (StudioState & { deleteFiles?: string[] }) | null;
  if (!body?.categories || !body.photos || !body.site) {
    return json({ error: "Неполные данные" }, 400);
  }
  const { deleteFiles, ...rest } = body;
  const state: StudioState = {
    ...rest,
    tags: rest.tags ?? [],
    backstage: rest.backstage ?? [],
    galleries: {
      reviews: rest.galleries?.reviews ?? [],
      workshops: rest.galleries?.workshops ?? [],
      press: rest.galleries?.press ?? [],
    },
    aboutVideos: rest.aboutVideos ?? [],
    publications: rest.publications ?? [],
    pressLinks: rest.pressLinks ?? [],
  };
  try {
    await saveStudio(state, "Обновление с панели управления", Array.isArray(deleteFiles) ? deleteFiles : []);
    return json({ ok: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Не удалось сохранить" }, 500);
  }
}
