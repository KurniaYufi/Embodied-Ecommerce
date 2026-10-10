import { prisma } from "@/lib/prisma";
import CategoriesManager from "@/components/admin/CategoriesManager";

export default async function SellerCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search = "" } = await searchParams;

  const categories = await prisma.category.findMany({
    where: search ? { name: { contains: search, mode: "insensitive" } } : undefined,
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">Master Data</p>
      <h1 className="mt-1 font-serif text-3xl">Categories</h1>

      <CategoriesManager
        initialCategories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, productsCount: c._count.products }))}
        initialSearch={search}
      />
    </div>
  );
}
