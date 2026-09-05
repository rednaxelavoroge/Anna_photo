"use client";

import { THEME_LABELS, THEME_SWATCHES, THEMES, type ThemeId, isLightTheme, isTheme } from "@/lib/theme";
import { useEffect, useState } from "react";

/**
 * Переключатель фона сайта: бежевый, белый, чёрный. Три кружка в шапке и в
 * мобильном меню. Выбор запоминается в браузере (`anna-skin`), тот же ключ
 * читает загрузочный скрипт в `ThemeScript`, поэтому при следующем открытии
 * страница сразу выходит в выбранном цвете, без мигания.
 */
function applyTheme(theme: ThemeId) {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = isLightTheme(theme) ? "light" : "dark";
  try {
    localStorage.setItem("anna-skin", theme);
  } catch {
    /* браузер запретил хранилище — тема живёт до перезагрузки */
  }
}

export function ThemeSwitch({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<ThemeId>("beige");

  useEffect(() => {
    const fromDom = document.documentElement.getAttribute("data-theme");
    if (isTheme(fromDom)) setTheme(fromDom);
  }, []);

  return (
    <div className={`flex items-center gap-2 ${className}`} role="group" aria-label="Цвет сайта">
      {THEMES.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => {
            setTheme(id);
            applyTheme(id);
          }}
          aria-label={`Фон: ${THEME_LABELS[id]}`}
          aria-pressed={theme === id}
          title={THEME_LABELS[id]}
          className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
            theme === id ? "border-ink" : "border-line hover:border-ink/60"
          }`}
        >
          <span
            className="block h-3 w-3 rounded-full border border-ink/20"
            style={{ background: THEME_SWATCHES[id] }}
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  );
}
