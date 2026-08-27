import { adminPasswordSet, isAdmin, loginAdmin, logoutAdmin } from "@/lib/admin-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { authenticated: await isAdmin() },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { password?: string; action?: string } | null;

  if (body?.action === "logout") {
    await logoutAdmin();
    return NextResponse.json({ ok: true });
  }

  if (!adminPasswordSet()) {
    return NextResponse.json(
      { error: "Пароль панели не задан в настройках — вход закрыт" },
      { status: 500 },
    );
  }

  // Пропуск выдаёт сам admin-auth: там же, где он проверяется, чтобы формат
  // куки и её проверка не разъехались.
  if (!(await loginAdmin(body?.password ?? ""))) {
    return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
