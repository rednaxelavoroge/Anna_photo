import { getPost } from "@/lib/blog";
import Link from "next/link";

export function GuideCta({ slugs, label = "Гиды к съёмке" }: { slugs: string[]; label?: string }) {
  const posts = slugs.map((slug) => getPost(slug)).filter((post) => Boolean(post));
  if (posts.length === 0) return null;

  return (
    <aside className="mt-10 max-w-2xl border-t border-line pt-8">
      <p className="eyebrow">{label}</p>
      <ul className="mt-4 flex flex-col gap-2 text-sm">
        {posts.map((post) =>
          post ? (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="link-line">
                {post.title}
                {post.draft ? " · черновик" : ""}
              </Link>
            </li>
          ) : null,
        )}
      </ul>
    </aside>
  );
}
