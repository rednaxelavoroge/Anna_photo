import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description:
    "Политика конфиденциальности и обработки персональных данных фотографа Анны Манасарян (annamanasaryan.com).",
  keywords: ["политика конфиденциальности", "обработка персональных данных", "Анна Манасарян"],
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-4xl px-5 pt-28 pb-24 md:px-8">
      <p className="eyebrow">Юридическая информация</p>
      <h1 className="mt-4 font-display text-3xl leading-tight md:text-5xl">
        Политика конфиденциальности
      </h1>
      <p className="mt-4 text-xs tracking-wider text-muted uppercase">
        Редакция от {new Date().toLocaleDateString("ru-RU", { year: "numeric", month: "long" })}
      </p>

      <div className="mt-12 space-y-10 text-sm leading-relaxed text-ink/90 md:text-base">
        <section>
          <h2 className="font-display text-xl text-ink md:text-2xl">1. Кто обрабатывает данные</h2>
          <p className="mt-3">
            Оператором персональных данных является фотограф <strong>Анна Манасарян</strong> (владелец
            и администратор сайта <strong>annamanasaryan.com</strong>).
          </p>
          <p className="mt-2">
            Связь по любым вопросам обработки данных и отзыва согласий:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            <li>
              Электронная почта:{" "}
              <a href="mailto:annamanasaryan.foto@gmail.com" className="underline hover:text-ink">
                annamanasaryan.foto@gmail.com
              </a>
            </li>
            <li>WhatsApp (Армения): +374 98 033 550</li>
            <li>WhatsApp (Россия): +7 915 003 3550</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink md:text-2xl">2. Какие данные собираются и зачем</h2>
          <div className="mt-3 space-y-4">
            <div>
              <p className="font-medium text-ink">А. Данные при обращении и записи на съёмку</p>
              <p className="mt-1">
                Когда вы связываетесь со мной через мессенджеры (WhatsApp, Telegram, Instagram) или по
                электронной почте, вы добровольно сообщаете имя, номер телефона, аккаунт в мессенджере,
                город съёмки, пожелания к дате и формат фотосессии. Эти сведения используются исключительно
                для ответа на ваш запрос, согласования деталей, бронирования даты и проведения съёмки.
              </p>
            </div>

            <div>
              <p className="font-medium text-ink">Б. Технические данные и файлы cookie</p>
              <p className="mt-1">
                Для стабильной работы сайта, запоминания выбранной темы оформления и работы интерфейса
                используются технические файлы cookie и локальное хранилище браузера (localStorage).
              </p>
            </div>

            <div>
              <p className="font-medium text-ink">В. Обезличенная веб-аналитика (при наличии согласия)</p>
              <p className="mt-1">
                Только после вашего явного согласия (кнопка «Принять все» в баннере) на сайте
                активируются аналитические счётчики:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                <li>
                  <strong>Google Analytics 4</strong> (идентификатор G-R2RHW37V4F, провайдер Google LLC, США)
                </li>
                <li>
                  <strong>Яндекс.Метрика</strong> (идентификатор 112477910, провайдер ООО «Яндекс», Россия)
                </li>
              </ul>
              <p className="mt-2">
                Аналитические системы собирают обезличенную техническую информацию: примерное географическое
                положение (на уровне города/страны), тип устройства, браузер, разрешение экрана, длительность
                визита и просмотренные страницы. Я использую эту информацию для оценки интереса к разделам
                портфолио и улучшения структуры сайта. До нажатия кнопки «Принять все» эти счётчики не
                загружаются и сетевые запросы к серверам аналитики не отправляются.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink md:text-2xl">
            3. Фотосъёмка, детские фотографии и публикация
          </h2>
          <p className="mt-3">
            В рамках профессиональной деятельности фотографа при проведении фотосессий обрабатываются
            фотографические изображения клиентов и членов их семей, включая несовершеннолетних детей.
          </p>
          <p className="mt-2">
            Съёмка детей проводится исключительно с предварительного ведома и согласия родителей либо
            законных представителей.
          </p>
          <p className="mt-2">
            Условия использования и демонстрации готовых фотографий в профессиональном портфолио
            регулируются разделом{" "}
            <Link href="/legal/booking" className="underline hover:text-ink">
              Условия записи и публикации
            </Link>
            . Если для вас принципиальна полная конфиденциальность съёмки (без публикации в сети), мы
            фиксируем это до начала фотосессии.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink md:text-2xl">
            4. Передача данных третьим лицам и трансграничная передача
          </h2>
          <p className="mt-3">
            Я не продаю и не передаю ваши персональные данные рекламным брокерам или третьим лицам для спама.
          </p>
          <p className="mt-2">
            Передача данных сторонним сервисам ограничена следующими случаями:
          </p>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm">
            <li>
              <strong>Google LLC</strong> (1600 Amphitheatre Parkway, Mountain View, CA 94043, США) — в рамках
              работы Google Analytics (с включенной анонимизацией IP) и при получении сообщений на почту Gmail.{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-ink"
              >
                Политика конфиденциальности Google
              </a>
              .
            </li>
            <li>
              <strong>ООО «ЯНДЕКС»</strong> (119021, Россия, г. Москва, ул. Льва Толстого, д. 16) — в рамках
              работы Яндекс.Метрики.{" "}
              <a
                href="https://yandex.ru/legal/confidential/"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-ink"
              >
                Политика конфиденциальности Яндекса
              </a>
              . Отказаться от сбора данных Яндекс.Метрикой во всех сайтах можно с помощью{" "}
              <a
                href="https://yandex.ru/support/metrica/general/opt-out.html"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-ink"
              >
                Блокировщика Яндекс.Метрики
              </a>
              .
            </li>
            <li>
              Мессенджеры (WhatsApp / Telegram / Meta / Instagram) — передача происходит в соответствии с
              правилами безопасности выбранных вами платформ при переписке.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink md:text-2xl">5. Применимое право</h2>
          <p className="mt-3">
            К настоящей Политике и отношениям по обработке персональных данных применяется
            законодательство <strong>Республики Армения</strong> (в частности, Закон РА «О защите персональных данных»).
            При необходимости оператор уведомляет уполномоченный орган РА по защите персональных данных
            в установленном законом порядке.
          </p>
          <p className="mt-2">
            При взаимодействии с клиентами и пользователями из других государств (включая Российскую Федерацию
            и страны Европейского союза) могут дополнительно учитываться применимые требования местного
            законодательства о защите информации.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink md:text-2xl">6. Ваши права и отзыв согласия</h2>
          <p className="mt-3">Вы имеете право:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            <li>Запросить подтверждение обработки ваших данных и информацию об объёме таких данных;</li>
            <li>Потребовать уточнения, блокирования или уничтожения ваших персональных данных;</li>
            <li>В любой момент изменить или отозвать согласие на использование аналитических cookies;</li>
            <li>
              Отозвать согласие на обработку контактных данных, направив письмо на{" "}
              <a href="mailto:annamanasaryan.foto@gmail.com" className="underline hover:text-ink">
                annamanasaryan.foto@gmail.com
              </a>
              .
            </li>
          </ul>
          <p className="mt-4 text-sm text-muted">
            Вы можете управлять cookies аналитики на странице{" "}
            <Link href="/cookies" className="underline hover:text-ink">
              Политика cookies
            </Link>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
