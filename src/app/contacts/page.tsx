import { getSite } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Контакты",
  description:
    "Связаться с Анной Манасарян: WhatsApp в Армении и России, почта, Instagram. Фотосессии, обучение, фототуры.",
  keywords: ["фотограф контакты", "заказать фотосессию в Армении", "Анна Манасарян WhatsApp"],
};

const digits = (value: string) => value.replace(/\D/g, "");

/**
 * По правке заказчицы 05.09: крупно «Контакты», без города, оба номера —
 * WhatsApp и оба открывают чат.
 */
export default function ContactsPage() {
  const { contacts } = getSite();

  return (
    <article className="px-5 pt-28 pb-24 md:px-8">
      <h1 className="font-display text-4xl md:text-6xl">Контакты</h1>
      <p className="mt-5 max-w-xl text-sm text-muted md:text-base">
        Напишите в WhatsApp — так быстрее всего обсудить съёмку, обучение или фототур.
      </p>
      <ul className="mt-14 space-y-8 text-lg">
        <li>
          <p className="eyebrow">WhatsApp / Армения</p>
          <a href={`https://wa.me/${digits(contacts.phone || contacts.whatsapp)}`} className="link-line mt-2 inline-block">
            {contacts.phone || contacts.whatsapp}
          </a>
        </li>
        {contacts.phoneRussia ? (
          <li>
            <p className="eyebrow">WhatsApp / Россия</p>
            <a href={`https://wa.me/${digits(contacts.phoneRussia)}`} className="link-line mt-2 inline-block">
              {contacts.phoneRussia}
            </a>
          </li>
        ) : null}
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
        {contacts.facebook ? (
          <li>
            <p className="eyebrow">Facebook</p>
            <a href={contacts.facebook} target="_blank" rel="noreferrer" className="link-line mt-2 inline-block">
              Facebook
            </a>
          </li>
        ) : null}
      </ul>
    </article>
  );
}
