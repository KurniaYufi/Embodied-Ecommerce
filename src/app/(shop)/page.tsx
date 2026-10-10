import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toProductCard } from "@/lib/products";
import { formatRupiah } from "@/lib/format";
import Marquee from "@/components/Marquee";
import ProductImage from "@/components/ProductImage";
import ShopProductCard from "@/components/ShopProductCard";
import SectionHeading from "@/components/SectionHeading";
import { ArrowRightIcon } from "@/components/Icons";

export default async function HomePage() {
  const [featuredRaw, latestRaw, lookbookRaw, categories] = await Promise.all([
    prisma.product.findFirst({ where: { isBestseller: true, stock: { gt: 0 } }, orderBy: { id: "asc" } }),
    prisma.product.findMany({ orderBy: { createdAt: "desc" }, take: 4, include: { reviews: { select: { rating: true } } } }),
    prisma.product.findMany({ where: { isNew: true }, orderBy: { id: "asc" }, take: 3, include: { reviews: { select: { rating: true } } } }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { products: true } },
        products: { take: 2, orderBy: { id: "asc" }, select: { id: true, image: true, gradient: true } },
      },
    }),
  ]);

  const featured = featuredRaw ?? (await prisma.product.findFirst({ orderBy: { id: "asc" } }));
  const latest = latestRaw.map(toProductCard);
  const lookbook = lookbookRaw.map(toProductCard);
  // Spread the photography so the same product doesn't repeat across hero, tiles and studio notes.
  const shopCategories = categories
    .filter((c) => c._count.products > 0)
    .map((c) => ({ ...c, cover: c.products.find((p) => p.id !== featured?.id) ?? c.products[0] }));
  const usedIds = new Set([featured?.id, ...shopCategories.map((c) => c.cover?.id), ...lookbook.map((p) => p.id)]);
  const studioImage = latest.find((p) => p.image && !usedIds.has(p.id))?.image ?? lookbook[0]?.image ?? null;

  return (
    <>
      {/* Hero */}
      <section className="relative isolate -mt-[calc(4rem+1px)] overflow-hidden bg-neutral-950 text-white lg:-mt-[calc(4.5rem+1px)]">
        <Image
          src="/images/hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-[68%_center]"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/45 to-black/10 lg:bg-gradient-to-r lg:from-black/85 lg:via-black/45 lg:to-transparent"
        />
        {/* Keeps the transparent header legible over the top of the photo. */}
        <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-black/55 to-transparent" />
        <div className="container-page flex min-h-[min(92svh,56rem)] flex-col justify-end pt-48 pb-14 lg:justify-center lg:pt-36 lg:pb-24">
          <div className="animate-fade-up max-w-xl">
            <p className="text-[11px] font-medium tracking-[0.3em] text-white/70 uppercase">Clothing · Indonesia · Est. 2024</p>
            <h1 className="mt-6 font-serif text-[clamp(3.25rem,9vw,7.5rem)] leading-[0.92] font-medium tracking-tight">
              Wear what
              <br />
              <span className="italic">you are.</span>
            </h1>
            <p className="mt-7 max-w-md text-[15px] leading-relaxed text-white/75">
              Pieces cut to move, not to restrict — made slowly, in limited quantities, for the way you actually live.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/collection" className="btn btn-on-dark">
                Shop the Collection
              </Link>
              <Link href="/collection?category=new" className="btn btn-outline-on-dark">
                New Arrivals
              </Link>
            </div>
          </div>
        </div>

        {featured && (
          <Link
            href={`/product/${featured.slug}`}
            className="group absolute right-6 bottom-6 hidden items-center gap-4 bg-black/45 p-3 pr-5 backdrop-blur-md transition-colors hover:bg-black/60 lg:flex xl:right-10 xl:bottom-10"
          >
            <span className="h-20 w-16 shrink-0 overflow-hidden bg-white">
              <ProductImage image={featured.image} gradient={featured.gradient} alt="" decorative />
            </span>
            <span className="text-sm">
              <span className="block text-[10px] tracking-[0.24em] text-white/60 uppercase">
                {featured.isBestseller ? "Bestseller" : "Featured"}
              </span>
              <span className="mt-1 block">{featured.name}</span>
              <span className="block text-white/70 tabular-nums">{formatRupiah(featured.price)}</span>
            </span>
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </section>

      <Marquee
        items={["wear what you are", "dressed in intention", "the body, the cloth, the self", "quietly worn, deeply felt", "new arrival"]}
      />

      {/* Shop by category */}
      {shopCategories.length > 0 && (
        <section aria-labelledby="categories-heading" className="container-page pt-20 lg:pt-28">
          <SectionHeading id="categories-heading" eyebrow="Explore" title="Shop by Category" />
          <div className={`mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 ${shopCategories.length >= 3 ? "lg:grid-cols-3" : ""}`}>
            {shopCategories.map((c) => (
              <Link key={c.id} href={`/collection?category=${c.slug}`} className="group block">
                <div className="aspect-[4/5] overflow-hidden bg-white">
                  <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]">
                    <ProductImage image={c.cover?.image} gradient={c.cover?.gradient} alt="" decorative />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-b border-line pb-4">
                  <div>
                    <h3 className="display text-3xl">{c.name}</h3>
                    <p className="mt-0.5 text-[13px] text-muted">
                      {c._count.products} piece{c._count.products === 1 ? "" : "s"}
                    </p>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong text-ink transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
                    <ArrowRightIcon className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest */}
      <section id="collection" aria-labelledby="latest-heading" className="container-page pt-20 lg:pt-28">
        <SectionHeading
          id="latest-heading"
          eyebrow="Just Landed"
          title="The Latest Pieces"
          action={{ label: "View all", href: "/collection" }}
        />
        {latest.length === 0 ? (
          <p className="mt-10 text-sm text-muted">New pieces are on their way.</p>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {latest.map((p) => (
              <ShopProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Studio notes */}
      <section id="studio" aria-labelledby="studio-heading" className="container-page pt-20 lg:pt-28">
        <div className="grid grid-cols-1 items-center gap-10 border-y border-line py-14 lg:grid-cols-12 lg:gap-16 lg:py-20">
          <div className="lg:col-span-5">
            <div className="aspect-[4/5] max-w-md overflow-hidden bg-gradient-to-br from-stone-200 to-stone-400">
              <ProductImage image={studioImage} gradient="from-stone-200 to-stone-400" alt="" decorative />
            </div>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="eyebrow">Studio Notes</p>
            <h2 id="studio-heading" className="display mt-4 text-4xl leading-tight sm:text-5xl">
              Clothing that becomes a <span className="italic">second skin.</span>
            </h2>
            <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-ink-soft">
              We work with natural fibres — linen, cotton, tencel — that breathe with the body and soften with wear.
              Every piece is cut to move, not to restrict.
            </p>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-soft">
              Embodied was born from a desire to dress with intention. Slow production, limited quantities,
              thoughtful design. Nothing more.
            </p>
            <p className="mt-6 font-serif text-lg text-muted italic">— Embodied Studio, Jakarta</p>
            <Link href="/collection" className="btn btn-secondary mt-8">
              Discover the Collection
            </Link>
          </div>
        </div>
      </section>

      {/* Lookbook */}
      <section id="lookbook" aria-labelledby="lookbook-heading" className="container-page pt-20 lg:pt-28">
        <SectionHeading
          id="lookbook-heading"
          eyebrow="Collection"
          title="The Lookbook"
          action={lookbook.length > 0 ? { label: "Shop new arrivals", href: "/collection?category=new" } : undefined}
        />
        {lookbook.length === 0 ? (
          <p className="mt-10 text-sm text-muted">New looks are on their way.</p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 md:grid-cols-3">
            {lookbook.map((p) => (
              <ShopProductCard key={p.id} product={p} aspect="aspect-[3/4]" />
            ))}
          </div>
        )}
      </section>

      {/* Service promises — taken from the Help page */}
      <section aria-label="Our promises" className="container-page pt-20 lg:pt-28">
        <ul className="grid grid-cols-1 divide-y divide-line border-y border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { title: "Made in small batches", body: "Allow 3–5 business days for your piece to be prepared.", href: "/help#shipping" },
            { title: "Nationwide shipping", body: "Delivered across Indonesia via JNE and J&T.", href: "/help#shipping" },
            { title: "7-day returns", body: "Unworn items with tags attached can be returned.", href: "/help#returns" },
          ].map((item) => (
            <li key={item.title}>
              <Link href={item.href} className="group block px-2 py-8 sm:px-8">
                <p className="display text-2xl">{item.title}</p>
                <p className="mt-2 text-sm text-muted">{item.body}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-[12px] font-medium tracking-[0.14em] text-ink uppercase">
                  Learn more <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
