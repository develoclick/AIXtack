export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
      <div className="mt-4 h-4 w-full max-w-xl animate-pulse rounded-lg bg-muted" />
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-soft">
            <div className="aspect-[4/3] w-full animate-pulse bg-muted" />
            <div className="flex flex-col gap-2.5 p-5">
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
