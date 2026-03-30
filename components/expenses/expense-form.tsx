'use client'

import { useState } from 'react'
import { createExpense } from '@/app/actions/expenses'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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

function SegmentControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium tracking-wide uppercase text-muted">{label}</label>
      <div className="flex p-1 rounded-xl bg-surface">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex-1 py-3 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer',
              value === opt.value
                ? 'bg-card text-foreground shadow-sm border border-border/60'
                : 'text-muted hover:text-foreground'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function ExpenseForm({ groupId, members, currentUserId }: ExpenseFormProps) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [advancedBy, setAdvancedBy] = useState(currentUserId)
  const [splitMode, setSplitMode] = useState<SplitMode>('half')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const totalAmount = parseInt(amount) || 0
  const advancer = members.find(m => m.user_id === advancedBy)
  const other = members.find(m => m.user_id !== advancedBy)

  const getSplits = () => {
    if (!other) return []
    if (splitMode === 'half') {
      const half = Math.floor(totalAmount / 2)
      return [
        { userId: advancedBy, amount: half + (totalAmount - half * 2) },
        { userId: other.user_id, amount: half },
      ]
    } else {
      return [
        { userId: advancedBy, amount: 0, percentage: 0 },
        { userId: other.user_id, amount: totalAmount, percentage: 100 },
      ]
    }
  }

  const getPreview = () => {
    if (totalAmount <= 0 || !advancer || !other) return null
    const lentAmount = splitMode === 'half' ? Math.floor(totalAmount / 2) : totalAmount
    return `${advancer.profile.display_name}が ${totalAmount.toLocaleString()}円 立て替え、${other.profile.display_name}に ${lentAmount.toLocaleString()}円 貸します`
  }

  const handleSubmit = async () => {
    setError('')
    if (!description.trim()) { setError('内容を入力してください'); return }
    if (totalAmount <= 0) { setError('金額を入力してください'); return }
    if (members.length < 2) { setError('メンバーが2人必要です'); return }

    setSubmitting(true)
    try {
      const result = await createExpense(groupId, {
        description,
        amount: totalAmount,
        paidBy: advancedBy,
        splitMethod: splitMode === 'half' ? 'equal' : 'percentage',
        splits: getSplits(),
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

  const advancerOptions = members.map(m => ({
    value: m.user_id,
    label: m.user_id === currentUserId ? `${m.profile.display_name}（あなた）` : m.profile.display_name,
  }))

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div className="bg-danger-light text-danger text-sm p-3 rounded-xl border border-danger/10">
          {error}
        </div>
      )}

      <Input
        label="内容"
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="例: スーパーの買い物"
        autoFocus
      />

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

      <SegmentControl
        label="立て替えた人"
        options={advancerOptions}
        value={advancedBy}
        onChange={setAdvancedBy}
      />

      <SegmentControl
        label="立て替え方法"
        options={[
          { value: 'half', label: '半分立て替える' },
          { value: 'all', label: '全額立て替える' },
        ]}
        value={splitMode}
        onChange={setSplitMode}
      />

      {preview && (
        <p className="text-xs text-muted text-center">{preview}</p>
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
