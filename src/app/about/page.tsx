import { CoverArt } from "@/components/CoverArt";
import { getSite } from "@/lib/content";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "О фотографе Анне Манасарян",
  description:
    "Детский и семейный фотограф в Ереване. Новорождённые, дети, семьи, travel и обучение.",
  keywords: ["фотограф Анна Манасарян", "детский фотограф Ереван", "семейный фотограф Армения"],
};

export default function AboutPage() {
  const { about } = getSite();

  return (
    <article className="px-5 pt-28 pb-24 md:px-8">
      <p className="eyebrow">{about.eyebrow}</p>
      <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[0.95] md:text-6xl">
        {about.title}
      </h1>
      <div className="relative mt-10 aspect-[3/4] max-w-md overflow-hidden bg-void">
        <CoverArt slug="home-hero" title={about.title} />
      </div>
      <p className="mt-8 max-w-2xl text-lg leading-relaxed">{about.lead}</p>
      <div className="mt-10 max-w-2xl space-y-5 text-sm leading-relaxed text-muted md:text-base">
        {about.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <p className="mt-12 max-w-2xl text-xs leading-relaxed text-ash">{about.note}</p>
      <Link href="/contacts" className="link-line mt-10 inline-block text-xs tracking-[0.2em] uppercase">
        Написать
      </Link>
    </article>
  );
}
