import { getCategories, getSite } from "@/lib/content";
import { isBlogEnabled } from "@/lib/articles";
import Link from "next/link";

export function SiteFooter() {
  const site = getSite();
  const categories = getCategories();
  const showBlog = isBlogEnabled();

  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-16 md:grid-cols-[1.2fr_1fr_1fr] md:px-8">
        <div>
          <p className="font-display text-xl tracking-tight">{site.brand}</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">{site.tagline}</p>
        </div>
        <div>
          <p className="eyebrow">Меню</p>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <Link href="/portfolio">Портфолио</Link>
            <Link href="/training">Обучение</Link>
            <Link href="/backstage">Бэкстейдж</Link>
            <Link href="/reviews">Отзывы</Link>
            <Link href="/about">Обо мне</Link>
            {showBlog ? <Link href="/blog">Статьи</Link> : null}
            <Link href="/contacts">Контакты</Link>
          </div>
        </div>
        <div>
          <p className="eyebrow">Съёмки</p>
          <div className="mt-4 flex flex-col gap-2 text-sm text-muted">
            {categories.map((item) => (
              <Link key={item.slug} href={`/portfolio/${item.slug}`}>
                {item.menu}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 border-t border-line px-5 py-5 text-[11px] tracking-[0.16em] text-muted uppercase md:flex-row md:items-center md:justify-between md:px-8">
        <div>© {new Date().getFullYear()} {site.owner}. Все кадры принадлежат автору.</div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href="/privacy" className="hover:text-ink transition">
            Конфиденциальность
          </Link>
          <Link href="/cookies" className="hover:text-ink transition">
            Cookies
          </Link>
          <Link href="/legal/booking" className="hover:text-ink transition">
            Условия съёмки
          </Link>
        </div>
      </div>
    </footer>
  );
}
