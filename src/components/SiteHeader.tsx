"use client";

import { ThemeSwitch } from "@/components/ThemeSwitch";
import { getSite } from "@/lib/content";
import Link from "next/link";
import { useEffect, useState } from "react";

// «Портфолио» ведёт на список разделов. До 05.09.2026 это была ссылка-якорь
// `/#portfolio` на главную; заказчица попросила убрать «решётку» из адреса,
// поэтому у списка теперь своя страница. Лента всех кадров — /portfolio/all.
//
// «Фототуры» отдельным пунктом больше нет: заказчица попросила убрать его
// внутрь «Путешествий», рядом с Арменией и Италией.
const NAV = [
  { href: "/portfolio", label: "Портфолио" },
  { href: "/training", label: "Обучение" },
  { href: "/backstage", label: "Бэкстейдж" },
  { href: "/reviews", label: "Отзывы" },
  { href: "/about", label: "Обо мне" },
  { href: "/contacts", label: "Контакты" },
];

export function SiteHeader() {
  const site = getSite();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-500 ${
          open || scrolled
            ? "border-b border-line bg-paper"
            : "border-b border-transparent bg-paper/80"
        }`}
      >
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-5 md:px-8">
          <Link
            href="/"
            className="font-display text-sm tracking-[0.18em] text-ink uppercase md:text-base"
          >
            {site.brand}
          </Link>

          <nav aria-label="Основная навигация" className="hidden items-center gap-8 text-[11px] tracking-[0.18em] uppercase lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="link-line text-ink/70 hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
            <ThemeSwitch className="ml-2" />
          </nav>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-ink lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            <span className="sr-only">Меню</span>
            <svg viewBox="0 0 24 24" className="h-6 w-6 stroke-current" fill="none" strokeWidth="1.4">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </header>

      {open ? (
        <div
          id="mobile-nav"
          className="mobile-nav-panel fixed inset-0 z-[100] overflow-y-auto px-6 py-6"
        >
          <div className="flex items-center justify-between border-b border-line pb-5">
            <span className="font-display tracking-[0.16em] text-ink uppercase">{site.brand}</span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Закрыть меню" className="text-ink">
              <svg viewBox="0 0 24 24" className="h-6 w-6 stroke-current" fill="none" strokeWidth="1.4">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex flex-col gap-6 pt-10">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="font-display text-3xl text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-10 flex items-center gap-4 border-t border-line pt-6 text-[11px] tracking-[0.18em] text-muted uppercase">
            <span>Цвет сайта</span>
            <ThemeSwitch />
          </div>
        </div>
      ) : null}
    </>
  );
}
