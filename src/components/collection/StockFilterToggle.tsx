"use client";

import { useCollectionQuery } from "./CollectionQuery";

export default function StockFilterToggle({ checked }: { checked: boolean }) {
  const { navigate } = useCollectionQuery();

  return (
    <fieldset>
      <legend className="eyebrow mb-3 text-ink">Availability</legend>
      <label className="flex cursor-pointer items-center justify-between gap-3 py-1.5 text-[15px] text-ink-soft sm:text-sm">
        In stock only
        <span className="relative inline-flex">
          <input
            type="checkbox"
            role="switch"
            checked={checked}
            onChange={(e) => navigate({ stock: e.target.checked ? "" : "0" })}
            className="peer sr-only"
          />
          <span
            aria-hidden
            className="h-6 w-10 rounded-full bg-line-strong transition-colors peer-checked:bg-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink"
          />
          <span aria-hidden className="absolute top-1 left-1 h-4 w-4 rounded-full bg-paper shadow transition-transform peer-checked:translate-x-4" />
        </span>
      </label>
    </fieldset>
  );
}
