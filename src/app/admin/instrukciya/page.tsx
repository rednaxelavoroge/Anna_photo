import { isAdmin } from "@/lib/admin-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Инструкция — панель Анны",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function Btn({ children }: { children: React.ReactNode }) {
  return (
    <span className="mx-0.5 inline rounded-full bg-line px-1.5 py-0.5 text-[0.72rem] font-semibold tracking-wide text-ink">
      {children}
    </span>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return (
    <span className="mx-0.5 inline rounded-md border border-line px-1.5 py-0.5 text-[0.72rem] font-medium tracking-wide text-muted uppercase">
      {children}
    </span>
  );
}

function Note({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border border-line bg-surface px-4 py-3.5">
      <span className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted uppercase">{label}</span>
      <p className="text-sm leading-relaxed text-ink">{children}</p>
    </div>
  );
}

function Chapter({
  id,
  num,
  title,
  children,
}: {
  id: string;
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="flex scroll-mt-6 flex-col gap-4 border-t border-line pt-8">
      <span className="text-[0.68rem] font-semibold tracking-[0.2em] text-muted uppercase">Глава {num}</span>
      <h2 className="-mt-2 font-display text-2xl leading-tight text-ink">{title}</h2>
      {children}
    </section>
  );
}

function Steps({ items }: { items: React.ReactNode[] }) {
  return (
    <ol className="flex list-none flex-col gap-3 p-0">
      {items.map((item, i) => (
        <li key={i} className="grid grid-cols-[1.75rem_1fr] items-baseline gap-1">
          <span className="font-display text-sm font-semibold text-muted tabular-nums">{i + 1}</span>
          <span className="text-[0.95rem] leading-relaxed text-ink">{item}</span>
        </li>
      ))}
    </ol>
  );
}

function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex list-none flex-col gap-2.5 p-0">
      {items.map((item, i) => (
        <li key={i} className="grid grid-cols-[0.9rem_1fr] items-baseline gap-2.5">
          <span className="text-muted">—</span>
          <span className="text-[0.95rem] leading-relaxed text-ink">{item}</span>
        </li>
      ))}
    </ul>
  );
}

const CHAPTERS = [
  { id: "vhod", num: "01", title: "Как войти в панель" },
  { id: "gde", num: "02", title: "Что где лежит" },
  { id: "kadry", num: "03", title: "Кадры: добавить, поправить, удалить" },
  { id: "poryadok", num: "04", title: "Порядок: что за чем стоит" },
  { id: "razdely", num: "05", title: "Разделы портфолио" },
  { id: "podrazdely", num: "06", title: "Подразделы внутри раздела" },
  { id: "galerei", num: "07", title: "Бэкстейдж, отзывы, воркшопы, фотоархив" },
  { id: "roliki", num: "08", title: "Ролики с телефона" },
  { id: "teksty", num: "09", title: "Тексты, пресса, ТВ, фототуры, контакты" },
  { id: "papki", num: "10", title: "Файлы, положенные мимо панели" },
  { id: "sohranit", num: "11", title: "После «Сохранить» и если удалили лишнее" },
];

export default async function InstrukciyaPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto flex max-w-2xl flex-col gap-12 px-5 py-12 md:px-8 md:py-16">
        <header className="flex flex-col gap-3">
          <Link
            href="/admin"
            className="self-start rounded-full border border-line bg-surface px-4 py-2 text-xs font-medium text-ink"
          >
            ← Вернуться в панель
          </Link>
          <span className="mt-3 text-[0.7rem] font-semibold tracking-[0.22em] text-muted uppercase">
            Сайт Анны Манасарян
          </span>
          <h1 className="font-display text-3xl leading-tight text-ink md:text-4xl">Как менять сайт самой</h1>
          <p className="text-base leading-relaxed text-muted">
            Каждая глава — одно дело, от начала до конца. Заранее знать ничего не нужно.
          </p>
        </header>

        <nav aria-label="Главы" className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface">
          {CHAPTERS.map((chapter) => (
            <a
              key={chapter.id}
              href={`#${chapter.id}`}
              className="grid grid-cols-[2.2rem_1fr] items-baseline gap-2 border-b border-line/60 px-4 py-3 text-[0.95rem] text-ink last:border-b-0 hover:bg-paper"
            >
              <span className="font-display text-xs font-semibold text-muted tabular-nums">{chapter.num}</span>
              <span>{chapter.title}</span>
            </a>
          ))}
        </nav>

        <Chapter id="vhod" num="01" title="Как войти в панель">
          <Steps
            items={[
              <>
                Откройте адрес <span className="font-medium break-all">admin.annamanasaryan.com</span>
              </>,
              <>
                Введите пароль в поле <Field>Пароль</Field>
              </>,
              <>
                Нажмите <Btn>ВОЙТИ В КАБИНЕТ →</Btn>
              </>,
            ]}
          />
          <p className="text-[0.95rem] leading-relaxed text-ink">
            Панель открывается и с компьютера, и с телефона. Эта инструкция всегда лежит внутри панели: кнопка «Инструкция» наверху.
          </p>
          <Note label="Чтобы не искать каждый раз">
            На айфоне: откройте адрес в Safari, «Поделиться» внизу, «На экран „Домой“». На андроиде: три точки в углу Chrome,
            «Добавить на главный экран». Панель встанет значком рядом с приложениями.
          </Note>
        </Chapter>

        <Chapter id="gde" num="02" title="Что где лежит">
          <p className="text-[0.95rem] leading-relaxed text-ink">Наверху панели девять кнопок — девять мест сайта.</p>
          <Bullets
            items={[
              <>
                <Btn>КАДРЫ</Btn> — все фотографии и ролики портфолио. Добавить, подписать, переставить, перенести в другой раздел, удалить.
              </>,
              <>
                <Btn>РАЗДЕЛЫ</Btn> — девятнадцать блоков на главной и пункты портфолио: название, описание, обложка, порядок.
              </>,
              <>
                <Btn>ПОДРАЗДЕЛЫ</Btn> — темы внутри раздела, например «Путешествия → Армения, Италия».
              </>,
              <>
                <Btn>БЭКСТЕЙДЖ</Btn>, <Btn>ОТЗЫВЫ</Btn> — кадры и ролики этих страниц.
              </>,
              <>
                <Btn>ОБУЧЕНИЕ</Btn> — тексты страницы, видео мастер-класса, коллажи воркшопов.
              </>,
              <>
                <Btn>ОБО МНЕ И ПРЕССА</Btn> — первый экран главной, биография, публикации, ссылки на прессу, ТВ, фотоархив.
              </>,
              <>
                <Btn>ФОТОТУРЫ</Btn> — тексты и обложка страницы.
              </>,
              <>
                <Btn>КОНТАКТЫ</Btn> — WhatsApp, телефоны, почта, Instagram.
              </>,
            ]}
          />
          <Note label="Число в скобках">
            Рядом с названием вкладки стоит число — сколько там кадров или разделов сейчас.
          </Note>
        </Chapter>

        <Chapter id="kadry" num="03" title="Кадры: добавить, поправить, удалить">
          <p className="text-[0.95rem] leading-relaxed text-ink">
            Кадр — это одна или несколько фотографий (можно и ролик) с названием, разделом и подразделами. На сайте видны все файлы кадра по порядку, первый — обложка.
          </p>
          <p className="font-medium text-ink">Добавить новый кадр</p>
          <Steps
            items={[
              <>
                Вкладка <Btn>КАДРЫ</Btn>, кнопка <Btn>+ НОВЫЙ КАДР</Btn>. Если перед этим выбрать раздел в списке «Все разделы», он уже будет отмечен.
              </>,
              <>Впишите название — оно видно в панели и помогает поиску.</>,
              <>Отметьте разделы. Один кадр может стоять в нескольких разделах сразу — так вы и просили.</>,
              <>
                <Btn>ДОБАВИТЬ ФОТОГРАФИИ</Btn> — выберите файлы, можно несколько. Панель сама сожмёт их до нужного размера.
              </>,
              <>
                <Btn>СОХРАНИТЬ КАДР ✓</Btn>
              </>,
            ]}
          />
          <p className="font-medium text-ink">Поправить кадр</p>
          <Bullets
            items={[
              <>Найдите кадр: поле «Поиск по названию» или список «Все разделы» сверху.</>,
              <>
                <Btn>РЕДАКТИРОВАТЬ</Btn> под кадром открывает то же окно. Крестик на файле убирает его, стрелки и перетаскивание меняют порядок внутри кадра.
              </>,
              <>
                <Btn>УДАЛИТЬ</Btn> убирает кадр с сайта вместе с файлами. Панель переспросит.
              </>,
            ]}
          />
          <Note label="Сколько файлов в кадре">
            Под названием кадра в списке написано «файлов: 3», если их больше одного. Все они показываются на сайте, не только обложка.
          </Note>
        </Chapter>

        <Chapter id="poryadok" num="04" title="Порядок: что за чем стоит">
          <p className="text-[0.95rem] leading-relaxed text-ink">
            <strong>Возьмите карточку мышью и перетащите на нужное место.</strong> Место, куда она встанет, подсвечивается рамкой. Отпустили — порядок сохранился, отдельной кнопки нет.
          </p>
          <p className="text-[0.95rem] leading-relaxed text-ink">
            <strong>На телефоне — нажмите на карточку и подержите.</strong> Примерно треть секунды: карточка приподнимется, дальше ведите пальцем и отпустите где нужно. Пока держите меньше — палец просто листает страницу.
          </p>
          <p className="text-[0.95rem] leading-relaxed text-ink">Стрелки ↑ ↓ никуда не делись, если так привычнее.</p>
          <Bullets
            items={[
              <>кадры внутри раздела — вкладка <Btn>КАДРЫ</Btn>, выберите раздел в списке сверху, тогда появятся и номера;</>,
              <>разделы на главной — вкладка <Btn>РАЗДЕЛЫ</Btn>;</>,
              <>подразделы, бэкстейдж, отзывы, воркшопы, фотоархив, публикации — на своих вкладках;</>,
              <>файлы внутри кадра — в окне кадра.</>,
            ]}
          />
        </Chapter>

        <Chapter id="razdely" num="05" title="Разделы портфолио">
          <Bullets
            items={[
              <>
                <Btn>+ ДОБАВИТЬ РАЗДЕЛ</Btn> — название в меню обязательно, остальное можно позже. Адрес страницы панель сделает сама.
              </>,
              <>Описание показывается под названием раздела на главной.</>,
              <>Обложка: если не выбрана, обложкой становится первый кадр раздела. Хотите другую — <Btn>ВЫБРАТЬ ОБЛОЖКУ</Btn>.</>,
              <>Удаление раздела кадры не трогает: с них только снимается этот раздел.</>,
            ]}
          />
        </Chapter>

        <Chapter id="podrazdely" num="06" title="Подразделы внутри раздела">
          <p className="text-[0.95rem] leading-relaxed text-ink">
            Подраздел — это метка на кадре. Как только в разделе есть хотя бы один кадр с меткой, на сайте внутри раздела появляется полоска «Все · Армения · Италия…», и у каждой темы своя страница.
          </p>
          <Steps
            items={[
              <>
                Завести: вкладка <Btn>ПОДРАЗДЕЛЫ</Btn>, впишите название, <Btn>+ СОЗДАТЬ ПОДРАЗДЕЛ</Btn>. Или прямо в окне кадра, поле «Новый подраздел».
              </>,
              <>Отметить кадры: в окне кадра нажмите кружок нужного подраздела, сохраните.</>,
              <>Переименование ничего не ломает; удаление снимает метку с кадров, кадры остаются.</>,
            ]}
          />
        </Chapter>

        <Chapter id="galerei" num="07" title="Бэкстейдж, отзывы, воркшопы, фотоархив">
          <p className="text-[0.95rem] leading-relaxed text-ink">
            Эти четыре места устроены одинаково: список кадров в том порядке, в каком они на сайте.
          </p>
          <Steps
            items={[
              <>
                <Btn>ФОТОГРАФИИ</Btn> — выбрать файлы; в бэкстейдж можно и <Btn>РОЛИК С ТЕЛЕФОНА</Btn>. Выбранное встаёт в ряд ожидания.
              </>,
              <>Подпись (необязательно) — одна на всё, что выбрали; потом её можно поправить под каждым кадром.</>,
              <>
                <Btn>ОПУБЛИКОВАТЬ →</Btn>
              </>,
            ]}
          />
          <Bullets
            items={[
              <>Подпись под кадром правится прямо в списке и записывается, когда вы уходите из поля.</>,
              <>
                <Btn>УДАЛИТЬ</Btn> под кадром убирает его с сайта вместе с файлом.
              </>,
              <>Воркшопы лежат на вкладке «Обучение» внизу; фотоархив — на вкладке «Обо мне и пресса» внизу.</>,
            ]}
          />
        </Chapter>

        <Chapter id="roliki" num="08" title="Ролики с телефона">
          <p className="text-[0.95rem] leading-relaxed text-ink">
            Ролик выбирается как есть, до 200 МБ. Панель отправляет его и показывает проценты; потом ролик сжимается — это минута-две, и всё это время бежит полоска и секунды. Панель не зависла, просто ждёт.
          </p>
          <Bullets
            items={[
              <>Пока ролик не готов, кнопка «Сохранить» погашена. Как только готов — ролик встаёт в список, и можно сохранять.</>,
              <>Ролик можно положить в кадр портфолио, в бэкстейдж, в видео мастер-класса и в «ТВ обо мне».</>,
              <>Если ролик не доехал, панель напишет об этом словами. Просто выберите его ещё раз.</>,
            ]}
          />
        </Chapter>

        <Chapter id="teksty" num="09" title="Тексты, пресса, ТВ, фототуры, контакты">
          <Bullets
            items={[
              <>
                <Btn>ОБО МНЕ И ПРЕССА</Btn>: подпись под портретом на главной, сам портрет, биография. В биографии каждая строка — через пустую строку; жирный текст — две звёздочки по краям: **так**.
              </>,
              <>Публикации: карточка — одна статья или страница издания. <Btn>ОТКРЫТЬ</Btn> — и внутри заголовок, издание, дата, текст, страницы издания. <Btn>+ НОВАЯ ПУБЛИКАЦИЯ</Btn> добавляет карточку сверху.</>,
              <>Ссылки на публикации — заголовок, издание, адрес. ТВ обо мне — ролики на сайте и текстовый список эфиров с YouTube.</>,
              <>
                <Btn>ОБУЧЕНИЕ</Btn>: две крупные строки с пояснениями, видео мастер-класса с подписями, коллажи воркшопов.
              </>,
              <>
                <Btn>ФОТОТУРЫ</Btn>: заголовок, текст, надпись на кнопке, обложка.
              </>,
              <>
                <Btn>КОНТАКТЫ</Btn>: активный номер WhatsApp — на него ведут все кнопки «Написать» на сайте. Кнопки «Армения» и «Россия» подставляют один из телефонов; «Проверить переход» открывает WhatsApp по этому номеру.
              </>,
              <>
                На каждой из этих вкладок внизу кнопка <Btn>СОХРАНИТЬ →</Btn>. Пока её не нажали, на сайте ничего не меняется.
              </>,
            ]}
          />
        </Chapter>

        <Chapter id="papki" num="10" title="Файлы, положенные мимо панели">
          <p className="text-[0.95rem] leading-relaxed text-ink">
            Иногда разработчик кладёт фотографии прямо в папки сайта. Такие файлы сразу видны на сайте в конце своего раздела, но панель про них ещё не знает.
          </p>
          <Steps
            items={[
              <>
                Нажмите <Btn>ПРОВЕРИТЬ ПАПКИ</Btn> на вкладке «Кадры» (или «Проверить папку» на бэкстейдже, отзывах, воркшопах, фотоархиве).
              </>,
              <>Панель скажет, сколько нашла. Кнопка <Btn>ДОБАВИТЬ ИХ В КАДРЫ</Btn> делает из них обычные кадры, дальше с ними всё как всегда.</>,
            ]}
          />
        </Chapter>

        <Chapter id="sohranit" num="11" title="После «Сохранить» и если удалили лишнее">
          <Bullets
            items={[
              <>Сайт пересобирается целиком: правка появляется на сайте через 3–5 минут. Жать «Сохранить» повторно не нужно.</>,
              <>Панель показывает изменение сразу и после перезагрузки его не теряет. Расхождение с сайтом на несколько минут — норма.</>,
              <>Страницу сайта лучше обновлять с очисткой: Ctrl + Shift + R, на Маке Cmd + Shift + R.</>,
              <>Каждое сохранение записывается отдельно, поэтому вернуть можно любой день. Пока окно кадра открыто — достаточно «Отмена». После сохранения проще сделать обратное действие руками; откат целиком делает разработчик по просьбе.</>,
            ]}
          />
        </Chapter>

        <footer className="flex flex-col gap-2 border-t border-line pt-7 text-sm text-muted">
          <p>Эта страница будет пополняться: появится новая возможность — появится и глава про неё.</p>
          <p>Если что-то повело себя не так, как здесь написано, — напишите разработчику и скажите, на каком шаге остановились.</p>
          <Link
            href="/admin"
            className="mt-2 self-start rounded-full border border-line bg-surface px-4 py-2 text-xs font-medium text-ink"
          >
            ← Вернуться в панель
          </Link>
        </footer>
      </div>
    </div>
  );
}
