/** How many times the items repeat inside each half, so one half is always wider than the screen. */
const REPEAT = 4;
/** Seconds per item; keeps the scroll speed constant regardless of how many items are passed. */
const SECONDS_PER_ITEM = 4;

/**
 * Endless ticker. The track holds two identical halves and slides by exactly -50%, so the end of
 * the first half lines up with the start of the second and the loop has no visible seam. Every
 * item carries the same padding and trailing separator, which keeps the spacing even at the join.
 */
export default function Marquee({ items = [] as string[] }) {
  if (items.length === 0) return null;
  const sequence = Array.from({ length: REPEAT }, () => items).flat();

  const half = (key: string) => (
    <ul key={key} className="flex shrink-0 items-center">
      {sequence.map((text, i) => (
        <li key={i} className="flex shrink-0 items-center">
          <span className="px-6 sm:px-8">{text}</span>
          <span className="text-subtle not-italic">·</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="overflow-hidden border-y border-line bg-paper py-4 text-ink" aria-hidden>
      <div
        className="animate-marquee flex w-max font-serif text-lg whitespace-nowrap italic hover:[animation-play-state:paused] sm:text-xl"
        style={{ animationDuration: `${sequence.length * SECONDS_PER_ITEM}s` }}
      >
        {half("a")}
        {half("b")}
      </div>
    </div>
  );
}
