import { AlbumGrid } from "@/components/AlbumGrid";
import { getReviews } from "@/lib/content";
import { getPhotos } from "@/lib/photos";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Отзывы о фотографе Анне Манасарян",
  description: "Отзывы семей и учеников о съёмках и воркшопах Анны Манасарян в Армении и Москве.",
  keywords: ["отзывы фотограф Ереван", "отзывы детский фотограф Армения", "отзывы Анна Манасарян"],
};

export default function ReviewsPage() {
  const reviews = getReviews();
  const reviewPhotos = getPhotos("reviews");

  return (
    <article className="px-5 pt-28 pb-24 md:px-8">
      <h1 className="font-display text-4xl md:text-6xl">Отзывы о съёмках и воркшопах</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
        Сообщения и впечатления родителей, семей и учеников из WhatsApp, Instagram и VK.
      </p>

      {reviewPhotos.length > 0 ? (
        <div className="mt-12">
          <AlbumGrid photos={reviewPhotos} slug="reviews" />
        </div>
      ) : (
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
      )}
    </article>
  );
}
