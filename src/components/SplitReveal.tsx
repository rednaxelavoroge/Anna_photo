"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useLayoutEffect, useRef, type ReactNode } from "react";

type SplitRevealProps = {
  wordLeft: string;
  wordRight: string;
  children: ReactNode;
};

// Unbounded 400 + tracking -0.05em: «МАНАСАРЯН» ≈ 7.68em. Size to that so the
// longer word fills the half without kissing the viewport edge.
const WORD_CLASS =
  "inline-block whitespace-nowrap font-display leading-[0.78] tracking-[-0.05em] text-ink select-none text-[min(16svh,calc((50vw-1.5rem)/7.72))]";

export function SplitReveal({ wordLeft, wordRight, children }: SplitRevealProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const leftWordRef = useRef<HTMLSpanElement>(null);
  const rightWordRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const leftX = useTransform(scrollYProgress, [0.02, 0.38], ["0%", "-102%"]);
  const rightX = useTransform(scrollYProgress, [0.02, 0.38], ["0%", "102%"]);
  const revealOpacity = useTransform(scrollYProgress, [0.06, 0.28], [0, 1]);
  const revealScale = useTransform(scrollYProgress, [0.06, 0.38], [0.97, 1]);
  const openScale = useTransform(scrollYProgress, (progress) => {
    const t = Math.min(1, Math.max(0, (progress - 0.02) / 0.36));
    const remaining = Math.max(0, 1 - 1.02 * t);
    return Math.min(1, remaining / 0.98);
  });
  const wordOpacity = useTransform(scrollYProgress, [0.26, 0.38], [1, 0]);

  useLayoutEffect(() => {
    if (reduced) return;

    const leftPane = leftPaneRef.current;
    const rightPane = rightPaneRef.current;
    const leftWord = leftWordRef.current;
    const rightWord = rightWordRef.current;
    if (!leftPane || !rightPane || !leftWord || !rightWord) return;

    const fit = () => {
      leftWord.style.fontSize = "";
      rightWord.style.fontSize = "";
      const inset = Math.max(10, Math.min(leftPane.clientWidth, rightPane.clientWidth) * 0.04);
      const avail = Math.min(leftPane.clientWidth, rightPane.clientWidth) - inset;
      const widest = Math.max(leftWord.scrollWidth, rightWord.scrollWidth, 1);
      if (widest <= avail) return;

      const current = parseFloat(getComputedStyle(leftWord).fontSize);
      const next = `${Math.max(20, current * (avail / widest))}px`;
      leftWord.style.fontSize = next;
      rightWord.style.fontSize = next;
    };

    fit();
    void document.fonts?.ready.then(fit);
    const observer = new ResizeObserver(fit);
    observer.observe(leftPane);
    observer.observe(rightPane);
    return () => observer.disconnect();
  }, [reduced, wordLeft, wordRight]);

  if (reduced) {
    return (
      <section className="bg-paper px-5 py-24 text-ink md:px-8">
        <p className="font-display text-4xl leading-none tracking-[-0.04em] md:text-6xl">
          {wordLeft} {wordRight}
        </p>
        <div className="mt-12">{children}</div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative h-[165vh] bg-paper">
      <div className="sticky top-0 flex h-svh items-center overflow-hidden">
        <motion.div
          style={{ opacity: revealOpacity, scale: revealScale }}
          className="w-full will-change-transform"
        >
          {children}
        </motion.div>

        <motion.div
          ref={leftPaneRef}
          aria-hidden="true"
          style={{ x: leftX }}
          className="pointer-events-none absolute inset-y-0 left-0 flex w-1/2 items-center justify-end border-r border-line bg-paper pr-[0.08em] pl-[clamp(0.7rem,2.6vw,1.6rem)] will-change-transform"
        >
          <motion.span
            style={{ scale: openScale, opacity: wordOpacity }}
            className="origin-right inline-block will-change-transform"
          >
            <span ref={leftWordRef} className={`${WORD_CLASS} -translate-y-[0.42em]`}>
              {wordLeft}
            </span>
          </motion.span>
        </motion.div>

        <motion.div
          ref={rightPaneRef}
          aria-hidden="true"
          style={{ x: rightX }}
          className="pointer-events-none absolute inset-y-0 right-0 flex w-1/2 items-center justify-start bg-paper pl-[0.08em] pr-[clamp(0.7rem,2.6vw,1.6rem)] will-change-transform"
        >
          <motion.span
            style={{ scale: openScale, opacity: wordOpacity }}
            className="origin-left inline-block will-change-transform"
          >
            <span ref={rightWordRef} className={`${WORD_CLASS} translate-y-[0.42em]`}>
              {wordRight}
            </span>
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
}
