'use client'

import { useState } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { deleteExpense } from '@/app/actions/expenses'
import { formatCurrency } from '@/lib/utils'
import type { Profile } from '@/lib/types/database'

interface ExpenseSplitWithProfile {
  id: string
  user_id: string
  amount: number
  percentage: number | null
  profile: Profile
}

interface ExpenseCardProps {
  expense: {
    id: string
    description: string
    amount: number
    split_method: string
    created_at: string
    paid_by_profile: Profile
    expense_splits: ExpenseSplitWithProfile[]
  }
  groupId: string
  currentUserId: string
}

const splitMethodLabel: Record<string, string> = {
  equal: '均等',
  exact: '金額指定',
  percentage: '割合',
}

export function ExpenseCard({ expense, groupId, currentUserId }: ExpenseCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const date = new Date(expense.created_at).toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="p-4 rounded-2xl bg-card border border-border/60 transition-colors duration-200 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center gap-3">
          <Avatar name={expense.paid_by_profile.display_name} />
          <div>
            <p className="text-sm font-500 tracking-tight">{expense.description}</p>
            <p className="text-xs text-muted font-light mt-0.5">
              {expense.paid_by_profile.display_name} · {date}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-600 tabular-nums tracking-tight">{formatCurrency(expense.amount)}</p>
          <p className="text-[11px] text-muted">{splitMethodLabel[expense.split_method]}</p>
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-border/40 animate-fade-in">
          <p className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted mb-2.5">内訳</p>
          <div className="flex flex-col gap-2">
            {expense.expense_splits.map(split => (
              <div key={split.id} className="flex items-center justify-between text-sm">
                <span className="text-foreground font-light">{split.profile.display_name}</span>
                <span className="text-muted tabular-nums">
                  {formatCurrency(split.amount)}
                  {split.percentage != null && (
                    <span className="text-xs ml-1 opacity-60">({split.percentage}%)</span>
                  )}
                </span>
              </div>
            ))}
          </div>

          {expense.paid_by_profile.id === currentUserId && (
            <div className="mt-4 pt-3 border-t border-border/40">
              {confirming ? (
                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    className="text-xs"
                    onClick={async () => {
                      await deleteExpense(groupId, expense.id)
                      setConfirming(false)
                    }}
                  >
                    削除する
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-xs"
                    onClick={() => setConfirming(false)}
                  >
                    やめる
                  </Button>
                </div>
              ) : (
                <button
                  className="text-xs text-muted hover:text-danger transition-colors cursor-pointer"
                  onClick={() => setConfirming(true)}
                >
                  この支出を削除
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
