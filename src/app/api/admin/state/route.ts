import { isAdmin } from "@/lib/admin-auth";
import { loadStudio, saveStudio, type StudioState } from "@/lib/admin-store";
import { NextResponse } from "next/server";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Нужен вход" }, { status: 401 });
  try {
    const state = await loadStudio();
    return NextResponse.json(state);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Не удалось прочитать данные" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Нужен вход" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as StudioState | null;
  if (!body?.categories || !body.photos || !body.featured || !body.site) {
    return NextResponse.json({ error: "Неполные данные" }, { status: 400 });
  }
  try {
    await saveStudio(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Не удалось сохранить" }, { status: 500 });
  }
}
