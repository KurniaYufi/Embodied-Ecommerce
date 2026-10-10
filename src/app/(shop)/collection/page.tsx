import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toProductCard } from "@/lib/products";
import ShopProductCard from "@/components/ShopProductCard";
import Pagination from "@/components/Pagination";
import { CollectionQueryProvider, ResultsRegion } from "@/components/collection/CollectionQuery";
import FilterList from "@/components/collection/FilterList";
import StockFilterToggle from "@/components/collection/StockFilterToggle";
import SortSelect from "@/components/collection/SortSelect";
import SearchInput from "@/components/collection/SearchInput";
import ActiveFilterChips, { type Chip } from "@/components/collection/ActiveFilterChips";
import MobileFilters from "@/components/collection/MobileFilters";

type SearchParams = {
  search?: string;
  category?: string;
  price?: string;
  stock?: string;
  sort?: string;
  page?: string;
};

const PAGE_SIZE = 12;

const PRICE_ITEMS = [
  { label: "All prices", value: "" },
  { label: "Under Rp 300.000", value: "under-300" },
  { label: "Rp 300.000 – 500.000", value: "300-500" },
  { label: "Rp 500.000 – 1.000.000", value: "500-1000" },
  { label: "Over Rp 1.000.000", value: "1000-plus" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Newest" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "name-asc", label: "Name, A–Z" },
];

export const metadata: Metadata = { title: "Shop" };

export default async function CollectionPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const search = (sp.search ?? "").trim().slice(0, 100);
  const categoryFilter = sp.category ?? "";
  const priceFilter = PRICE_ITEMS.some((p) => p.value === sp.price) ? (sp.price ?? "") : "";
  const stockFilter = sp.stock !== "0" && sp.stock !== "false";
  const sortFilter = SORT_OPTIONS.some((s) => s.value === sp.sort) ? (sp.sort ?? "recent") : "recent";
  const requestedPage = Math.max(1, Math.floor(Number(sp.page)) || 1);

  const where: Prisma.ProductWhereInput = {};
  if (search !== "") where.name = { contains: search, mode: "insensitive" };
  if (categoryFilter === "new") where.isNew = true;
  else if (categoryFilter === "bestseller") where.isBestseller = true;
  else if (categoryFilter) where.category = { slug: categoryFilter };

  if (priceFilter === "under-300") where.price = { lt: 300000 };
  else if (priceFilter === "300-500") where.price = { gte: 300000, lte: 500000 };
  else if (priceFilter === "500-1000") where.price = { gte: 500000, lte: 1000000 };
  else if (priceFilter === "1000-plus") where.price = { gt: 1000000 };

  if (stockFilter) where.stock = { gt: 0 };

  let orderBy: Prisma.ProductOrderByWithRelationInput[] = [{ id: "desc" }];
  if (sortFilter === "price-asc") orderBy = [{ price: "asc" }, { id: "desc" }];
  else if (sortFilter === "price-desc") orderBy = [{ price: "desc" }, { id: "desc" }];
  else if (sortFilter === "name-asc") orderBy = [{ name: "asc" }];

  const [total, categories] = await Promise.all([
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);

  const products = (
    await prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { reviews: { select: { rating: true } } },
    })
  ).map(toProductCard);

  const categoryItems = [
    { label: "All products", value: "" },
    { label: "New Arrivals", value: "new" },
    { label: "Bestsellers", value: "bestseller" },
    ...categories.map((c) => ({ label: c.name, value: c.slug })),
  ];

  const categoryLabel = categoryItems.find((c) => c.value === categoryFilter)?.label;
  const title = categoryFilter && categoryLabel ? categoryLabel : "Shop All";

  const chips: Chip[] = [];
  if (search) chips.push({ label: `“${search}”`, param: "search" });
  if (categoryFilter && categoryLabel) chips.push({ label: categoryLabel, param: "category" });
  if (priceFilter) chips.push({ label: PRICE_ITEMS.find((p) => p.value === priceFilter)!.label, param: "price" });
  if (!stockFilter) chips.push({ label: "Including sold out", param: "stock" });

  const filters = (idPrefix: string) => (
    <>
      <SearchInput id={`${idPrefix}-search`} defaultValue={search} />
      <FilterList title="Category" items={categoryItems} param="category" active={categoryFilter} />
      <FilterList title="Price" items={PRICE_ITEMS} param="price" active={priceFilter} />
      <StockFilterToggle checked={stockFilter} />
    </>
  );

  return (
    <Suspense>
      <CollectionQueryProvider>
        <div className="border-b border-line">
          <div className="container-page py-10 lg:py-14">
            <nav aria-label="Breadcrumb" className="text-[13px] text-muted">
              <Link href="/" className="hover:text-ink">
                Home
              </Link>
              <span className="mx-2">/</span>
              <span className="text-ink">{title}</span>
            </nav>
            <h1 className="display mt-4 text-5xl sm:text-6xl">{title}</h1>
            {search && (
              <p className="mt-3 text-sm text-muted">
                Showing results for <span className="text-ink">“{search}”</span>
              </p>
            )}
          </div>
        </div>

        <div className="container-page flex gap-12 py-8 lg:py-12">
          <aside aria-label="Filters" className="hidden w-60 shrink-0 lg:block">
            <div className="sticky top-28 space-y-9">{filters("desktop")}</div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <MobileFilters activeCount={chips.length} resultCount={total}>
                  {filters("mobile")}
                </MobileFilters>
                <p className="text-sm text-muted" aria-live="polite">
                  {total} item{total !== 1 ? "s" : ""}
                </p>
              </div>
              <SortSelect options={SORT_OPTIONS} selected={sortFilter} />
            </div>

            {chips.length > 0 && (
              <div className="mt-4">
                <ActiveFilterChips chips={chips} />
              </div>
            )}

            <ResultsRegion>
              {products.length === 0 ? (
                <div className="mt-10 border border-dashed border-line-strong px-6 py-20 text-center">
                  <p className="display text-3xl">No pieces found</p>
                  <p className="mx-auto mt-3 max-w-sm text-sm text-muted">
                    {search
                      ? `We couldn't find anything matching “${search}”. Try a different word or remove a filter.`
                      : "No products match these filters right now. Try removing one."}
                  </p>
                  <Link href="/collection" className="btn btn-primary mt-8">
                    View all products
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 xl:grid-cols-3">
                    {products.map((product, i) => (
                      <ShopProductCard key={product.id} product={product} priority={i < 2} />
                    ))}
                  </div>
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    hrefFor={(p) => {
                      const params = new URLSearchParams();
                      for (const [k, v] of Object.entries(sp)) if (v && k !== "page") params.set(k, v);
                      if (p > 1) params.set("page", String(p));
                      const qs = params.toString();
                      return qs ? `/collection?${qs}` : "/collection";
                    }}
                  />
                </>
              )}
            </ResultsRegion>
          </div>
        </div>
      </CollectionQueryProvider>
    </Suspense>
  );
}
