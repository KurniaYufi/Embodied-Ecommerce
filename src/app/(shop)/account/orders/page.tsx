import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/format";
import { STATUS_BADGE_CLASS, STATUS_LABELS } from "@/lib/orderStatus";
import ProductImage from "@/components/ProductImage";
import Pagination from "@/components/Pagination";
import { ChevronRightIcon, ReceiptIcon } from "@/components/Icons";

export const metadata: Metadata = { title: "My Orders" };

const PAGE_SIZE = 10;

export default async function OrderHistoryPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const session = await auth();
  const sp = await searchParams;
  const userId = Number(session!.user.id);

  const total = await prisma.order.count({ where: { userId } });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Math.floor(Number(sp.page)) || 1), totalPages);

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: { items: { select: { id: true, image: true, gradient: true, productName: true, quantity: true } } },
  });

  return (
    <div className="container-page max-w-4xl py-10 lg:py-14">
      <p className="eyebrow">Account</p>
      <h1 className="display mt-3 text-5xl">My Orders</h1>

      {orders.length === 0 ? (
        <div className="mt-10 flex flex-col items-center border border-dashed border-line-strong px-6 py-20 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sunken text-muted">
            <ReceiptIcon className="h-6 w-6" />
          </span>
          <p className="display mt-5 text-3xl">No orders yet</p>
          <p className="mt-2 max-w-sm text-sm text-muted">When you place an order, you can track its status here.</p>
          <Link href="/collection" className="btn btn-primary mt-8">
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-3 text-sm text-muted">
            {total} order{total === 1 ? "" : "s"}
          </p>
          <ul className="mt-8 space-y-3">
            {orders.map((order) => {
              const count = order.items.reduce((s, i) => s + i.quantity, 0);
              return (
                <li key={order.id}>
                  <Link
                    href={`/orders/${order.accessToken}`}
                    className="group card flex flex-col gap-4 p-5 transition-colors hover:border-line-strong sm:flex-row sm:items-center"
                  >
                    <div className="flex -space-x-3">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="h-16 w-12 overflow-hidden border-2 border-surface bg-sunken">
                          <ProductImage image={item.image} gradient={item.gradient} alt={item.productName} decorative />
                        </div>
                      ))}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-ink">{order.number}</p>
                      <p className="mt-0.5 text-[13px] text-muted">
                        {order.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Jakarta" })}
                        {" · "}
                        {count} item{count === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <span className={`badge ${STATUS_BADGE_CLASS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
                      <span className="text-[15px] font-medium tabular-nums">{formatRupiah(order.subtotal)}</span>
                      <ChevronRightIcon className="hidden h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5 sm:block" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Pagination page={page} totalPages={totalPages} hrefFor={(p) => (p > 1 ? `/account/orders?page=${p}` : "/account/orders")} />
        </>
      )}
    </div>
  );
}
