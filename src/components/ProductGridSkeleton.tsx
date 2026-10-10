export default function ProductGridSkeleton({ count = 6, columns = "grid-cols-2 xl:grid-cols-3" }: { count?: number; columns?: string }) {
  return (
    <div className={`grid ${columns} gap-x-4 gap-y-10 sm:gap-x-6`} aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <div className="skeleton aspect-[4/5]" />
          <div className="skeleton mt-4 h-4 w-3/4" />
          <div className="skeleton mt-2 h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}
