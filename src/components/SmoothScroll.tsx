"use client";

import { useEffect } from "react";

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let lenis: { raf: (time: number) => void; destroy: () => void } | null = null;

    const start = async () => {
      const { default: Lenis } = await import("lenis");
      lenis = new Lenis({
        duration: 1.05,
        smoothWheel: true,
      });
      const raf = (time: number) => {
        lenis?.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
    };

    void start();
    return () => {
      cancelAnimationFrame(frame);
      lenis?.destroy();
    };
  }, []);

  return null;
}
