export default function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      aria-hidden
      className="absolute top-1 right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ink px-1 text-[10px] leading-none font-semibold text-paper tabular-nums group-data-[tone=light]/header:bg-white group-data-[tone=light]/header:text-neutral-900"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
