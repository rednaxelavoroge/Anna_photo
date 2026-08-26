import { getPreviewCover } from "@/lib/preview";
import Image from "next/image";
import type { CSSProperties } from "react";

function hash(value: string) {
  return [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function CoverArt({
  slug,
  title,
  src,
  className = "",
  style,
}: {
  slug: string;
  title: string;
  src?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const resolved = src || getPreviewCover(slug);
  if (resolved) {
    return (
      <span className={`relative block h-full w-full overflow-hidden bg-void ${className}`} style={style}>
        <Image
          src={resolved}
          alt={title}
          fill
          priority={slug === "home-hero"}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </span>
    );
  }

  const n = hash(slug);
  const silvers = ["#8f8a82", "#b7b2a8", "#c9c4bb", "#d8d2c8", "#6f6a63", "#a39e96"];
  const a = silvers[n % silvers.length];
  const b = silvers[(n + 2) % silvers.length];
  const c = silvers[(n + 4) % silvers.length];

  return (
    <svg viewBox="0 0 1200 1500" className={`h-full w-full ${className}`} style={style} role="img" aria-label={title}>
      <defs>
        <filter id={`gelatin-${slug}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" result="noise" />
          <feColorMatrix type="saturate" values="0" in="noise" result="grain" />
          <feBlend in="SourceGraphic" in2="grain" mode="multiply" />
        </filter>
      </defs>
      <g filter={`url(#gelatin-${slug})`}>
        <rect width="1200" height="1500" fill={a} />
        <rect x="90" y="110" width="700" height="940" fill={b} opacity="0.88" />
        <rect x="540" y="540" width="560" height="800" fill={c} opacity="0.72" />
        <rect x="0" y="0" width="1200" height="28" fill="#2c2824" opacity="0.18" />
        <rect x="0" y="1472" width="1200" height="28" fill="#2c2824" opacity="0.18" />
      </g>
    </svg>
  );
}
