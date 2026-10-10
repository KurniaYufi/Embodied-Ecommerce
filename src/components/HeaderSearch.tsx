"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useModalBehaviour } from "./Drawer";
import { CloseIcon, SearchIcon } from "./Icons";
import Portal from "./Portal";

export default function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const close = () => setOpen(false);
  useModalBehaviour(open, close, panelRef);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    setOpen(false);
    router.push(q ? `/collection?search=${encodeURIComponent(q)}` : "/collection");
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Search products" aria-expanded={open} className="icon-btn">
        <SearchIcon />
      </button>

      {open && (
        <Portal>
          <div className="fixed inset-0 z-[60]">
            <div className="absolute inset-0 bg-black/40" onClick={close} />
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Search products"
              className="animate-fade-up relative border-b border-line bg-paper shadow-xl"
            >
              <form onSubmit={submit} role="search" className="container-page flex items-center gap-3 py-5 sm:py-7">
                <SearchIcon className="h-5 w-5 shrink-0 text-muted" />
                <label htmlFor="header-search" className="sr-only">
                  Search products
                </label>
                <input
                  id="header-search"
                  data-autofocus
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search jackets, shirts, jeans…"
                  autoComplete="off"
                  enterKeyHint="search"
                  className="min-w-0 flex-1 bg-transparent font-serif text-2xl text-ink placeholder:text-subtle focus:outline-none sm:text-3xl [&::-webkit-search-cancel-button]:hidden"
                />
                {query && (
                  <button type="button" onClick={() => setQuery("")} className="text-[12px] text-muted underline underline-offset-4 hover:text-ink">
                    Clear
                  </button>
                )}
                <button type="submit" className="btn btn-primary btn-sm hidden sm:inline-flex">
                  Search
                </button>
                <button type="button" onClick={close} aria-label="Close search" className="icon-btn">
                  <CloseIcon />
                </button>
              </form>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
