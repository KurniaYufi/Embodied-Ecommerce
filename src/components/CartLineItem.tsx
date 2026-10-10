"use client";

import Link from "next/link";
import { lineIssue, useCart, type CartLine } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import { formatRupiah } from "@/lib/format";
import { MAX_QTY_PER_LINE } from "@/lib/cart";
import ProductImage from "./ProductImage";
import QuantityStepper from "./QuantityStepper";

/** One bag line, shared by the cart drawer and the checkout summary. */
export default function CartLineItem({
  item,
  serverError,
  onNavigate,
}: {
  item: CartLine;
  serverError?: string;
  onNavigate?: () => void;
}) {
  const { updateQty, removeItem, addToCart } = useCart();
  const { show } = useToast();
  const issue = serverError ?? lineIssue(item);
  const max = Math.max(1, Math.min(MAX_QTY_PER_LINE, item.stock ?? MAX_QTY_PER_LINE));
  const href = item.slug ? `/product/${item.slug}` : null;

  const remove = () => {
    const { key, qty, ...rest } = item;
    removeItem(key);
    show(`${item.name} removed from your bag.`, {
      action: { label: "Undo", onClick: () => addToCart(rest, qty, { openDrawer: false }) },
    });
  };

  const image = (
    <div className="h-28 w-[5.5rem] shrink-0 overflow-hidden bg-sunken">
      <ProductImage image={item.image} gradient={item.gradient} alt={item.name} sizes="88px" />
    </div>
  );

  return (
    <li className="flex gap-4 py-5">
      {href ? (
        <Link href={href} onClick={onNavigate} tabIndex={-1} aria-hidden>
          {image}
        </Link>
      ) : (
        image
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {href ? (
              <Link href={href} onClick={onNavigate} className="text-[15px] font-medium text-ink hover:underline hover:underline-offset-4">
                {item.name}
              </Link>
            ) : (
              <p className="text-[15px] font-medium text-ink">{item.name}</p>
            )}
            <p className="mt-0.5 text-[13px] text-muted">
              {item.size ? `Size ${item.size}` : "One size"} · {formatRupiah(item.priceValue)}
            </p>
          </div>
          <p className="text-[15px] font-medium text-ink tabular-nums">{formatRupiah(item.priceValue * item.qty)}</p>
        </div>

        {issue && (
          <p role="alert" className="mt-2 text-[13px] text-danger">
            {issue}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-3">
          <QuantityStepper
            size="sm"
            value={item.qty}
            max={Math.max(max, item.qty)}
            onChange={(q) => updateQty(item.key, q)}
            label={`Quantity for ${item.name}`}
          />
          <button type="button" onClick={remove} className="text-[13px] text-muted underline underline-offset-4 hover:text-danger">
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
