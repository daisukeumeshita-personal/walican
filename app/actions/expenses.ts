'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type ExpenseActionState = {
  error?: string
} | null

export async function createExpense(
  groupId: string,
  data: {
    description: string
    amount: number
    paidBy: string
    splitMethod: 'equal' | 'exact' | 'percentage'
    splits: { userId: string; amount: number; percentage?: number }[]
  }
): Promise<ExpenseActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Validate that split amounts sum to total
  const splitTotal = data.splits.reduce((sum, s) => sum + s.amount, 0)
  if (splitTotal !== data.amount) {
    return { error: '分配金額の合計が支払い金額と一致しません' }
  }

  // Create expense
  const expenseId = crypto.randomUUID()
  const { error: expenseError } = await supabase
    .from('expenses')
    .insert({
      id: expenseId,
      group_id: groupId,
      description: data.description,
      amount: data.amount,
      paid_by: data.paidBy,
      split_method: data.splitMethod,
      created_by: user.id,
    })

  if (expenseError) {
    console.error('Expense INSERT failed:', expenseError.message, expenseError.code)
    return { error: '支出の追加に失敗しました' }
  }

  // Create splits
  const splits = data.splits.map(s => ({
    expense_id: expenseId,
    user_id: s.userId,
    amount: s.amount,
    percentage: s.percentage ?? null,
  }))

  const { error: splitsError } = await supabase
    .from('expense_splits')
    .insert(splits)

  if (splitsError) {
    console.error('Splits INSERT failed:', splitsError.message, splitsError.code)
    // Rollback expense
    await supabase.from('expenses').delete().eq('id', expenseId)
    return { error: '支出の追加に失敗しました' }
  }

  revalidatePath(`/groups/${groupId}`)
  redirect(`/groups/${groupId}`)
}

export async function updateExpense(
  groupId: string,
  expenseId: string,
  data: { description: string; amount: number }
): Promise<ExpenseActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  if (!data.description.trim()) return { error: '内容を入力してください' }
  if (data.amount <= 0) return { error: '金額を入力してください' }

  // 既存のスプリットを取得して割合を保ちながら金額を再計算
  const { data: splits } = await supabase
    .from('expense_splits')
    .select('id, user_id, amount, percentage')
    .eq('expense_id', expenseId)

  const { data: expense } = await supabase
    .from('expenses')
    .select('amount, split_method')
    .eq('id', expenseId)
    .single()

  if (!expense || !splits) return { error: '支出が見つかりません' }

  // スプリット金額を再計算
  let newSplits: { id: string; amount: number }[]

  if (expense.split_method === 'equal') {
    const base = Math.floor(data.amount / splits.length)
    const remainder = data.amount - base * splits.length
    newSplits = splits.map((s, i) => ({ id: s.id, amount: base + (i < remainder ? 1 : 0) }))
  } else if (expense.split_method === 'percentage') {
    let remaining = data.amount
    newSplits = splits.map((s, i) => {
      const pct = s.percentage ?? 0
      const amt = i === splits.length - 1 ? remaining : Math.round(data.amount * pct / 100)
      remaining -= amt
      return { id: s.id, amount: amt }
    })
  } else {
    // exact: 元の比率で按分
    const oldTotal = splits.reduce((sum, s) => sum + s.amount, 0)
    let remaining = data.amount
    newSplits = splits.map((s, i) => {
      const ratio = oldTotal > 0 ? s.amount / oldTotal : 1 / splits.length
      const amt = i === splits.length - 1 ? remaining : Math.round(data.amount * ratio)
      remaining -= amt
      return { id: s.id, amount: amt }
    })
  }

  const { error: expenseError } = await supabase
    .from('expenses')
    .update({ description: data.description.trim(), amount: data.amount })
    .eq('id', expenseId)

  if (expenseError) return { error: '支出の更新に失敗しました' }

  for (const s of newSplits) {
    await supabase.from('expense_splits').update({ amount: s.amount }).eq('id', s.id)
  }

  revalidatePath(`/groups/${groupId}`)
  return null
}

export async function deleteExpense(groupId: string, expenseId: string): Promise<ExpenseActionState> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId)

  if (error) {
    return { error: '支出の削除に失敗しました' }
  }

  revalidatePath(`/groups/${groupId}`)
  return null
}
