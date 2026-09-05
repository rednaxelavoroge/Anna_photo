import type { StudioTag } from "@/lib/content";
import Link from "next/link";

/** Ссылка, которую строка подразделов показывает наравне с метками. */
export type TagStripExtra = { href: string; name: string; active?: boolean };

/**
 * Подразделы внутри раздела портфолио: «Все · Армения · Фототуры…».
 * Показывается, когда у раздела есть кадры с метками или заданы `extras`.
 *
 * `extras` появились 05.09.2026: заказчица попросила убрать «Фототуры» из
 * главного меню и показывать их внутри «Путешествий», рядом с Арменией.
 * Своих кадров у фототуров нет, меткой это не сделать — поэтому отдельная
 * ссылка в той же строке.
 */
export function TagStrip({
  categorySlug,
  tags,
  activeTag,
  extras = [],
}: {
  categorySlug: string;
  tags: StudioTag[];
  activeTag?: string;
  extras?: TagStripExtra[];
}) {
  if (tags.length === 0 && extras.length === 0) return null;
  const base = "shrink-0 rounded-full border px-3 py-1 text-[11px] tracking-[0.14em] uppercase transition-colors";
  const on = "border-ink bg-ink text-snow";
  const off = "border-line text-muted hover:text-ink";
  const allActive = !activeTag && !extras.some((item) => item.active);
  return (
    <nav aria-label="Подразделы" className="tape-page-tags flex shrink-0 items-center gap-2 overflow-x-auto px-5 pb-2 no-scrollbar md:px-8">
      <Link href={`/portfolio/${categorySlug}`} className={`${base} ${allActive ? on : off}`}>
        Все
      </Link>
      {tags.map((tag) => (
        <Link
          key={tag.slug}
          href={`/portfolio/${categorySlug}/${tag.slug}`}
          className={`${base} ${activeTag === tag.slug ? on : off}`}
        >
          {tag.name}
        </Link>
      ))}
      {extras.map((item) => (
        <Link key={item.href} href={item.href} className={`${base} ${item.active ? on : off}`}>
          {item.name}
        </Link>
      ))}
    </nav>
  );
}
