"use client";

import Link from "next/link";

export default function ShopError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-page flex flex-col items-center py-28 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="display mt-4 text-5xl">We couldn&apos;t load this page</h1>
      <p className="mt-4 max-w-md text-sm text-muted">Please try again. If the problem continues, contact us and we&apos;ll help.</p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={reset} className="btn btn-primary">
          Try again
        </button>
        <Link href="/" className="btn btn-quiet">
          Back to home
        </Link>
      </div>
    </div>
  );
}
