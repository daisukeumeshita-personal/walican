'use client'

import { Button } from '@/components/ui/button'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16 text-center px-4">
      <h2 className="text-xl font-bold mb-2">エラーが発生しました</h2>
      <p className="text-muted mb-6">問題が発生しました。もう一度お試しください。</p>
      <Button onClick={reset}>再試行</Button>
    </div>
  )
}
