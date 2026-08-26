import { isAdmin } from "@/lib/admin-auth";
import { loadStudio, saveStudio, type StudioState } from "@/lib/admin-store";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET() {
  if (!(await isAdmin())) return json({ error: "Нужен вход" }, 401);
  try {
    const state = await loadStudio();
    return json(state);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Не удалось прочитать данные" }, 500);
  }
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) return json({ error: "Нужен вход" }, 401);
  const body = (await request.json().catch(() => null)) as StudioState | null;
  if (!body?.categories || !body.photos || !body.featured || !body.site) {
    return json({ error: "Неполные данные" }, 400);
  }
  try {
    await saveStudio(body);
    return json({ ok: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Не удалось сохранить" }, 500);
  }
}
