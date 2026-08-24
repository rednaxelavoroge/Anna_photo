"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";

type SplitRevealProps = {
  wordLeft: string;
  wordRight: string;
  children: ReactNode;
};

const WORD_CLASS = "split-word";

export function SplitReveal({ wordLeft, wordRight, children }: SplitRevealProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const leftWordRef = useRef<HTMLSpanElement>(null);
  const rightWordRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const intro = useMotionValue(0);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    if (reduced) return;
    const control = animate(intro, 1, {
      duration: 4.2,
      delay: 5.5,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => control.stop();
  }, [intro, reduced]);

  const scrollOpen = useTransform(scrollYProgress, [0.01, 0.40], [0, 1]);
  const openAmount = useTransform([intro, scrollOpen], ([shown, scrolled]) =>
    Math.max(Number(shown), Number(scrolled)),
  );
  const leftX = useTransform(openAmount, [0, 1], ["0%", "-102%"]);
  const rightX = useTransform(openAmount, [0, 1], ["0%", "102%"]);
  const revealOpacity = useTransform(openAmount, [0.05, 0.80], [0, 1]);
  const revealScale = useTransform(openAmount, [0.05, 1], [0.94, 1]);
  const openScale = useTransform(openAmount, (progress) => {
    const remaining = Math.max(0, 1 - 0.95 * progress);
    return Math.min(1, Math.max(0, remaining));
  });
  const wordOpacity = useTransform(openAmount, [0.60, 0.92], [1, 0]);
  const hintOpacity = useTransform(openAmount, [0, 0.25], [1, 0]);

  const handleOpenClick = () => {
    if (reduced) return;
    animate(intro, 1, {
      duration: 2.8,
      ease: [0.16, 1, 0.3, 1],
    });
  };

  useLayoutEffect(() => {
    const leftPane = leftPaneRef.current;
    const rightPane = rightPaneRef.current;
    const leftWord = leftWordRef.current;
    const rightWord = rightWordRef.current;
    if (!leftPane || !rightPane || !leftWord || !rightWord) return;

    const fit = () => {
      const pane = Math.min(leftPane.clientWidth, rightPane.clientWidth);
      const avail = Math.max(28, pane - 16);
      const probe = 180;
      for (const word of [leftWord, rightWord]) {
        word.style.maxWidth = "none";
        word.style.width = "max-content";
        word.style.fontSize = `${probe}px`;
      }
      const widest = Math.max(leftWord.offsetWidth, rightWord.offsetWidth, 1);
      const next = `${Math.max(16, probe * (avail / widest) * 0.96)}px`;
      leftWord.style.fontSize = next;
      rightWord.style.fontSize = next;
    };

    fit();
    requestAnimationFrame(fit);
    void document.fonts?.ready.then(fit);
    const observer = new ResizeObserver(fit);
    observer.observe(leftPane);
    observer.observe(rightPane);
    return () => observer.disconnect();
  }, [wordLeft, wordRight]);

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
    <section ref={sectionRef} className="relative h-[165svh] bg-paper">
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
          onClick={handleOpenClick}
          style={{ x: leftX }}
          className="cursor-pointer absolute inset-y-0 left-0 z-20 flex w-1/2 items-center justify-end overflow-hidden border-r border-line bg-paper pr-[0.08em] pl-[0.45rem] will-change-transform sm:pl-[clamp(0.45rem,1.6vw,1.1rem)]"
        >
          <motion.span
            style={{ scale: openScale, opacity: wordOpacity }}
            className="origin-right inline-block will-change-transform"
          >
            <span ref={leftWordRef} className={WORD_CLASS}>
              {wordLeft}
            </span>
          </motion.span>
        </motion.div>

        <motion.div
          ref={rightPaneRef}
          aria-hidden="true"
          onClick={handleOpenClick}
          style={{ x: rightX }}
          className="cursor-pointer absolute inset-y-0 right-0 z-20 flex w-1/2 items-center justify-start overflow-hidden bg-paper pl-[0.08em] pr-[0.45rem] will-change-transform sm:pr-[clamp(0.45rem,1.6vw,1.1rem)]"
        >
          <motion.span
            style={{ scale: openScale, opacity: wordOpacity }}
            className="origin-left inline-block will-change-transform"
          >
            <span ref={rightWordRef} className={WORD_CLASS}>
              {wordRight}
            </span>
          </motion.span>
        </motion.div>

        <motion.div
          style={{ opacity: hintOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-16 z-30 flex justify-center text-[10px] tracking-[0.24em] uppercase text-muted"
        >
          <span>Листайте или нажмите, чтобы открыть</span>
        </motion.div>
      </div>
    </section>
  );
}
