"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef, type ReactNode } from "react";

type SplitRevealProps = {
  wordLeft: string;
  wordRight: string;
  children: ReactNode;
};

export function SplitReveal({ wordLeft, wordRight, children }: SplitRevealProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const leftX = useTransform(scrollYProgress, [0.02, 0.38], ["0%", "-102%"]);
  const rightX = useTransform(scrollYProgress, [0.02, 0.38], ["0%", "102%"]);
  const revealOpacity = useTransform(scrollYProgress, [0.06, 0.28], [0, 1]);
  const revealScale = useTransform(scrollYProgress, [0.06, 0.38], [0.97, 1]);

  if (reduced) {
    return (
      <section className="bg-void px-5 py-24 text-bg md:px-8">
        <p className="font-display text-4xl leading-none md:text-6xl">
          {wordLeft} {wordRight}
        </p>
        <div className="mt-12">{children}</div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative h-[165vh] bg-void">
      <div className="sticky top-0 flex h-svh items-center overflow-hidden">
        <motion.div
          style={{ opacity: revealOpacity, scale: revealScale }}
          className="w-full will-change-transform"
        >
          {children}
        </motion.div>

        <motion.div
          aria-hidden="true"
          style={{ x: leftX }}
          className="pointer-events-none absolute inset-y-0 left-0 flex w-1/2 items-center justify-end border-r border-white/10 bg-void will-change-transform"
        >
          <span className="-translate-y-[0.42em] pr-[0.04em] font-display text-[13vw] leading-[0.78] text-bg select-none md:text-[9vw]">
            {wordLeft}
          </span>
        </motion.div>

        <motion.div
          aria-hidden="true"
          style={{ x: rightX }}
          className="pointer-events-none absolute inset-y-0 right-0 flex w-1/2 items-center justify-start bg-void will-change-transform"
        >
          <span className="translate-y-[0.42em] pl-[0.04em] font-display text-[13vw] leading-[0.78] text-bg select-none md:text-[9vw]">
            {wordRight}
          </span>
        </motion.div>
      </div>
    </section>
  );
}
