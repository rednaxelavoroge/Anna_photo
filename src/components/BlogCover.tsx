import Image from "next/image";

export function BlogCover({
  src,
  alt,
  priority = false,
  className = "",
  aspect = "aspect-[16/10]",
  zoom = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  aspect?: string;
  zoom?: boolean;
}) {
  const content = (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 1200px"
      className="object-cover"
    />
  );

  return (
    <div className={`relative ${aspect} w-full overflow-hidden bg-paper ${className}`}>
      {zoom ? <div className="tile-zoom h-full w-full">{content}</div> : content}
    </div>
  );
}
