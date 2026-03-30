import { Avatar } from '@/components/ui/avatar'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface MemberBalance {
  userId: string
  displayName: string
  totalPaid: number
  totalOwed: number
  netBalance: number
}

interface BalanceSummaryProps {
  balances: MemberBalance[]
  currentUserId: string
}

export function BalanceSummary({ balances, currentUserId }: BalanceSummaryProps) {
  return (
    <div className="flex flex-col gap-2">
      {balances.map((b, i) => (
        <div key={b.userId} className={`flex items-center justify-between p-4 rounded-2xl bg-card border border-border/60 animate-fade-up stagger-${Math.min(i + 1, 5)}`}>
          <div className="flex items-center gap-3">
            <Avatar name={b.displayName} />
            <div>
              <p className="text-sm font-500 tracking-tight">
                {b.displayName}
                {b.userId === currentUserId && (
                  <span className="text-xs text-muted ml-1 font-normal">you</span>
                )}
              </p>
              <p className="text-xs text-muted font-light mt-0.5">
                支払い {formatCurrency(b.totalPaid)} / 負担 {formatCurrency(b.totalOwed)}
              </p>
            </div>
          </div>
          <span className={cn(
            'text-sm font-600 tabular-nums tracking-tight',
            b.netBalance > 0 ? 'text-primary' : b.netBalance < 0 ? 'text-accent' : 'text-muted'
          )}>
            {b.netBalance > 0 ? '+' : ''}{formatCurrency(b.netBalance)}
          </span>
        </div>
      ))}
    </div>
  )
}
