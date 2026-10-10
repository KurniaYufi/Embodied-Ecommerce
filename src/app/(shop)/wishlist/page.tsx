import type { Metadata } from "next";
import WishlistClient from "@/components/WishlistClient";

export const metadata: Metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return (
    <div className="container-page py-10 lg:py-14">
      <p className="eyebrow">Saved for later</p>
      <h1 className="display mt-3 text-5xl sm:text-6xl">Wishlist</h1>
      <p className="mt-3 max-w-lg text-sm text-muted">
        Your wishlist is saved on this device. Pieces sell out quickly — add them to your bag when you&apos;re ready.
      </p>
      <WishlistClient />
    </div>
  );
}
