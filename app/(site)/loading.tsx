export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Cargando">
      <div className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          <div className="mt-5 h-14 w-full max-w-2xl animate-pulse rounded-xl bg-muted" />
          <div className="mt-3 h-14 w-2/3 max-w-xl animate-pulse rounded-xl bg-muted" />
          <div className="mt-6 h-4 w-full max-w-xl animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-2/3 max-w-xl animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="h-64 animate-pulse rounded-[2rem] bg-muted lg:col-span-7" />
          <div className="h-64 animate-pulse rounded-2xl bg-muted lg:col-span-5" />
        </div>
      </div>
    </div>
  );
}
