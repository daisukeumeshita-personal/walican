'use client'

import { useState } from 'react'
import { createExpense } from '@/app/actions/expenses'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency } from '@/lib/utils'
import type { Profile } from '@/lib/types/database'

type SplitMode = 'half' | 'all'

interface MemberWithProfile {
  user_id: string
  profile: Profile
}

interface ExpenseFormProps {
  groupId: string
  members: MemberWithProfile[]
  currentUserId: string
}

export function ExpenseForm({ groupId, members, currentUserId }: ExpenseFormProps) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState(currentUserId)
  const [splitMode, setSplitMode] = useState<SplitMode>('half')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const totalAmount = parseInt(amount) || 0
  const otherMember = members.find(m => m.user_id !== paidBy)
  const payerMember = members.find(m => m.user_id === paidBy)

  // スプリット計算
  const getSplits = () => {
    if (!otherMember) return []
    if (splitMode === 'half') {
      const half = Math.floor(totalAmount / 2)
      const remainder = totalAmount - half * 2
      return [
        { userId: paidBy, amount: half + remainder },
        { userId: otherMember.user_id, amount: half },
      ]
    } else {
      // まるごと: 支払者の負担=0、相手の負担=全額
      return [
        { userId: paidBy, amount: 0, percentage: 0 },
        { userId: otherMember.user_id, amount: totalAmount, percentage: 100 },
      ]
    }
  }

  // プレビュー文言（常に「支払者が X円 支払い、相手に Y円 貸します」形式）
  const getPreview = () => {
    if (totalAmount <= 0 || !otherMember || !payerMember) return null
    const lentAmount = splitMode === 'half'
      ? Math.floor(totalAmount / 2)
      : totalAmount
    return `${payerMember.profile.display_name}が ${totalAmount.toLocaleString()}円 支払い、${otherMember.profile.display_name}に ${lentAmount.toLocaleString()}円 貸します`
  }

  const handleSubmit = async () => {
    setError('')
    if (!description.trim()) { setError('内容を入力してください'); return }
    if (totalAmount <= 0) { setError('金額を入力してください'); return }
    if (members.length < 2) { setError('メンバーが2人必要です'); return }

    const splits = getSplits()
    const splitMethod = splitMode === 'half' ? 'equal' : 'percentage'

    setSubmitting(true)
    try {
      const result = await createExpense(groupId, {
        description,
        amount: totalAmount,
        paidBy,
        splitMethod,
        splits,
      })
      if (result?.error) {
        setError(result.error)
        setSubmitting(false)
      }
    } catch (e) {
      throw e
    }
  }

  const preview = getPreview()

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div className="bg-danger-light text-danger text-sm p-3 rounded-xl border border-danger/10">
          {error}
        </div>
      )}

      {/* 内容 */}
      <Input
        label="内容"
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="例: スーパーの買い物"
        autoFocus
      />

      {/* 金額 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium tracking-wide uppercase text-muted">金額（円）</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm">¥</span>
          <input
            type="number"
            inputMode="numeric"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
            min="1"
            className="w-full pl-8 pr-4 py-3 rounded-xl border border-border bg-card text-foreground text-lg font-semibold tabular-nums placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/20 transition-colors duration-200"
          />
        </div>
      </div>

      {/* 支払者 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium tracking-wide uppercase text-muted">支払者</label>
        <div className="flex gap-2">
          {members.map(m => (
            <button
              key={m.user_id}
              type="button"
              onClick={() => setPaidBy(m.user_id)}
              className={cn(
                'flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-colors duration-200 cursor-pointer',
                paidBy === m.user_id
                  ? 'bg-foreground text-background border-foreground shadow-sm'
                  : 'bg-card text-muted border-border hover:border-foreground/30 hover:text-foreground'
              )}
            >
              {m.profile.display_name}
              {m.user_id === currentUserId && (
                <span className={cn('text-xs ml-1', paidBy === m.user_id ? 'opacity-60' : 'text-muted/60')}>
                  （あなた）
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 立て替え方法 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium tracking-wide uppercase text-muted">立て替え方法</label>
        <div className="flex gap-2 p-1 rounded-xl bg-surface">
          <button
            type="button"
            onClick={() => setSplitMode('half')}
            className={cn(
              'flex-1 py-3 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer',
              splitMode === 'half'
                ? 'bg-card text-foreground shadow-sm border border-border/60'
                : 'text-muted hover:text-foreground'
            )}
          >
            半分立て替える
          </button>
          <button
            type="button"
            onClick={() => setSplitMode('all')}
            className={cn(
              'flex-1 py-3 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer',
              splitMode === 'all'
                ? 'bg-card text-foreground shadow-sm border border-border/60'
                : 'text-muted hover:text-foreground'
            )}
          >
            全額立て替える
          </button>
        </div>
      </div>

      {/* プレビュー */}
      {preview && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary-light/40 border border-primary/10">
          <svg className="w-3.5 h-3.5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-primary">{preview}</p>
        </div>
      )}

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || members.length < 2}
        className="w-full h-12 text-base mt-1"
      >
        {submitting ? '追加中...' : '支出を追加'}
      </Button>
    </div>
  )
}
