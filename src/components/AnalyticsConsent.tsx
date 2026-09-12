"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CONSENT_STORAGE_KEY = "anna_cookie_consent";
const GA_ID = "G-R2RHW37V4F";
const METRIKA_ID = "112477910";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    ym?: ((id: number, action: string, ...args: unknown[]) => void) & {
      a?: unknown[];
      l?: number;
    };
  }
}

function loadAnalytics() {
  if (typeof window === "undefined") return;

  // 1. Google Analytics 4
  if (!document.getElementById("ga-script")) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer?.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, {
      anonymize_ip: true,
    });

    const script = document.createElement("script");
    script.id = "ga-script";
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    script.async = true;
    document.head.appendChild(script);
  }

  // 2. Yandex Metrika
  if (!document.getElementById("ym-script")) {
    const ymFunc: { (...args: unknown[]): void; a?: unknown[]; l?: number } = function (...args: unknown[]) {
      (ymFunc.a = ymFunc.a || []).push(args);
    };
    ymFunc.l = Number(new Date());
    window.ym = ymFunc as Window["ym"];

    const ymScript = document.createElement("script");
    ymScript.id = "ym-script";
    ymScript.src = "https://mc.yandex.ru/metrika/tag.js";
    ymScript.async = true;
    document.head.appendChild(ymScript);

    window.ym?.(Number(METRIKA_ID), "init", {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: false,
    });
  }
}

export function AnalyticsConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONSENT_STORAGE_KEY) as "accepted" | "rejected" | null;
      if (saved === "accepted") {
        loadAnalytics();
      } else if (saved === "rejected") {
        // отказ, ничего не подгружаем
      } else {
        // выбор еще не сделан
        setShowBanner(true);
      }
    } catch {
      setShowBanner(true);
    }

    const handleOpenBanner = () => {
      setShowBanner(true);
    };
    window.addEventListener("open-cookie-banner", handleOpenBanner);
    return () => window.removeEventListener("open-cookie-banner", handleOpenBanner);
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, "accepted");
    } catch {
      // ignore
    }
    setShowBanner(false);
    loadAnalytics();
  };

  const handleReject = () => {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, "rejected");
    } catch {
      // ignore
    }
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <aside
      aria-label="Уведомление об использовании cookies"
      role="region"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl border border-line bg-snow p-5 shadow-lg backdrop-blur-md md:bottom-6 md:left-auto md:right-6 md:p-6"
    >
      <div className="flex flex-col gap-4">
        <div>
          <p className="eyebrow text-ink/70">Файлы cookie и аналитика</p>
          <p className="mt-2 text-xs leading-relaxed text-ink/80 md:text-sm">
            Этот сайт использует технические cookies для работы и внешнюю аналитику (Google
            Analytics и Яндекс.Метрика), чтобы понимать интерес к разделам портфолио.
            Аналитика подключается только с вашего согласия. Подробнее — в{" "}
            <Link href="/cookies" className="underline underline-offset-4 hover:text-ink">
              политике cookies
            </Link>{" "}
            и{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-ink">
              политике конфиденциальности
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={handleReject}
            className="cursor-pointer border border-line bg-paper px-4 py-2.5 text-[11px] font-medium tracking-[0.14em] text-ink uppercase transition hover:border-ink"
          >
            Только обязательные
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="cursor-pointer border border-ink bg-ink px-4 py-2.5 text-[11px] font-medium tracking-[0.14em] text-snow uppercase transition hover:bg-ink/90"
          >
            Принять все
          </button>
        </div>
      </div>
    </aside>
  );
}

export function openCookieBanner() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-cookie-banner"));
  }
}
