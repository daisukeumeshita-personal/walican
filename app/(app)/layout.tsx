import { Header } from '@/components/layout/header'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grain">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-5 py-8">
        {children}
      </main>
    </div>
  )
}
