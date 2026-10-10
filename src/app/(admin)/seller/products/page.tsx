import { prisma } from "@/lib/prisma";
import ProductsManager from "@/components/admin/ProductsManager";

export default async function SellerProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search = "" } = await searchParams;

  const [products, categories, sizes] = await Promise.all([
    prisma.product.findMany({
      where: search ? { name: { contains: search, mode: "insensitive" } } : undefined,
      include: { category: true, sizes: { include: { size: true } } },
      orderBy: { id: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.size.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">Master Data</p>
      <h1 className="mt-1 font-serif text-3xl">Products</h1>

      <ProductsManager
        initialProducts={products.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          categoryId: p.categoryId,
          categoryName: p.category?.name ?? null,
          description: p.description,
          price: p.price,
          stock: p.stock,
          gradient: p.gradient,
          image: p.image,
          isBestseller: p.isBestseller,
          isNew: p.isNew,
          sizeIds: p.sizes.map((s) => s.sizeId),
          sizeLabels: p.sizes.map((s) => s.size.label),
        }))}
        categories={categories}
        sizes={sizes}
        initialSearch={search}
      />
    </div>
  );
}
