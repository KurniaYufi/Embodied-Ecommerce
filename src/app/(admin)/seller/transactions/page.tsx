import { prisma } from "@/lib/prisma";
import TransactionsManager from "@/components/admin/TransactionsManager";

export default async function SellerTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  const { search = "", status = "", page: pageRaw } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);
  const pageSize = 10;

  const where = {
    ...(search
      ? {
          OR: [
            { customerName: { contains: search, mode: "insensitive" as const } },
            { number: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(status ? { status: status as never } : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { items: true },
    }),
    prisma.order.count({ where }),
  ]);

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">Transaksi</p>
      <h1 className="mt-1 font-serif text-3xl">Transactions</h1>

      <TransactionsManager
        orders={orders.map((o) => ({
          id: o.id,
          number: o.number,
          customerName: o.customerName,
          customerPhone: o.customerPhone,
          shippingAddress: o.shippingAddress,
          notes: o.notes,
          subtotal: o.subtotal,
          status: o.status,
          paymentProofPath: o.paymentProofPath,
          createdAt: o.createdAt.toISOString(),
          items: o.items.map((i) => ({
            id: i.id,
            productName: i.productName,
            size: i.size,
            price: i.price,
            quantity: i.quantity,
            gradient: i.gradient,
            image: i.image,
          })),
        }))}
        initialSearch={search}
        initialStatus={status}
        page={page}
        totalPages={Math.ceil(total / pageSize)}
      />
    </div>
  );
}
