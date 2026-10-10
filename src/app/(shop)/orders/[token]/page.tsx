import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { cancelDueToExpiredPayment, paymentDeadline } from "@/lib/orders";
import { formatRupiah } from "@/lib/format";
import { STATUS_BADGE_CLASS, STATUS_LABELS, STATUS_MESSAGES } from "@/lib/orderStatus";
import ProductImage from "@/components/ProductImage";
import PaymentCountdown from "@/components/PaymentCountdown";
import PaymentProofUpload from "@/components/PaymentProofUpload";
import ReviewStarForm from "@/components/ReviewStarForm";
import OrderTracker from "@/components/OrderTracker";
import CheckoutSteps from "@/components/CheckoutSteps";
import { CheckIcon } from "@/components/Icons";

export const metadata: Metadata = { title: "Order status", robots: { index: false } };

export default async function OrderStatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const { token } = await params;
  const { placed } = await searchParams;

  const existing = await prisma.order.findUnique({ where: { accessToken: token } });
  if (!existing) notFound();

  await cancelDueToExpiredPayment(existing);

  const order = await prisma.order.findUniqueOrThrow({
    where: { accessToken: token },
    include: { items: true, paymentMethod: { select: { name: true } } },
  });

  const session = await auth();
  const isOwner = !!session?.user && Number(session.user.id) === order.userId;
  const canUploadProof = ["pending_payment", "awaiting_confirmation"].includes(order.status);
  const canReview = isOwner && order.status === "completed";

  let reviewedRatings: Record<number, number> = {};
  if (canReview) {
    const productIds = order.items.map((i) => i.productId).filter((id): id is number => id !== null);
    const reviews = await prisma.review.findMany({
      where: { userId: Number(session!.user.id), productId: { in: productIds } },
    });
    reviewedRatings = Object.fromEntries(reviews.map((r) => [r.productId, r.rating]));
  }

  const paymentMethods = canUploadProof
    ? await prisma.paymentMethod.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: { id: true, type: true, name: true, accountName: true, accountNumber: true, imagePath: true },
      })
    : [];

  const uniqueItems = Array.from(new Map(order.items.map((i) => [i.productId, i])).values()).filter((i) => i.productId !== null);
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const placedAt = order.createdAt.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });

  return (
    <div className="container-page py-10 lg:py-14">
      {canUploadProof && <CheckoutSteps current={order.status === "pending_payment" ? 2 : 3} />}

      {placed && order.status === "pending_payment" && (
        <div role="status" className="alert alert-success mt-8 flex items-start gap-3">
          <CheckIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Thank you — your order has been placed.</p>
            <p className="mt-0.5">Complete the payment below to confirm it. Bookmark this page to check your order status later.</p>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-8">
        <div>
          <p className="eyebrow">Order</p>
          <h1 className="display mt-2 text-4xl sm:text-5xl">{order.number}</h1>
          <p className="mt-2 text-sm text-muted">
            Placed {placedAt} WIB · {itemCount} item{itemCount === 1 ? "" : "s"}
          </p>
        </div>
        <span className={`badge ${STATUS_BADGE_CLASS[order.status]} px-3 py-2`}>{STATUS_LABELS[order.status]}</span>
      </div>

      <div className="mt-8">
        <OrderTracker status={order.status} />
        <p className="mt-6 text-[15px] text-ink-soft">{STATUS_MESSAGES[order.status]}</p>
        {order.status === "cancelled" && (
          <Link href="/collection" className="btn btn-primary mt-6">
            Shop again
          </Link>
        )}
      </div>

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="space-y-12 lg:col-span-7">
          <section aria-labelledby="items-heading">
            <h2 id="items-heading" className="display text-3xl">
              Items
            </h2>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-4 py-5">
                  <div className="h-24 w-20 shrink-0 overflow-hidden bg-sunken">
                    <ProductImage image={item.image} gradient={item.gradient} alt={item.productName} />
                  </div>
                  <div className="flex flex-1 flex-col justify-center">
                    <p className="text-[15px] font-medium text-ink">{item.productName}</p>
                    <p className="mt-0.5 text-[13px] text-muted">
                      {item.size ? `Size ${item.size}` : "One size"} · {item.quantity} × {formatRupiah(item.price)}
                    </p>
                  </div>
                  <p className="self-center text-[15px] font-medium tabular-nums">{formatRupiah(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-4 flex items-center justify-between text-base font-medium">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatRupiah(order.subtotal)}</dd>
            </dl>
          </section>

          {canReview && uniqueItems.length > 0 && (
            <section aria-labelledby="review-heading">
              <h2 id="review-heading" className="display text-3xl">
                Rate your purchase
              </h2>
              <p className="mt-2 text-sm text-muted">Your rating helps others choose.</p>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {uniqueItems.map((item) => (
                  <li key={item.id} className="flex flex-wrap items-center gap-4 py-4">
                    <div className="h-16 w-14 shrink-0 overflow-hidden bg-sunken">
                      <ProductImage image={item.image} gradient={item.gradient} alt={item.productName} />
                    </div>
                    <p className="min-w-32 flex-1 text-sm">{item.productName}</p>
                    <ReviewStarForm token={token} productId={item.productId!} productName={item.productName} existingRating={reviewedRatings[item.productId!]} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="shipping-heading" className="card p-6">
            <h2 id="shipping-heading" className="display text-2xl">
              Shipping to
            </h2>
            <address className="mt-3 space-y-1 text-sm text-ink-soft not-italic">
              <p className="font-medium text-ink">{order.customerName}</p>
              <p>{order.customerPhone}</p>
              <p className="whitespace-pre-line">{order.shippingAddress}</p>
            </address>
            {order.notes && <p className="mt-3 border-t border-line pt-3 text-sm text-muted">Notes: {order.notes}</p>}
          </section>
        </div>

        <aside className="lg:col-span-5">
          <div className="space-y-6 lg:sticky lg:top-28">
            {order.status === "pending_payment" && <PaymentCountdown deadline={paymentDeadline(order.createdAt).toISOString()} />}

            {canUploadProof ? (
              <PaymentProofUpload
                token={token}
                paymentMethods={paymentMethods}
                subtotal={order.subtotal}
                hasExistingProof={!!order.paymentProofPath}
                currentMethodName={order.paymentMethod?.name ?? null}
              />
            ) : (
              <div className="card p-6 text-sm">
                <h2 className="display text-2xl">Payment</h2>
                <dl className="mt-4 space-y-2">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Amount</dt>
                    <dd className="tabular-nums">{formatRupiah(order.subtotal)}</dd>
                  </div>
                  {order.paymentMethod && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted">Method</dt>
                      <dd>{order.paymentMethod.name}</dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Status</dt>
                    <dd>{STATUS_LABELS[order.status]}</dd>
                  </div>
                </dl>
              </div>
            )}

            <div className="text-sm text-muted">
              Questions about this order?{" "}
              <Link href="/help#contact" className="link text-ink">
                Contact us
              </Link>{" "}
              with your order number.
              {isOwner && (
                <>
                  {" "}
                  <Link href="/account/orders" className="link text-ink">
                    View all orders
                  </Link>
                  .
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
