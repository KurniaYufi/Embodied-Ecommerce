"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { createLocalStore } from "@/lib/localStore";

const wishlistStore = createLocalStore<number[]>("embodied-wishlist", [], (value) =>
  Array.isArray(value) ? value.filter((v): v is number => Number.isInteger(v) && v > 0) : []
);

type WishlistContextValue = {
  ids: number[];
  count: number;
  isWishlisted: (id: number) => boolean;
  /** Returns true when the item is now saved, false when it was removed. */
  toggle: (id: number) => boolean;
  remove: (id: number) => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const ids = wishlistStore.useValue();

  const toggle = useCallback((id: number) => {
    const current = wishlistStore.read();
    const saved = !current.includes(id);
    wishlistStore.write(saved ? [...current, id] : current.filter((x) => x !== id));
    return saved;
  }, []);

  const remove = useCallback((id: number) => {
    wishlistStore.write(wishlistStore.read().filter((x) => x !== id));
  }, []);

  const value = useMemo(
    () => ({
      ids,
      count: ids.length,
      isWishlisted: (id: number) => ids.includes(id),
      toggle,
      remove,
    }),
    [ids, toggle, remove]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
