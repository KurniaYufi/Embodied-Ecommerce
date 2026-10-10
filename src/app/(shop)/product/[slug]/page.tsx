import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { LOW_STOCK, productBadge, toProductCard } from "@/lib/products";
import ProductImage from "@/components/ProductImage";
import StarRating from "@/components/StarRating";
import ProductDetailClient from "@/components/ProductDetailClient";
import ShopProductCard from "@/components/ShopProductCard";
import SectionHeading from "@/components/SectionHeading";

const getProduct = cache((slug: string) =>
  prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      sizes: { include: { size: true } },
      reviews: { select: { rating: true } },
    },
  })
);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return { title: "Product not found" };
  return { title: product.name, description: product.description.slice(0, 160) };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const [allSizes, relatedRaw] = await Promise.all([
    prisma.size.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({
      where: { id: { not: product.id }, ...(product.categoryId ? { categoryId: product.categoryId } : {}) },
      orderBy: [{ stock: "desc" }, { id: "desc" }],
      take: 4,
      include: { reviews: { select: { rating: true } } },
    }),
  ]);

  const badge = productBadge(product);
  const productSizeIds = new Set(product.sizes.map((ps) => ps.sizeId));
  // Products without linked sizes are one-size: no selector is shown and none is sent at checkout.
  const sizeOptions =
    productSizeIds.size === 0
      ? []
      : allSizes.map((s) => ({ id: s.id, label: s.label, available: productSizeIds.has(s.id) }));

  const { averageRating, reviewsCount } = toProductCard(product);
  const soldOut = product.stock <= 0;
  const related = relatedRaw.map(toProductCard);

  return (
    <>
      <div className="container-page pt-6 lg:pt-8">
        <nav aria-label="Breadcrumb" className="text-[13px] text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-ink">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/collection" className="hover:text-ink">
                Shop
              </Link>
            </li>
            {product.category && (
              <>
                <li aria-hidden>/</li>
                <li>
                  <Link href={`/collection?category=${product.category.slug}`} className="hover:text-ink">
                    {product.category.name}
                  </Link>
                </li>
              </>
            )}
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-ink">
              {product.name}
            </li>
          </ol>
        </nav>
      </div>

      <div className="container-page grid grid-cols-1 gap-10 pt-6 lg:grid-cols-12 lg:gap-16 lg:pt-8">
        <div className="lg:col-span-7">
          <div className="relative aspect-[4/5] overflow-hidden bg-sunken lg:sticky lg:top-28">
            {(badge || soldOut) && (
              <span className={`badge absolute top-4 left-4 z-10 ${soldOut ? "bg-ink text-paper" : "bg-paper text-ink"}`}>
                {soldOut ? "Sold out" : badge}
              </span>
            )}
            <ProductImage image={product.image} gradient={product.gradient} alt={product.name} priority />
          </div>
        </div>

        <div className="lg:col-span-5">
          <p className="eyebrow">{product.category?.name ?? "Collection"}</p>
          <h1 className="display mt-3 text-4xl leading-tight sm:text-5xl">{product.name}</h1>
          {reviewsCount > 0 && (
            <div className="mt-3">
              <StarRating rating={averageRating} count={reviewsCount} size="h-4 w-4" />
            </div>
          )}

          <ProductDetailClient
            productId={product.id}
            slug={product.slug}
            name={product.name}
            price={product.price}
            gradient={product.gradient}
            image={product.image}
            description={product.description}
            sizes={sizeOptions}
            stock={product.stock}
            lowStockThreshold={LOW_STOCK}
          />
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="container-page pt-24">
          <SectionHeading
            id="related-heading"
            eyebrow="You may also like"
            title={product.category ? `More in ${product.category.name}` : "More pieces"}
            action={{
              label: "View all",
              href: product.category ? `/collection?category=${product.category.slug}` : "/collection",
            }}
          />
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {related.map((p) => (
              <ShopProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
