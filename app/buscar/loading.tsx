export default function LoadingBuscar() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="h-9 w-64 animate-pulse rounded-xl bg-mar-100" />
      <div className="mt-4 h-16 animate-pulse rounded-2xl bg-mar-100" />
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl bg-white">
            <div className="aspect-[4/3] w-full animate-pulse bg-mar-100" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-mar-100" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-mar-100" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
