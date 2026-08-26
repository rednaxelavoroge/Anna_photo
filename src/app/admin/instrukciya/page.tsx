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

function Figure({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <figure className="m-0 flex flex-col gap-2">
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface p-3">
        <div className="min-w-[20rem]">{children}</div>
      </div>
      <figcaption className="text-sm text-muted">{caption}</figcaption>
    </figure>
  );
}

const CHAPTERS = [
  { id: "vhod", num: "01", title: "Как войти в панель" },
  { id: "gde", num: "02", title: "Что где лежит" },
  { id: "lenta", num: "03", title: "Лента на главной странице" },
  { id: "podrazdely", num: "04", title: "Подразделы портфолио" },
  { id: "poryadok", num: "05", title: "Порядок: что за чем стоит" },
  { id: "foto-video", num: "06", title: "Фотографии и видео в кадре" },
  { id: "portret", num: "07", title: "Ваше фото на главной" },
  { id: "sohranit", num: "08", title: "Что происходит после «Сохранить»" },
  { id: "otkat", num: "09", title: "Если удалили лишнее" },
  { id: "melochi", num: "10", title: "Мелочи, которые стоит знать" },
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
            Студия Анны Манасарян
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
                Откройте адрес{" "}
                <span className="font-medium break-all">admin.annamanasaryan.com</span>
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
            Панель открывается и с компьютера, и с телефона. Адрес не меняется — его можно сохранить в закладки.
            Эта инструкция всегда лежит внутри панели: кнопка «Инструкция» наверху.
          </p>
          <Note label="Чтобы не искать каждый раз">
            На айфоне: откройте адрес в Safari, нажмите «Поделиться» внизу, выберите «На экран „Домой“». На андроиде:
            три точки в углу Chrome, «Добавить на главный экран». Панель встанет значком рядом с приложениями.
          </Note>
          <Note label="Если панель снова просит пароль">
            Так бывает, когда её долго не открывали. Введите пароль ещё раз — ничего не потерялось.
          </Note>
        </Chapter>

        <Chapter id="gde" num="02" title="Что где лежит">
          <p className="text-[0.95rem] leading-relaxed text-ink">Наверху панели семь кнопок. Это семь разных мест.</p>
          <Figure caption="Так выглядит верх панели. Тёмная — та, что открыта сейчас.">
            <svg viewBox="0 0 560 136" className="block h-auto w-full" role="img" aria-label="Ряд вкладок наверху панели">
              <rect x="0" y="8" width="110" height="30" rx="15" fill="var(--color-line)" />
              <text x="55" y="27" textAnchor="middle" fontSize="10.5" fontWeight="600" letterSpacing="0.7" fill="var(--color-ink)">
                КАДРЫ
              </text>
              <rect x="120" y="8" width="200" height="30" rx="15" fill="var(--color-line)" />
              <text x="220" y="27" textAnchor="middle" fontSize="10.5" fontWeight="600" letterSpacing="0.7" fill="var(--color-ink)">
                РАЗДЕЛЫ ПОРТФОЛИО
              </text>
              <rect x="330" y="8" width="150" height="30" rx="15" fill="var(--color-line)" />
              <text x="405" y="27" textAnchor="middle" fontSize="10.5" fontWeight="600" letterSpacing="0.7" fill="var(--color-ink)">
                ПОДРАЗДЕЛЫ
              </text>
              <rect x="0" y="48" width="130" height="30" rx="15" fill="var(--color-line)" />
              <text x="65" y="67" textAnchor="middle" fontSize="10.5" fontWeight="600" letterSpacing="0.7" fill="var(--color-ink)">
                ИЗБРАННОЕ
              </text>
              <rect x="140" y="48" width="180" height="30" rx="15" fill="var(--color-ink)" />
              <text x="230" y="67" textAnchor="middle" fontSize="10.5" fontWeight="600" letterSpacing="0.7" fill="#fffcf8">
                ТЕКСТЫ И ОБО МНЕ
              </text>
              <rect x="330" y="48" width="130" height="30" rx="15" fill="var(--color-line)" />
              <text x="395" y="67" textAnchor="middle" fontSize="10.5" fontWeight="600" letterSpacing="0.7" fill="var(--color-ink)">
                БЭКСТЕЙДЖ
              </text>
              <rect x="0" y="88" width="105" height="30" rx="15" fill="var(--color-line)" />
              <text x="52" y="107" textAnchor="middle" fontSize="10.5" fontWeight="600" letterSpacing="0.7" fill="var(--color-ink)">
                КОНТАКТЫ
              </text>
              <text x="300" y="107" fontSize="10" fill="var(--color-muted)">
                выбранная вкладка — тёмная
              </text>
            </svg>
          </Figure>
          <div className="flex flex-col gap-3">
            {[
              ["Кадры", "Все съёмки и портфолио-кадры: добавить, править, удалить. Здесь же — фотографии, видео и подразделы."],
              ["Разделы портфолио", "Большие направления: Новорождённые, Дети, Семья и остальные. Названия, описания, обложки, порядок. Можно завести новое и удалить ненужное."],
              ["Подразделы", "Темы внутри разделов. Завести новый, переименовать, удалить, переставить стрелками."],
              ["Избранное", "Полоса с кадрами на главной: заголовок, подпись и то, какие кадры там стоят."],
              ["Тексты и обо мне", "Имя, слоган, рассказ, портрет, обучение, фототур, видео и отзывы."],
              ["Бэкстейдж", "Кадры со съёмок: подготовка, свет, пауза между дублями."],
              ["Контакты", "Телефоны, WhatsApp, Instagram, Facebook, почта, город."],
            ].map(([name, what]) => (
              <div key={name} className="flex flex-col gap-0.5 border-b border-line/50 pb-3 last:border-b-0 last:pb-0">
                <span className="text-[0.73rem] font-semibold tracking-[0.1em] text-ink uppercase">{name}</span>
                <span className="text-[0.95rem] leading-relaxed text-muted">{what}</span>
              </div>
            ))}
          </div>
        </Chapter>

        <Chapter id="lenta" num="03" title="Избранное на главной странице">
          <p className="text-[0.95rem] leading-relaxed text-ink">
            Это широкая полоса с кадрами на главной. Название, подпись и состав — ваши: какие съёмки там стоят и в каком порядке.
          </p>
          <h3 className="mt-2 font-display text-base font-semibold text-ink">Где она в панели</h3>
          <Steps
            items={[
              <>
                Нажмите вкладку <Btn>ИЗБРАННОЕ</Btn> в верхней строке
              </>,
              <>В скобках рядом с названием вкладки — сколько кадров выбрано сейчас</>,
            ]}
          />
          <Figure caption="Тот же блок в панели: галочка сверху, три поля, список выбранного и поиск.">
            <svg viewBox="0 0 560 300" className="block h-auto w-full" role="img" aria-label="Блок «Лента избранного на главной» в панели">
              <rect x="0.5" y="0.5" width="559" height="299" rx="14" fill="none" stroke="var(--color-line)" />
              <text x="18" y="26" fontSize="10.5" fontWeight="600" letterSpacing="1.2" fill="var(--color-muted)">
                ЛЕНТА ИЗБРАННОГО НА ГЛАВНОЙ
              </text>
              <rect x="424" y="16" width="12" height="12" rx="3" fill="var(--color-ink)" />
              <path d="M427 22 l3 3 l5 -6" stroke="#fffcf8" strokeWidth="1.6" fill="none" strokeLinecap="round" />
              <text x="443" y="26" fontSize="11" fill="var(--color-ink)">
                Показывать на сайте
              </text>
              <text x="18" y="54" fontSize="9" fontWeight="600" letterSpacing="0.9" fill="var(--color-muted)">
                НАДПИСЬ СВЕРХУ
              </text>
              <rect x="18" y="60" width="248" height="26" rx="10" fill="none" stroke="var(--color-line)" />
              <text x="30" y="77" fontSize="11" fill="var(--color-ink)">
                Избранное
              </text>
              <text x="286" y="54" fontSize="9" fontWeight="600" letterSpacing="0.9" fill="var(--color-muted)">
                ЗАГОЛОВОК
              </text>
              <rect x="286" y="60" width="248" height="26" rx="10" fill="none" stroke="var(--color-line)" />
              <text x="298" y="77" fontSize="11" fill="var(--color-ink)">
                Коллекция сезона
              </text>
              <text x="18" y="108" fontSize="9" fontWeight="600" letterSpacing="0.9" fill="var(--color-muted)">
                ПОДПИСЬ ПОД ЗАГОЛОВКОМ
              </text>
              <rect x="18" y="114" width="516" height="26" rx="10" fill="none" stroke="var(--color-line)" />
              <text x="30" y="131" fontSize="11" fill="var(--color-ink)">
                Кадры, которые хочется показать первыми
              </text>
              <text x="18" y="162" fontSize="9" fontWeight="600" letterSpacing="0.9" fill="var(--color-muted)">
                ВЫБРАННЫЕ КАДРЫ (2)
              </text>
              <rect x="18" y="170" width="516" height="30" rx="10" fill="none" stroke="var(--color-line)" />
              <text x="30" y="189" fontSize="10" fill="var(--color-muted)">
                1
              </text>
              <text x="46" y="189" fontSize="11" fill="var(--color-ink)">
                Семейная фотосессия
              </text>
              <text x="450" y="190" fontSize="13" fill="var(--color-muted)">
                ↑
              </text>
              <text x="474" y="190" fontSize="13" fill="var(--color-muted)">
                ↓
              </text>
              <text x="500" y="190" fontSize="12" fill="var(--color-muted)">
                ✕
              </text>
              <rect x="18" y="206" width="516" height="30" rx="10" fill="none" stroke="var(--color-line)" />
              <text x="30" y="225" fontSize="10" fill="var(--color-muted)">
                2
              </text>
              <text x="46" y="225" fontSize="11" fill="var(--color-ink)">
                Новорождённые
              </text>
              <text x="450" y="226" fontSize="13" fill="var(--color-muted)">
                ↑
              </text>
              <text x="474" y="226" fontSize="13" fill="var(--color-muted)">
                ↓
              </text>
              <text x="500" y="226" fontSize="12" fill="var(--color-muted)">
                ✕
              </text>
              <rect x="18" y="252" width="516" height="28" rx="10" fill="none" stroke="var(--color-line)" />
              <text x="30" y="270" fontSize="11" fill="var(--color-muted)">
                Найти кадр по названию…
              </text>
            </svg>
          </Figure>
          <h3 className="mt-2 font-display text-base font-semibold text-ink">Что меняют поля</h3>
          <Bullets
            items={[
              <>
                <strong className="font-semibold">Показывать на сайте</strong> — галочка справа сверху. Снимете — вся лента пропадёт с главной. Поставите обратно — вернётся.
              </>,
              <>
                <Field>Надпись сверху</Field> — мелкая строчка над заголовком.
              </>,
              <>
                <Field>Заголовок</Field> — крупная надпись. «Коллекция сезона», «К Новому году» — что нужно.
              </>,
              <>
                <Field>Подпись под заголовком</Field> — строчка помельче. Можно оставить пустой.
              </>,
            ]}
          />
          <h3 className="mt-2 font-display text-base font-semibold text-ink">Как набрать кадры</h3>
          <Steps
            items={[
              <>
                Найдите внизу блока поле <Field>Найти кадр по названию</Field>
              </>,
              <>Начните печатать название — например, «семья». Ниже останется только оно.</>,
              <>Нажмите на найденный кадр — он встанет в список выше.</>,
              <>Так же добавьте остальные, сколько захотите.</>,
              <>
                Нажмите <Btn>СОХРАНИТЬ ИЗБРАННОЕ →</Btn> в самом низу
              </>,
            ]}
          />
          <Note label="Если не выбрать ни одного">
            Лента не опустеет. Она соберётся сама — по одному кадру из каждого раздела портфолио. Пустого места на главной не будет.
          </Note>
          <Note label="Главное не забыть">
            Пока не нажата <Btn>СОХРАНИТЬ ИЗБРАННОЕ →</Btn>, на сайте ничего не изменится.
          </Note>
        </Chapter>

        <Chapter id="podrazdely" num="04" title="Подразделы портфолио">
          <h3 className="font-display text-base font-semibold text-ink">Как устроено портфолио</h3>
          <p className="text-[0.95rem] leading-relaxed text-ink">
            Три уровня. Сначала <strong className="font-semibold">раздел</strong> — Новорождённые, Дети, Семья. Внутри раздела{" "}
            <strong className="font-semibold">подразделы</strong> — темы. А внутри уже сами кадры.
          </p>
          <Figure caption="Подраздел живёт внутри того раздела, где лежит помеченный кадр.">
            <svg viewBox="0 0 560 210" className="block h-auto w-full" role="img" aria-label="Три уровня портфолио: раздел, подраздел, кадры">
              <rect x="0" y="14" width="150" height="34" rx="12" fill="var(--color-line)" />
              <text x="75" y="36" textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--color-ink)">
                Дети
              </text>
              <text x="75" y="62" textAnchor="middle" fontSize="9.5" letterSpacing="1" fill="var(--color-muted)">
                РАЗДЕЛ
              </text>
              <path d="M150 31 h40" stroke="var(--color-line)" strokeWidth="1.5" />
              <rect x="196" y="0" width="164" height="30" rx="11" fill="none" stroke="var(--color-line)" />
              <text x="278" y="20" textAnchor="middle" fontSize="12" fill="var(--color-ink)">
                Студия
              </text>
              <rect x="196" y="40" width="164" height="30" rx="11" fill="none" stroke="var(--color-line)" />
              <text x="278" y="60" textAnchor="middle" fontSize="12" fill="var(--color-ink)">
                Природа
              </text>
              <rect x="196" y="80" width="164" height="30" rx="11" fill="none" stroke="var(--color-line)" />
              <text x="278" y="100" textAnchor="middle" fontSize="12" fill="var(--color-ink)">
                Дом
              </text>
              <text x="278" y="128" textAnchor="middle" fontSize="9.5" letterSpacing="1" fill="var(--color-muted)">
                ПОДРАЗДЕЛЫ
              </text>
              <path d="M360 55 h36" stroke="var(--color-line)" strokeWidth="1.5" />
              <rect x="400" y="20" width="46" height="46" rx="10" fill="var(--color-line)" />
              <rect x="456" y="20" width="46" height="46" rx="10" fill="var(--color-line)" />
              <rect x="512" y="20" width="46" height="46" rx="10" fill="var(--color-line)" />
              <rect x="400" y="72" width="46" height="46" rx="10" fill="var(--color-line)" />
              <rect x="456" y="72" width="46" height="46" rx="10" fill="var(--color-line)" />
              <rect x="512" y="72" width="46" height="46" rx="10" fill="var(--color-line)" />
              <text x="479" y="136" textAnchor="middle" fontSize="9.5" letterSpacing="1" fill="var(--color-muted)">
                КАДРЫ
              </text>
              <text x="0" y="172" fontSize="11.5" fill="var(--color-muted)">
                Подраздел — это метка на кадре. Он появляется в портфолио тогда,
              </text>
              <text x="0" y="190" fontSize="11.5" fill="var(--color-muted)">
                когда метку получает хотя бы один кадр. Пустых не бывает.
              </text>
            </svg>
          </Figure>
          <h3 className="mt-2 font-display text-base font-semibold text-ink">Как завести новый подраздел</h3>
          <Steps
            items={[
              <>
                Нажмите вкладку <Btn>ПОДРАЗДЕЛЫ</Btn> в верхней строке
              </>,
              <>В самом верху, в поле «Новый подраздел», впишите название — например, «Свадьба»</>,
              <>
                Нажмите <Btn>+ СОЗДАТЬ ПОДРАЗДЕЛ</Btn>
              </>,
              <>Он тут же встанет в список ниже</>,
            ]}
          />
          <Note label="В портфолио он появится не сразу">
            Подраздел показывается там, где есть отмеченные им кадры. Пока ни один не отмечен, на сайте его не видно — и это правильно.
          </Note>
          <h3 className="mt-2 font-display text-base font-semibold text-ink">Тот же подраздел можно завести прямо из карточки кадра</h3>
          <Steps
            items={[
              <>
                Вкладка <Btn>КАДРЫ</Btn>, найдите кадр через поиск наверху
              </>,
              <>
                Нажмите под ним <Btn>Редактировать</Btn>
              </>,
              <>Пролистайте окно до блока «Подразделы и темы»</>,
              <>Под кругляшками найдите поле «Нет нужного подраздела? Создайте свой»</>,
              <>
                Впишите название и нажмите <Btn>+ СОЗДАТЬ ПОДРАЗДЕЛ</Btn>
              </>,
              <>Подраздел появится среди кругляшков — уже с галочкой</>,
              <>
                Нажмите внизу окна <Btn>СОХРАНИТЬ КАДР ✓</Btn>
              </>,
            ]}
          />
        </Chapter>

        <Chapter id="poryadok" num="05" title="Порядок: что за чем стоит">
          <p className="text-[0.95rem] leading-relaxed text-ink">
            Везде, где важно, что идёт первым, у строк и карточек есть стрелки <Btn>↑</Btn> <Btn>↓</Btn>. Нажали —
            переставилось и сразу сохранилось, отдельной кнопки не нужно. Порядок в панели и есть порядок на сайте.
          </p>
          <Bullets
            items={[
              <>
                <strong className="font-semibold">Разделы портфолио.</strong> Вкладка <Btn>Разделы портфолио</Btn>. Стрелки слева, затем «Редактировать» и «Удалить».
              </>,
              <>
                <strong className="font-semibold">Подразделы.</strong> Вкладка <Btn>Подразделы</Btn>. Здесь же их можно переименовать и удалить.
              </>,
              <>
                <strong className="font-semibold">Кадры внутри раздела.</strong> Вкладка <Btn>Кадры</Btn>: выберите один раздел в списке и очистите поиск — у карточек появятся стрелки. Пока выбрано «Все разделы», стрелок нет.
              </>,
              <>
                <strong className="font-semibold">Кадры бэкстейджа.</strong> Вкладка <Btn>Бэкстейдж</Btn>, стрелки под каждым кадром. Номер — его место в ленте.
              </>,
              <>
                <strong className="font-semibold">Фотографии одного кадра.</strong> Внутри окна, стрелки <Btn>←</Btn> <Btn>→</Btn> под каждым снимком. Первый помечен словом «Обложка».
              </>,
            ]}
          />
          <Note label="Про разделы и ссылки">
            Переименование меняет только надпись. Адрес раздела остаётся прежним, поэтому ссылки, которые вы кому-то отправляли, продолжают работать.
          </Note>
        </Chapter>

        <Chapter id="foto-video" num="06" title="Фотографии и видео в кадре">
          <p className="text-[0.95rem] leading-relaxed text-ink">
            Всё это внизу окна <Field>Редактирование кадра</Field>.
          </p>
          <Bullets
            items={[
              <>
                <strong className="font-semibold">Убрать фотографию</strong> — крестик <Btn>✕</Btn> под снимком. Добавить — выбрать файлы, можно сразу несколько. Записывается всё кнопкой <Btn>Сохранить кадр</Btn>. Закрыли окно через <Btn>Отмена</Btn> — всё осталось как было.
              </>,
              <>Совсем без фотографий кадр сохранить нельзя — панель об этом скажет.</>,
              <>
                <strong className="font-semibold">Видео.</strong> Поле <Field>Видео (YouTube id или ссылка)</Field> внизу окна. Снятый на телефон ролик лучше выложить на YouTube и вставить ссылку — так он будет открываться быстрее.
              </>,
            ]}
          />
        </Chapter>

        <Chapter id="portret" num="07" title="Ваше фото на главной">
          <p className="text-[0.95rem] leading-relaxed text-ink">
            Это портрет на первом экране и на странице «Обо мне». Раньше картинка была вшита, теперь её можно сменить самой.
          </p>
          <Steps
            items={[
              <>
                Вкладка <Btn>ТЕКСТЫ И ОБО МНЕ</Btn>
              </>,
              <>
                Блок <Field>Портретное фото автора</Field>
              </>,
              <>Выберите снимок с компьютера или с телефона. Панель сожмёт его сама.</>,
              <>
                Нажмите <Btn>СОХРАНИТЬ ВСЕ ТЕКСТЫ →</Btn>
              </>,
            ]}
          />
          <Note label="Пока не сохранили">
            Превью в панели уже видно. На сайте портрет сменится после кнопки сохранения — вместе с остальными текстами.
          </Note>
        </Chapter>

        <Chapter id="sohranit" num="08" title="Что происходит после «Сохранить»">
          <p className="text-[0.95rem] leading-relaxed text-ink">
            Правка сохраняется сразу, но сайт обновляется не мгновенно: он собирается заново целиком. Это занимает{" "}
            <strong className="font-semibold">от пяти до десяти минут</strong>.
          </p>
          <Bullets
            items={[
              <>Нажимать «Сохранить» второй и третий раз не нужно — от этого только дольше.</>,
              <>Когда время вышло, откройте сайт и обновите страницу. На телефоне — потяните её вниз.</>,
              <>
                На компьютере обновляйте с очисткой: <strong className="font-semibold">Ctrl + Shift + R</strong>, на Маке{" "}
                <strong className="font-semibold">Cmd + Shift + R</strong>. Иначе браузер покажет вчерашнюю страницу из своей памяти.
              </>,
            ]}
          />
          <Note label="Панель и сайт идут не в ногу — так и должно быть">
            Сама панель показывает изменение сразу: удалили кадр — он тут же пропал из списка. Сайт догоняет через несколько минут. Повторять удаление, пока сайт ещё старый, не нужно.
          </Note>
          <Note label="Если через полчаса ничего не изменилось">
            Напишите разработчику и скажите, что именно правили. Правка не пропала — она сохранена, просто застряла где-то по дороге на сайт.
          </Note>
        </Chapter>

        <Chapter id="otkat" num="09" title="Если удалили лишнее">
          <p className="text-[0.95rem] leading-relaxed text-ink">
            Вернуть можно всё и на любой день назад. Каждое сохранение записывается отдельно.
          </p>
          <Bullets
            items={[
              <>
                <strong className="font-semibold">Пока окно кадра открыто</strong> — достаточно нажать <Btn>Отмена</Btn>. Ничего сохранено не было.
              </>,
              <>
                <strong className="font-semibold">Уже сохранили и передумали</strong> — чаще всего проще сделать обратное действие руками: вернуть подраздел стрелками, заново отметить тему, загрузить фотографию.
              </>,
              <>
                <strong className="font-semibold">Удалили много и не помните что</strong> — напишите разработчику: «верните, как было вчера утром». Состояние сайта откатывается на нужный день целиком.
              </>,
            ]}
          />
        </Chapter>

        <Chapter id="melochi" num="10" title="Мелочи, которые стоит знать">
          <Bullets
            items={[
              <>Фотографии можно грузить любые, прямо с телефона: панель сама их сожмёт, качество не пострадает.</>,
              <>Цен на сайте нет нигде и не появится — так задумано.</>,
              <>
                Название раздела правятся свободно: адрес страницы за ним не тянется, ссылки не ломаются. Новый раздел заводится кнопкой <Btn>+ Добавить новый раздел</Btn>.
              </>,
              <>
                Один кадр может стоять сразу в нескольких разделах — отметьте столько кругляшков, сколько подходит.
              </>,
              <>
                Ломать панель, нажимая не туда, не получится: вернуть можно любое действие — как именно, написано в главе{" "}
                <a href="#otkat" className="font-semibold underline">
                  «Если удалили лишнее»
                </a>
                .
              </>,
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
