import { formatCurrency } from '@/lib/utils'

interface SimplifiedDebt {
  from: { id: string; name: string }
  to: { id: string; name: string }
  amount: number
}

interface BalanceCardProps {
  debts: SimplifiedDebt[]
}

export function BalanceCard({ debts }: BalanceCardProps) {
  if (debts.length === 0) {
    return (
      <div className="text-center py-10 rounded-2xl bg-primary-light/40 border border-primary/10">
        <p className="text-primary font-500 text-sm">全員の精算が完了しています</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {debts.map((debt, i) => (
        <div key={i} className={`flex items-center justify-between p-4 rounded-2xl bg-card border border-border/60 animate-slide-in stagger-${Math.min(i + 1, 5)}`}>
          <div className="flex items-center gap-2.5 text-sm">
            <span className="font-500 text-accent">{debt.from.name}</span>
            <svg className="w-4 h-4 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <span className="font-500 text-primary">{debt.to.name}</span>
          </div>
          <span className="font-600 text-sm tabular-nums tracking-tight">{formatCurrency(debt.amount)}</span>
        </div>
      ))}
    </div>
  )
}
