"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { lineIssue, useCart } from "@/contexts/CartContext";
import { useCartSync } from "@/contexts/useCartSync";
import { useHydrated } from "@/lib/localStore";
import { formatRupiah } from "@/lib/format";
import { submitCheckout } from "@/app/actions/checkout";
import CartLineItem from "./CartLineItem";
import { AlertIcon, BagIcon } from "./Icons";

type Fields = { customerName: string; customerPhone: string; shippingAddress: string; notes: string };
type PaymentMethodSummary = { id: number; name: string; type: string };

const DRAFT_KEY = "embodied-checkout-draft";

function readDraft(): Partial<Fields> {
  try {
    return JSON.parse(window.sessionStorage.getItem(DRAFT_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function validate(f: Fields): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!f.customerName.trim()) errors.customerName = "Full name is required.";
  if (!f.customerPhone.trim()) errors.customerPhone = "Phone number is required.";
  else if (!/^\+?[0-9\s-]{8,20}$/.test(f.customerPhone.trim())) errors.customerPhone = "Enter a valid phone number (8–20 digits).";
  if (!f.shippingAddress.trim()) errors.shippingAddress = "Shipping address is required.";
  else if (f.shippingAddress.trim().length < 10) errors.shippingAddress = "Please enter your full shipping address.";
  if (f.notes.length > 500) errors.notes = "Notes must be 500 characters or fewer.";
  return errors;
}

export default function CheckoutClient({
  defaultName,
  paymentMethods,
}: {
  defaultName: string;
  paymentMethods: PaymentMethodSummary[];
}) {
  const { items, subtotal, count, clearCart } = useCart();
  const hydrated = useHydrated();
  const router = useRouter();
  useCartSync(true);

  const [fields, setFields] = useState<Fields>({ customerName: defaultName, customerPhone: "", shippingAddress: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const draftLoaded = useRef(false);

  // Restore an in-progress form (e.g. after going back to the shop), then keep it saved for this tab.
  useEffect(() => {
    if (draftLoaded.current) return;
    draftLoaded.current = true;
    const draft = readDraft();
    if (Object.keys(draft).length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from sessionStorage
      setFields((f) => ({ ...f, ...draft, customerName: draft.customerName || f.customerName }));
    }
  }, []);

  useEffect(() => {
    if (!draftLoaded.current) return;
    try {
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(fields));
    } catch {
      // Private mode etc. — the form still works, it just won't be restored.
    }
  }, [fields]);

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const blockingIssue = items.some((i) => lineIssue(i) !== null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    setFormError(null);
    setItemErrors({});

    const clientErrors = validate(fields);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) {
      const first = Object.keys(clientErrors)[0];
      document.getElementById(`checkout-${first}`)?.focus();
      return;
    }
    if (items.length === 0) {
      setFormError("Your bag is empty.");
      return;
    }
    if (blockingIssue) {
      setFormError("Some items in your bag need attention before you can continue.");
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    try {
      const result = await submitCheckout({
        customerName: fields.customerName,
        customerPhone: fields.customerPhone,
        shippingAddress: fields.shippingAddress,
        notes: fields.notes || null,
        items: items.map((i) => ({ id: i.id, size: i.size, qty: i.qty })),
      });

      if (!result.success) {
        if (result.needsLogin) {
          router.push(`/login?redirect=${encodeURIComponent("/checkout")}`);
          return;
        }
        setFormError(result.error);
        setErrors(result.fieldErrors ?? {});
        setItemErrors(result.itemErrors ?? {});
        submittingRef.current = false;
        setSubmitting(false);
        return;
      }

      try {
        window.sessionStorage.removeItem(DRAFT_KEY);
      } catch {}
      clearCart();
      // Keep the button disabled while navigating so the order can't be placed twice.
      router.replace(`/orders/${result.accessToken}?placed=1`);
    } catch {
      setFormError("We couldn't reach the server. Please check your connection and try again — you have not been charged.");
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12" aria-busy="true">
        <div className="space-y-5 lg:col-span-7">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="skeleton h-11" />
          ))}
        </div>
        <div className="skeleton h-72 lg:col-span-5" />
      </div>
    );
  }

  if (items.length === 0 && !submitting) {
    return (
      <div className="mt-10 flex flex-col items-center border border-dashed border-line-strong px-6 py-20 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sunken text-muted">
          <BagIcon className="h-6 w-6" />
        </span>
        <p className="display mt-5 text-3xl">Your bag is empty</p>
        <p className="mt-2 max-w-sm text-sm text-muted">Add a few pieces to your bag before checking out.</p>
        <Link href="/collection" className="btn btn-primary mt-8">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const fieldProps = (key: keyof Fields) => ({
    id: `checkout-${key}`,
    name: key,
    value: fields[key],
    onChange: set(key),
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `checkout-${key}-error` : undefined,
    className: "input",
  });

  const fieldError = (name: keyof Fields) =>
    errors[name] ? (
      <p id={`checkout-${name}-error`} className="field-error">
        {errors[name]}
      </p>
    ) : null;

  return (
    <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
      <form onSubmit={handleSubmit} noValidate className="lg:col-span-7" aria-describedby={formError ? "checkout-form-error" : undefined}>
        <h2 className="display text-3xl">Shipping details</h2>
        <p className="mt-2 text-sm text-muted">Where should we send your order?</p>

        {formError && (
          <div id="checkout-form-error" role="alert" className="alert alert-danger mt-6 flex gap-3">
            <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="checkout-customerName" className="label">
              Full name
            </label>
            <input {...fieldProps("customerName")} type="text" autoComplete="name" required />
            {fieldError("customerName")}
          </div>
          <div>
            <label htmlFor="checkout-customerPhone" className="label">
              Phone number
            </label>
            <input {...fieldProps("customerPhone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="e.g. 0812 3456 7890" required />
            {errors.customerPhone ? fieldError("customerPhone") : <p className="field-hint">For delivery updates from the courier.</p>}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="checkout-shippingAddress" className="label">
              Shipping address
            </label>
            <textarea
              {...fieldProps("shippingAddress")}
              rows={4}
              autoComplete="street-address"
              placeholder="Street, number, district, city, province, postal code"
              required
            />
            {fieldError("shippingAddress")}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="checkout-notes" className="label">
              Order notes <span className="font-normal text-muted">(optional)</span>
            </label>
            <textarea {...fieldProps("notes")} rows={2} maxLength={500} placeholder="Anything we should know?" />
            {fieldError("notes")}
          </div>
        </div>

        <div className="mt-10 border-t border-line pt-8">
          <h2 className="display text-3xl">Payment</h2>
          <p className="mt-2 text-sm text-muted">
            After placing your order you&apos;ll see the transfer details and can upload your proof of payment. Orders are held for 10 minutes
            while awaiting payment.
          </p>
          {paymentMethods.length > 0 ? (
            <ul className="mt-5 flex flex-wrap gap-2">
              {paymentMethods.map((pm) => (
                <li key={pm.id} className="border border-line-strong bg-surface px-3 py-2 text-[13px] text-ink-soft">
                  {pm.name}
                  <span className="ml-2 text-[11px] text-muted uppercase">{pm.type === "qris" ? "QRIS" : "Bank transfer"}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="alert alert-warning mt-5">No payment method is available right now. Please contact us before placing an order.</p>
          )}
        </div>

        <button type="submit" disabled={submitting || blockingIssue} className="btn btn-primary mt-10 w-full sm:w-auto sm:min-w-72">
          {submitting ? (
            <>
              <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-paper/40 border-t-paper" />
              Placing order…
            </>
          ) : (
            `Place Order · ${formatRupiah(subtotal)}`
          )}
        </button>
        <p className="mt-3 text-[13px] text-muted">By placing your order you agree to pay the total shown via one of the methods above.</p>
      </form>

      <aside aria-labelledby="summary-heading" className="lg:col-span-5">
        <div className="card p-5 sm:p-6 lg:sticky lg:top-28">
          <div className="flex items-baseline justify-between">
            <h2 id="summary-heading" className="display text-2xl">
              Order summary
            </h2>
            <span className="text-sm text-muted">
              {count} item{count === 1 ? "" : "s"}
            </span>
          </div>
          <ul className="mt-2 divide-y divide-line">
            {items.map((item) => (
              <CartLineItem key={item.key} item={item} serverError={itemErrors[item.key]} />
            ))}
          </ul>
          <dl className="mt-2 space-y-2 border-t border-line pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="text-ink tabular-nums">{formatRupiah(subtotal)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base font-medium">
              <dt>Total to pay</dt>
              <dd className="tabular-nums">{formatRupiah(subtotal)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-[12px] text-muted">Prices and stock are re-checked when you place your order.</p>
          <Link href="/collection" className="link mt-5 inline-block text-[13px] text-muted hover:text-ink">
            Continue shopping
          </Link>
        </div>
      </aside>
    </div>
  );
}
