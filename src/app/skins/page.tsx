import { THEME_LABELS, THEME_SWATCHES, THEMES } from "@/lib/theme";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Выбор цвета сайта",
  robots: { index: false, follow: false },
};

const NOTES: Record<string, string> = {
  beige: "Тёплая бумага, как сейчас. Мягкий кремовый пол под кадрами.",
  white: "Чистый белый. Галерея без желтизны, максимальный свет.",
  gray: "Светлый нейтральный серый с вашего кружка. Не коричневый и не тёмный.",
  black: "Чистый чёрный. Модная витрина, максимальный контраст.",
};

export default function SkinsPage() {
  return (
    <div className="min-h-svh bg-paper px-5 pt-28 pb-24 text-ink md:px-8">
      <p className="eyebrow">Превью для выбора</p>
      <h1 className="mt-4 max-w-2xl font-display text-3xl md:text-5xl">Четыре фона. Один сайт.</h1>
      <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted">
        Откройте каждый вариант, полистайте главную и портфолио, потом напишите какой оставить.
      </p>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {THEMES.map((id) => (
          <Link
            key={id}
            href={`/?theme=${id}`}
            className="border border-line bg-snow p-6 transition-colors hover:border-ink"
          >
            <span
              className="mb-5 block h-16 border border-line"
              style={{ background: THEME_SWATCHES[id] }}
              aria-hidden="true"
            />
            <p className="font-display text-2xl">{THEME_LABELS[id]}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{NOTES[id]}</p>
            <p className="mt-8 text-[11px] tracking-[0.16em] uppercase">Открыть →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
