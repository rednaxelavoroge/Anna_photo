import { getSite } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Контакты фотографа в Ереване",
  description:
    "Связаться с Анной Манасарян: WhatsApp, телефон в Армении и России, почта, Instagram. Фотосессии в Ереване.",
  keywords: ["фотограф Ереван контакты", "заказать фотосессию в Армении"],
};

export default function ContactsPage() {
  const { contacts } = getSite();

  return (
    <article className="px-5 pt-28 pb-24 md:px-8">
      <p className="eyebrow">{contacts.city}</p>
      <h1 className="mt-4 font-display text-4xl md:text-6xl">Контакты фотографа в Ереване</h1>
      <p className="mt-5 max-w-xl text-sm text-muted md:text-base">
        Напишите в WhatsApp — так быстрее всего обсудить съёмку, обучение или фототур.
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
          <p className="eyebrow">Почта</p>
          <a href={`mailto:${contacts.email}`} className="link-line mt-2 inline-block">
            {contacts.email}
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
    </article>
  );
}
