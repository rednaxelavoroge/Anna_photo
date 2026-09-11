import { formatPostDate, getPosts } from "@/lib/blog";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, graphJsonLd, pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = pageMetadata({
  title: "Статьи и гиды к съёмке",
  description:
    "Гиды Анны Манасарян: подготовка к ньюборн-съёмке, дети, семья в Ереване, запись в Армении и Москве. Не портфолио — тексты к съёмке.",
  path: "/blog",
  keywords: ["гиды фотосессия Армения", "как подготовиться к детской фотосессии", "ньюборн Ереван советы"],
});

export default function BlogIndexPage() {
  const posts = getPosts();

  return (
    <article className="px-5 pt-28 pb-24 md:px-8">
      <JsonLd
        data={graphJsonLd([
          breadcrumbJsonLd([
            { name: "Главная", path: "/" },
            { name: "Статьи", path: "/blog" },
          ]),
        ])}
      />
      <p className="eyebrow">Статьи</p>
      <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[0.95] md:text-6xl">
        Гиды к съёмке — не галерея
      </h1>
      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
        Это тексты для родителей и гостей Армении. В верхнем меню их нет специально: портфолио остаётся
        про кадр. Часть материалов помечена как черновик — так и есть, не «тайный раздел».
      </p>

      <ul className="mt-16 divide-y divide-line border-y border-line">
        {posts.map((post) => (
          <li key={post.slug} className="py-8">
            <p className="text-[11px] tracking-[0.16em] text-muted uppercase">
              {formatPostDate(post.date)}
              {post.draft ? " · черновик" : ""}
            </p>
            <h2 className="mt-3 max-w-3xl font-display text-2xl leading-[1.05] md:text-3xl">
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{post.description}</p>
            <Link
              href={`/blog/${post.slug}`}
              className="link-line mt-4 inline-block text-xs tracking-[0.2em] uppercase"
            >
              Читать
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
