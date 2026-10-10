import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import MobileNav from "./MobileNav";
import HeaderSearch from "./HeaderSearch";
import AccountMenu from "./AccountMenu";
import WishlistLink from "./WishlistLink";
import CartTrigger from "./CartTrigger";
import NavLinks from "./NavLinks";
import HeaderShell from "./HeaderShell";
import AnnouncementBar from "./AnnouncementBar";

export type NavItem = { label: string; href: string };

export default async function SiteHeader() {
  const [session, categories] = await Promise.all([
    auth(),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true } }),
  ]);

  const navLinks: NavItem[] = [
    { label: "Shop All", href: "/collection" },
    ...categories.map((c) => ({ label: c.name, href: `/collection?category=${c.slug}` })),
    { label: "New In", href: "/collection?category=new" },
    { label: "Lookbook", href: "/#lookbook" },
  ];

  const user = session?.user
    ? { name: session.user.name ?? "", email: session.user.email ?? "", role: session.user.role }
    : null;

  return (
    <>
      <AnnouncementBar>
        <span className="sm:hidden">Handmade in small batches.</span>
        <span className="hidden sm:inline">Handmade in small batches — please allow 3–5 days for dispatch.</span>{" "}
        <Link href="/help#shipping" className="underline underline-offset-2 hover:opacity-80">
          Shipping info
        </Link>
      </AnnouncementBar>
      <HeaderShell>
        <div className="container-page relative flex h-16 items-center justify-between gap-4 lg:h-18">
          <div className="flex items-center gap-1 lg:hidden">
            <MobileNav links={navLinks} user={user} />
            <HeaderSearch />
          </div>

          <Link
            href="/"
            aria-label="Embodied — home"
            className="absolute left-1/2 -translate-x-1/2 font-serif text-[22px] font-semibold tracking-[0.32em] uppercase lg:static lg:translate-x-0 lg:text-2xl"
          >
            Embodied
          </Link>

          <NavLinks links={navLinks} />

          <div className="flex items-center gap-0.5 sm:gap-1">
            <span className="hidden lg:inline-flex">
              <HeaderSearch />
            </span>
            <span className="hidden sm:inline-flex">
              <AccountMenu user={user} />
            </span>
            <WishlistLink />
            <CartTrigger />
          </div>
        </div>
      </HeaderShell>
    </>
  );
}
