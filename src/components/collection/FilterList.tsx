"use client";

import Link from "next/link";
import { isPlainClick, useCollectionQuery } from "./CollectionQuery";

type Item = { label: string; value: string; count?: number };

export default function FilterList({
  title,
  items,
  param,
  active = "",
}: {
  title: string;
  items: Item[];
  param: string;
  active?: string;
}) {
  const { hrefWith, navigate } = useCollectionQuery();

  return (
    <fieldset>
      <legend className="eyebrow mb-3 text-ink">{title}</legend>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const selected = active === item.value;
          return (
            <li key={item.value || "all"}>
              <Link
                href={hrefWith({ [param]: item.value })}
                scroll={false}
                aria-current={selected ? "true" : undefined}
                onClick={(e) => {
                  if (!isPlainClick(e)) return;
                  e.preventDefault();
                  navigate({ [param]: item.value });
                }}
                className={`group flex items-center gap-3 py-1.5 text-[15px] transition-colors sm:text-sm ${
                  selected ? "font-medium text-ink" : "text-ink-soft hover:text-ink"
                }`}
              >
                <span
                  aria-hidden
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    selected ? "border-ink" : "border-line-strong group-hover:border-muted"
                  }`}
                >
                  {selected && <span className="h-2 w-2 rounded-full bg-ink" />}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.count !== undefined && <span className="text-xs text-muted tabular-nums">{item.count}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
