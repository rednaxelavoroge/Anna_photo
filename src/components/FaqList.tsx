export function FaqList({
  items,
  title = "Вопросы",
}: {
  items: { question: string; answer: string }[];
  title?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="mt-16 max-w-3xl" aria-labelledby="faq-heading">
      <p className="eyebrow">FAQ</p>
      <h2 id="faq-heading" className="mt-4 font-display text-3xl md:text-4xl">
        {title}
      </h2>
      <div className="mt-8 divide-y divide-line border-y border-line">
        {items.map((item) => (
          <details key={item.question} className="group py-5">
            <summary className="cursor-pointer list-none font-display text-xl leading-snug marker:content-none">
              {item.question}
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
