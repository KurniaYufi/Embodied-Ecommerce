"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Modal from "@/components/Modal";
import ProductImage from "@/components/ProductImage";
import { formatRupiah } from "@/lib/format";
import { updateOrderStatus } from "@/app/actions/transactions";

type OrderItem = {
  id: number;
  productName: string;
  size: string | null;
  price: number;
  quantity: number;
  gradient: string;
  image: string | null;
};

type Order = {
  id: number;
  number: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  notes: string | null;
  subtotal: number;
  status: string;
  paymentProofPath: string | null;
  createdAt: string;
  items: OrderItem[];
};

const STATUS_OPTIONS = [
  { value: "pending_payment", label: "Pending Payment" },
  { value: "awaiting_confirmation", label: "Awaiting Confirmation" },
  { value: "paid", label: "Paid" },
  { value: "shipped", label: "Shipped" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_BADGE_CLASS: Record<string, string> = {
  pending_payment: "bg-neutral-200 text-neutral-700",
  awaiting_confirmation: "bg-amber-100 text-amber-800",
  paid: "bg-blue-100 text-blue-800",
  shipped: "bg-sky-100 text-sky-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-rose-100 text-rose-800",
};

export default function TransactionsManager({
  orders,
  initialSearch,
  initialStatus,
  page,
  totalPages,
}: {
  orders: Order[];
  initialSearch: string;
  initialStatus: string;
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [viewing, setViewing] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [pending, setPending] = useState(false);

  const updateQuery = (next: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const openView = (order: Order) => {
    setViewing(order);
    setNewStatus(order.status);
  };

  const handleSaveStatus = async () => {
    if (!viewing) return;
    setPending(true);
    await updateOrderStatus(viewing.id, newStatus);
    setPending(false);
    setViewing(null);
    router.refresh();
  };

  return (
    <div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search by customer or order number"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            updateQuery({ search: e.target.value });
          }}
          className="w-full max-w-xs border border-neutral-300 bg-cream px-3 py-2 text-sm focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            updateQuery({ status: e.target.value });
          }}
          className="border border-neutral-300 bg-cream px-3 py-2 text-sm focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-[11px] uppercase tracking-wider text-neutral-500 dark:border-neutral-800">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Proof</th>
              <th className="px-4 py-3">Placed</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                  No transactions yet.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-neutral-100 dark:border-neutral-800">
                  <td className="px-4 py-3">{order.number}</td>
                  <td className="px-4 py-3">{order.customerName}</td>
                  <td className="px-4 py-3">{formatRupiah(order.subtotal)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-1.5 py-0.5 text-[10px] uppercase ${STATUS_BADGE_CLASS[order.status]}`}>
                      {STATUS_OPTIONS.find((s) => s.value === order.status)?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {order.paymentProofPath ? (
                      <Link href={order.paymentProofPath} target="_blank" className="text-neutral-600 underline underline-offset-4">
                        View
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-500">
                    {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => openView(order)} aria-label="View order" className="text-neutral-600 hover:text-neutral-900">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`${pathname}?${new URLSearchParams({ ...(search ? { search } : {}), ...(statusFilter ? { status: statusFilter } : {}), page: String(p) }).toString()}`}
              className={`h-8 w-8 flex items-center justify-center text-sm ${p === page ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"}`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing ? `Order ${viewing.number}` : ""} maxWidth="max-w-xl">
        {viewing && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">
                {new Date(viewing.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
              <span className={`px-1.5 py-0.5 text-[10px] uppercase ${STATUS_BADGE_CLASS[viewing.status]}`}>
                {STATUS_OPTIONS.find((s) => s.value === viewing.status)?.label}
              </span>
            </div>

            <div>
              <h4 className="text-[11px] uppercase tracking-wider text-neutral-500">Customer</h4>
              <p className="mt-1 text-sm">{viewing.customerName}</p>
              <p className="text-sm text-neutral-600">{viewing.customerPhone}</p>
              <p className="text-sm text-neutral-600">{viewing.shippingAddress}</p>
              {viewing.notes && <p className="text-sm text-neutral-500">Notes: {viewing.notes}</p>}
            </div>

            <div>
              <h4 className="text-[11px] uppercase tracking-wider text-neutral-500">Items</h4>
              <div className="mt-2 space-y-3">
                {viewing.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="h-14 w-12 flex-shrink-0 overflow-hidden bg-neutral-100">
                      <ProductImage image={item.image} gradient={item.gradient} alt={item.productName} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{item.productName}</p>
                      <p className="text-xs text-neutral-500">
                        {item.size ?? "One Size"} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm">{formatRupiah(item.price * item.quantity)}</p>
                  </div>
                ))}
                <div className="flex justify-between border-t border-neutral-200 pt-3 text-sm font-medium dark:border-neutral-700">
                  <span>Subtotal</span>
                  <span>{formatRupiah(viewing.subtotal)}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] uppercase tracking-wider text-neutral-500">Proof of Payment</h4>
              {viewing.paymentProofPath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={viewing.paymentProofPath} alt="Payment proof" className="mt-2 max-h-64 object-contain" />
              ) : (
                <p className="mt-1 text-sm text-neutral-500">No payment proof uploaded yet.</p>
              )}
            </div>

            <div className="flex items-center gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-700">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="flex-1 border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none dark:border-neutral-700 dark:bg-neutral-800"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleSaveStatus}
                disabled={pending}
                className="bg-neutral-900 px-5 py-2 text-[11px] font-medium uppercase tracking-wider text-white disabled:opacity-60 dark:bg-white dark:text-neutral-900"
              >
                {pending ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
