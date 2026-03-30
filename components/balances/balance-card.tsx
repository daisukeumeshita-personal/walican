import { formatCurrency } from '@/lib/utils'

interface SimplifiedDebt {
  from: { id: string; name: string }
  to: { id: string; name: string }
  amount: number
}

interface BalanceCardProps {
  debts: SimplifiedDebt[]
  currentUserId: string
}

export function BalanceCard({ debts, currentUserId }: BalanceCardProps) {
  if (debts.length === 0) {
    return (
      <div className="text-center py-10 rounded-2xl bg-primary-light/40 border border-primary/10">
        <p className="text-primary font-500 text-sm">精算の必要はありません</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {debts.map((debt, i) => {
        // 自分が借り手（from）ならオレンジ、貸し手（to）なら緑
        const isBorrower = debt.from.id === currentUserId
        const amountColor = isBorrower ? 'text-orange-500' : 'text-emerald-600'

        return (
          <div key={i} className={`flex items-center justify-between p-4 rounded-2xl bg-card border border-border/60 animate-slide-in stagger-${Math.min(i + 1, 5)}`}>
            <div className="flex items-center gap-2.5 text-sm">
              <span className="font-500 text-foreground">{debt.from.name}</span>
              <svg className="w-4 h-4 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <span className="font-500 text-foreground">{debt.to.name}</span>
            </div>
            <div className={`flex flex-col items-end ${amountColor}`}>
              <span className="text-xs">{isBorrower ? '借りた合計' : '貸した合計'}</span>
              <span className="font-600 text-sm tabular-nums tracking-tight">{formatCurrency(debt.amount)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
