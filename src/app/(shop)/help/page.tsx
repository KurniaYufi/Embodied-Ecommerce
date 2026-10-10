import type { Metadata } from "next";

export const metadata: Metadata = { title: "Help" };

const SECTIONS = [
  { id: "sizing", label: "Sizing Guide" },
  { id: "shipping", label: "Shipping" },
  { id: "returns", label: "Returns" },
  { id: "contact", label: "Contact" },
];

export default function HelpPage() {
  return (
    <div className="container-page py-10 lg:py-14">
      <p className="eyebrow">Customer care</p>
      <h1 className="display mt-3 text-5xl sm:text-6xl">How can we help?</h1>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-12">
        <nav aria-label="Help topics" className="lg:col-span-3">
          <ul className="flex flex-wrap gap-2 lg:sticky lg:top-28 lg:flex-col lg:gap-1">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="inline-block border border-line-strong px-3 py-2 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink lg:border-0 lg:border-l lg:border-line lg:px-4 lg:hover:border-ink"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-16 lg:col-span-8 lg:col-start-5">
          <section id="sizing" aria-labelledby="sizing-heading">
            <h2 id="sizing-heading" className="display text-4xl">
              Sizing Guide
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
              Our pieces are cut with a relaxed, oversized silhouette. If you&apos;re between sizes, we recommend sizing up for a fuller drape.
            </p>
            <div className="mt-6 overflow-x-auto border border-line">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <caption className="sr-only">Body measurements per size, in centimetres</caption>
                <thead className="bg-sunken">
                  <tr className="text-[11px] tracking-[0.14em] text-muted uppercase">
                    <th scope="col" className="px-4 py-3 font-medium">Size</th>
                    <th scope="col" className="px-4 py-3 font-medium">Chest (cm)</th>
                    <th scope="col" className="px-4 py-3 font-medium">Waist (cm)</th>
                    <th scope="col" className="px-4 py-3 font-medium">Length (cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {[
                    ["XS", "84–88", "64–68", "62"],
                    ["S", "89–93", "69–73", "64"],
                    ["M", "94–98", "74–78", "66"],
                    ["L", "99–104", "79–84", "68"],
                    ["XL", "105–110", "85–90", "70"],
                  ].map((row) => (
                    <tr key={row[0]}>
                      <th scope="row" className="px-4 py-3 font-medium text-ink">
                        {row[0]}
                      </th>
                      {row.slice(1).map((cell, i) => (
                        <td key={i} className="px-4 py-3 text-ink-soft tabular-nums">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="shipping" aria-labelledby="shipping-heading">
            <h2 id="shipping-heading" className="display text-4xl">
              Shipping
            </h2>
            <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink-soft">
              <p>Every piece is made in small batches — please allow 3–5 business days for your order to be prepared before it ships.</p>
              <p>
                We ship nationwide across Indonesia via JNE and J&amp;T. Estimated delivery is 2–5 business days for Java and 4–8 business days
                for other islands, depending on your location.
              </p>
              <p>You&apos;ll receive your order tracking details once your payment has been confirmed and your package has shipped.</p>
            </div>
          </section>

          <section id="returns" aria-labelledby="returns-heading">
            <h2 id="returns-heading" className="display text-4xl">
              Returns &amp; Exchanges
            </h2>
            <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink-soft">
              <p>
                We accept returns and exchanges within 7 days of delivery, provided the item is unworn, unwashed, and still has its original tags
                attached.
              </p>
              <p>To start a return, reach out to us via the contact details below with your order number and the reason for return.</p>
              <p>Sale items and accessories are final sale and cannot be returned or exchanged.</p>
            </div>
          </section>

          <section id="contact" aria-labelledby="contact-heading" className="card p-6 sm:p-8">
            <h2 id="contact-heading" className="display text-4xl">
              Contact
            </h2>
            <dl className="mt-5 grid grid-cols-1 gap-5 text-sm sm:grid-cols-3">
              <div>
                <dt className="eyebrow">Email</dt>
                <dd className="mt-1.5 text-ink">
                  hello@embodied.studio{" "}
                  <a href="mailto:hello@embodied.studio" className="link ml-1 text-muted">
                    (write)
                  </a>
                </dd>
              </div>
              <div>
                <dt className="eyebrow">Studio hours</dt>
                <dd className="mt-1.5 text-ink">Monday–Friday, 09.00–17.00 WIB</dd>
              </div>
              <div>
                <dt className="eyebrow">Studio</dt>
                <dd className="mt-1.5 text-ink">Embodied Studio, Jakarta, Indonesia</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
