import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "./Icons";

export default function Pagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const base = "inline-flex h-10 min-w-10 items-center justify-center px-2 text-sm transition-colors";

  return (
    <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-1">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} aria-label="Previous page" className={`${base} text-ink hover:bg-sunken`}>
          <ChevronLeftIcon className="h-4 w-4" />
        </Link>
      ) : (
        <span aria-hidden className={`${base} text-subtle`}>
          <ChevronLeftIcon className="h-4 w-4" />
        </span>
      )}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={hrefFor(p)}
          aria-current={p === page ? "page" : undefined}
          aria-label={`Page ${p}`}
          className={`${base} tabular-nums ${p === page ? "bg-ink text-paper" : "text-ink-soft hover:bg-sunken"}`}
        >
          {p}
        </Link>
      ))}
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} aria-label="Next page" className={`${base} text-ink hover:bg-sunken`}>
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      ) : (
        <span aria-hidden className={`${base} text-subtle`}>
          <ChevronRightIcon className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
