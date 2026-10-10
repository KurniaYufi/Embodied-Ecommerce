import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductImage from "@/components/ProductImage";
import { formatRupiah } from "@/lib/format";

export default async function DashboardPage() {
  const [productCount, categoryCount, outOfStockCount, orderCount, awaitingConfirmationCount, recentProducts] =
    await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.product.count({ where: { stock: { lte: 0 } } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "awaiting_confirmation" } }),
      prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: "desc" }, take: 5 }),
    ]);

  const stats = [
    { label: "Products", value: productCount, href: "/seller/products" },
    { label: "Categories", value: categoryCount, href: "/seller/categories" },
    { label: "Out of Stock", value: outOfStockCount, href: "/seller/products" },
    { label: "Total Orders", value: orderCount, href: "/seller/transactions" },
    { label: "Awaiting Confirmation", value: awaitingConfirmationCount, href: "/seller/transactions" },
  ];

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">Overview</p>
      <h1 className="mt-1 font-serif text-3xl">Dashboard</h1>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="border border-neutral-200 p-6 hover:border-neutral-400 dark:border-neutral-800"
          >
            <p className="text-[11px] uppercase tracking-wider text-neutral-500">{stat.label}</p>
            <p className="mt-2 font-serif text-3xl">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 border border-neutral-200 p-6 dark:border-neutral-800">
        <h2 className="font-serif text-lg">Recently Added Products</h2>
        {recentProducts.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">No products yet — add one from Master Data.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {recentProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-4">
                <div className="h-12 w-10 flex-shrink-0 overflow-hidden bg-neutral-100">
                  <ProductImage image={product.image} gradient={product.gradient} alt={product.name} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-neutral-500">{product.category?.name ?? "Uncategorized"}</p>
                </div>
                <p className="text-sm">{formatRupiah(product.price)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
