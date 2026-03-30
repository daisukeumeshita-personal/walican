'use client'

import { useFormStatus } from 'react-dom'
import { Button } from './button'
import { type ButtonHTMLAttributes } from 'react'

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  pendingText?: string
}

export function SubmitButton({ children, pendingText, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? (pendingText || '処理中...') : children}
    </Button>
  )
}
