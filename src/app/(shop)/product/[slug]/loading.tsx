export default function Loading() {
  return (
    <div className="container-page grid grid-cols-1 gap-10 pt-14 lg:grid-cols-12 lg:gap-16" aria-busy="true">
      <div className="skeleton aspect-[4/5] lg:col-span-7" />
      <div className="space-y-4 lg:col-span-5">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-12 w-3/4" />
        <div className="skeleton h-7 w-32" />
        <div className="skeleton mt-8 h-12 w-full" />
        <div className="skeleton h-12 w-full" />
      </div>
    </div>
  );
}
