"use client";

import { useEffect, useRef, useState } from "react";
import { useCollectionQuery } from "./CollectionQuery";
import { CloseIcon, SearchIcon } from "../Icons";

export default function SearchInput({ defaultValue = "", id }: { defaultValue?: string; id: string }) {
  const [value, setValue] = useState(defaultValue);
  const { navigate } = useCollectionQuery();
  const lastSubmitted = useRef(defaultValue);

  // Keep the field in sync when the URL changes elsewhere (e.g. "Clear all").
  const [prevDefault, setPrevDefault] = useState(defaultValue);
  if (prevDefault !== defaultValue) {
    setPrevDefault(defaultValue);
    setValue(defaultValue);
  }

  useEffect(() => {
    lastSubmitted.current = defaultValue;
  }, [defaultValue]);

  useEffect(() => {
    const q = value.trim();
    if (q === lastSubmitted.current.trim()) return;
    const timer = setTimeout(() => {
      lastSubmitted.current = q;
      // Replace rather than push so each keystroke doesn't add a history entry.
      navigate({ search: q }, { replace: true });
    }, 400);
    return () => clearTimeout(timer);
  }, [value, navigate]);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        lastSubmitted.current = value.trim();
        navigate({ search: value.trim() });
      }}
      className="relative"
    >
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search products"
        autoComplete="off"
        enterKeyHint="search"
        className="input pr-10 pl-9 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue("");
            lastSubmitted.current = "";
            navigate({ search: "" });
          }}
          aria-label="Clear search"
          className="absolute top-1/2 right-1 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center text-muted hover:text-ink"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
