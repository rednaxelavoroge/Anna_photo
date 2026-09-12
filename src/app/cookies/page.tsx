import { CookieSettingsButton } from "@/components/CookieSettingsButton";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Политика использования файлов cookie",
  description:
    "Информация об использовании файлов cookie и систем аналитики на сайте фотографа Анны Манасарян (annamanasaryan.com).",
  keywords: ["cookies", "файлы cookie", "Google Analytics", "Яндекс Метрика", "Анна Манасарян"],
};

export default function CookiesPage() {
  return (
    <article className="mx-auto max-w-4xl px-5 pt-28 pb-24 md:px-8">
      <p className="eyebrow">Юридическая информация</p>
      <h1 className="mt-4 font-display text-3xl leading-tight md:text-5xl">
        Использование файлов cookie
      </h1>
      <p className="mt-4 text-xs tracking-wider text-muted uppercase">
        Редакция от {new Date().toLocaleDateString("ru-RU", { year: "numeric", month: "long" })}
      </p>

      <div className="mt-12 space-y-10 text-sm leading-relaxed text-ink/90 md:text-base">
        <section>
          <h2 className="font-display text-xl text-ink md:text-2xl">Что такое cookie</h2>
          <p className="mt-3">
            Файлы cookie — это небольшие текстовые фрагменты данных, которые сайт сохраняет на вашем
            устройстве (компьютере, планшете или телефоне) во время посещения страниц. Они позволяют
            сайту помнить ваши предпочтения и не настраивать всё заново при повторном визите.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink md:text-2xl">Какие категории cookie мы используем</h2>
          <div className="mt-4 space-y-6">
            <div className="border border-line bg-snow p-5">
              <h3 className="font-display text-base text-ink">1. Обязательные (технические) файлы</h3>
              <p className="mt-2 text-sm text-ink/80">
                Необходимы для базового функционирования сайта: переключения и сохранения цветовой темы
                оформления (бежевая, белая, серая, тёмная) и фиксации вашего решения относительно согласия
                на аналитические счётчики. Без этих файлов сайт не сможет корректно отображаться в
                выбранном вами виде. Эти файлы не собирают маркетинговых данных и не требуют согласия.
              </p>
            </div>

            <div className="border border-line bg-snow p-5">
              <h3 className="font-display text-base text-ink">2. Статистические (аналитические) файлы</h3>
              <p className="mt-2 text-sm text-ink/80">
                Подключаются <strong>исключительно после вашего согласия</strong> в баннере на сайте:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
                <li>
                  <strong>Google Analytics 4 (Google LLC)</strong>: ID <code>G-R2RHW37V4F</code>. Используется
                  для оценки общей посещаемости, просмотра разделов портфолио, с включенной функцией
                  анонимизации IP-адресов.{" "}
                  <a
                    href="https://policies.google.com/technologies/cookies"
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-ink"
                  >
                    Политика Google в отношении файлов cookie
                  </a>
                  .
                </li>
                <li>
                  <strong>Яндекс.Метрика (ООО «Яндекс»)</strong>: ID <code>112477910</code>. Помогает понять,
                  насколько удобно посетителям ориентироваться в сериях фотографий и находить контакты.{" "}
                  <a
                    href="https://yandex.ru/legal/confidential/"
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-ink"
                  >
                    Политика конфиденциальности Яндекса
                  </a>
                  .
                </li>
              </ul>
              <p className="mt-3 text-sm text-ink/80">
                До момента нажатия кнопки «Принять все» ни один из этих счётчиков не запускается и запросы к
                сторонним серверам не отправляются.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink md:text-2xl">Управление вашим выбором</h2>
          <p className="mt-3">
            Вы в любой момент можете изменить своё решение относительно аналитических файлов cookie
            непосредственно на этом сайте:
          </p>
          <div className="mt-4">
            <CookieSettingsButton />
          </div>
          <p className="mt-4">
            Также вы можете полностью отключить поддержку cookies в настройках вашего веб-браузера или
            установить официальный браузерный компонент{" "}
            <a
              href="https://yandex.ru/support/metrica/general/opt-out.html"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-ink"
            >
              Блокировщик Яндекс.Метрики
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink md:text-2xl">Контакты</h2>
          <p className="mt-3">
            Подробная информация о порядке обработки персональных данных содержится в{" "}
            <Link href="/privacy" className="underline hover:text-ink">
              Политике конфиденциальности
            </Link>
            . Вопросы можно направить на почту{" "}
            <a href="mailto:annamanasaryan.foto@gmail.com" className="underline hover:text-ink">
              annamanasaryan.foto@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
