import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { CreateGroupForm } from '@/components/groups/create-group-form'

export default function NewGroupPage() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/" className="text-muted hover:text-foreground">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold">新しいグループ</h1>
      </div>
      <Card>
        <CreateGroupForm />
      </Card>
    </div>
  )
}
