import Link from "next/link";

type Props = {
  title: string;
  links: { label: string; href: string }[];
};

export default function FooterLinks({ title, links }: Props) {
  return (
    <div>
      <h3 className="text-[11px] font-medium tracking-[0.24em] text-neutral-400 uppercase">{title}</h3>
      <ul className="mt-5 space-y-3 text-sm">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="text-neutral-300 transition-colors hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
