/**
 * Трёхъязычные ключевые слова (RU, EN, HY) для SEO сайта Анны Манасарян.
 */
export const MULTILINGUAL_KEYWORDS = [
  // RU
  "фотограф Армения",
  "детский фотограф Ереван",
  "семейный фотограф Армения",
  "фотосессия новорождённых в Армении",
  "ньюборн фотограф Ереван",
  "детская фотосессия в Армении",
  "семейная фотосессия в Ереване",
  "фотограф Анна Манасарян",
  "заказать фотосессию в Армении",
  "фотосессия в армянских национальных костюмах",
  "воркшоп фотографа Армения",
  "фототур в Ереван",
  // EN
  "photographer Armenia",
  "child photographer Yerevan",
  "family photographer Armenia",
  "newborn photographer Yerevan",
  "newborn photoshoot Armenia",
  "family photoshoot Yerevan",
  "kids photoshoot Armenia",
  "Anna Manasaryan photographer",
  "book photoshoot Armenia",
  "Armenian national costume photoshoot",
  "photography workshop Armenia",
  "photo tour Yerevan",
  // HY
  "լուսանկարիչ Հայաստան",
  "մանկական լուսանկարիչ Երևան",
  "ընտանեկան լուսանկարիչ Հայաստան",
  "նորածինների ֆոտոսեսիա Երևան",
  "մանկական ֆոտոսեսիա Հայաստան",
  "ընտանեկան ֆոտոսեսիա Երևան",
  "Աննա Մանասարյան լուսանկարիչ",
  "ֆոտոսեսիա պատվիրել Հայաստան",
  "հայկական ազգային տարազ ֆոտոսեսիա",
  "լուսանկարչության վորկշոփ Հայաստան",
  "ֆոտոտուր Երևան",
];

/**
 * Объединяет базовые ключевые слова страницы с глобальными трёхъязычными ключевыми словами,
 * устраняя дубликаты.
 */
export function mergeKeywords(specificKeywords?: string[]): string[] {
  const set = new Set<string>();
  if (specificKeywords) {
    for (const kw of specificKeywords) {
      if (kw && kw.trim()) set.add(kw.trim());
    }
  }
  for (const kw of MULTILINGUAL_KEYWORDS) {
    set.add(kw);
  }
  return Array.from(set);
}
