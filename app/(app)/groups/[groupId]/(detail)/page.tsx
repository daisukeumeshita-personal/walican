import Link from 'next/link'
import { getSimplifiedDebts } from '@/lib/data/balances'
import { getGroupExpenses } from '@/lib/data/expenses'
import { getShoppingItems } from '@/lib/data/shopping'
import { getCurrentUser } from '@/lib/data/profiles'
import { BalanceCard } from '@/components/balances/balance-card'
import { ExpenseList } from '@/components/expenses/expense-list'
import { ShoppingList } from '@/components/shopping/shopping-list'
import { AddItemForm } from '@/components/shopping/add-item-form'
import { ShoppingBottomSheet } from '@/components/shopping/shopping-bottom-sheet'

export default async function GroupOverviewPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const [debts, expenses, shoppingItems, { user }] = await Promise.all([
    getSimplifiedDebts(groupId),
    getGroupExpenses(groupId),
    getShoppingItems(groupId),
    getCurrentUser(),
  ])

  return (
    <>
      {/* PC: 2カラム */}
      <div className="hidden md:grid md:grid-cols-[1fr_320px] md:gap-8 md:items-start">
        <MainContent groupId={groupId} debts={debts} expenses={expenses} currentUserId={user.id} />
        <aside className="sticky top-6 bg-card rounded-2xl border border-border/60 p-5">
          <div className="flex flex-col gap-4">
            <h2 className="text-xs font-semibold tracking-[0.08em] uppercase text-muted">買い物メモ</h2>
            <AddItemForm groupId={groupId} />
            <ShoppingList items={shoppingItems as any} groupId={groupId} />
          </div>
        </aside>
      </div>

      {/* スマホ: 1カラム */}
      <div className="md:hidden">
        <MainContent groupId={groupId} debts={debts} expenses={expenses} currentUserId={user.id} />
      </div>

      {/* スマホ用ボトムシート */}
      <ShoppingBottomSheet items={shoppingItems as any} groupId={groupId} />
    </>
  )
}

function MainContent({
  groupId,
  debts,
  expenses,
  currentUserId,
}: {
  groupId: string
  debts: Awaited<ReturnType<typeof getSimplifiedDebts>>
  expenses: Awaited<ReturnType<typeof getGroupExpenses>>
  currentUserId: string
}) {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="text-xs font-semibold tracking-[0.08em] uppercase text-muted mb-3">
          精算が必要な支払い
        </h2>
        <BalanceCard debts={debts} currentUserId={currentUserId} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold tracking-[0.08em] uppercase text-muted">履歴</h2>
          <Link
            href={`/groups/${groupId}/expenses/new`}
            className="px-4 py-1.5 rounded-full font-medium text-xs tracking-tight bg-foreground text-background hover:bg-foreground/85 shadow-sm transition-colors duration-200"
          >
            ＋ 追加
          </Link>
        </div>
        <ExpenseList
          expenses={expenses as any}
          groupId={groupId}
          currentUserId={currentUserId}
        />
      </section>
    </div>
  )
}
