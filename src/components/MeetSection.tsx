"use client";

import { CoverArt } from "@/components/CoverArt";
import type { Category } from "@/lib/content";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

export function MeetSections({ categories }: { categories: Category[] }) {
  return (
    <div className="bg-paper">
      {categories.map((category, index) => (
        <MeetSection
          key={category.slug}
          category={category}
          index={index}
          total={categories.length}
        />
      ))}
    </div>
  );
}

function MeetSection({
  category,
  index,
  total,
}: {
  category: Category;
  index: number;
  total: number;
}) {
  const reduced = useReducedMotion();
  const imageLeft = index % 2 === 0;
  const number = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

  const image = (
    <Link
      href={`/portfolio/${category.slug}`}
      className="group relative block w-full overflow-hidden"
      aria-label={`Открыть ${category.menu}`}
    >
      <div className="relative mx-auto aspect-[2/3] h-[40svh] max-h-[340px] w-auto overflow-hidden rounded-xs bg-paper shadow-sm ring-1 ring-ink/10 transition-transform duration-500 group-hover:scale-[1.015] sm:max-h-[380px] md:h-auto md:max-h-[70svh] md:w-full md:max-w-[460px]">
        <CoverArt slug={category.slug} title={category.menu} src={category.cover} contain />
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-end justify-start p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:p-6">
        <span className="bg-ink/85 px-3 py-1.5 text-xs tracking-[0.22em] text-snow uppercase backdrop-blur-xs">
          Смотреть альбом →
        </span>
      </div>
    </Link>
  );

  const copy = (
    <div className="flex flex-col justify-center px-1 py-1 text-center md:text-left sm:px-4 md:px-8 lg:px-12">
      <p className="eyebrow text-muted">{number}</p>
      <h2 className="mt-2 font-display text-xl leading-[1.15] text-ink sm:text-2xl md:text-3xl lg:text-4xl">
        {category.menu}
      </h2>
      <p className="mt-2 max-w-lg text-xs leading-relaxed text-muted sm:text-sm md:mt-3 md:text-base">
        {category.description}
      </p>
      <div className="mt-4 flex justify-center md:justify-start md:mt-6">
        <Link
          href={`/portfolio/${category.slug}`}
          className="link-line inline-flex items-center text-xs tracking-[0.2em] uppercase"
        >
          Смотреть альбом →
        </Link>
      </div>
    </div>
  );

  return (
    <motion.section
      initial={reduced ? undefined : { opacity: 0, y: 24 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="border-t border-line/60 bg-paper py-8 sm:py-12 md:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 md:px-10">
        <div className="grid grid-cols-1 items-center gap-5 sm:gap-6 md:grid-cols-2 md:gap-12 lg:gap-16">
          <div className={imageLeft ? "md:order-1" : "md:order-2"}>
            {image}
          </div>
          <div className={imageLeft ? "md:order-2" : "md:order-1"}>
            {copy}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
