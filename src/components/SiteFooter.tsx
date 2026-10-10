import Link from "next/link";
import FooterLinks from "./FooterLinks";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer id="about" className="mt-24 bg-neutral-950 text-neutral-100">
      <div className="container-page grid grid-cols-2 gap-x-8 gap-y-12 py-16 md:grid-cols-4 lg:grid-cols-12 lg:py-20">
        <div className="col-span-2 md:col-span-4 lg:col-span-3">
          <Link href="/" className="font-serif text-3xl font-semibold tracking-[0.32em] uppercase">
            Embodied
          </Link>
          <p className="mt-4 font-serif text-xl text-neutral-300 italic">Wear what you are.</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-400">
            Clothing in natural fibres — linen, cotton, tencel — cut to move and made in small batches in Jakarta.
          </p>
        </div>

        <div className="lg:col-span-2 lg:col-start-5">
          <FooterLinks
            title="Shop"
            links={[
              { label: "All Products", href: "/collection" },
              { label: "New Arrivals", href: "/collection?category=new" },
              { label: "Bestsellers", href: "/collection?category=bestseller" },
              { label: "Wishlist", href: "/wishlist" },
            ]}
          />
        </div>

        <div className="lg:col-span-2">
          <FooterLinks
            title="Studio"
            links={[
              { label: "Our Story", href: "/#studio" },
              { label: "Lookbook", href: "/#lookbook" },
            ]}
          />
        </div>

        <div className="lg:col-span-2">
          <FooterLinks
            title="Help"
            links={[
              { label: "Sizing Guide", href: "/help#sizing" },
              { label: "Shipping", href: "/help#shipping" },
              { label: "Returns", href: "/help#returns" },
              { label: "Contact", href: "/help#contact" },
            ]}
          />
        </div>

        <div className="lg:col-span-2">
          <FooterLinks
            title="Account"
            links={[
              { label: "My Orders", href: "/account/orders" },
              { label: "Settings", href: "/settings/profile" },
              { label: "Log in", href: "/login" },
              { label: "Create account", href: "/register" },
            ]}
          />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} Embodied Studio, Jakarta, Indonesia.</p>
          <p>Handcrafted with intention.</p>
        </div>
      </div>
    </footer>
  );
}
