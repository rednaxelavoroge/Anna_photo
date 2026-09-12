import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Условия записи и публикации",
  description:
    "Условия бронирования съёмки, проведения фотосессий и публикации фотографий в портфолио Анны Манасарян.",
  keywords: ["условия съёмки", "бронирование фотосессии", "согласие на публикацию", "детский фотограф"],
};

export default function BookingLegalPage() {
  return (
    <article className="mx-auto max-w-4xl px-5 pt-28 pb-24 md:px-8">
      <p className="eyebrow">Юридическая информация</p>
      <h1 className="mt-4 font-display text-3xl leading-tight md:text-5xl">
        Условия записи и съёмки
      </h1>
      <p className="mt-4 text-xs tracking-wider text-muted uppercase">
        Памятка для клиентов · Редакция от{" "}
        {new Date().toLocaleDateString("ru-RU", { year: "numeric", month: "long" })}
      </p>

      <div className="mt-12 space-y-10 text-sm leading-relaxed text-ink/90 md:text-base">
        <section>
          <h2 className="font-display text-xl text-ink md:text-2xl">1. Запись и бронирование</h2>
          <p className="mt-3">
            Запись на фотосессии (новорождённые, дети, семьи, индивидуальные съёмки, фототуры)
            осуществляется через личное общение в мессенджерах (WhatsApp) или по электронной почте.
          </p>
          <p className="mt-2">
            Дата съёмки считается предварительно забронированной после взаимного согласования времени, места,
            формата и условий бронирования. При съёмке новорождённых дата бронируется ориентировочно по
            предполагаемой дате родов (ПДР) и уточняется в первые дни после рождения малыша.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink md:text-2xl">2. Безопасность и съёмка детей</h2>
          <p className="mt-3">
            Здоровье, комфорт и безопасность ребёнка — абсолютный приоритет при любой фотосессии. Я имею
            медицинское образование и многолетний опыт работы с новорождёнными (с 2014 года проведено более 700
            съёмок малышей).
          </p>
          <p className="mt-2">
            Фотосъёмка несовершеннолетних проводится исключительно в присутствии и с согласия родителей или
            законных представителей. Все используемые ткани, реквизит и аксессуары проходят обязательную
            гигиеническую обработку.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink md:text-2xl">
            3. Публикация в портфолио и конфиденциальность
          </h2>
          <p className="mt-3">
            Профессиональное портфолио и открытая демонстрация авторских работ — основа работы фотографа.
            По умолчанию я оставляю за собой право использовать лучшие художественные кадры со съёмки на
            своём сайте (<strong>annamanasaryan.com</strong>), в профессиональных соцсетях, для участия в
            фотовыставках и авторских публикациях.
          </p>
          <div className="mt-4 border border-line bg-snow p-5">
            <h3 className="font-display text-base text-ink">Конфиденциальная съёмка</h3>
            <p className="mt-2 text-sm text-ink/80">
              Если вы хотите, чтобы фотосессия осталась строго конфиденциальной (без публикации в сети и
              портфолио), <strong>пожалуйста, сообщите об этом до начала съёмки</strong>. Мы с уважением
              относимся к желанию клиентов сохранить приватность личной жизни.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink md:text-2xl">4. Передача готовых материалов</h2>
          <p className="mt-3">
            Готовые фотографии передаются клиенту в согласованные сроки в электронном виде через защищённую
            ссылку на облачное хранилище или файлообменник для скачивания в максимальном качестве.
          </p>
          <p className="mt-2">
            Исходные необработанные файлы (RAW) являются рабочим материалом фотографа и заказчику не
            передаются, если иное прямо не согласовано сторонами.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink md:text-2xl">5. Контакты и вопросы</h2>
          <p className="mt-3">
            Если у вас есть вопросы по подготовке к съёмке, подбору образов или условиям, напишите мне в{" "}
            <Link href="/contacts" className="underline hover:text-ink">
              Контакты
            </Link>{" "}
            или на почту{" "}
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
