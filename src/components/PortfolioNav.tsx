"use client";

import type { Category } from "@/lib/content";
import Link from "next/link";
import { useEffect, useRef } from "react";

type PortfolioNavProps = {
  categories: Category[];
  activeSlug?: string;
  categoryName?: string;
};

export function PortfolioNav({ categories, activeSlug, categoryName }: PortfolioNavProps) {
  const activeItemRef = useRef<HTMLAnchorElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeItemRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeEl = activeItemRef.current;
      const left = activeEl.offsetLeft - container.clientWidth / 2 + activeEl.clientWidth / 2;
      container.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
    }
  }, [activeSlug]);

  return (
    <header className="tape-page-nav">
      <div className="flex items-center justify-between">
        <p className="eyebrow flex items-center gap-2">
          {categoryName ? (
            <>
              <Link href="/portfolio" className="hover:text-ink transition-colors">
                Портфолио
              </Link>
              <span className="text-line">/</span>
              <span className="text-ink font-medium">{categoryName}</span>
            </>
          ) : (
            <span className="text-ink font-medium">Портфолио · Все съёмки</span>
          )}
        </p>
      </div>

      <div className="relative mt-2.5">
        <div
          ref={containerRef}
          className="portfolio-category-strip flex items-center gap-2 overflow-x-auto pb-1 text-[11px] tracking-[0.14em] uppercase no-scrollbar md:flex-wrap md:gap-x-4 md:gap-y-2 md:overflow-visible"
        >
          <Link
            href="/portfolio"
            ref={!activeSlug || activeSlug === "portfolio" ? activeItemRef : undefined}
            className={`shrink-0 rounded-full px-3 py-1.5 transition-all md:rounded-none md:p-0 ${
              !activeSlug || activeSlug === "portfolio"
                ? "bg-ink text-snow font-medium md:bg-transparent md:text-ink md:border-b md:border-ink"
                : "bg-snow/60 text-muted hover:text-ink hover:bg-snow md:bg-transparent md:hover:bg-transparent"
            }`}
          >
            Все кадры
          </Link>

          {categories.map((item) => {
            const isActive = item.slug === activeSlug;
            return (
              <Link
                key={item.slug}
                href={`/portfolio/${item.slug}`}
                ref={isActive ? activeItemRef : undefined}
                className={`shrink-0 rounded-full px-3 py-1.5 transition-all md:rounded-none md:p-0 ${
                  isActive
                    ? "bg-ink text-snow font-medium md:bg-transparent md:text-ink md:border-b md:border-ink"
                    : "bg-snow/60 text-muted hover:text-ink hover:bg-snow md:bg-transparent md:hover:bg-transparent"
                }`}
              >
                {item.menu}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
