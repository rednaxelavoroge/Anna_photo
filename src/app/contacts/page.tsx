import { GuideCta } from "@/components/GuideCta";
import { JsonLd } from "@/components/JsonLd";
import { getSite } from "@/lib/content";
import { breadcrumbJsonLd, graphJsonLd, pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = pageMetadata({
  title: "Контакты фотографа в Ереване",
  description:
    "Связаться с Анной Манасарян: WhatsApp, телефон в Армении и России, Instagram. Съёмки в Ереване; график Москвы уточняйте в переписке.",
  path: "/contacts",
  keywords: ["фотограф Ереван контакты", "заказать фотосессию в Армении"],
});

export default function ContactsPage() {
  const { contacts } = getSite();

  return (
    <article className="px-5 pt-28 pb-24 md:px-8">
      <JsonLd
        data={graphJsonLd([
          breadcrumbJsonLd([
            { name: "Главная", path: "/" },
            { name: "Контакты", path: "/contacts" },
          ]),
        ])}
      />
      <p className="eyebrow">{contacts.city}</p>
      <h1 className="mt-4 font-display text-4xl md:text-6xl">Контакты фотографа в Ереване</h1>
      <p className="mt-5 max-w-xl text-sm text-muted md:text-base">
        Напишите в WhatsApp — так быстрее всего обсудить съёмку, обучение или фототур. Российский номер
        тоже рабочий: это не второй сайт и не «московский филиал», а тот же человек.
      </p>
      <ul className="mt-14 space-y-8 text-lg">
        <li>
          <p className="eyebrow">WhatsApp / Армения</p>
          <a href={`https://wa.me/${contacts.whatsappDigits}`} className="link-line mt-2 inline-block">
            {contacts.whatsapp}
          </a>
        </li>
        <li>
          <p className="eyebrow">Россия</p>
          <a href={`tel:${contacts.phoneRussia.replace(/\s/g, "")}`} className="mt-2 inline-block">
            {contacts.phoneRussia}
          </a>
        </li>
        <li>
          <p className="eyebrow">Instagram</p>
          <a
            href={`https://instagram.com/${contacts.instagram}`}
            target="_blank"
            rel="noreferrer"
            className="link-line mt-2 inline-block"
          >
            @{contacts.instagram}
          </a>
        </li>
      </ul>
      <GuideCta
        slugs={[
          "kak-zapisatsya-na-fotosessiyu-armeniya-moskva",
          "kak-vybrat-detskogo-fotografa",
          "podgotovka-k-fotosessii-novorozhdennogo",
        ]}
        label="Перед письмом"
      />
      <p className="mt-10 text-sm">
        <Link href="/blog" className="link-line">
          Все гиды к съёмке →
        </Link>
      </p>
    </article>
  );
}
