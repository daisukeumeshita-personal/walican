import { ExpenseCard } from './expense-card'
import { EmptyState } from '@/components/ui/empty-state'
import type { Profile } from '@/lib/types/database'

interface ExpenseSplitWithProfile {
  id: string
  user_id: string
  amount: number
  percentage: number | null
  profile: Profile
}

interface ExpenseWithDetails {
  id: string
  description: string
  amount: number
  split_method: string
  created_at: string
  paid_by_profile: Profile
  expense_splits: ExpenseSplitWithProfile[]
}

interface ExpenseListProps {
  expenses: ExpenseWithDetails[]
  groupId: string
  currentUserId: string
}

export function ExpenseList({ expenses, groupId, currentUserId }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <EmptyState
        message="まだ支出がありません"
        description="「＋ 追加」ボタンから最初の支出を記録しましょう"
      />
    )
  }

  // 月ごとにグループ化
  const groups: { key: string; label: string; expenses: ExpenseWithDetails[] }[] = []
  for (const expense of expenses) {
    const d = new Date(expense.created_at)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const existing = groups.find(g => g.key === key)
    if (existing) {
      existing.expenses.push(expense)
    } else {
      groups.push({
        key,
        label: `${d.getMonth() + 1}月 ${d.getFullYear()}`,
        expenses: [expense],
      })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map(group => (
        <div key={group.key}>
          <h3 className="text-xs font-semibold tracking-[0.08em] text-muted mb-2 px-1">
            {group.label}
          </h3>
          <div className="flex flex-col gap-2">
            {group.expenses.map(expense => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                groupId={groupId}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
