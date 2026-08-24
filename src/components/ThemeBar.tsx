"use client";

import { THEME_LABELS, THEME_SWATCHES, THEMES, type ThemeId, isLightTheme, isTheme } from "@/lib/theme";
import { useEffect, useState } from "react";

function applyTheme(theme: ThemeId) {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = isLightTheme(theme) ? "light" : "dark";
  try {
    localStorage.setItem("anna-skin", theme);
  } catch {
    /* ignore */
  }
  const url = new URL(window.location.href);
  url.searchParams.set("theme", theme);
  window.history.replaceState({}, "", url);
}

export function ThemeBar() {
  const [theme, setTheme] = useState<ThemeId>("beige");

  useEffect(() => {
    const fromDom = document.documentElement.getAttribute("data-theme");
    if (isTheme(fromDom)) setTheme(fromDom);
  }, []);

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-line bg-paper/95 px-3 py-3 text-ink md:px-4">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3">
        <p className="text-[10px] tracking-[0.16em] uppercase">Превью цвета — выберите фон</p>
        <div className="flex flex-wrap gap-2">
          {THEMES.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTheme(id);
                applyTheme(id);
              }}
              className={`inline-flex items-center gap-2 border px-2.5 py-1.5 text-[11px] tracking-[0.14em] uppercase md:px-3 ${
                theme === id ? "border-ink bg-ink text-snow" : "border-line text-ink"
              }`}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full border border-line"
                style={{ background: THEME_SWATCHES[id] }}
                aria-hidden="true"
              />
              {THEME_LABELS[id]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
