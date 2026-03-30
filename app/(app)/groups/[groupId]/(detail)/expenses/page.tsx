import Link from 'next/link'
import { getGroupExpenses } from '@/lib/data/expenses'
import { getCurrentUser } from '@/lib/data/profiles'
import { ExpenseList } from '@/components/expenses/expense-list'

export default async function ExpensesPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const [expenses, { user }] = await Promise.all([
    getGroupExpenses(groupId),
    getCurrentUser(),
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">支出一覧</h2>
        <Link
          href={`/groups/${groupId}/expenses/new`}
          className="px-5 py-2.5 rounded-full font-medium text-sm tracking-tight bg-foreground text-background hover:bg-foreground/85 shadow-sm transition-colors duration-200"
        >
          + 支出を追加
        </Link>
      </div>
      <ExpenseList
        expenses={expenses as any}
        groupId={groupId}
        currentUserId={user.id}
      />
    </div>
  )
}
