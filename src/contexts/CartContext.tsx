"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { createLocalStore } from "@/lib/localStore";
import { MAX_QTY_PER_LINE, cartLineKey } from "@/lib/cart";

export type CartItem = {
  id: number | null;
  slug?: string;
  name: string;
  priceValue: number;
  gradient: string;
  image: string | null;
  size: string | null;
  qty: number;
  /** Last known stock, refreshed from the server; the checkout action is the real authority. */
  stock?: number;
};

export type CartLine = CartItem & { key: string };

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    (typeof v.id === "number" || v.id === null) &&
    typeof v.name === "string" &&
    typeof v.priceValue === "number" &&
    typeof v.qty === "number" &&
    v.qty > 0
  );
}

const cartStore = createLocalStore<CartItem[]>("embodied-cart", [], (value) =>
  Array.isArray(value)
    ? value.filter(isCartItem).map((i) => ({
        ...i,
        gradient: typeof i.gradient === "string" ? i.gradient : "from-neutral-200 to-neutral-300",
        image: typeof i.image === "string" ? i.image : null,
        size: typeof i.size === "string" ? i.size : null,
      }))
    : []
);

export type FreshProduct = {
  id: number;
  slug: string;
  name: string;
  price: number;
  stock: number;
  image: string | null;
  gradient: string;
  sizes: string[];
};

type AddResult = { added: number; limitedBy: "stock" | "max" | null };

type CartContextValue = {
  items: CartLine[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  count: number;
  subtotal: number;
  addToCart: (item: Omit<CartItem, "qty">, qty: number, options?: { openDrawer?: boolean }) => AddResult;
  updateQty: (key: string, qty: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  /** Apply fresh server data: update prices/names/stock and drop products that no longer exist. */
  reconcile: (fresh: FreshProduct[]) => { removed: string[]; changed: boolean };
};

const CartContext = createContext<CartContextValue | null>(null);

function maxFor(item: { stock?: number }): number {
  return Math.max(0, Math.min(MAX_QTY_PER_LINE, item.stock ?? MAX_QTY_PER_LINE));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const stored = cartStore.useValue();
  const [isOpen, setIsOpen] = useState(false);

  const items = useMemo<CartLine[]>(
    () => stored.map((i) => ({ ...i, key: cartLineKey(i.id, i.size) })),
    [stored]
  );

  const addToCart = useCallback<CartContextValue["addToCart"]>((item, qty, options) => {
    const current = [...cartStore.read()];
    const index = current.findIndex((c) => c.id === item.id && c.size === item.size);
    const existingQty = index >= 0 ? current[index].qty : 0;
    const limit = maxFor(item);
    const nextQty = Math.min(existingQty + qty, limit);
    const added = Math.max(0, nextQty - existingQty);
    const limitedBy: AddResult["limitedBy"] =
      existingQty + qty > limit ? (item.stock !== undefined && item.stock < MAX_QTY_PER_LINE ? "stock" : "max") : null;

    if (added > 0) {
      if (index >= 0) current[index] = { ...current[index], ...item, qty: nextQty };
      else current.push({ ...item, qty: nextQty });
      cartStore.write(current);
    }
    if (options?.openDrawer !== false) setIsOpen(true);
    return { added, limitedBy };
  }, []);

  const updateQty = useCallback((key: string, qty: number) => {
    const current = cartStore.read();
    const next = current
      .map((i) => (cartLineKey(i.id, i.size) === key ? { ...i, qty: Math.min(qty, Math.max(1, maxFor(i))) } : i))
      .filter((i) => i.qty > 0);
    cartStore.write(next);
  }, []);

  const removeItem = useCallback((key: string) => {
    cartStore.write(cartStore.read().filter((i) => cartLineKey(i.id, i.size) !== key));
  }, []);

  const clearCart = useCallback(() => cartStore.write([]), []);

  const reconcile = useCallback((fresh: FreshProduct[]) => {
    const byId = new Map(fresh.map((p) => [p.id, p]));
    const current = cartStore.read();
    const removed: string[] = [];
    let changed = false;
    const next: CartItem[] = [];
    for (const item of current) {
      const p = item.id !== null ? byId.get(item.id) : undefined;
      if (!p) {
        removed.push(item.name);
        changed = true;
        continue;
      }
      const updated: CartItem = {
        ...item,
        slug: p.slug,
        name: p.name,
        priceValue: p.price,
        image: p.image,
        gradient: p.gradient,
        stock: p.stock,
      };
      if (
        updated.priceValue !== item.priceValue ||
        updated.name !== item.name ||
        updated.stock !== item.stock ||
        updated.image !== item.image ||
        updated.slug !== item.slug
      ) {
        changed = true;
      }
      next.push(updated);
    }
    if (changed) cartStore.write(next);
    return { removed, changed };
  }, []);

  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.priceValue * i.qty, 0), [items]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ items, isOpen, open, close, count, subtotal, addToCart, updateQty, removeItem, clearCart, reconcile }),
    [items, isOpen, open, close, count, subtotal, addToCart, updateQty, removeItem, clearCart, reconcile]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

/** Problems a cart line has against its last known stock/sizes. */
export function lineIssue(item: CartItem): string | null {
  if (item.stock === undefined) return null;
  if (item.stock <= 0) return "Sold out — please remove this item.";
  if (item.qty > item.stock) return `Only ${item.stock} left — please lower the quantity.`;
  return null;
}
