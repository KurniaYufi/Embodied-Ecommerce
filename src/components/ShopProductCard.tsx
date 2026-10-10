import Link from "next/link";
import ProductImage from "./ProductImage";
import StarRating from "./StarRating";
import WishlistButton from "./WishlistButton";
import { formatRupiah } from "@/lib/format";
import { LOW_STOCK, type ProductCardData } from "@/lib/products";

type Props = {
  product: ProductCardData;
  aspect?: string;
  priority?: boolean;
};

export default function ShopProductCard({ product, aspect = "aspect-[4/5]", priority = false }: Props) {
  const href = `/product/${product.slug}`;
  const soldOut = product.stock <= 0;
  const lowStock = !soldOut && product.stock <= LOW_STOCK;

  return (
    <article className="group relative flex flex-col">
      <div className={`relative ${aspect} overflow-hidden bg-sunken`}>
        <div className={`h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.03] ${soldOut ? "opacity-60" : ""}`}>
          <ProductImage image={product.image} gradient={product.gradient} alt={product.name} decorative priority={priority} />
        </div>

        <div className="pointer-events-none absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {soldOut ? (
            <span className="badge bg-ink text-paper">Sold out</span>
          ) : (
            product.badge && <span className="badge bg-paper text-ink">{product.badge}</span>
          )}
        </div>

        <div className="absolute top-2 right-2 z-10">
          <WishlistButton productId={product.id} productName={product.name} />
        </div>
      </div>

      <div className="mt-3.5 flex flex-1 flex-col gap-1">
        <h3 className="text-[15px] leading-snug text-ink">
          <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {product.name}
          </Link>
        </h3>
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="text-sm text-ink-soft tabular-nums">{formatRupiah(product.price)}</p>
          {lowStock && <p className="text-[12px] text-warning">Only {product.stock} left</p>}
        </div>
        <StarRating rating={product.averageRating} count={product.reviewsCount} />
      </div>
      {/* Keyboard focus ring for the stretched link. */}
      <span aria-hidden className="pointer-events-none absolute -inset-1.5 hidden ring-2 ring-ink group-has-[a:focus-visible]:block" />
    </article>
  );
}
