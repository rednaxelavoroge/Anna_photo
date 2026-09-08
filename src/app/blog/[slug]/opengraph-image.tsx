import { ImageResponse } from "next/og";
import { getPost } from "@/lib/blog";

export const alt = "Guide — Anna Manasaryan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  const label = post?.draft ? "Draft guide" : "Guide";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: "#0c0c0c",
          color: "#f3f3f1",
          padding: 72,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 48,
            left: 72,
            fontSize: 16,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#9c9c98",
          }}
        >
          Anna Manasaryan · {label}
        </div>
        <div style={{ fontSize: 56, lineHeight: 1, letterSpacing: -1 }}>Anna Manasaryan</div>
        <div style={{ marginTop: 20, fontSize: 24, color: "#c8c8c4" }}>{slug}</div>
      </div>
    ),
    { ...size },
  );
}
