import { EntityFacts, PressMentions } from "@/components/EntityFacts";
import { FaqList } from "@/components/FaqList";
import { GuideCta } from "@/components/GuideCta";
import { JsonLd } from "@/components/JsonLd";
import entity from "@/data/entity.json";
import { getSite } from "@/lib/content";
import { breadcrumbJsonLd, faqJsonLd, graphJsonLd, pageMetadata, personJsonLd } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = pageMetadata({
  title: "О фотографе Анне Манасарян",
  description:
    "Детский и семейный фотограф. Первой в Армении начала снимать новорождённых; выставки в Ереване, съёмки для Haute Time, воркшопы в Москве.",
  path: "/about",
  keywords: ["фотограф Анна Манасарян", "детский фотограф Ереван", "семейный фотограф Армения"],
});

export default function AboutPage() {
  const { about } = getSite();

  return (
    <article className="px-5 pt-28 pb-24 md:px-8">
      <JsonLd
        data={graphJsonLd([
          personJsonLd(),
          breadcrumbJsonLd([
            { name: "Главная", path: "/" },
            { name: "Обо мне", path: "/about" },
          ]),
          faqJsonLd(entity.faq),
        ])}
      />
      <p className="eyebrow">{about.eyebrow}</p>
      <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[0.95] md:text-6xl">
        {about.title}
      </h1>
      <p className="mt-8 max-w-2xl text-lg leading-relaxed">{about.lead}</p>
      <div className="mt-10 max-w-2xl space-y-5 text-sm leading-relaxed text-muted md:text-base">
        {about.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <EntityFacts />
      <PressMentions />
      <FaqList items={entity.faq} title="Коротко о съёмке и географии" />

      <GuideCta
        slugs={[
          "kak-vybrat-detskogo-fotografa",
          "podgotovka-k-fotosessii-novorozhdennogo",
          "kak-zapisatsya-na-fotosessiyu-armeniya-moskva",
          "skazochnye-fotosessii-dlya-detej",
        ]}
        label="Гиды, если выбираете съёмку"
      />

      <p className="mt-12 max-w-2xl text-xs leading-relaxed text-ash">{about.note}</p>
      <Link href="/contacts" className="link-line mt-10 inline-block text-xs tracking-[0.2em] uppercase">
        Написать
      </Link>
    </article>
  );
}
