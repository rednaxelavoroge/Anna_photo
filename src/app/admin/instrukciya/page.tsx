"use client";

import { RequireAdmin } from "@/components/RequireAdmin";
import Link from "next/link";

const CHAPTERS = [
  ["01", "Как войти в панель"],
  ["02", "Что где лежит"],
  ["03", "Лента на главной странице"],
  ["04", "Подразделы портфолио"],
  ["05", "Порядок: что за чем стоит"],
  ["06", "Фотографии и видео в кадре"],
  ["07", "Что происходит после «Сохранить»"],
  ["08", "Если удалили лишнее"],
  ["09", "Мелочи, которые стоит знать"],
] as const;

export default function AdminGuidePage() {
  return (
    <RequireAdmin>
    <article className="mx-auto max-w-3xl px-5 py-12 md:px-8">
      <Link href="/admin" className="rounded-full border border-line px-4 py-2 text-xs">
        ← Вернуться в панель
      </Link>
      <p className="eyebrow mt-10">Студия Анны Манасарян</p>
      <h1 className="mt-4 font-display text-4xl md:text-5xl">Как менять сайт самой</h1>
      <p className="mt-4 text-sm text-muted">Каждая глава — одно дело, от начала до конца. Заранее знать ничего не нужно.</p>
      <ol className="mt-10 space-y-3 border border-line bg-surface p-6">
        {CHAPTERS.map(([num, title]) => (
          <li key={num} className="flex gap-4 text-sm">
            <span className="text-muted">{num}</span>
            <a href={`#ch-${num}`} className="link-line">
              {title}
            </a>
          </li>
        ))}
      </ol>

      <section id="ch-01" className="mt-16">
        <p className="eyebrow">Глава 01</p>
        <h2 className="mt-2 font-display text-3xl">Как войти в панель</h2>
        <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm">
          <li>Откройте admin.annamanasaryan.com — откроется вход, или сразу кабинет, если вы уже внутри</li>
          <li>Если просит пароль, адрес входа: admin.annamanasaryan.com/admin/login</li>
          <li>Введите пароль в поле Пароль</li>
          <li>Нажмите Войти в кабинет →</li>
        </ol>
        <p className="mt-4 text-sm text-muted">Панель открывается с компьютера и с телефона. Кнопка «Инструкция» всегда наверху.</p>
      </section>

      <section id="ch-02" className="mt-16">
        <p className="eyebrow">Глава 02</p>
        <h2 className="mt-2 font-display text-3xl">Что где лежит</h2>
        <ul className="mt-6 space-y-3 text-sm">
          <li><strong>Кадры</strong> — все фотографии: добавить, править, удалить. Здесь же ставятся подразделы.</li>
          <li><strong>Разделы портфолио</strong> — Новорождённые, Дети, Семья и остальные: названия, описания, порядок.</li>
          <li><strong>Подразделы</strong> — темы внутри разделов. Пустых не бывает: метка появляется, когда её получил хотя бы один кадр.</li>
          <li><strong>Тексты и обо мне</strong> — слоган, рассказ, лента на главной.</li>
          <li><strong>Бэкстейдж</strong> — кадры из съёмок.</li>
          <li><strong>Контакты</strong> — телефоны, почта, Instagram.</li>
        </ul>
      </section>

      <section id="ch-03" className="mt-16">
        <p className="eyebrow">Глава 03</p>
        <h2 className="mt-2 font-display text-3xl">Лента на главной странице</h2>
        <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm">
          <li>Вкладка «Тексты и обо мне»</li>
          <li>Блок «Лента избранного на главной»</li>
        </ol>
        <p className="mt-4 text-sm">Галочка «Показывать на сайте» прячет всю ленту. Стрелки меняют порядок, крестик убирает кадр только из ленты. Внизу — «Сохранить все тексты →».</p>
        <p className="mt-3 text-sm text-muted">Если не выбрать ни одного кадра, лента соберётся сама — по одному кадру из каждого раздела.</p>
      </section>

      <section id="ch-04" className="mt-16">
        <p className="eyebrow">Глава 04</p>
        <h2 className="mt-2 font-display text-3xl">Подразделы портфолио</h2>
        <p className="mt-4 text-sm">Раздел → подраздел → кадры. Подраздел — метка на кадре. Откройте кадр → «Подразделы и темы» → создайте свой или отметьте кругляшок → Сохранить кадр.</p>
      </section>

      <section id="ch-05" className="mt-16">
        <p className="eyebrow">Глава 05</p>
        <h2 className="mt-2 font-display text-3xl">Порядок: что за чем стоит</h2>
        <p className="mt-4 text-sm">Стрелки ↑ ↓ сохраняют сразу. У кадров стрелки видны, когда выбран один раздел, не «Все разделы». В карточке кадра стрелки ← → меняют фото, первое — обложка.</p>
      </section>

      <section id="ch-06" className="mt-16">
        <p className="eyebrow">Глава 06</p>
        <h2 className="mt-2 font-display text-3xl">Фотографии и видео в кадре</h2>
        <p className="mt-4 text-sm">Можно несколько файлов сразу, с телефона. Панель сожмёт сама. Без фото кадр не сохранится. Видео — YouTube, поле внизу окна. Отмена закрывает окно без записи.</p>
      </section>

      <section id="ch-07" className="mt-16">
        <p className="eyebrow">Глава 07</p>
        <h2 className="mt-2 font-display text-3xl">Что происходит после «Сохранить»</h2>
        <p className="mt-4 text-sm">Панель меняется сразу. Сайт на .com догоняет через несколько минут. Не нажимайте «Сохранить» повторно. На компьютере обновляйте Ctrl+Shift+R, на Маке Cmd+Shift+R.</p>
      </section>

      <section id="ch-08" className="mt-16">
        <p className="eyebrow">Глава 08</p>
        <h2 className="mt-2 font-display text-3xl">Если удалили лишнее</h2>
        <p className="mt-4 text-sm">Пока окно открыто — Отмена. Уже сохранили — сделайте обратное руками. Много и не помните что — напишите разработчику: «верните, как было вчера утром».</p>
      </section>

      <section id="ch-09" className="mt-16">
        <p className="eyebrow">Глава 09</p>
        <h2 className="mt-2 font-display text-3xl">Мелочи, которые стоит знать</h2>
        <p className="mt-4 text-sm">Цен на сайте нет. Название можно менять сколько угодно: адрес раздела не ломается. Ломать панель нажатием не туда не получится — любое действие можно вернуть.</p>
      </section>

      <Link href="/admin" className="mt-16 inline-block text-xs">
        ← Вернуться в панель
      </Link>
    </article>
    </RequireAdmin>
  );
}
