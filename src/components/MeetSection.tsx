"use client";

import { CoverArt } from "@/components/CoverArt";
import type { Category } from "@/lib/content";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * Разделы портфолио на главной: кадр и подпись выезжают навстречу друг другу
 * по скроллу, встречаются и остаются, пока следующий раздел не наедет сверху.
 *
 * Широкий экран: две половины, кадр слева или справа через одну. Телефон:
 * кадр сверху на всю ширину, подпись под ним — половина экрана шириной
 * 195 px давала ту самую «обрезку 1:4», от которой заказчица отказалась.
 * На широком экране кадр заполняет половину под обрез, как было с первой
 * версии (заказчику так нравится); на телефоне показан целиком на бежевом.
 */
export function MeetSections({ categories }: { categories: Category[] }) {
  return (
    <div className="relative bg-paper">
      {categories.map((category, index) => (
        <MeetSection key={category.slug} category={category} index={index} total={categories.length} />
      ))}
    </div>
  );
}

function useWide() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setWide(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return wide;
}

function MeetSection({ category, index, total }: { category: Category; index: number; total: number }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const wide = useWide();
  const imageLeft = index % 2 === 0;
  const number = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Съезжаются к центру и остаются: разъезд обратно оставлял пустой экран
  // между разделами, заказчица просила, чтобы разделы шли друг за другом.
  const fromLeft = useTransform(scrollYProgress, [0.05, 0.3, 1], ["-58%", "0%", "0%"]);
  const fromRight = useTransform(scrollYProgress, [0.05, 0.3, 1], ["58%", "0%", "0%"]);
  // На телефоне кадр сверху всегда едет слева, подпись снизу — справа.
  const imageX = wide && !imageLeft ? fromRight : fromLeft;
  const copyX = wide && !imageLeft ? fromLeft : fromRight;

  const image = (
    <Link
      href={`/portfolio/${category.slug}`}
      className="group relative flex h-full w-full items-center justify-center overflow-hidden bg-paper px-4 pt-2 pb-1 md:bg-void md:p-0"
      aria-label={`Открыть ${category.menu}`}
    >
      {category.cover ? (
        <div className="tile-zoom relative h-full w-full">
          <CoverArt slug={category.slug} title={category.menu} src={category.cover} contain coverFromMd />
        </div>
      ) : (
        <div className="flex aspect-[2/3] h-full max-w-full items-center justify-center border border-line px-6 text-center text-[11px] tracking-[0.2em] text-muted uppercase">
          Раздел наполняется
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 hidden items-end justify-start p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:flex">
        <span className="bg-ink/85 px-3 py-1.5 text-xs tracking-[0.22em] text-snow uppercase backdrop-blur-xs">
          Смотреть альбом →
        </span>
      </div>
    </Link>
  );

  const copy = (
    <div className="flex min-h-0 min-w-0 flex-col justify-start bg-paper px-5 pt-4 pb-6 md:h-full md:justify-center md:px-12 md:py-10 lg:px-16">
      <p className="eyebrow text-muted">{number}</p>
      <h2 className="mt-2 font-display text-[clamp(1.35rem,6vw,2rem)] leading-[1.1] text-ink md:mt-4 md:text-[clamp(1.6rem,3.2vw,2.75rem)]">
        {category.menu}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted md:mt-4 md:max-w-md md:text-base">
        {category.description}
      </p>
      <div className="mt-3 md:mt-6">
        <Link
          href={`/portfolio/${category.slug}`}
          className="link-line inline-flex items-center text-[11px] tracking-[0.18em] uppercase md:text-xs md:tracking-[0.2em]"
        >
          Смотреть альбом →
        </Link>
      </div>
    </div>
  );

  if (reduced) {
    return (
      <section className="border-t border-line">
        <div className="grid md:min-h-[80svh] md:grid-cols-2">
          <div className={`h-[56svh] md:h-auto ${imageLeft ? "md:order-1" : "md:order-2"}`}>{image}</div>
          <div className={imageLeft ? "md:order-2" : "md:order-1"}>{copy}</div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative h-[120svh] bg-paper md:h-[135svh]">
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden pt-[4.5rem] md:flex-row md:pt-0">
        <motion.div
          style={{ x: imageX }}
          className={`h-[54svh] w-full shrink-0 will-change-transform md:h-full md:w-1/2 ${imageLeft ? "md:order-1" : "md:order-2"}`}
        >
          {image}
        </motion.div>
        <motion.div
          style={{ x: copyX }}
          className={`min-h-0 w-full flex-1 will-change-transform md:h-full md:w-1/2 ${imageLeft ? "md:order-2" : "md:order-1"}`}
        >
          {copy}
        </motion.div>
      </div>
    </section>
  );
}
