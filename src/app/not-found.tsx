import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ShopNotFound from "./(shop)/not-found";

// Unmatched URLs render outside the (shop) layout, so wrap the 404 in the store chrome here.
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <ShopNotFound />
      </main>
      <SiteFooter />
    </div>
  );
}
