import { isAdmin } from "@/lib/admin-auth";
import { saveUpload } from "@/lib/admin-store";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Нужен вход" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { dataUrl?: string; filename?: string } | null;
  const dataUrl = body?.dataUrl ?? "";
  const match = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match) return NextResponse.json({ error: "Нужно изображение" }, { status: 400 });
  const ext = match[1] === "jpeg" ? "jpg" : match[1];
  const stem = body?.filename?.replace(/\.[^.]+$/, "") || "frame";
  const buffer = Buffer.from(match[2], "base64");
  try {
    const src = await saveUpload(`${stem}.${ext}`, buffer);
    return NextResponse.json({ src });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Загрузка не удалась" }, { status: 500 });
  }
}
