# Anna Manasaryan — photography

Сайт фотографа **annamanasaryan.com**. Next.js 15 App Router.

**Боевой сайт живёт на хостинге заказчицы, не на Vercel.** Namecheap, cPanel
`annaclvt`, папка `public_html`; отдаёт LiteSpeed. Публикуется статической
выгрузкой по FTP из Actions — сам на каждый push и на каждое сохранение из
панели. Vercel остался запасным входом и в выкладке не участвует.

Панель заказчицы — `admin.annamanasaryan.com`, отдельное приложение Node.js в
cPanel (`public_html/admin-panel`). Она пишет содержимое в репозиторий через
GitHub API, поэтому каждое сохранение — обычный коммит.

**Рабочая ветка — `cursor/namecheap-static-f40b`**: там и сайт, и панель, и
процессы выкладки. Здесь, в `main`, лежат только короткие файлы-вызовы:
кнопки в Actions показываются лишь с ветки по умолчанию, а две копии
процессов держать нельзя — разъедутся.

Фотографии — `public/photos/{категория}/{альбом}`, как на annamanasaryan.art.

Не выкладывать в папку сайта `.art` — это чужой сайт, каталог свечей.

```bash
npm install
npm run fonts
npm run dev
```

Подробности — `docs/handoff.md` и `docs/perenos-paneli-na-hosting.md` в рабочей ветке.
