"use server";

import { prisma } from "@/lib/prisma";
import { toProductCard } from "@/lib/products";

/** Products for the browser-stored wishlist. Unknown or deleted ids are simply skipped. */
export async function getWishlistProducts(ids: number[]) {
  const clean = [...new Set(ids.filter((id) => Number.isInteger(id) && id > 0))].slice(0, 100);
  if (clean.length === 0) return [];
  const products = await prisma.product.findMany({
    where: { id: { in: clean } },
    include: { reviews: { select: { rating: true } } },
  });
  // Keep the order in which items were saved.
  const order = new Map(clean.map((id, i) => [id, i]));
  return products.sort((a, b) => order.get(a.id)! - order.get(b.id)!).map(toProductCard);
}
