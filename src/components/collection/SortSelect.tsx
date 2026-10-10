"use client";

import { useCollectionQuery } from "./CollectionQuery";
import { ChevronDownIcon } from "../Icons";

type Option = { value: string; label: string };

export default function SortSelect({ options, selected }: { options: Option[]; selected: string }) {
  const { navigate } = useCollectionQuery();

  return (
    <div className="relative">
      <label htmlFor="sort" className="sr-only">
        Sort products
      </label>
      <select
        id="sort"
        value={selected}
        onChange={(e) => navigate({ sort: e.target.value === "recent" ? "" : e.target.value })}
        className="h-10 cursor-pointer appearance-none border border-line-strong bg-surface py-0 pr-9 pl-3 text-sm text-ink hover:border-muted focus:border-ink focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            Sort: {opt.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted" />
    </div>
  );
}
