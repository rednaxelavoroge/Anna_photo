import { CookieSettingsButton } from "@/components/CookieSettingsButton";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Политика использования файлов cookie",
  description:
    "Информация об использовании технических файлов cookie на сайте фотографа Анны Манасарян (annamanasaryan.com).",
  keywords: ["cookies", "файлы cookie", "технические cookie", "конфиденциальность", "Анна Манасарян"],
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
                Необходимы для базового функционирования сайта: переключения и сохранения выбранной цветовой темы
                оформления интерфейса (бежевая, белая, серая, тёмная). Без этих файлов сайт не сможет корректно
                отображаться в выбранном вами виде. Эти файлы сохраняются исключительно на вашем устройстве, не
                собирают маркетинговых или персональных данных и не требуют согласия.
              </p>
            </div>

            <div className="border border-line bg-snow p-5">
              <h3 className="font-display text-base text-ink">2. Статистические (аналитические) файлы</h3>
              <p className="mt-2 text-sm text-ink/80">
                В настоящее время внешние системы веб-аналитики (Google Analytics, Яндекс.Метрика) на сайте{" "}
                <strong>полностью отключены</strong>. Сайт не использует сторонние аналитические cookies,
                пиксели отслеживания и маркетинговые скрипты. Никакие запросы к серверам аналитики не отправляются.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink md:text-2xl">Управление вашим выбором</h2>
          <p className="mt-3">
            Поскольку внешние аналитические счётчики и маркетинговые cookies на сайте отключены, сайт не собирает
            профили посетителей. Вы можете в любой момент полностью отключить или очистить сохранённые cookies
            в настройках вашего веб-браузера.
          </p>
          <div className="mt-4">
            <CookieSettingsButton />
          </div>
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
