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
        description="「支出を追加」ボタンから最初の支出を記録しましょう"
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {expenses.map(expense => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
          groupId={groupId}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  )
}
