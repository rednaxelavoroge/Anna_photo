import type { TagStripExtra } from "@/components/TagStrip";

/**
 * Ссылки, которые показываются в строке подразделов наравне с метками.
 *
 * Пока такая одна: «Фототуры» внутри «Путешествий». До 05.09.2026 фототуры
 * были отдельным пунктом главного меню; заказчица попросила убрать пункт и
 * держать фототуры там же, где Армения и Италия. Страница `/phototour`
 * осталась на своём адресе — по ней уже есть ссылки снаружи.
 */
export const PHOTOTOUR_CATEGORY = "travel";

export function extrasFor(categorySlug: string, active?: string): TagStripExtra[] {
  if (categorySlug !== PHOTOTOUR_CATEGORY) return [];
  return [{ href: "/phototour", name: "Фототуры", active: active === "phototour" }];
}
