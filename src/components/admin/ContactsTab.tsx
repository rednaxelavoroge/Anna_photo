"use client";

import type { TabProps } from "@/components/admin/types";
import { BTN, BTN_GHOST, Card, Field, INPUT } from "@/components/admin/ui";
import type { SiteContacts } from "@/lib/content";

const digits = (value: string) => value.replace(/\D/g, "");

/** Вкладка «Контакты»: активный WhatsApp отдельно, телефоны, почта, соцсети. */
export function ContactsTab({ state, setState, persist, busy }: TabProps) {
  const { contacts } = state.site;
  const patch = (next: Partial<SiteContacts>) => setState({ ...state, site: { ...state.site, contacts: { ...contacts, ...next } } });
  const text = (key: keyof SiteContacts, label: string, hint?: string) => (
    <Field key={key} label={label} hint={hint}>
      <input className={INPUT} value={contacts[key] ?? ""} onChange={(event) => patch({ [key]: event.target.value })} />
    </Field>
  );

  return (
    <section className="mt-8 space-y-8">
      <div className="max-w-3xl space-y-4 border-2 border-ink/60 bg-surface p-5">
        <h2 className="font-display text-2xl">Кнопка WhatsApp на сайте</h2>
        <p className="text-sm text-muted">
          Этот номер стоит в контактах и на кнопках «Написать» по всему сайту: фототуры, «Обо мне», подвал. Можно вписать любой номер или подставить один из телефонов ниже.
        </p>
        <Field label="Активный номер WhatsApp">
          <input className={`${INPUT} font-medium`} value={contacts.whatsapp} placeholder="+374 98 0 33 55 0" onChange={(event) => patch({ whatsapp: event.target.value, whatsappDigits: digits(event.target.value) })} />
        </Field>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted">Подставить:</span>
          {contacts.phone ? (
            <button type="button" className={BTN_GHOST} onClick={() => patch({ whatsapp: contacts.phone, whatsappDigits: digits(contacts.phone) })}>
              Армения {contacts.phone}
            </button>
          ) : null}
          {contacts.phoneRussia ? (
            <button type="button" className={BTN_GHOST} onClick={() => patch({ whatsapp: contacts.phoneRussia, whatsappDigits: digits(contacts.phoneRussia) })}>
              Россия {contacts.phoneRussia}
            </button>
          ) : null}
        </div>
        {contacts.whatsapp ? (
          <p className="flex flex-wrap items-center justify-between gap-3 border border-line bg-paper px-3 py-2 text-xs">
            <span>
              Ссылка: <span className="font-mono">https://wa.me/{digits(contacts.whatsapp)}</span>
            </span>
            <a href={`https://wa.me/${digits(contacts.whatsapp)}`} target="_blank" rel="noopener noreferrer" className={BTN_GHOST}>
              Проверить переход ↗
            </a>
          </p>
        ) : null}
      </div>

      <Card title="Телефоны и связь">
        {text("phone", "Телефон (Армения)")}
        {text("phoneRussia", "Телефон (Россия)")}
        {text("email", "Почта")}
        {text("instagram", "Instagram", "Без @ — только имя профиля")}
        {text("facebook", "Facebook", "Ссылка на профиль или страницу; пусто — не показывать")}
        {text("city", "Город / локация", "Мелкая надпись над заголовком страницы «Контакты»")}
      </Card>
      <button type="button" disabled={busy} className={BTN} onClick={() => void persist(state, "Сохраняю контакты…")}>
        Сохранить контакты →
      </button>
    </section>
  );
}
