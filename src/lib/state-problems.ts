import type { StudioState } from "@/lib/admin-store";

/*
  Что здесь и зачем.

  Панель сохраняет всё содержимое сайта одним запросом, и до этой правки
  сервер проверял ровно три вещи: что пришли разделы, кадры и site. Что
  внутри — не смотрел никто. Кадр без раздела молча ложился в данные и
  просто нигде не показывался; ролик без ссылки давал пустую рамку;
  подпись, которую забыли, оставалась пустой навсегда.

  Такое не падает и не жалуется — оно тихо не работает. Заказчица видит
  «Сохранено», а на сайте нет ничего, и узнаём мы об этом через сутки с её
  слов. У соседнего сайта, каталога свечей, тот же изъян 08.09.2026 стоил
  52 минут работы: панель приняла изделие без описания, сборка сайта на нём
  легла, и всё, что сохранялось после, до сайта не доехало.

  Поэтому панель теперь отказывает сразу и словами: какой кадр, какое поле,
  что с ним не так. Проверяется только то, без чего вещь на сайте не
  работает, — не «хорошо бы заполнить», а «иначе не покажется».
*/

/** Пусто — это и не строка, и строка из одних пробелов. */
function blank(value: unknown): boolean {
  return typeof value !== "string" || value.trim() === "";
}

/** Как назвать вещь в тексте ошибки: имя, если есть, иначе файл, иначе номер. */
function label(parts: Array<unknown>, fallback: string): string {
  for (const part of parts) {
    if (typeof part === "string" && part.trim() !== "") return part.trim();
  }
  return fallback;
}

/**
 * Что в содержимом не даст вещи показаться на сайте. Пустой список — всё в
 * порядке.
 *
 * Проверка нарочно узкая. Запрет сохранять — тяжёлая мера: панель пишет всё
 * одним запросом, и лишнее правило заперло бы заказчицу на пустом поле,
 * которое ни на что не влияет. Поэтому здесь только то, без чего вещь на
 * сайте либо не появится вовсе, либо появится сломанной.
 */
export function stateProblems(state: StudioState): string[] {
  const problems: string[] = [];

  (state.photos ?? []).forEach((photo, index) => {
    const name = label([photo.alt, photo.src], `кадр ${index + 1}`);
    const noCategories = !Array.isArray(photo.categories) || photo.categories.length === 0;

    // Начатый и брошенный кадр — одна находка, а не три: три строки об одном
    // и том же читаются как три разные беды и только пугают.
    if (blank(photo.src) && blank(photo.alt) && noCategories) {
      problems.push(`Кадр ${index + 1} — пустой, ничего не заполнено`);
      return;
    }

    if (blank(photo.src)) problems.push(`Кадр «${name}» — не выбран файл`);
    if (blank(photo.alt)) problems.push(`Кадр «${name}» — нет подписи`);
    if (noCategories) {
      problems.push(`Кадр «${name}» — не выбран ни один раздел, на сайте он нигде не покажется`);
    }
  });

  (state.categories ?? []).forEach((category, index) => {
    const name = label([category.title, category.menu, category.slug], `раздел ${index + 1}`);
    if (blank(category.slug)) problems.push(`Раздел «${name}» — нет адреса`);
    if (blank(category.menu)) problems.push(`Раздел «${name}» — нет названия в меню`);
    if (blank(category.title)) problems.push(`Раздел «${name}» — нет заголовка`);
  });

  (state.tags ?? []).forEach((tag, index) => {
    const name = label([tag.name, tag.slug], `метка ${index + 1}`);
    if (blank(tag.slug)) problems.push(`Метка «${name}» — нет адреса`);
    if (blank(tag.name)) problems.push(`Метка «${name}» — нет названия`);
  });

  const galleryTitles: Record<string, string> = {
    reviews: "Отзывы",
    workshops: "Воркшопы",
    press: "Фотоархив",
  };
  for (const [key, items] of Object.entries(state.galleries ?? {})) {
    const where = galleryTitles[key] ?? key;
    (items ?? []).forEach((item, index) => {
      const name = label([item.alt, item.src], `кадр ${index + 1}`);
      if (blank(item.src)) problems.push(`${where}: «${name}» — не выбран файл`);
      if (blank(item.alt)) problems.push(`${where}: «${name}» — нет подписи`);
    });
  }

  (state.backstage ?? []).forEach((item, index) => {
    const name = label([item.alt, item.src], `кадр ${index + 1}`);
    if (blank(item.src)) problems.push(`Бэкстейдж: «${name}» — не выбран файл`);
    if (blank(item.alt)) problems.push(`Бэкстейдж: «${name}» — нет подписи`);
  });

  (state.aboutVideos ?? []).forEach((video, index) => {
    const name = label([video.title, video.id], `ролик ${index + 1}`);
    // Здесь лежит не адрес целиком, а опознаватель ролика на YouTube.
    // Пустой — на странице «Обо мне» останется рамка без ролика.
    if (blank(video.id)) problems.push(`Ролик «${name}» — не вставлена ссылка на YouTube`);
    if (blank(video.title)) problems.push(`Ролик «${name}» — нет подписи`);
  });

  (state.publications ?? []).forEach((publication, index) => {
    const name = label([publication.title, publication.media], `публикация ${index + 1}`);
    if (blank(publication.title)) problems.push(`Публикация «${name}» — нет заголовка`);
    if (blank(publication.media)) problems.push(`Публикация «${name}» — не указано издание`);
    if (blank(publication.lead)) problems.push(`Публикация «${name}» — нет вступления`);
  });

  (state.pressLinks ?? []).forEach((link, index) => {
    const name = label([link.title, link.media], `ссылка ${index + 1}`);
    if (blank(link.title)) problems.push(`Ссылка «${name}» — нет заголовка`);
    if (blank(link.media)) problems.push(`Ссылка «${name}» — не указано издание`);
    if (blank(link.href)) problems.push(`Ссылка «${name}» — не вставлен адрес`);
  });

  return problems;
}

/** Сколько строк показываем целиком: длинный список читать невозможно. */
const SHOWN = 12;

/**
 * Текст отказа для панели. Списком, по строке на находку, с обрезкой:
 * если забыли заполнить сорок кадров, сорок строк никто читать не станет.
 */
export function refusalText(problems: string[]): string {
  const shown = problems.slice(0, SHOWN);
  const rest = problems.length - shown.length;

  return [
    "Не сохранено: без этого на сайте ничего не появится.",
    "",
    ...shown.map((problem) => `• ${problem}`),
    ...(rest > 0 ? [`• …и ещё ${rest}`] : []),
    "",
    "Заполните и сохраните ещё раз. Всё, что вы уже набрали, осталось в панели.",
  ].join("\n");
}
