import { isAdmin } from "@/lib/admin-auth";
import { STALE_STATE, loadStudio, saveStudio, scanUnlisted, type StudioState } from "@/lib/admin-store";
import { refusalText, stateProblems } from "@/lib/state-problems";
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
    articles: {
      enabled: Boolean(rest.articles?.enabled),
      articles: rest.articles?.articles ?? {},
      items: rest.articles?.items ?? [],
    },
  };
  /*
    Проверка перед записью. Раньше сервер смотрел только, что три списка
    вообще пришли: кадр без раздела, ролик без ссылки и подпись, которую
    забыли, уезжали в репозиторий как есть и просто не работали на сайте.
    Молча — а значит, узнавали мы об этом с её слов через сутки.
  */
  const problems = stateProblems(state);
  if (problems.length > 0) {
    return json({ error: refusalText(problems), problems }, 400);
  }

  try {
    const saved = await saveStudio(
      state,
      "Обновление с панели управления",
      Array.isArray(deleteFiles) ? deleteFiles : [],
      body.revision,
    );
    return json({ ok: true, revision: saved.revision });
  } catch (error) {
    // Данные успели измениться под панелью. Это не поломка и не вина
    // человека: 409 говорит панели показать своё окно с «обновить страницу»,
    // а не ронять всё в общую строку ошибки.
    if (error instanceof Error && error.message === STALE_STATE) {
      return json(
        {
          error:
            "Содержимое сайта изменилось с тех пор, как вы открыли панель. Обновите страницу, иначе это сохранение затрёт свежие правки.",
          stale: true,
        },
        409,
      );
    }
    return json({ error: error instanceof Error ? error.message : "Не удалось сохранить" }, 500);
  }
}
