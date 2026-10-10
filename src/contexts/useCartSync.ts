"use client";

import { useEffect, useRef } from "react";
import { getCartProducts } from "@/app/actions/checkout";
import { useCart } from "./CartContext";
import { useToast } from "./ToastContext";

/**
 * Refreshes prices, names and stock for the items in the browser cart whenever `active` turns on,
 * so the bag never shows stale prices. The checkout action still re-validates everything.
 */
export function useCartSync(active: boolean) {
  const { items, reconcile } = useCart();
  const { show } = useToast();
  const idsKey = items.map((i) => i.id).join(",");
  const lastSynced = useRef<string | null>(null);

  useEffect(() => {
    if (!active || idsKey === "" || lastSynced.current === idsKey) return;
    let cancelled = false;
    const ids = idsKey.split(",").map(Number).filter(Boolean);
    getCartProducts(ids)
      .then((fresh) => {
        if (cancelled) return;
        lastSynced.current = idsKey;
        const { removed } = reconcile(fresh);
        if (removed.length > 0) {
          show(`${removed.join(", ")} ${removed.length > 1 ? "are" : "is"} no longer available and was removed from your bag.`);
        }
      })
      .catch(() => {
        // Network hiccup: keep the last known data; checkout will validate on the server.
      });
    return () => {
      cancelled = true;
    };
  }, [active, idsKey, reconcile, show]);
}
