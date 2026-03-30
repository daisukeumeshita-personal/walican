import { cn } from '@/lib/utils'
import { type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id || props.name
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium tracking-wide uppercase text-muted">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/20 text-sm transition-colors duration-200',
          error && 'border-danger focus:ring-danger/20',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger mt-0.5">{error}</p>}
    </div>
  )
}
