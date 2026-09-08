import { formatPostDate, type BlogPost } from "@/lib/blog";
import Link from "next/link";

export function RelatedPosts({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;

  return (
    <aside className="border-t border-line pt-12">
      <p className="eyebrow">Ещё гиды</p>
      <ul className="mt-6 grid gap-px bg-line md:grid-cols-2">
        {posts.map((post) => (
          <li key={post.slug} className="bg-bg p-6">
            <p className="text-[11px] tracking-[0.16em] text-muted uppercase">
              {formatPostDate(post.date)}
              {post.draft ? " · черновик" : ""}
            </p>
            <Link href={`/blog/${post.slug}`} className="mt-3 block font-display text-2xl leading-[1.05]">
              {post.title}
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted">{post.description}</p>
          </li>
        ))}
      </ul>
    </aside>
  );
}
