"use client";

import { CoverArt } from "@/components/CoverArt";
import type { Category } from "@/lib/content";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";

export function MeetSections({ categories }: { categories: Category[] }) {
  return (
    <div className="relative bg-paper">
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
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const imageLeft = index % 2 === 0;
  const number = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Встречное выплывание справа и слева.
  // Элементы сходятся в центр (0%) и фиксируются на месте без разлёта в пустую бездну.
  const leftX = useTransform(scrollYProgress, [0.06, 0.32, 1], ["-58%", "0%", "0%"]);
  const rightX = useTransform(scrollYProgress, [0.06, 0.32, 1], ["58%", "0%", "0%"]);

  const image = (
    <Link
      href={`/portfolio/${category.slug}`}
      className="group relative block h-full w-full overflow-hidden bg-void"
      aria-label={`Открыть ${category.menu}`}
    >
      <div className="tile-zoom absolute inset-0">
        <CoverArt slug={category.slug} title={category.menu} src={category.cover} />
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-end justify-start p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:p-6">
        <span className="bg-ink/85 px-3 py-1.5 text-xs tracking-[0.22em] text-snow uppercase backdrop-blur-xs">
          Смотреть альбом →
        </span>
      </div>
    </Link>
  );

  const copy = (
    <div className="flex min-w-0 flex-col justify-center bg-paper px-2.5 py-4 sm:px-8 md:px-12 md:py-10 lg:px-16">
      <p className="eyebrow text-muted">{number}</p>
      <h2 className="mt-2 font-display text-[clamp(0.92rem,3.4vw,2.75rem)] leading-[1.12] text-ink [overflow-wrap:normal] [word-break:keep-all] md:mt-4">
        {category.menu}
      </h2>
      <p className="mt-1.5 text-[11px] leading-relaxed text-muted [overflow-wrap:normal] [word-break:normal] sm:text-xs md:mt-4 md:text-sm md:max-w-md">
        {category.description}
      </p>
      <div className="mt-3 md:mt-6">
        <Link
          href={`/portfolio/${category.slug}`}
          className="link-line inline-flex items-center text-[10px] tracking-[0.18em] uppercase md:text-xs md:tracking-[0.2em]"
        >
          Смотреть альбом →
        </Link>
      </div>
    </div>
  );

  if (reduced) {
    return (
      <section className="border-t border-line">
        <div className="grid md:grid-cols-2 md:min-h-[70svh]">
          <div className={`min-h-[46svh] md:min-h-0 ${imageLeft ? "md:order-1" : "md:order-2"}`}>
            <div className="h-full min-h-[46svh] md:aspect-auto">{image}</div>
          </div>
          <div className={imageLeft ? "md:order-2" : "md:order-1"}>{copy}</div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative h-[115svh] bg-paper">
      <div className="sticky top-0 flex h-svh overflow-hidden">
        <motion.div style={{ x: leftX }} className="flex min-w-0 w-1/2 will-change-transform">
          {imageLeft ? image : copy}
        </motion.div>
        <motion.div style={{ x: rightX }} className="flex min-w-0 w-1/2 will-change-transform">
          {imageLeft ? copy : image}
        </motion.div>
      </div>
    </section>
  );
}
