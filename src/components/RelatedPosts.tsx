import { formatPostDate, type BlogPost } from "@/lib/blog";
import { BlogCover } from "@/components/BlogCover";
import Link from "next/link";

export function RelatedPosts({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;

  return (
    <aside className="border-t border-line pt-12">
      <p className="eyebrow">Ещё гиды</p>
      <ul className="mt-6 grid gap-px bg-line md:grid-cols-2">
        {posts.map((post) => (
          <li key={post.slug} className="group bg-bg p-6">
            {post.cover ? (
              <Link
                href={`/blog/${post.slug}`}
                className="mb-4 block overflow-hidden bg-paper"
                tabIndex={-1}
                aria-hidden="true"
              >
                <BlogCover
                  src={post.cover}
                  alt={post.coverAlt || post.title}
                  aspect="aspect-[16/10]"
                  zoom
                />
              </Link>
            ) : null}
            <p className="text-[11px] tracking-[0.16em] text-muted uppercase">
              {formatPostDate(post.date)}
              {post.draft ? " · черновик" : ""}
            </p>
            <Link
              href={`/blog/${post.slug}`}
              className="mt-3 block font-display text-2xl leading-[1.05] transition-colors group-hover:text-stone"
            >
              {post.title}
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted">{post.description}</p>
          </li>
        ))}
      </ul>
    </aside>
  );
}
