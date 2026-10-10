"use client";

import { useState } from "react";
import Drawer from "../Drawer";
import { FilterIcon } from "../Icons";
import { useCollectionQuery } from "./CollectionQuery";
import { CLEAR_ALL } from "./ActiveFilterChips";

export default function MobileFilters({
  activeCount,
  resultCount,
  children,
}: {
  activeCount: number;
  resultCount: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { isPending, navigate } = useCollectionQuery();

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-expanded={open} className="btn btn-quiet btn-sm gap-2 lg:hidden">
        <FilterIcon className="h-4 w-4" />
        Filters
        {activeCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] text-paper">{activeCount}</span>
        )}
      </button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Filters"
        side="left"
        widthClass="w-[90%] max-w-sm"
        footer={
          <div className="grid grid-cols-2 gap-3">
            <button type="button" disabled={activeCount === 0} onClick={() => navigate(CLEAR_ALL)} className="btn btn-quiet btn-sm">
              Clear all
            </button>
            <button type="button" onClick={() => setOpen(false)} className="btn btn-primary btn-sm">
              {isPending ? "Updating…" : `Show ${resultCount} item${resultCount === 1 ? "" : "s"}`}
            </button>
          </div>
        }
      >
        <div className="space-y-8 px-5 py-6">{children}</div>
      </Drawer>
    </>
  );
}
