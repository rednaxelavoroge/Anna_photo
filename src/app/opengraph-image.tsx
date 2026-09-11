import { ImageResponse } from "next/og";

export const alt = "Anna Manasaryan — children’s and family photographer in Armenia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
          Photographer · Yerevan
        </div>
        <div style={{ fontSize: 64, lineHeight: 1, letterSpacing: -2 }}>Anna Manasaryan</div>
        <div style={{ marginTop: 20, fontSize: 28, color: "#c8c8c4", maxWidth: 780 }}>
          Children’s and family photography in Armenia
        </div>
      </div>
    ),
    { ...size },
  );
}
