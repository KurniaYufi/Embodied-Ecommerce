"use client";

import { useWishlist } from "@/contexts/WishlistContext";
import { useToast } from "@/contexts/ToastContext";
import { HeartIcon } from "./Icons";

export default function WishlistButton({
  productId,
  productName,
  variant = "overlay",
}: {
  productId: number;
  productName: string;
  variant?: "overlay" | "inline";
}) {
  const { isWishlisted, toggle } = useWishlist();
  const { show } = useToast();
  const saved = isWishlisted(productId);

  const onClick = () => {
    const nowSaved = toggle(productId);
    show(nowSaved ? `${productName} saved to your wishlist.` : `${productName} removed from your wishlist.`, {
      action: nowSaved ? { label: "View", href: "/wishlist" } : undefined,
    });
  };

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        className="btn btn-quiet h-12 w-12 shrink-0 px-0"
        aria-label={saved ? `Remove ${productName} from wishlist` : `Save ${productName} to wishlist`}
      >
        <HeartIcon filled={saved} className={`h-5 w-5 ${saved ? "text-danger" : ""}`} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${productName} from wishlist` : `Save ${productName} to wishlist`}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full bg-paper/85 backdrop-blur transition-colors hover:bg-paper ${
        saved ? "text-danger" : "text-ink"
      }`}
    >
      <HeartIcon filled={saved} className="h-[18px] w-[18px]" />
    </button>
  );
}
