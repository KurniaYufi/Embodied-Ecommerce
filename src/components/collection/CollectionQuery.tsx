"use client";

import { createContext, useCallback, useContext, useMemo, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Ctx = {
  isPending: boolean;
  /** Build a /collection URL from the current query with the given params changed ("" removes). */
  hrefWith: (changes: Record<string, string>) => string;
  navigate: (changes: Record<string, string>, options?: { replace?: boolean }) => void;
};

const CollectionQueryContext = createContext<Ctx | null>(null);

export function CollectionQueryProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const hrefWith = useCallback(
    (changes: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      // Any filter change starts again from the first page.
      if (!("page" in changes)) params.delete("page");
      const qs = params.toString();
      return qs ? `/collection?${qs}` : "/collection";
    },
    [searchParams]
  );

  const navigate = useCallback<Ctx["navigate"]>(
    (changes, options) => {
      const href = hrefWith(changes);
      startTransition(() => {
        if (options?.replace) router.replace(href, { scroll: false });
        else router.push(href, { scroll: false });
      });
    },
    [hrefWith, router]
  );

  const value = useMemo(() => ({ isPending, hrefWith, navigate }), [isPending, hrefWith, navigate]);
  return <CollectionQueryContext.Provider value={value}>{children}</CollectionQueryContext.Provider>;
}

export function useCollectionQuery() {
  const ctx = useContext(CollectionQueryContext);
  if (!ctx) throw new Error("useCollectionQuery must be used within CollectionQueryProvider");
  return ctx;
}

/** Plain-click navigations run inside the transition; modified clicks (new tab etc.) behave normally. */
export function isPlainClick(e: React.MouseEvent) {
  return !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0);
}

export function ResultsRegion({ children }: { children: React.ReactNode }) {
  const { isPending } = useCollectionQuery();
  return (
    <div aria-busy={isPending} className={`transition-opacity duration-200 ${isPending ? "pointer-events-none opacity-50" : ""}`}>
      {children}
    </div>
  );
}
