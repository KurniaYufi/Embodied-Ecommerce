import { StarIcon } from "./Icons";

type Props = {
  rating?: number;
  count?: number;
  size?: string;
};

export default function StarRating({ rating = 0, count = 0, size = "h-3.5 w-3.5" }: Props) {
  if (count === 0) return null;

  const rounded = Math.round(rating);

  return (
    <div className="flex items-center gap-1.5">
      <span className="sr-only">
        Rated {rating.toFixed(1)} out of 5 from {count} review{count === 1 ? "" : "s"}
      </span>
      <div className="flex items-center" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <StarIcon key={i} filled={i <= rounded} className={`${size} ${i <= rounded ? "text-amber-500" : "text-line-strong"}`} />
        ))}
      </div>
      <span aria-hidden className="text-xs text-muted tabular-nums">
        {rating.toFixed(1)} ({count})
      </span>
    </div>
  );
}
