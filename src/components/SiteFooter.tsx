import { getCategories, getSite } from "@/lib/content";
import Link from "next/link";

export function SiteFooter() {
  const site = getSite();
  const categories = getCategories();

  return (
    <footer className="border-t border-line bg-bg">
      <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-16 md:grid-cols-[1.2fr_1fr_1fr] md:px-8">
        <div>
          <p className="font-display text-xl tracking-tight">{site.brand}</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">{site.tagline}</p>
        </div>
        <div>
          <p className="eyebrow">Меню</p>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <Link href="/portfolio">Портфолио</Link>
            <Link href="/backstage">Бэкстейджи</Link>
            <Link href="/about">Обо мне</Link>
            <Link href="/training">Обучение</Link>
            <Link href="/reviews">Отзывы</Link>
            <Link href="/contacts">Контакты</Link>
            <Link href="/phototour">Фототур в Армению</Link>
          </div>
        </div>
        <div>
          <p className="eyebrow">Альбомы</p>
          <div className="mt-4 flex flex-col gap-2 text-sm text-muted">
            {categories.map((item) => (
              <Link key={item.slug} href={`/portfolio/${item.slug}`}>
                {item.menu}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-line px-5 py-5 text-[11px] tracking-[0.16em] text-muted uppercase md:px-8">
        © {new Date().getFullYear()} {site.owner}. Все кадры принадлежат автору.
      </div>
    </footer>
  );
}
