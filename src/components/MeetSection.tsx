"use client";

import { CoverArt } from "@/components/CoverArt";
import type { Category } from "@/lib/content";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";

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
    <div id="portfolio" className="relative bg-paper">
      {categories.map((category, index) => (
        <MeetSection key={category.slug} category={category} index={index} />
      ))}
    </div>
  );
}

function MeetSection({ category, index }: { category: Category; index: number }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const imageLeft = index % 2 === 0;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Десктоп: половины съезжаются плавно всё время, пока раздел поднимается
  // снизу (progress 0 — верх раздела у нижнего края окна, 0.4 — раздел занял
  // экран и прилип). К моменту прилипания они встретились и дальше стоят:
  // разъезд обратно оставлял пустой экран между разделами. Секция 150svh.
  const fromLeft = useTransform(scrollYProgress, [0.02, 0.42, 1], ["-100%", "0%", "0%"]);
  const fromRight = useTransform(scrollYProgress, [0.02, 0.42, 1], ["100%", "0%", "0%"]);
  const imageX = imageLeft ? fromLeft : fromRight;
  const copyX = imageLeft ? fromRight : fromLeft;
  const ease = [0.16, 1, 0.3, 1] as const;

  const image = (
    <Link
      href={`/portfolio/${category.slug}`}
      className="group relative flex h-auto w-full items-center justify-center overflow-hidden bg-paper px-4 pt-2 pb-1 md:h-full md:bg-void md:p-0"
      aria-label={`Открыть ${category.menu}`}
    >
      {category.cover ? (
        <>
          {/* Телефон: рамка по высоте самого кадра, без бежевых полос над и под горизонтальным фото. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={category.cover}
            alt={category.menu}
            className="block max-h-[58svh] w-full object-contain md:hidden"
          />
          <div className="tile-zoom relative hidden h-full w-full md:block">
            <CoverArt slug={category.slug} title={category.menu} src={category.cover} />
          </div>
        </>
      ) : (
        <div className="flex aspect-[3/2] w-full items-center justify-center border border-line px-6 text-center text-[11px] tracking-[0.2em] text-muted uppercase md:aspect-auto md:h-full">
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
    <div className="flex min-h-0 min-w-0 flex-col justify-start bg-paper px-5 pt-3 pb-2 md:h-full md:justify-center md:px-12 md:py-10 lg:px-16">
      <h2 className="font-display text-[clamp(1.35rem,6vw,2rem)] leading-[1.1] text-ink md:text-[clamp(1.6rem,3.2vw,2.75rem)]">
        {category.menu}
      </h2>
      {/* Заказчица сказала, что описания под разделами перепишет сама, а
          какие-то уберёт. Пустое описание не должно оставлять на главной
          пустую строку с отступами. */}
      {category.description ? (
        <p className="mt-2 text-sm leading-relaxed text-muted md:mt-4 md:max-w-md md:text-base">
          {category.description}
        </p>
      ) : null}
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

  // Телефон: без прилипания. Панель во весь экран с контентом на полэкрана
  // давала пустые бежевые экраны между разделами. Здесь разделы идут
  // обычным потоком, кадр въезжает слева и подпись справа, когда попадают
  // в окно.
  const mobile = reduced ? (
    <section className="border-t border-line py-5 md:hidden">
      {image}
      {copy}
    </section>
  ) : (
    // Наблюдение за окном — на секции: сдвинутый на 100% блок стоит за краем
    // экрана, и «в окне» для него самого не наступило бы никогда.
    <motion.section
      className="overflow-hidden border-t border-line py-5 md:hidden"
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.25 }}
    >
      <motion.div
        variants={{ hidden: { x: "-100%", opacity: 0 }, shown: { x: 0, opacity: 1 } }}
        transition={{ duration: 0.75, ease }}
      >
        {image}
      </motion.div>
      <motion.div
        variants={{ hidden: { x: "100%", opacity: 0 }, shown: { x: 0, opacity: 1 } }}
        transition={{ duration: 0.75, ease, delay: 0.1 }}
      >
        {copy}
      </motion.div>
    </motion.section>
  );

  if (reduced) {
    return (
      <>
        {mobile}
        <section className="hidden border-t border-line md:block">
          <div className="grid md:min-h-[80svh] md:grid-cols-2">
            <div className={imageLeft ? "md:order-1" : "md:order-2"}>{image}</div>
            <div className={imageLeft ? "md:order-2" : "md:order-1"}>{copy}</div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {mobile}
      <section ref={sectionRef} className="relative hidden h-[150svh] bg-paper md:block">
        <div className="sticky top-0 flex h-svh overflow-hidden">
          <motion.div
            style={{ x: imageX }}
            className={`h-full w-1/2 will-change-transform ${imageLeft ? "order-1" : "order-2"}`}
          >
            {image}
          </motion.div>
          <motion.div
            style={{ x: copyX }}
            className={`h-full w-1/2 min-w-0 will-change-transform ${imageLeft ? "order-2" : "order-1"}`}
          >
            {copy}
          </motion.div>
        </div>
      </section>
    </>
  );
}
