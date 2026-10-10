"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWishlist } from "@/contexts/WishlistContext";
import { useHydrated } from "@/lib/localStore";
import { getWishlistProducts } from "@/app/actions/catalog";
import type { ProductCardData } from "@/lib/products";
import ShopProductCard from "./ShopProductCard";
import { HeartIcon } from "./Icons";

type LoadState = { key: string; products: ProductCardData[] } | { key: string; error: true };

export default function WishlistClient() {
  const { ids } = useWishlist();
  const hydrated = useHydrated();
  const key = ids.join(",");
  const [state, setState] = useState<LoadState | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!hydrated || key === "") return;
    let cancelled = false;
    getWishlistProducts(key.split(",").map(Number))
      .then((products) => !cancelled && setState({ key, products }))
      .catch(() => !cancelled && setState({ key, error: true }));
    return () => {
      cancelled = true;
    };
  }, [hydrated, key, retry]);

  if (!hydrated || (key !== "" && (!state || (state.key !== key && !("products" in state))))) {
    return (
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4" aria-busy="true" aria-label="Loading wishlist">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i}>
            <div className="skeleton aspect-[4/5]" />
            <div className="skeleton mt-4 h-4 w-3/4" />
            <div className="skeleton mt-2 h-4 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (key === "") {
    return (
      <div className="mt-10 flex flex-col items-center border border-dashed border-line-strong px-6 py-20 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sunken text-muted">
          <HeartIcon className="h-6 w-6" />
        </span>
        <p className="display mt-5 text-3xl">Nothing saved yet</p>
        <p className="mt-2 max-w-sm text-sm text-muted">Tap the heart on any piece to keep it here for later.</p>
        <Link href="/collection" className="btn btn-primary mt-8">
          Explore the Collection
        </Link>
      </div>
    );
  }

  if (state && "error" in state) {
    return (
      <div role="alert" className="alert alert-danger mt-10 flex flex-wrap items-center justify-between gap-3">
        We couldn&apos;t load your wishlist. Please check your connection.
        <button type="button" onClick={() => setRetry((r) => r + 1)} className="btn btn-quiet btn-sm">
          Try again
        </button>
      </div>
    );
  }

  // While a removal refetches, hide removed items immediately.
  const products = (state && "products" in state ? state.products : []).filter((p) => ids.includes(p.id));
  const missing = ids.length - products.length;

  return (
    <>
      <p className="mt-8 text-sm text-muted">
        {products.length} saved item{products.length === 1 ? "" : "s"}
      </p>
      {products.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {products.map((p) => (
            <ShopProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
      {missing > 0 && state?.key === key && (
        <p className="mt-8 text-sm text-muted">
          {missing} saved item{missing === 1 ? " is" : "s are"} no longer available.
        </p>
      )}
    </>
  );
}
