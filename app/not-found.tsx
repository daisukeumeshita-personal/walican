import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16 text-center px-4">
      <h1 className="text-4xl font-bold text-primary mb-2">404</h1>
      <p className="text-muted mb-6">ページが見つかりません</p>
      <Link href="/">
        <Button>トップに戻る</Button>
      </Link>
    </div>
  )
}
