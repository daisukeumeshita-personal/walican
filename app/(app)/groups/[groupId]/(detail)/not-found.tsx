import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h2 className="text-xl font-bold mb-2">グループが見つかりません</h2>
      <p className="text-muted mb-6">このグループは存在しないか、アクセス権がありません。</p>
      <Link href="/groups">
        <Button>グループ一覧に戻る</Button>
      </Link>
    </div>
  )
}
