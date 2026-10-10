export type ProductCardData = {
  id: number;
  slug: string;
  name: string;
  price: number;
  stock: number;
  gradient: string;
  image: string | null;
  badge: string | null;
  averageRating: number;
  reviewsCount: number;
};

type ProductWithReviews = {
  id: number;
  slug: string;
  name: string;
  price: number;
  stock: number;
  gradient: string;
  image: string | null;
  isBestseller: boolean;
  isNew: boolean;
  reviews?: { rating: number }[];
};

export function productBadge(p: { isBestseller: boolean; isNew: boolean }): string | null {
  return p.isBestseller ? "Bestseller" : p.isNew ? "New" : null;
}

export function toProductCard(p: ProductWithReviews): ProductCardData {
  const reviews = p.reviews ?? [];
  const reviewsCount = reviews.length;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    stock: p.stock,
    gradient: p.gradient,
    image: p.image,
    badge: productBadge(p),
    averageRating: reviewsCount > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount : 0,
    reviewsCount,
  };
}

/** Low-stock threshold for the "Only N left" hint. */
export const LOW_STOCK = 5;
