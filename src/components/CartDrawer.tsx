"use client";

import Link from "next/link";
import { lineIssue, useCart } from "@/contexts/CartContext";
import { useCartSync } from "@/contexts/useCartSync";
import { formatRupiah } from "@/lib/format";
import Drawer from "./Drawer";
import CartLineItem from "./CartLineItem";
import { BagIcon } from "./Icons";

export default function CartDrawer() {
  const { items, isOpen, close, count, subtotal } = useCart();
  useCartSync(isOpen);

  const hasIssues = items.some((i) => lineIssue(i) !== null);

  return (
    <Drawer
      open={isOpen}
      onClose={close}
      title={
        <>
          Your Bag <span className="font-sans text-sm text-muted tabular-nums">({count})</span>
        </>
      }
      footer={
        items.length > 0 ? (
          <>
            <dl className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="font-medium text-ink tabular-nums">{formatRupiah(subtotal)}</dd>
              </div>
            </dl>
            <p className="mt-1.5 text-[13px] text-muted">Final total is confirmed on the next step.</p>
            {hasIssues && (
              <p role="alert" className="mt-3 text-[13px] text-danger">
                Please resolve the highlighted items before checking out.
              </p>
            )}
            {hasIssues ? (
              <button type="button" disabled className="btn btn-primary mt-4 w-full">
                Checkout
              </button>
            ) : (
              <Link href="/checkout" onClick={close} className="btn btn-primary mt-4 w-full">
                Checkout
              </Link>
            )}
            <button type="button" onClick={close} className="btn btn-quiet mt-2 w-full">
              Continue Shopping
            </button>
          </>
        ) : null
      }
    >
      {items.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sunken text-muted">
            <BagIcon className="h-6 w-6" />
          </span>
          <p className="display mt-5 text-2xl">Your bag is empty</p>
          <p className="mt-2 max-w-xs text-sm text-muted">Pieces you add will appear here, ready for checkout.</p>
          <Link href="/collection" onClick={close} className="btn btn-primary mt-6">
            Shop the Collection
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-line px-5 sm:px-6">
          {items.map((item) => (
            <CartLineItem key={item.key} item={item} onNavigate={close} />
          ))}
        </ul>
      )}
    </Drawer>
  );
}
