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
        <CoverArt slug={category.slug} title={category.menu} src={category.cover} />
      </div>
      <div className="absolute inset-0 flex items-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:p-8">
        <span className="text-xs tracking-[0.22em] text-snow uppercase">Открыть →</span>
      </div>
    </Link>
  );

  const copy = (
    <div className="flex min-w-0 flex-col justify-center bg-paper px-3 py-6 sm:px-5 md:px-12 md:py-10 lg:px-16">
      <p className="eyebrow">{number}</p>
      <h2 className="mt-3 font-display text-[clamp(1.05rem,3.8vw,3rem)] leading-[1.12] text-ink [overflow-wrap:normal] [word-break:keep-all] md:mt-4">
        {category.menu}
      </h2>
      <p className="mt-3 text-[0.78rem] leading-relaxed text-muted [overflow-wrap:normal] [word-break:normal] md:mt-5 md:max-w-md md:text-base">
        {category.description}
      </p>
      <Link
        href={`/portfolio/${category.slug}`}
        className="link-line mt-5 w-fit text-[10px] tracking-[0.18em] uppercase md:mt-8 md:text-xs md:tracking-[0.22em]"
      >
        Смотреть ленту
      </Link>
    </div>
  );

  if (reduced) {
    return (
      <section className="border-t border-line">
        <div className="grid md:grid-cols-2 md:min-h-[70svh]">
          <div className={`min-h-[46svh] md:min-h-0 ${imageLeft ? "md:order-1" : "md:order-2"}`}>
            <div className="aspect-[4/5] h-full min-h-[46svh] md:aspect-auto">{image}</div>
          </div>
          <div className={imageLeft ? "md:order-2" : "md:order-1"}>{copy}</div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative h-[145svh] bg-paper">
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
