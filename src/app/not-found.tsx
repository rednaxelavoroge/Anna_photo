import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Страница не найдена",
  robots: { index: false, follow: true },
};

export default function NotFoundPage() {
  return (
    <article className="px-5 pt-28 pb-24 md:px-8">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[0.95] md:text-6xl">
        Такой страницы нет
      </h1>
      <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted md:text-base">
        Адрес мог измениться. Портфолио, тексты к съёмке и контакты на месте.
      </p>
      <div className="mt-10 flex flex-wrap gap-6 text-xs tracking-[0.2em] uppercase">
        <Link href="/" className="link-line">
          На главную
        </Link>
        <Link href="/portfolio" className="link-line">
          Портфолио
        </Link>
        <Link href="/blog" className="link-line">
          Статьи
        </Link>
        <Link href="/contacts" className="link-line">
          Контакты
        </Link>
      </div>
    </article>
  );
}
