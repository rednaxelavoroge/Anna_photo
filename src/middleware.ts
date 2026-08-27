import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (host.startsWith("admin.") && request.nextUrl.pathname === "/") {
    // Адрес собирается из заголовков самого запроса, а не из request.nextUrl.
    // На хостинге заказчицы панель работает за перенаправляющим сервером и о
    // своём внешнем имени не знает: nextUrl там — это внутренний
    // localhost:порт, и заказчица упиралась бы в пустую страницу.
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    return NextResponse.redirect(`${proto}://${host}/admin`, 307);
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
