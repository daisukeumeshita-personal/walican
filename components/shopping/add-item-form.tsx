'use client'

import { useState, useRef } from 'react'
import { addShoppingItem } from '@/app/actions/shopping'
import { Button } from '@/components/ui/button'

interface AddItemFormProps {
  groupId: string
}

export function AddItemForm({ groupId }: AddItemFormProps) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || submitting) return

    setSubmitting(true)
    await addShoppingItem(groupId, text)
    setText('')
    setSubmitting(false)
    inputRef.current?.focus()
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="追加..."
        className="flex-1 px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/20 text-sm transition-colors duration-200"
      />
      <Button type="submit" disabled={submitting || !text.trim()} className="shrink-0">
        追加
      </Button>
    </form>
  )
}
