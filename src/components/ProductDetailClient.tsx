"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import { formatRupiah } from "@/lib/format";
import { MAX_QTY_PER_LINE } from "@/lib/cart";
import QuantityStepper from "./QuantityStepper";
import WishlistButton from "./WishlistButton";
import { ChevronDownIcon } from "./Icons";

type SizeOption = { id: number; label: string; available: boolean };

type Props = {
  productId: number;
  slug: string;
  name: string;
  price: number;
  gradient: string;
  image: string | null;
  description: string;
  sizes: SizeOption[];
  stock: number;
  lowStockThreshold: number;
};

export default function ProductDetailClient({
  productId,
  slug,
  name,
  price,
  gradient,
  image,
  description,
  sizes,
  stock,
  lowStockThreshold,
}: Props) {
  const { addToCart, items } = useCart();
  const { show } = useToast();
  const sizeErrorId = useId();

  const availableSizes = sizes.filter((s) => s.available);
  const hasSizes = sizes.length > 0;
  const [selectedSize, setSelectedSize] = useState<string | null>(availableSizes.length === 1 ? availableSizes[0].label : null);
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);

  const soldOut = stock <= 0 || (hasSizes && availableSizes.length === 0);
  // Stock is tracked per product, so count every size of this product already in the bag.
  const inBag = items.filter((i) => i.id === productId).reduce((sum, i) => sum + i.qty, 0);
  const remaining = Math.max(0, Math.min(stock - inBag, MAX_QTY_PER_LINE));
  const maxQty = Math.max(1, remaining);

  const handleAdd = () => {
    if (hasSizes && !selectedSize) {
      setSizeError(true);
      document.getElementById(`${sizeErrorId}-group`)?.focus();
      return;
    }
    if (remaining <= 0) {
      show(`You already have all available stock of ${name} in your bag.`, { tone: "error" });
      return;
    }
    const { added, limitedBy } = addToCart(
      { id: productId, slug, name, priceValue: price, gradient, image, size: hasSizes ? selectedSize : null, stock },
      Math.min(qty, remaining)
    );
    if (added === 0 || limitedBy) {
      show(
        limitedBy === "stock"
          ? `Only ${stock} in stock — your bag has the maximum available.`
          : `You can add up to ${MAX_QTY_PER_LINE} of each item.`,
        { tone: added === 0 ? "error" : "default" }
      );
    }
    setQty(1);
  };

  return (
    <div className="mt-5">
      <p className="text-2xl text-ink tabular-nums">{formatRupiah(price)}</p>

      <p className={`mt-3 flex items-center gap-2 text-[13px] ${soldOut ? "text-danger" : stock <= lowStockThreshold ? "text-warning" : "text-success"}`}>
        <span aria-hidden className="h-2 w-2 rounded-full bg-current" />
        {soldOut ? "Sold out" : stock <= lowStockThreshold ? `Low stock — only ${stock} left` : "In stock, ready to ship"}
      </p>

      {hasSizes && (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <p id={`${sizeErrorId}-label`} className="text-[13px] font-medium text-ink">
              Size{selectedSize && <span className="font-normal text-muted">: {selectedSize}</span>}
            </p>
            <Link href="/help#sizing" className="link text-[13px] text-muted hover:text-ink">
              Size guide
            </Link>
          </div>
          <div
            id={`${sizeErrorId}-group`}
            role="radiogroup"
            aria-labelledby={`${sizeErrorId}-label`}
            aria-describedby={sizeError ? sizeErrorId : undefined}
            tabIndex={-1}
            className="mt-3 flex flex-wrap gap-2 focus:outline-none"
          >
            {sizes.map((size) => {
              const selected = selectedSize === size.label;
              return (
                <button
                  key={size.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={size.available ? `Size ${size.label}` : `Size ${size.label}, unavailable`}
                  disabled={!size.available || stock <= 0}
                  onClick={() => {
                    setSelectedSize(size.label);
                    setSizeError(false);
                  }}
                  className={`h-12 min-w-14 border px-4 text-sm transition-colors ${
                    !size.available || stock <= 0
                      ? "cursor-not-allowed border-line text-subtle line-through"
                      : selected
                        ? "border-ink bg-ink text-paper"
                        : sizeError
                          ? "border-danger text-ink hover:border-ink"
                          : "border-line-strong text-ink hover:border-ink"
                  }`}
                >
                  {size.label}
                </button>
              );
            })}
          </div>
          {sizeError && (
            <p id={sizeErrorId} role="alert" className="field-error">
              Please select a size.
            </p>
          )}
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <QuantityStepper value={Math.min(qty, maxQty)} onChange={setQty} max={maxQty} label="Quantity" disabled={soldOut || remaining <= 0} />
        {!soldOut && inBag > 0 && <p className="text-[13px] text-muted">{inBag} already in your bag</p>}
      </div>

      <div className="mt-4 flex gap-3">
        <button type="button" data-add-to-cart onClick={handleAdd} disabled={soldOut} className="btn btn-primary flex-1">
          {soldOut ? "Sold Out" : "Add to Bag"}
        </button>
        <WishlistButton productId={productId} productName={name} variant="inline" />
      </div>

      <p className="mt-4 text-[13px] text-muted">Handmade in small batches — please allow 3–5 business days for dispatch.</p>

      <div className="mt-10 divide-y divide-line border-y border-line">
        <Accordion title="Description" defaultOpen>
          <p className="text-[15px] leading-relaxed whitespace-pre-line text-ink-soft">{description}</p>
        </Accordion>
        <Accordion title="Size & Fit">
          <p className="text-[15px] leading-relaxed text-ink-soft">
            Our pieces are cut with a relaxed, oversized silhouette. If you&apos;re between sizes, we recommend sizing up for a fuller drape.{" "}
            <Link href="/help#sizing" className="link text-ink">
              See the full size guide
            </Link>
            .
          </p>
        </Accordion>
        <Accordion title="Shipping & Returns">
          <p className="text-[15px] leading-relaxed text-ink-soft">
            We ship nationwide across Indonesia via JNE and J&amp;T. Returns and exchanges are accepted within 7 days of delivery for unworn
            items with tags attached.{" "}
            <Link href="/help#shipping" className="link text-ink">
              Read more
            </Link>
            .
          </p>
        </Accordion>
      </div>
    </div>
  );
}

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="group">
      <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-[13px] font-medium tracking-[0.14em] text-ink uppercase [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDownIcon className="h-4 w-4 text-muted transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="pb-6">{children}</div>
    </details>
  );
}
