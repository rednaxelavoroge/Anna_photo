# Anna Manasaryan — photography

Сайт фотографа **annamanasaryan.com**. Next.js App Router, выкладка на Vercel.

Серые пластины — временные образцы сетки, не финальные кадры. Старый WordPress не скачиваем. Когда Анна пришлёт короткий список, файлы кладём в `public/photos/{категория}/{альбом}`, как на annamanasaryan.art.

Старый WordPress на Namecheap не трогаем: новый сайт живёт отдельно, папки не пересекаются.

```bash
npm install
npm run fonts
npm run dev
```

Домен после деплоя: подключить `annamanasaryan.com` в проекте Vercel.

## SEO и статьи

Технический каркас поисковой и генеративной оптимизации (не отдельный SEO-плагин):

- Уникальные `title` / `description`, canonical, Open Graph и Twitter card на ключевых страницах
- JSON-LD: `Person`, `ProfessionalService`, `WebSite` (без SearchAction — поиска на сайте нет), `BreadcrumbList`, `Article`, `FAQPage` на «Обо мне», `ImageGallery` в альбомах
- `https://annamanasaryan.com/sitemap.xml` и `robots.txt`
- OG-картинка: `/opengraph-image`
- Страница 404; редиректы `/obo-mne` → `/about`, `/statii` → `/blog`

География в схеме честная: съёмки в Армении (Ереван), российский телефон и опыт Москвы не выдаются за «филиал». Факты для AI-цитирования — блок на [`/about`](https://annamanasaryan.com/about/), только проверяемые вещи с живого сайта (ньюборн-ниша, Haute Time, выставки, воркшопы). Наград и цифр сверх этого нет.

### Блог / гиды

Маршрут: [`/blog`](/blog) и `/blog/{slug}`. В шапке галереи нет — только футер и мобильное меню «Статьи». Индексируется, в том числе черновики (`creativeWorkStatus: Draft`, плашка на странице, **без** noindex).

Контент — markdown в `content/blog/*.md`:

```yaml
---
title: Заголовок
description: До 160 знаков
date: 2026-09-08
draft: true
tags:
  - новорождённые
relatedSlugs:
  - slug-sosedney-stati
targetQueries:
  - запрос
portfolioHref: /portfolio/newborn
---

Текст. Внутренние ссылки как `[к кадрам](/portfolio/newborn)`.
```

После файла — `npm run build`. План десяти тем и карта ссылок: [`CONTENT_PLAN_SEO_RU.md`](./CONTENT_PLAN_SEO_RU.md).
