import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn(
      'bg-card rounded-2xl border border-border/60 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
      className
    )}>
      {children}
    </div>
  )
}
