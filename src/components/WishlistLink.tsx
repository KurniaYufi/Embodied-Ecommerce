"use client";

import Link from "next/link";
import { useWishlist } from "@/contexts/WishlistContext";
import { HeartIcon } from "./Icons";
import CountBadge from "./CountBadge";

export default function WishlistLink() {
  const { count } = useWishlist();
  return (
    <Link href="/wishlist" aria-label={`Wishlist, ${count} item${count === 1 ? "" : "s"}`} className="icon-btn">
      <HeartIcon />
      <CountBadge count={count} />
    </Link>
  );
}
