export default function Loading() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between mb-6">
        <div className="h-7 w-24 bg-border rounded animate-pulse" />
        <div className="h-9 w-24 bg-border rounded-lg animate-pulse" />
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-card rounded-xl border border-border p-4">
          <div className="h-5 w-40 bg-border rounded animate-pulse mb-2" />
          <div className="h-4 w-24 bg-border rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}
