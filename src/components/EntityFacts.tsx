import entity from "@/data/entity.json";

export function EntityFacts() {
  return (
    <section className="mt-16 max-w-3xl" aria-labelledby="entity-facts">
      <p className="eyebrow">Факты, которые можно проверить</p>
      <h2 id="entity-facts" className="mt-4 font-display text-3xl md:text-4xl">
        Опыт, а не слоган
      </h2>
      <dl className="mt-10 divide-y divide-line border-y border-line">
        {entity.facts.map((fact) => (
          <div key={fact.label} className="grid gap-2 py-6 md:grid-cols-[11rem_1fr] md:gap-8">
            <dt className="text-xs tracking-[0.16em] text-muted uppercase">{fact.label}</dt>
            <dd className="text-sm leading-relaxed md:text-base">{fact.text}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function PressMentions() {
  return (
    <section className="mt-16 max-w-3xl" aria-labelledby="press-mentions">
      <p className="eyebrow">Публикации</p>
      <h2 id="press-mentions" className="mt-4 font-display text-3xl md:text-4xl">
        СМИ обо мне
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
        Названия и издания — с живой страницы «Обо мне». Ссылок ради ссылок здесь нет: оригиналы
        остаются у изданий.
      </p>
      <ul className="mt-8 space-y-4">
        {entity.press.map((item) => (
          <li key={`${item.outlet}-${item.title}`} className="border-t border-line pt-4">
            <p className="text-xs tracking-[0.16em] text-muted uppercase">
              {item.outlet}
              {item.year ? ` · ${item.year}` : ""}
              {` · ${item.kind}`}
            </p>
            <p className="mt-2 font-display text-xl">{item.title}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
