"use client";

import { useCollectionQuery } from "./CollectionQuery";
import { CloseIcon } from "../Icons";

export type Chip = { label: string; param: string };

export const CLEAR_ALL = { search: "", category: "", price: "", stock: "", sort: "" };

export default function ActiveFilterChips({ chips }: { chips: Chip[] }) {
  const { navigate } = useCollectionQuery();
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.param}
          type="button"
          onClick={() => navigate({ [chip.param]: "" })}
          className="inline-flex h-8 items-center gap-1.5 border border-line-strong bg-surface pr-2 pl-3 text-[13px] text-ink transition-colors hover:border-ink"
          aria-label={`Remove filter: ${chip.label}`}
        >
          {chip.label}
          <CloseIcon className="h-3.5 w-3.5 text-muted" />
        </button>
      ))}
      <button type="button" onClick={() => navigate(CLEAR_ALL)} className="ml-1 text-[13px] text-muted underline underline-offset-4 hover:text-ink">
        Clear all
      </button>
    </div>
  );
}
