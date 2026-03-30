import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types/database'

interface MemberBalance {
  userId: string
  displayName: string
  totalPaid: number
  totalOwed: number
  netBalance: number
}

interface SimplifiedDebt {
  from: { id: string; name: string }
  to: { id: string; name: string }
  amount: number
}

export async function getGroupBalances(groupId: string): Promise<MemberBalance[]> {
  const supabase = await createClient()

  // Get all members with profiles
  const { data: members } = await supabase
    .from('group_members')
    .select('user_id, profile:profiles(*)')
    .eq('group_id', groupId)

  if (!members || members.length === 0) return []

  // Get all expenses for this group
  const { data: expenses } = await supabase
    .from('expenses')
    .select('id, amount, paid_by')
    .eq('group_id', groupId)

  // Get all splits
  const { data: splits } = await supabase
    .from('expense_splits')
    .select('expense_id, user_id, amount')
    .in('expense_id', (expenses || []).map(e => e.id))

  // Calculate balances
  const balanceMap = new Map<string, { paid: number; owed: number }>()

  members.forEach(m => {
    balanceMap.set(m.user_id, { paid: 0, owed: 0 })
  })

  // Sum total paid by each member
  ;(expenses || []).forEach(e => {
    const entry = balanceMap.get(e.paid_by)
    if (entry) entry.paid += e.amount
  })

  // Sum total owed by each member
  ;(splits || []).forEach(s => {
    const entry = balanceMap.get(s.user_id)
    if (entry) entry.owed += s.amount
  })

  return members.map(m => {
    const profile = m.profile as unknown as Profile
    const entry = balanceMap.get(m.user_id)!
    return {
      userId: m.user_id,
      displayName: profile.display_name,
      totalPaid: entry.paid,
      totalOwed: entry.owed,
      netBalance: entry.paid - entry.owed,
    }
  })
}

export async function getSimplifiedDebts(groupId: string): Promise<SimplifiedDebt[]> {
  const balances = await getGroupBalances(groupId)

  // Separate creditors (positive balance) and debtors (negative balance)
  const creditors: { id: string; name: string; amount: number }[] = []
  const debtors: { id: string; name: string; amount: number }[] = []

  balances.forEach(b => {
    if (b.netBalance > 0) {
      creditors.push({ id: b.userId, name: b.displayName, amount: b.netBalance })
    } else if (b.netBalance < 0) {
      debtors.push({ id: b.userId, name: b.displayName, amount: -b.netBalance })
    }
  })

  // Sort descending by amount for greedy matching
  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort((a, b) => b.amount - a.amount)

  const debts: SimplifiedDebt[] = []
  let ci = 0
  let di = 0

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci]
    const debtor = debtors[di]
    const amount = Math.min(creditor.amount, debtor.amount)

    if (amount > 0) {
      debts.push({
        from: { id: debtor.id, name: debtor.name },
        to: { id: creditor.id, name: creditor.name },
        amount,
      })
    }

    creditor.amount -= amount
    debtor.amount -= amount

    if (creditor.amount === 0) ci++
    if (debtor.amount === 0) di++
  }

  return debts
}
