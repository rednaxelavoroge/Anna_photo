import type { StudioTag } from "@/lib/content";
import Link from "next/link";

/**
 * Подразделы внутри раздела портфолио: «Все · Армения · Италия…».
 * Показывается только когда у раздела есть кадры с метками.
 */
export function TagStrip({
  categorySlug,
  tags,
  activeTag,
}: {
  categorySlug: string;
  tags: StudioTag[];
  activeTag?: string;
}) {
  if (tags.length === 0) return null;
  const base = "shrink-0 rounded-full border px-3 py-1 text-[11px] tracking-[0.14em] uppercase transition-colors";
  return (
    <nav aria-label="Подразделы" className="tape-page-tags flex shrink-0 items-center gap-2 overflow-x-auto px-5 pb-2 no-scrollbar md:px-8">
      <Link
        href={`/portfolio/${categorySlug}`}
        className={`${base} ${!activeTag ? "border-ink bg-ink text-snow" : "border-line text-muted hover:text-ink"}`}
      >
        Все
      </Link>
      {tags.map((tag) => (
        <Link
          key={tag.slug}
          href={`/portfolio/${categorySlug}/${tag.slug}`}
          className={`${base} ${activeTag === tag.slug ? "border-ink bg-ink text-snow" : "border-line text-muted hover:text-ink"}`}
        >
          {tag.name}
        </Link>
      ))}
    </nav>
  );
}
