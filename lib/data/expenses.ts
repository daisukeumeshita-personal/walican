import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types/database'

export interface ExpenseSplitWithProfile {
  id: string
  expense_id: string
  user_id: string
  amount: number
  percentage: number | null
  profile: Profile
}

export interface ExpenseWithDetails {
  id: string
  group_id: string
  description: string
  amount: number
  paid_by: string
  split_method: 'equal' | 'exact' | 'percentage'
  created_by: string
  created_at: string
  updated_at: string
  paid_by_profile: Profile
  expense_splits: ExpenseSplitWithProfile[]
}

export async function getGroupExpenses(groupId: string): Promise<ExpenseWithDetails[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('expenses')
    .select(`
      *,
      paid_by_profile:profiles!expenses_paid_by_fkey(*),
      expense_splits(
        *,
        profile:profiles(*)
      )
    `)
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })

  return (data as unknown as ExpenseWithDetails[]) || []
}

export async function getExpenseById(expenseId: string): Promise<ExpenseWithDetails | null> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('expenses')
    .select(`
      *,
      paid_by_profile:profiles!expenses_paid_by_fkey(*),
      expense_splits(
        *,
        profile:profiles(*)
      )
    `)
    .eq('id', expenseId)
    .single()

  return (data as unknown as ExpenseWithDetails) || null
}
