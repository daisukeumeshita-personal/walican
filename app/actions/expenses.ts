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
  redirect(`/groups/${groupId}/expenses`)
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
