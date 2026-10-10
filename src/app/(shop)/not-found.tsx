import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-28 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="display mt-4 text-5xl sm:text-6xl">This page has moved on</h1>
      <p className="mt-4 max-w-md text-sm text-muted">The piece or page you were looking for doesn&apos;t exist or is no longer available.</p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/collection" className="btn btn-primary">
          Shop the Collection
        </Link>
        <Link href="/" className="btn btn-quiet">
          Back to home
        </Link>
      </div>
    </div>
  );
}
