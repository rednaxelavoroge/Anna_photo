# Переезд панели с Vercel на хостинг — инструкция по образцу .art

Этот документ написан агентом, который 27.08.2026 перевёз на хостинг панель
сайта **annamanasaryan.art** (репозиторий `rednaxelavoroge/Candles_Soap`).
Здесь всё, что там сработало, что стоило времени, и чем `.com` отличается.

Сайты у одной заказчицы, хостинг один и тот же — один аккаунт cPanel
`annaclvt` на сервере `66.29.141.168`, тариф Namecheap Stellar, cPanel 134.
Поэтому большая часть переносится один в один.

---

## Зачем это делается

Vercel в России придушен. Заказчица заходила в панель только через ВПН и
жаловалась на тормоза. Сами сайты по этой же причине уже отдаются с обычного
хостинга; панель оставалась на Vercel, потому что ей нужен работающий сервер,
а не статика.

Выяснилось, что в cPanel есть **Setup Node.js App** с версиями Node до 24-й.
Значит панель может жить там же. Заодно уходит предел в 3,5 МБ на тело
запроса — это было ограничение Vercel, а не наше.

**Vercel при этом не выключается.** Он остаётся запасным входом: если на
хостинге что-то не заладится, заказчица заходит по-старому. Проект не удалять,
переменные там не стирать.

---

## Чем .com отличается от .art — прочитать до начала

Это главное, ради чего стоит читать документ целиком.

1. **DNS у доменов разный.**
   - `annamanasaryan.art` — серверы имён **Cloudflare**
     (`jillian.ns.cloudflare.com`, `weston.ns.cloudflare.com`).
   - `annamanasaryan.com` — серверы имён **хостинга**
     (`dns1.namecheaphosting.com`, `dns2.namecheaphosting.com`).

   То есть записи `.com` правятся **в cPanel → Zone Editor**, а не в
   Cloudflare и не на вкладке Advanced DNS в Namecheap. Проверить перед
   работой: `dig +short NS annamanasaryan.com`.

2. **Папка сайта другая.** `.art` лежит в `/home/annaclvt/annamanasaryan.art`,
   а `.com` — в `/home/annaclvt/public_html` (это видно в cPanel →
   SSL/TLS Certificates → Installation, колонка Document Root).
   Значит Application root у приложения Node будет `public_html/admin-panel`,
   а не `annamanasaryan.art/admin-panel`.

3. **FTP-доступ заперт в папке `.art`.** Секреты `FTP_HOST` / `FTP_USER` /
   `FTP_PASSWORD` в обоих репозиториях одни и те же, но логин попадает сразу
   в папку `annamanasaryan.art`, и подняться выше не всегда получается.
   В `.github/workflows/deploy-photo-com.yml` (репозиторий Candles_Soap!) уже
   написан перебор кандидатов — `.`, `..`, `../..`, `../../public_html`,
   `public_html`, `/home/annaclvt/public_html` — с проверкой, что не
   попали в папку `.art`. **Взять эту логику за основу**, не изобретать заново.

   Если окажется, что до `public_html` FTP не достаёт, — просить у заказчицы
   отдельную FTP-учётку с корнем в `public_html` (cPanel → FTP Accounts) и
   класть её в секрет `PANEL_FTP_USER` / `PANEL_FTP_PASSWORD`.

4. **Пароль панели у `.com` уже сделан правильно.** В
   `src/lib/admin-auth.ts` он читается из `ADMIN_PASSWORD`, кука подписана
   HMAC от пароля, в проде пустой пароль закрывает вход. У `.art` было хуже
   (пароль лежал в коде запасным значением), это чинили отдельно.
   **Здесь трогать не надо** — только задать переменную в cPanel.

5. **Флаг статической сборки называется иначе:** у `.com` это
   `NAMECHEAP_EXPORT=1`, у `.art` — `STATIC_EXPORT=1`. Не перепутать.

---

## Что нужно сделать в коде

### 1. Режим сборки только панели

В `next.config.ts` добавить рядом с `NAMECHEAP_EXPORT`:

```ts
const isPanel = process.env.PANEL_BUILD === "1";

// ...
...(isPanel ? { output: "standalone" as const } : {}),
images: isExport || isPanel ? { unoptimized: true } : { /* как было */ },
```

`standalone` кладёт рядом со сборкой маленький сервер и ровно те зависимости,
которые нужны в работе. На хостинг уезжает папка в сотню мегабайт вместо
всего проекта, и `npm install` там не нужен — его там и не запустить.

Оптимизатор картинок выключается намеренно: фотографии уже лежат на сайте,
везти их к панели незачем.

### 2. Панель берёт медиа прямо с сайта

Завести `NEXT_PUBLIC_MEDIA_BASE` и маленький помощник вроде
`src/lib/media-url.ts`, который приклеивает базу к путям вида `/photos/...`.
Смысл: панель показывает превью, а сами файлы отдаёт боевой сайт. Иначе
к панели придётся везти весь каталог.

У `.art` это выглядит так:

```ts
const BASE = (process.env.NEXT_PUBLIC_MEDIA_BASE || "").replace(/\/+$/, "");
```

Важно: `NEXT_PUBLIC_*` вшивается **на этапе сборки**. Задавать её надо в
workflow, а не только в cPanel. В cPanel можно продублировать, вреда нет.

### 3. Workflow выкладки панели

Взять целиком `.github/workflows/deploy-panel.yml` из репозитория
`rednaxelavoroge/Candles_Soap` и поправить пути. Что он делает:

- `npm ci`, затем `PANEL_BUILD=1 npm run build`;
- собирает папку `panel-dist`: `.next/standalone`, внутрь неё `.next/static`,
  из `public` только шрифты и значок;
- выбрасывает `node_modules/typescript` и `@types` — в работе не нужны;
- пишет `app.js` — точку входа для Passenger:

  ```js
  process.env.HOSTNAME = process.env.HOSTNAME || "127.0.0.1";
  require("./server.js");
  ```

- пишет `.htaccess` с `Require all denied` — папка панели лежит внутри папки
  сайта и иначе отдавалась бы в интернет;
- заливает по FTP через `lftp mirror -R --delete`;
- трогает `tmp/restart.txt` — этим Passenger перезапускает приложение.

**Замок вокруг `--delete` не убирать.** В workflow стоит проверка: если папка
назначения окажется корнем сайта (пустое значение, `.`, `public_html`,
короче четырёх знаков) — остановка. Без неё одна опечатка в секрете сносит
и сайт, и чужой WordPress, который лежит в той же папке.

**Внимание для `.com`:** папка назначения там будет называться
`admin-panel`, но лежать внутри `public_html`. Проверку на опасное имя
надо оставить, а путь собирать как `public_html/admin-panel` — то есть в
секрет `FTP_PANEL_DIR` писать полный путь от корня FTP, а не одно слово.

Запуск — только кнопкой (`workflow_dispatch`). И помнить: **workflow виден
в интерфейсе Actions только если он лежит в ветке по умолчанию.**

### 4. Локальная проверка перед выкладкой

```
PANEL_BUILD=1 npm run build
node .next/standalone/server.js
```

Панель должна подняться, вход и чтение данных — работать.

---

## Что делает человек в cPanel

Заказчик не программист. **Давать по одному шагу и ждать «готово».** Не
таблицей «имя — значение», а по действию на строку.

### Шаг 1. Создать приложение

cPanel → строка поиска → `node` → **Setup Node.js App** → **CREATE APPLICATION**.

- Node.js version — **та же, на которой собирает workflow** (у `.art` взяли
  22.23.2, потому что в Actions стоит Node 22). Не брать 24, если собираете
  на 22.
- Application mode — **Production**
- Application root — **`public_html/admin-panel`**
- Application URL — выбрать **`admin.annamanasaryan.com`** из списка,
  поле справа оставить пустым
- Application startup file — **`app.js`**

Если поддомена `admin.annamanasaryan.com` в списке нет — сначала завести его
в cPanel → Domains, document root оставить по умолчанию. Эта папка FTP-доступу
не видна, и это нормально: у приложения Node папка с файлами и папка адреса —
разные вещи, cPanel сам кладёт в document root правило перенаправления.

### Шаг 2. Переменные

Там же, блок **Environment variables**, кнопка **ADD VARIABLE**, по одной,
каждую подтвердить кнопкой **DONE**, потом **SAVE**:

- `GITHUB_TOKEN` — новый classic token с правом `repo`.
  Прежний, что стоит в Vercel, прочитать нельзя, он скрыт. Создаётся так:
  GitHub → Settings → Developer settings → Personal access tokens →
  Tokens (classic) → Generate new token (classic), права `repo`,
  срок «No expiration».
  Прямая ссылка с уже отмеченными правами:
  `https://github.com/settings/tokens/new?scopes=repo&description=Anna+photo+panel`
- `ADMIN_PASSWORD` — пароль панели. Тот же, что стоит сейчас в Vercel.
  Если он неизвестен (значение скрыто) — перезаписать его в Vercel на
  известное и вписать сюда то же самое, чтобы оба входа открывались одинаково.
- `NEXT_PUBLIC_MEDIA_BASE` — `https://annamanasaryan.com`

Затем **CREATE**.

### Шаг 3. Выложить панель

GitHub → Actions → выбрать workflow выкладки панели → **Run workflow** →
ветка по умолчанию → **Run workflow**.

Первая заливка долгая: у `.art` было около 115 МБ и ~3800 файлов, восемь
минут. Дальше уезжает только изменившееся.

### Шаг 4. Проверить ДО переключения адреса

Адрес ещё ведёт на Vercel, поэтому обращаемся к хостингу напрямую, подменяя
разрешение имени. `-k` нужен: сертификата пока нет.

```bash
curl -k -s -o /dev/null -w '%{http_code} %{redirect_url}\n' --resolve admin.annamanasaryan.com:443:66.29.141.168 https://admin.annamanasaryan.com/
```

```bash
curl -k -s -o /dev/null -w '%{http_code}\n' --resolve admin.annamanasaryan.com:443:66.29.141.168 https://admin.annamanasaryan.com/admin
```

Не открылось — смотреть Passenger log, путь к нему написан в карточке
приложения в cPanel, читается через File Manager. Типовые причины: не хватило
памяти (панели нужно 150–250 МБ), не доехала `.next/static`, не тот
стартовый файл.

### Шаг 5. Переключить адрес

`.com` живёт на серверах имён хостинга, значит:

cPanel → строка поиска → `zone` → **Zone Editor** → у `annamanasaryan.com`
кнопка **Manage** → найти запись `admin` → **Edit**:

- Type: **A**
- Name: **admin**
- Record: **66.29.141.168**
- TTL: 14400 или как стоит у остальных

Если запись сейчас `CNAME` — её надо **удалить** и создать `A` заново:
одновременно `CNAME` и `A` на одном имени держать нельзя.

Проверка: `dig +short admin.annamanasaryan.com` должен отдать
`66.29.141.168`.

### Шаг 6. Сертификат

**Сначала просто подождать.** AutoSSL на этом сервере работает, но выписывает
сертификат только после того, как адрес начал вести на хостинг. У `.art` он
сработал сам примерно через полчаса после переключения DNS и выдал сертификат
SSL.com на полгода, который дальше продлевается сам.

Проверять так:

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://admin.annamanasaryan.com/admin
```

Пока сертификата нет — `000`. Появился — `200` или `307`.

Посмотреть, что выписалось:

```bash
echo | openssl s_client -connect admin.annamanasaryan.com:443 -servername admin.annamanasaryan.com 2>/dev/null | openssl x509 -noout -subject -issuer -dates
```

**Если через сутки не выписался** — выпускать руками, рецепт ниже.

---

## Ручной выпуск сертификата — если AutoSSL не сработал

Бесплатно, Let's Encrypt, минут пятнадцать. Проверено на `.art`.

### 1. Поставить клиент

```bash
brew install acme.sh
```

### 2. Запросить сертификат

**Обязательно `--keylength 2048`.** cPanel не умеет ключи на эллиптической
кривой, а `acme.sh` по умолчанию выпускает именно такие, и они не
устанавливаются вообще никак.

```bash
acme.sh --issue --dns -d admin.annamanasaryan.com --keylength 2048 --server letsencrypt --yes-I-know-dns-manual-mode-enough-go-ahead-please
```

Команда напечатает, какую запись добавить:

```
Domain: '_acme-challenge.admin.annamanasaryan.com'
TXT value: '...'
```

### 3. Добавить запись

Для `.com` — cPanel → **Zone Editor** → Manage → **Add Record**:
Type `TXT`, Name `_acme-challenge.admin`, Record — напечатанное значение.

(Для `.art` то же самое делалось бы в Cloudflare.)

Дождаться, пока запись видна:

```bash
dig +short TXT _acme-challenge.admin.annamanasaryan.com @1.1.1.1
```

### 4. Забрать сертификат

Та же команда, но `--renew` вместо `--issue`:

```bash
acme.sh --renew -d admin.annamanasaryan.com --server letsencrypt --yes-I-know-dns-manual-mode-enough-go-ahead-please
```

Файлы лягут в `~/.acme.sh/admin.annamanasaryan.com/`:
`admin.annamanasaryan.com.cer` (сертификат), `.key` (ключ), `ca.cer`.

Проверить, что ключ в паре с сертификатом:

```bash
openssl x509 -noout -modulus -in ~/.acme.sh/admin.annamanasaryan.com/admin.annamanasaryan.com.cer | openssl md5
```

```bash
openssl rsa -noout -modulus -in ~/.acme.sh/admin.annamanasaryan.com/admin.annamanasaryan.com.key | openssl md5
```

Две строки должны совпасть.

### 5. Поставить в cPanel — тут главная ловушка

**Приватный ключ в поле формы cPanel не принимает.** Пишет
«The key is invalid» на любом формате — и на `BEGIN RSA PRIVATE KEY`, и на
PKCS#8 `BEGIN PRIVATE KEY`, — при том что ключ заведомо годный. На этом
теряется час, если не знать.

Рабочий путь:

1. Скопировать файл ключа туда, где его видно из диалога выбора файла:
   `cp ~/.acme.sh/admin.annamanasaryan.com/admin.annamanasaryan.com.key ~/Desktop/kluch.key`
2. cPanel → **SSL/TLS Certificates** → вкладка **Keys** → раздел
   «Upload a New Private Key» → **Choose a .key file** → выбрать файл →
   кнопка **Upload**. Должно написать «You have successfully uploaded…»
   и показать ID ключа.
3. Вкладка **Installation** → в списке Domain выбрать
   `admin.annamanasaryan.com` → вставить **сертификат** в верхнее поле
   (содержимое `.cer`) → нажать **Autofill by Certificate**. Поле ключа
   заполнится само, поле CABUNDLE тоже.
4. **Install Certificate**. Должно появиться окно «SSL Certificate
   Successfully Updated».

### 6. Убрать временную запись

Удалить TXT `_acme-challenge.admin` — она больше не нужна.

Сертификат Let's Encrypt живёт 90 дней. Если его ставили руками, значит
AutoSSL не работает, и через три месяца процедуру придётся повторить —
записать это в передачу, чтобы не забыть.

---

## Грабли, каждая стоила времени

1. **DNS искали не там.** Для `.art` в передаче было написано «управление
   DNS у Namecheap» — неверно, он на Cloudflare. Для `.com` наоборот, DNS на
   серверах хостинга. **Всегда проверять `dig +short NS домен`**, а не верить
   записям.
2. **Кнопки «Run AutoSSL» в этом cPanel нет.** Namecheap её прячет,
   отдельного инструмента «SSL/TLS Status» тоже нет — только вкладка
   **Status** внутри «SSL/TLS Certificates». Дёрнуть AutoSSL вручную нельзя,
   он ходит сам.
3. **«Namecheap SSL» бесплатных сертификатов не даёт** — только ставит
   купленные в Namecheap. Туда можно не ходить.
4. **cPanel не умеет ключи EC** — см. выше, `--keylength 2048`.
5. **Ключ вставляется только файлом** — см. выше, вкладка Keys.
6. **Сессия cPanel рвётся при смене IP**, выкидывает с надписью «Your IP
   address has changed». Пароль от cPanel заказчику не нужен — заходить
   заново через Namecheap → Hosting List → Manage → cPanel.
7. **Домен в Namecheap лежит под `annamanasaryan.com`**, `.art` показывается
   под ним. Искать в списке хостингов по `.art` бесполезно.
8. **`workflow_dispatch` виден в Actions только с ветки по умолчанию.**
   Положили workflow в рабочую ветку — кнопки не будет.
9. **Не ждать паузами.** `sleep` в этих сессиях заблокирован; состояние
   выкладки смотреть инструментами GitHub (`gh run watch`).
10. **Проверять фактически, а не по факту пуша.** «Запушено» ≠ «видно
    на сайте». Дважды выходило так, что заказчик смотрел на старую версию.

---

## Что будет после переезда

- Заказчица заходит по прежнему адресу, ВПН не нужен.
- Предел на тело запроса исчезает: можно грузить тяжёлые файлы, которые
  Vercel не пропускал (у `.art` это ролики с айфона, 10–40 МБ).
- Vercel остаётся запасным входом. Не выключать.
- **Сказать заказчице, что переезд состоялся** — иначе она продолжит
  включать ВПН по привычке.

---

## Что из этого уже сделано в репозитории Anna_photo

Дописано 27.08.2026, ветка `cursor/namecheap-static-f40b`. Кодовая часть
закрыта целиком, осталось только то, что делается руками в cPanel.

- `next.config.ts` — добавлен `PANEL_BUILD=1`: сборка `standalone`,
  оптимизатор картинок выключен. Флаг статической выгрузки сайта
  (`NAMECHEAP_EXPORT`) не тронут, обе сборки проверены.
- `src/lib/media-url.ts` — помощник `mediaUrl()`. Приклеивает
  `NEXT_PUBLIC_MEDIA_BASE` к путям вида `/photos/...`. Переменная пустая —
  ничего не меняется, поэтому на Vercel панель работает как раньше.
- `src/components/AdminPanel.tsx` — все шесть мест, где панель показывает
  фотографию, пропущены через `mediaUrl()`.
- `.github/workflows/deploy-panel.yml` — выкладка панели, только кнопкой.
- `src/lib/admin-auth.ts` — не тронут, как и договаривались.

### Отличия от рецепта `.art`, о которых стоит знать

**Папку панели workflow ищет сам.** Секрет `FTP_PANEL_DIR` не обязателен:
если он не задан, workflow перебирает `public_html`, `../public_html`,
`../../public_html`, `/home/annaclvt/public_html` и берёт первую папку,
которая открылась и не оказалась папкой `.art`. Панель кладётся в
`<найденное>/admin-panel`. Если не нашлось ни одной — workflow
останавливается и пишет, что нужна отдельная FTP-учётка. Заданный секрет
`FTP_PANEL_DIR` перебор отменяет и используется как есть.

**Замок вокруг `--delete` пришлось усилить.** У `.art` значение было одним
словом, у `.com` это путь, поэтому проверяется ещё и хвост пути: `public_html`
и `что-нибудь/public_html` останавливают выкладку одинаково. Проверено на
всех опасных значениях.

**Перенаправление с корня поддомена живёт в `src/middleware.ts`**, а не в
`next.config.ts`, — оно там было и раньше. Но собирало полный адрес из
`request.nextUrl`, а за Passenger это внутренний `localhost:порт`: заказчица
с `https://admin.annamanasaryan.com/` уехала бы в никуда. Теперь адрес
собирается из заголовков `Host` и `X-Forwarded-Proto` самого запроса.
На Vercel поведение прежнее.

**Вход работает только по HTTPS.** Кука входа помечена `Secure`, поэтому до
установки сертификата панель на хостинге откроется, но войти в неё не
получится. Это нормально и ожидаемо — сначала сертификат, потом проверка входа.

### Проверено локально

- `PANEL_BUILD=1 npm run build` — собирается, `standalone` весит 58 МБ,
  2176 файлов.
- Сборка запущена так же, как её запустит хостинг (`node app.js`):
  `/admin` без входа отдаёт 307 на `/admin/login`, вход по правильному паролю
  открывает панель (200), по неправильному — 401, данные каталога читаются,
  без куки — 401. Корень с заголовком `Host: admin.annamanasaryan.com`
  отдаёт 307 на `https://admin.annamanasaryan.com/admin`.
- Обычная сборка (Vercel) и `npm run export:namecheap` (сайт) собираются
  по-прежнему.

### Что осталось руками

Шаги 1, 2, 5 и 6 из этого документа: создать приложение в cPanel, вписать
переменные, поправить запись `admin` в Zone Editor, дождаться сертификата.
Шаг 3 (нажать кнопку выкладки) — с оговоркой ниже.

**Кнопки «Run workflow» пока не будет.** Настоящий сайт живёт в ветке
`cursor/namecheap-static-f40b`, а ветка по умолчанию — `main`, и она отстаёт.
`workflow_dispatch` показывается в Actions только с ветки по умолчанию
(грабля №8 выше). Значит перед первой выкладкой файл workflow нужно довезти
до `main` — отдельным маленьким коммитом или сменой ветки по умолчанию.
