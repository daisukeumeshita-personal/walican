import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-foreground text-background hover:bg-foreground/85 shadow-sm',
  secondary:
    'bg-transparent text-foreground border border-foreground/15 hover:bg-foreground/5',
  danger:
    'bg-danger text-white hover:bg-danger/85',
  ghost:
    'text-muted hover:text-foreground',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'px-5 py-2.5 rounded-full font-medium text-sm tracking-tight transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
