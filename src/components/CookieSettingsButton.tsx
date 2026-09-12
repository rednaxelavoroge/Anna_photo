"use client";

import { openCookieBanner } from "@/components/AnalyticsConsent";

interface CookieSettingsButtonProps {
  className?: string;
  label?: string;
}

export function CookieSettingsButton({
  className = "inline-block border border-ink bg-ink px-4 py-2 text-xs uppercase tracking-[0.16em] text-snow hover:bg-ink/90 cursor-pointer transition",
  label = "Изменить настройки cookies",
}: CookieSettingsButtonProps) {
  return (
    <button type="button" onClick={openCookieBanner} className={className}>
      {label}
    </button>
  );
}
