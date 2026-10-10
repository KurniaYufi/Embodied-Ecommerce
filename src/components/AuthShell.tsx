import Link from "next/link";
import { ChevronLeftIcon } from "./Icons";

export default function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-paper lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-neutral-950 text-white lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 via-neutral-900 to-black" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="font-serif text-2xl font-semibold tracking-[0.32em] uppercase">
            Embodied
          </Link>
          <div>
            <p className="font-serif text-6xl leading-[0.95] font-medium">
              Wear what
              <br />
              <span className="italic">you are.</span>
            </p>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/60">
              Natural fibres, cut to move. Made slowly in small batches in Jakarta.
            </p>
          </div>
          <p className="text-xs text-white/40">Clothing · Indonesia · Est. 2024</p>
        </div>
      </div>

      <div className="flex flex-col px-5 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
            <ChevronLeftIcon className="h-4 w-4" />
            Back to shop
          </Link>
          <Link href="/" className="font-serif text-xl font-semibold tracking-[0.32em] text-ink uppercase lg:hidden">
            Embodied
          </Link>
        </div>
        <main className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-sm">
            <h1 className="display text-4xl">{title}</h1>
            <p className="mt-2 text-sm text-muted">{description}</p>
            <div className="mt-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
