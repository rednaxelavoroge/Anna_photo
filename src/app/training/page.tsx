import { CoverArt } from "@/components/CoverArt";
import { getSite, getWorkshops } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Обучение фотографии — 45 воркшопов",
  description:
    "Обучение фотографии в Армении: 45 проведённых воркшопов, направления и форматы.",
  keywords: ["обучение фотографии Армения", "воркшоп фотографии Ереван"],
};

export default function TrainingPage() {
  const { training } = getSite();
  const workshops = getWorkshops();

  return (
    <article className="px-5 pt-28 pb-24 md:px-8">
      <p className="eyebrow">{training.eyebrow}</p>
      <h1 className="mt-4 font-display text-4xl md:text-6xl">{training.title}</h1>
      <p className="mt-4 font-display text-2xl text-muted md:text-3xl">{training.stat}</p>
      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
        {training.lead}
      </p>

      <div className="relative mt-12 aspect-[16/10] max-w-4xl overflow-hidden bg-void">
        <CoverArt slug="training" title={training.title} />
      </div>

      <div className="mt-14 grid gap-[var(--frame-gap)] md:grid-cols-2">
        {training.formats.map((item) => (
          <div key={item.title} className="bg-snow p-6">
            <h2 className="font-display text-2xl">{item.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 grid gap-[var(--frame-gap)] sm:grid-cols-2 lg:grid-cols-3">
        {workshops.map((item) => (
          <article key={item.id} className="bg-snow p-5">
            <p className="eyebrow">
              {String(item.n).padStart(2, "0")} · {item.year}
            </p>
            <h2 className="mt-3 font-display text-xl">{item.title}</h2>
            <p className="mt-2 text-sm text-muted">{item.place}</p>
          </article>
        ))}
      </div>
    </article>
  );
}
