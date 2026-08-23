function hash(value: string) {
  return [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function CoverArt({
  slug,
  title,
  className = "",
}: {
  slug: string;
  title: string;
  className?: string;
}) {
  const n = hash(slug);
  const lights = ["#1a1a1a", "#2b2b2b", "#3f3f3f", "#8a8a86", "#c8c8c4", "#ececea"];
  const a = lights[n % lights.length];
  const b = lights[(n + 2) % lights.length];
  const c = lights[(n + 4) % lights.length];

  return (
    <svg viewBox="0 0 1200 1500" className={`h-full w-full ${className}`} role="img" aria-label={title}>
      <rect width="1200" height="1500" fill={a} />
      <rect x="80" y="90" width="720" height="980" fill={b} />
      <rect x="520" y="520" width="580" height="820" fill={c} opacity="0.85" />
      <rect x="0" y="0" width="1200" height="36" fill="#0c0c0c" />
      <rect x="0" y="1464" width="1200" height="36" fill="#0c0c0c" />
    </svg>
  );
}
