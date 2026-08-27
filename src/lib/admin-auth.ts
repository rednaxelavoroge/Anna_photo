import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Пароль панели живёт только в переменной окружения: на хостинге он задан
 * в карточке приложения Node.js в cPanel, на Vercel — в Environment Variables.
 *
 * Запасного значения в коде нет намеренно. Раньше здесь стояло «anna» для
 * разработки, и включалось оно всякий раз, когда NODE_ENV не равен
 * "production", — то есть достаточно было переключить Application mode в
 * cPanel на Development, чтобы в панель пускало по слову «anna».
 */
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export const ADMIN_COOKIE = "anna_photo_admin";

/** Сколько панель помнит вход. Заказчица заходит с телефона, часто. */
const SESSION_DAYS = 30;

/**
 * Пропуск в панель — подписанный и со сроком, а не один и тот же навсегда.
 *
 * Раньше в куке лежала подпись от пароля и больше ничего: строка не менялась
 * никогда. Значит утёкшая кука пускала в панель вечно, и отобрать её можно
 * было только сменой пароля — а узнать об утечке неоткуда.
 *
 * Теперь в куке лежит срок годности и подпись к нему. Подделать подпись,
 * не зная пароля, нельзя; смена пароля разом закрывает все прежние входы,
 * так что отдельная кнопка «выйти везде» не нужна. Ничего нового задавать
 * в настройках хостинга не потребовалось.
 */
function sign(payload: string): string {
  return createHmac("sha256", ADMIN_PASSWORD || "").update(payload).digest("base64url");
}

function makeToken(): string {
  const until = String(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  return `${until}.${sign(until)}`;
}

/**
 * Сравнение, не выдающее ответ временем.
 *
 * Обычное `===` останавливается на первом несовпавшем знаке, и по тому,
 * насколько быстро пришёл отказ, подпись можно подбирать по одному знаку.
 * Разница исчезающе мала, но именно на «исчезающе малом» такие проверки
 * и ломают.
 */
function sameString(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function validToken(token: string | undefined): boolean {
  if (!token || !ADMIN_PASSWORD) return false;

  const split = token.lastIndexOf(".");
  if (split <= 0) return false;

  const until = token.slice(0, split);
  if (!sameString(token.slice(split + 1), sign(until))) return false;

  // Подпись сошлась — значит сроку можно верить, его подписывали тем же ключом.
  const expires = Number(until);
  return Number.isFinite(expires) && expires > Date.now();
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return validToken(jar.get(ADMIN_COOKIE)?.value);
}

export async function loginAdmin(password: string): Promise<boolean> {
  if (!ADMIN_PASSWORD) {
    // Лучше не пустить никого, чем пустить всех. В журнале хостинга будет
    // видно, почему вход перестал работать: переменную забыли задать.
    console.error("ADMIN_PASSWORD не задан — вход в панель закрыт.");
    return false;
  }

  if (!sameString(password, ADMIN_PASSWORD)) return false;

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, makeToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return true;
}

export async function logoutAdmin(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

/** Задан ли пароль вообще — чтобы вход мог сказать об этом внятно. */
export function adminPasswordSet(): boolean {
  return Boolean(ADMIN_PASSWORD);
}
