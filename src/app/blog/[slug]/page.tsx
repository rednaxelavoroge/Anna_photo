import { BlogCover } from "@/components/BlogCover";
import { JsonLd } from "@/components/JsonLd";
import { RelatedPosts } from "@/components/RelatedPosts";
import { formatPostDate, getPost, getPostSlugs, getRelatedPosts, isArticleVisible, isBlogEnabled } from "@/lib/blog";
import { MarkdownBody } from "@/lib/markdown";
import { articleJsonLd, breadcrumbJsonLd, graphJsonLd, pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Params = { slug: string };

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isArticleVisible(slug)) return {};
  const post = getPost(slug);
  if (!post) return {};
  return pageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    keywords: post.targetQueries,
    type: "article",
    publishedTime: post.date,
    image: post.cover,
  });
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  if (!isArticleVisible(slug)) notFound();
  const post = getPost(slug);
  if (!post) notFound();

  const related = getRelatedPosts(post);
  const json: object[] = [
    breadcrumbJsonLd([
      { name: "Главная", path: "/" },
      { name: "Статьи", path: "/blog" },
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
    articleJsonLd({
      title: post.title,
      description: post.description,
      path: `/blog/${post.slug}`,
      date: post.date,
      tags: [...post.tags, ...post.targetQueries],
      draft: post.draft,
      image: post.cover,
    }),
  ];

  return (
    <article className="px-5 pt-28 pb-24 md:px-8">
      <JsonLd data={graphJsonLd(json)} />
      <p className="eyebrow">
        <Link href="/blog">Статьи</Link>
        <span className="mx-3 text-line">/</span>
        {post.draft ? "Черновик" : "Гид"}
      </p>
      <h1 className="mt-4 max-w-4xl font-display text-4xl leading-[0.95] md:text-6xl">{post.title}</h1>
      <p className="mt-5 max-w-2xl text-sm text-muted">
        {formatPostDate(post.date)}
        {post.draft ? " · черновик, полный текст после редактуры" : ""}
      </p>
      {post.draft ? (
        <p className="mt-6 max-w-2xl border border-line bg-surface px-4 py-3 text-sm leading-relaxed text-muted">
          Это черновик гида. Его можно читать и индексировать, но формулировки ещё живые: Анна пройдёт текст
          перед тем, как считать его окончательным.
        </p>
      ) : null}

      {post.cover ? (
        <div className="mt-8 max-w-4xl md:mt-10">
          <BlogCover
            src={post.cover}
            alt={post.coverAlt || post.title}
            aspect="aspect-[16/10] md:aspect-[21/10]"
            priority
          />
        </div>
      ) : null}

      <div className="mt-10 max-w-2xl">
        <MarkdownBody source={post.body} />
      </div>

      <div className="mt-12 flex flex-wrap gap-6 text-xs tracking-[0.2em] uppercase">
        {post.portfolioHref ? (
          <Link href={post.portfolioHref} className="link-line">
            К кадрам
          </Link>
        ) : null}
        {post.aboutHref ? (
          <Link href={post.aboutHref} className="link-line">
            Обо мне
          </Link>
        ) : null}
        {post.contactsHref ? (
          <Link href={post.contactsHref} className="link-line">
            Написать
          </Link>
        ) : (
          <Link href="/contacts" className="link-line">
            Запись
          </Link>
        )}
      </div>

      <div className="mt-16">
        <RelatedPosts posts={related} />
      </div>
    </article>
  );
}
