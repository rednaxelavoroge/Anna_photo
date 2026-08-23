import { getReviews } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Отзывы о фотографе в Армении",
  description: "Отзывы семей и учеников о съёмках и воркшопах Анны Манасарян в Армении.",
  keywords: ["отзывы фотограф Ереван", "отзывы детский фотограф Армения"],
};

export default function ReviewsPage() {
  const reviews = getReviews();

  return (
    <article className="px-5 pt-28 pb-24 md:px-8">
      <p className="eyebrow">Голоса</p>
      <h1 className="mt-4 font-display text-4xl md:text-6xl">Отзывы о фотографе в Армении</h1>
      <div className="mt-14 grid gap-[var(--frame-gap)] md:grid-cols-2">
        {reviews.map((item) => (
          <blockquote key={item.id} className="bg-snow p-8">
            <p className="text-lg leading-relaxed">{item.text}</p>
            <footer className="mt-6 text-xs tracking-[0.16em] text-muted uppercase">
              {item.name} · {item.role}
            </footer>
          </blockquote>
        ))}
      </div>
    </article>
  );
}
