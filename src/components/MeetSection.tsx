"use client";

import { CoverArt } from "@/components/CoverArt";
import type { Category } from "@/lib/content";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";

export function MeetSections({ categories }: { categories: Category[] }) {
  return (
    <div>
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

  const leftX = useTransform(scrollYProgress, [0.08, 0.34, 0.66, 0.9], ["-58%", "0%", "0%", "-58%"]);
  const rightX = useTransform(scrollYProgress, [0.08, 0.34, 0.66, 0.9], ["58%", "0%", "0%", "58%"]);

  const image = (
    <Link
      href={`/portfolio/${category.slug}`}
      className="group relative block h-full w-full overflow-hidden bg-void"
      aria-label={`Открыть ${category.menu}`}
    >
      <div className="tile-zoom absolute inset-0">
        <CoverArt slug={category.slug} title={category.menu} />
      </div>
      <div className="absolute inset-0 flex items-end p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:p-8">
        <span className="text-xs tracking-[0.22em] text-bg uppercase">Открыть →</span>
      </div>
    </Link>
  );

  const copy = (
    <div className="flex h-full flex-col justify-center bg-bg px-5 py-10 md:px-12 lg:px-16">
      <p className="eyebrow">{number}</p>
      <h2 className="mt-4 max-w-md font-display text-3xl leading-[0.95] text-ink md:text-5xl">
        {category.menu}
      </h2>
      <p className="mt-5 max-w-md text-sm leading-relaxed text-muted md:text-base">
        {category.description}
      </p>
      <Link
        href={`/portfolio/${category.slug}`}
        className="link-line mt-8 w-fit text-xs tracking-[0.22em] uppercase"
      >
        Смотреть альбом
      </Link>
    </div>
  );

  if (reduced) {
    return (
      <section className="border-t border-line">
        <div className="grid min-h-[70svh] md:grid-cols-2">
          <div className={imageLeft ? "md:order-1" : "md:order-2"}>{image}</div>
          <div className={imageLeft ? "md:order-2" : "md:order-1"}>{copy}</div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative h-[200svh] bg-bg">
      <div className="sticky top-0 flex h-svh overflow-hidden">
        <motion.div
          style={{ x: leftX }}
          className="flex w-1/2 will-change-transform"
        >
          {imageLeft ? image : copy}
        </motion.div>
        <motion.div
          style={{ x: rightX }}
          className="flex w-1/2 will-change-transform"
        >
          {imageLeft ? copy : image}
        </motion.div>
      </div>
    </section>
  );
}
