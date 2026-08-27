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

## Ролик с телефона

Панель принимает ролик целиком (до 200 МБ) и показывает проценты отправки.
Сжимать на хостинге нечем — ffmpeg там нет, — поэтому исходник уезжает в
GitHub **приложением к служебному выпуску `video-inbox`**, не коммитом:
коммит остался бы в истории навсегда, а тридцать роликов по 40 МБ — это
гигабайт мёртвого веса при каждом клонировании.

Сжимает `.github/workflows/compress-video.yml`: 720 по короткой стороне,
H.264, звук AAC, `+faststart`. Перед публикацией сверяет длительность с
исходной (допуск полсекунды) и наличие звука — обрывок на сайт не попадёт.
Готовый ролик коммитится в `public/photos/uploads/`, ответ кладётся
приложением `<имя>.result.json`, исходник удаляется. Панель спрашивает про
судьбу ролика раз в пять секунд и ждёт до двенадцати минут.

Устройство сайта менять не пришлось: `PhotoTape` и `Lightbox` показывают
проигрывателем любой файл, чей путь кончается на `mp4`, `webm` или `mov`.
Готовый ролик просто встаёт в `images` кадра. Поле `video` (YouTube) —
отдельная вещь, к этому отношения не имеет.

Что стоит помнить:

- **Выпуск `video-inbox` не удалять.** Он служебный и почти всегда пустой.
- **Тип файла проверяется мягко и намеренно.** С телефона `.mov` приходит
  как `video/quicktime`, иногда тип пустой. Строгая проверка отвергала бы
  ролик уже после трёхминутной загрузки; окончательно судит ffmpeg.
- **`Content-Length` руками не выставлять** — в Node он либо игнорируется,
  либо роняет запрос.
- **Файл-вызов в `main` обязан просить `contents: write`.** Без этого
  запуск обрывается с `startup_failure` ещё до первого шага: больше, чем
  есть у вызывающего, GitHub не выдаёт. Проверено — именно так и было.
- **Шаг ответа панели не должен падать.** Он единственный, кто сообщает
  результат: если он оборвётся, панель двенадцать минут ждёт ответа,
  которого уже никто не пришлёт.

Что осталось непроверенным: сжатие настоящего ролика от начала до конца.
Отсюда файл в панели не выбрать, а связка проверена запуском с заведомо
отсутствующим исходником — процесс дошёл до поиска и внятно отказал.

## Порядок перетаскиванием

`src/lib/use-drag-order.ts` — мышью и пальцем (нажать, подержать треть
секунды, вести). Подключено к кадрам, разделам портфолио, бэкстейджу и
файлам внутри карточки кадра. Стрелки оставлены рядом.

Список кадров отфильтрован разделом и поиском, поэтому позиции с экрана
переводятся в позиции в полном списке — иначе кадр уезжает не туда.

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
