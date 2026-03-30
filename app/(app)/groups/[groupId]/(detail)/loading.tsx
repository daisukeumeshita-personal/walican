export default function Loading() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-border animate-pulse" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-border rounded animate-pulse mb-2" />
              <div className="h-3 w-48 bg-border rounded animate-pulse" />
            </div>
            <div className="h-5 w-16 bg-border rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}
