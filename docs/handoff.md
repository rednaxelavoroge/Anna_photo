# Anna_photo — handoff

Photography site for Anna Manasaryan, domain **annamanasaryan.com**.
Stack: Next.js 15 App Router, Tailwind 4, Framer Motion, Lenis.

**Боевой сайт живёт на хостинге заказчицы**, не на Vercel: `66.29.141.168`,
аккаунт cPanel `annaclvt`, папка `public_html`. Vercel остался запасным
входом, выключать его не надо. Как это устроено — раздел «Как публикуется»
ниже и `docs/perenos-paneli-na-hosting.md`.

Photos will live in `public/photos/{category}/{album-slug}` (same idea as the .art repo). Until Anna sends a shortlist, grey CoverArt plates stay as rhythm placeholders — they are not her final frames.

Do not bulk-import the old WordPress site or `wp-content`. Do not scrape https://www.annamanasaryan.com into this repo to fake a finished portfolio. She curates (too many photos; she may use ChatGPT to reduce); we drop only those files into the matching album folders. Optional later: one cover per category if she sends them. We do not pull those ourselves.

Не выкладывать в папку сайта `.art` — это чужой сайт, каталог свечей. Оба
процесса выкладки проверяют папку назначения по приметам и отказываются
работать, если попали не туда; проверку не убирать.

## Как публикуется

**Сайт — сам.** Любое сохранение из панели (и любой push в
`cursor/namecheap-static-f40b`) запускает `.github/workflows/deploy-site.yml`:
статическая выгрузка уезжает в `public_html` по FTP. Заказчица нажимает
«Сохранить» — через пару минут это на сайте, руками делать нечего.

Заливка идёт **без `--delete`** намеренно: в той же папке лежит
`admin-panel` — файлы панели, и удаление лишнего снесло бы её целиком.

**Панель — по кнопке.** GitHub → Actions → «Выложить панель на хостинг» →
Run workflow. Нужно только когда меняется сама программа панели; к
фотографиям и текстам отношения не имеет.

У обоих процессов ветка сборки задана внутри файла
(`ref: cursor/namecheap-static-f40b`). Кнопка показывается только с ветки по
умолчанию, а `main` отстаёт: без явной ветки нажатие собирает старый код.
В `main` лежат только короткие файлы-вызовы, вся работа — в рабочей ветке.

**Чего НЕ трогать:** `deploy-photo-com.yml` в репозитории
`rednaxelavoroge/Candles_Soap` — прежняя ручная выкладка этого сайта. Она
ни разу не отработала (у той FTP-учётки не было доступа к `public_html`) и
теперь не нужна. Запускать её не надо.

## Motion

- `SplitReveal` — name halves part on **scroll**.
- `MeetSection` — sticky `200svh`, halves come from left/right, meet, hold, part.
- Bound to scroll, works on mobile. `prefers-reduced-motion` skips transforms.

## Content still needed from Anna

- Shortlist of photos per album (not the whole old archive)
- Optional: one cover image per category for a richer demo
- Real workshop titles if the 45 stubs are wrong
- Real reviews
- Confirm Instagram handle for photography (now `annamanasaryan`)
