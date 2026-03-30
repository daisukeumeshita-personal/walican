'use client'

import { useState } from 'react'
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

  const isPayer = expense.paid_by_profile.id === currentUserId
  const day = new Date(expense.created_at).getDate()

  const userSplit = expense.expense_splits.find(s => s.user_id === currentUserId)
  const userSplitAmount = userSplit?.amount ?? 0
  const netAmount = isPayer
    ? expense.amount - userSplitAmount
    : userSplitAmount

  return (
    <div className="rounded-2xl bg-card border border-border/60 transition-colors duration-200 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div
        className="flex items-center gap-3 p-4 cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        {/* 日付 */}
        <div className="w-7 shrink-0 text-center">
          <span className="text-xl font-bold tabular-nums leading-none">{day}</span>
        </div>

        {/* 区切り線 */}
        <div className="w-px h-8 bg-border/50 shrink-0" />

        {/* 中央：タイトル＋補足 */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-500 tracking-tight truncate">{expense.description}</p>
          <p className="text-xs text-muted font-light mt-0.5 truncate">
            {expense.paid_by_profile.display_name}が {formatCurrency(expense.amount)} 支払いました
          </p>
        </div>

        {/* 右端：ステータス＋金額 */}
        <div className="text-right shrink-0">
          <p className={`text-[11px] font-semibold ${isPayer ? 'text-emerald-600' : 'text-orange-500'}`}>
            {isPayer ? '貸した' : '借りた'}
          </p>
          <p className={`text-base font-bold tabular-nums leading-tight ${isPayer ? 'text-emerald-600' : 'text-orange-500'}`}>
            {formatCurrency(netAmount)}
          </p>
        </div>
      </div>

      {showDetails && (
        <div className="px-4 pb-4 border-t border-border/40 pt-3 animate-fade-in">
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
          <p className="text-[11px] text-muted/60 mt-2">{splitMethodLabel[expense.split_method]}で分割</p>

          {isPayer && (
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
