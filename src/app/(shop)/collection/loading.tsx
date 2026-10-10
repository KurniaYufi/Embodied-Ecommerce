import ProductGridSkeleton from "@/components/ProductGridSkeleton";

export default function Loading() {
  return (
    <>
      <div className="border-b border-line">
        <div className="container-page py-10 lg:py-14">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton mt-6 h-14 w-64" />
        </div>
      </div>
      <div className="container-page flex gap-12 py-8 lg:py-12">
        <div className="hidden w-60 shrink-0 space-y-4 lg:block">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="skeleton h-5" />
          ))}
        </div>
        <div className="flex-1">
          <div className="skeleton mb-8 h-10 w-full" />
          <ProductGridSkeleton />
        </div>
      </div>
    </>
  );
}
