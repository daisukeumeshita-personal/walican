import Link from 'next/link'
import { getGroupMembers } from '@/lib/data/groups'
import { getCurrentUser } from '@/lib/data/profiles'
import { ExpenseForm } from '@/components/expenses/expense-form'
import { Card } from '@/components/ui/card'

export default async function NewExpensePage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const [members, { user }] = await Promise.all([
    getGroupMembers(groupId),
    getCurrentUser(),
  ])

  const membersForForm = members.map(m => ({
    user_id: m.user_id,
    profile: m.profile,
  }))

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Link href={`/groups/${groupId}/expenses`} className="text-muted hover:text-foreground">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h2 className="text-lg font-semibold">支出を追加</h2>
      </div>
      <Card>
        <ExpenseForm
          groupId={groupId}
          members={membersForForm}
          currentUserId={user.id}
        />
      </Card>
    </div>
  )
}
