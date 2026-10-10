type Props = {
  image?: string | null;
  gradient?: string;
  alt?: string;
  className?: string;
  /** Kept for call-site documentation of the rendered width; plain <img> ignores it. */
  sizes?: string;
  priority?: boolean;
  /** The image repeats adjacent text (e.g. a card title): hide it from assistive tech. */
  decorative?: boolean;
};

/**
 * Product photo, or — when no photo has been uploaded yet — the product's backdrop tone with a
 * quiet monogram so placeholder cards still read as intentional.
 */
export default function ProductImage({
  image = null,
  gradient = "from-neutral-300 to-neutral-400",
  alt = "",
  className = "",
  priority = false,
  decorative = false,
}: Props) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={decorative ? "" : alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  const initial = alt.trim().charAt(0).toUpperCase();

  return (
    <div
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : alt}
      aria-hidden={decorative || undefined}
      className={`@container relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br ${gradient} ${className}`}
    >
      <span
        aria-hidden
        className="pointer-events-none font-serif text-[min(40cqw,8rem)] leading-none text-white/40 italic select-none"
      >
        {initial}
      </span>
      <span aria-hidden className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] tracking-[0.4em] text-white/70 uppercase @max-[10rem]:hidden">
        Embodied
      </span>
    </div>
  );
}
