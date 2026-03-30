export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16 grain relative">
      <div className="absolute top-[10%] left-[5%] w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="w-full max-w-sm relative z-10">
        <div className="mb-10 animate-fade-up">
          <h1 className="font-display text-3xl font-700 tracking-tight text-foreground">
            Hanbun
          </h1>
          <p className="text-muted text-sm mt-1 font-light">ふたりの精算アプリ</p>
        </div>
        <div className="animate-fade-up stagger-1">
          {children}
        </div>
      </div>
    </div>
  )
}
