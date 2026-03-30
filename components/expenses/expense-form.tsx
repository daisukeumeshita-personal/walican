'use client'

import { useState } from 'react'
import { createExpense } from '@/app/actions/expenses'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Profile } from '@/lib/types/database'

type SplitMethod = 'equal' | 'exact' | 'percentage'

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
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('equal')
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({})
  const [percentages, setPercentages] = useState<Record<string, string>>({})
  const [selectedMembers, setSelectedMembers] = useState<string[]>(members.map(m => m.user_id))
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const totalAmount = parseInt(amount) || 0

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const getEqualSplit = () => {
    if (selectedMembers.length === 0) return {}
    const base = Math.floor(totalAmount / selectedMembers.length)
    const remainder = totalAmount - base * selectedMembers.length
    const splits: Record<string, number> = {}
    selectedMembers.forEach((id, i) => {
      splits[id] = base + (i < remainder ? 1 : 0)
    })
    return splits
  }

  const getExactTotal = () => {
    return selectedMembers.reduce((sum, id) => sum + (parseInt(exactAmounts[id]) || 0), 0)
  }

  const getPercentageTotal = () => {
    return selectedMembers.reduce((sum, id) => sum + (parseFloat(percentages[id]) || 0), 0)
  }

  const handleSubmit = async () => {
    setError('')

    if (!description.trim()) {
      setError('内容を入力してください')
      return
    }
    if (totalAmount <= 0) {
      setError('金額を入力してください')
      return
    }
    if (selectedMembers.length === 0) {
      setError('少なくとも1人のメンバーを選択してください')
      return
    }

    let splits: { userId: string; amount: number; percentage?: number }[]

    if (splitMethod === 'equal') {
      const equalSplits = getEqualSplit()
      splits = selectedMembers.map(id => ({
        userId: id,
        amount: equalSplits[id],
      }))
    } else if (splitMethod === 'exact') {
      const exactTotal = getExactTotal()
      if (exactTotal !== totalAmount) {
        setError(`金額の合計が一致しません（合計: ${exactTotal}円 / 支払額: ${totalAmount}円）`)
        return
      }
      splits = selectedMembers.map(id => ({
        userId: id,
        amount: parseInt(exactAmounts[id]) || 0,
      }))
    } else {
      const percentTotal = getPercentageTotal()
      if (Math.abs(percentTotal - 100) > 0.01) {
        setError(`割合の合計が100%になりません（合計: ${percentTotal}%）`)
        return
      }
      let remaining = totalAmount
      const sortedMembers = [...selectedMembers]
      splits = sortedMembers.map((id, i) => {
        const pct = parseFloat(percentages[id]) || 0
        const amt = i === sortedMembers.length - 1
          ? remaining
          : Math.round(totalAmount * pct / 100)
        remaining -= amt
        return { userId: id, amount: amt, percentage: pct }
      })
    }

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
      // redirect() throws a NEXT_REDIRECT error — this is expected on success
      throw e
    }
  }

  const splitMethodLabels: Record<SplitMethod, string> = {
    equal: '均等割り',
    exact: '金額指定',
    percentage: '割合指定',
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="bg-danger-light text-danger text-sm p-3 rounded-xl border border-danger/10">
          {error}
        </div>
      )}

      <Input
        label="内容"
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="例: ランチ代"
      />

      <Input
        label="金額（円）"
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="0"
        min="1"
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium tracking-wide uppercase text-muted">支払者</label>
        <select
          value={paidBy}
          onChange={e => setPaidBy(e.target.value)}
          className="px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/20 transition-colors duration-200"
        >
          {members.map(m => (
            <option key={m.user_id} value={m.user_id}>
              {m.profile.display_name}{m.user_id === currentUserId ? '（あなた）' : ''}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium tracking-wide uppercase text-muted mb-2.5 block">分配方法</label>
        <div className="flex gap-1.5 p-1 rounded-full bg-surface">
          {(Object.keys(splitMethodLabels) as SplitMethod[]).map(method => (
            <button
              key={method}
              type="button"
              onClick={() => setSplitMethod(method)}
              className={cn(
                'flex-1 px-3 py-2 text-sm font-medium rounded-full transition-colors duration-200 cursor-pointer',
                splitMethod === method
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted hover:text-foreground'
              )}
            >
              {splitMethodLabels[method]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium tracking-wide uppercase text-muted mb-2.5 block">メンバー</label>
        <div className="flex flex-col gap-1.5">
          {members.map(m => {
            const isSelected = selectedMembers.includes(m.user_id)
            const equalSplits = getEqualSplit()

            return (
              <div
                key={m.user_id}
                className={cn(
                  'flex items-center gap-3 p-3.5 rounded-xl border transition-colors duration-200',
                  isSelected ? 'border-foreground/15 bg-card' : 'border-border/40 bg-surface/50 opacity-50'
                )}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleMember(m.user_id)}
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
                <span className="text-sm font-500 flex-1 tracking-tight">
                  {m.profile.display_name}
                </span>

                {isSelected && splitMethod === 'equal' && totalAmount > 0 && (
                  <span className="text-sm text-muted tabular-nums">
                    {equalSplits[m.user_id]?.toLocaleString()}円
                  </span>
                )}

                {isSelected && splitMethod === 'exact' && (
                  <input
                    type="number"
                    value={exactAmounts[m.user_id] || ''}
                    onChange={e => setExactAmounts(prev => ({ ...prev, [m.user_id]: e.target.value }))}
                    placeholder="0"
                    min="0"
                    className="w-24 px-3 py-1.5 text-sm text-right rounded-lg border border-border bg-card focus:outline-none focus:ring-1 focus:ring-foreground/10 tabular-nums"
                  />
                )}

                {isSelected && splitMethod === 'percentage' && (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={percentages[m.user_id] || ''}
                      onChange={e => setPercentages(prev => ({ ...prev, [m.user_id]: e.target.value }))}
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-20 px-3 py-1.5 text-sm text-right rounded-lg border border-border bg-card focus:outline-none focus:ring-1 focus:ring-foreground/10 tabular-nums"
                    />
                    <span className="text-xs text-muted">%</span>
                    {totalAmount > 0 && percentages[m.user_id] && (
                      <span className="text-[11px] text-muted/70 ml-0.5 tabular-nums">
                        {Math.round(totalAmount * (parseFloat(percentages[m.user_id]) || 0) / 100).toLocaleString()}円
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {splitMethod === 'exact' && totalAmount > 0 && (
          <p className={cn(
            'text-xs mt-2.5 tabular-nums',
            getExactTotal() === totalAmount ? 'text-primary' : 'text-danger'
          )}>
            {getExactTotal().toLocaleString()} / {totalAmount.toLocaleString()}円
            {getExactTotal() !== totalAmount && ` （残り${(totalAmount - getExactTotal()).toLocaleString()}円）`}
          </p>
        )}
        {splitMethod === 'percentage' && (
          <p className={cn(
            'text-xs mt-2.5 tabular-nums',
            Math.abs(getPercentageTotal() - 100) < 0.01 ? 'text-primary' : 'text-danger'
          )}>
            {getPercentageTotal()}% / 100%
          </p>
        )}
      </div>

      {members.length === 0 && (
        <div className="bg-accent-light text-accent text-sm p-3 rounded-xl border border-accent/10">
          メンバーが見つかりません。グループにメンバーが追加されているか確認してください。
        </div>
      )}

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || members.length === 0}
        className="w-full h-12 text-base mt-2"
      >
        {submitting ? '追加中...' : '支出を追加'}
      </Button>
    </div>
  )
}
