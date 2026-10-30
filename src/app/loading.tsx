// ponytail: instant skeleton so sidebar nav feels immediate while the server renders
export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="h-4 w-28 rounded bg-[var(--panel-hi)] animate-pulse mb-4" />
      <div className="h-9 w-2/3 rounded-lg bg-[var(--panel-hi)] animate-pulse mb-3" />
      <div className="h-4 w-1/2 rounded bg-[var(--panel-hi)] animate-pulse mb-8" />
      <div className="h-2 rounded-full bg-[var(--panel-hi)] animate-pulse mb-8" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="card p-5 mb-2.5">
          <div className="h-5 w-1/3 rounded bg-[var(--panel-hi)] animate-pulse mb-2" />
          <div className="h-3.5 w-2/3 rounded bg-[var(--panel-hi)] animate-pulse" />
        </div>
      ))}
    </div>
  );
}
