import Link from 'next/link'
import { getGroupMembers } from '@/lib/data/groups'
import { getCurrentUser } from '@/lib/data/profiles'
import { ExpenseForm } from '@/components/expenses/expense-form'

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
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/groups/${groupId}`} className="text-muted hover:text-foreground">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-lg font-bold">支出を追加</h1>
      </div>
      <ExpenseForm
        groupId={groupId}
        members={membersForForm}
        currentUserId={user.id}
      />
    </div>
  )
}
