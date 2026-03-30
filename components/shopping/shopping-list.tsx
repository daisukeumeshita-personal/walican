'use client'

import { useOptimistic, useTransition } from 'react'
import { toggleShoppingItem, deleteShoppingItem } from '@/app/actions/shopping'
import { cn } from '@/lib/utils'
import type { ShoppingItem } from '@/lib/types/database'

interface ShoppingListProps {
  items: ShoppingItem[]
  groupId: string
}

export function ShoppingList({ items, groupId }: ShoppingListProps) {
  const [optimisticItems, setOptimisticItems] = useOptimistic(
    items,
    (state: ShoppingItem[], update: { id: string; action: 'toggle' | 'delete' }) => {
      if (update.action === 'delete') {
        return state.filter(item => item.id !== update.id)
      }
      return state.map(item =>
        item.id === update.id ? { ...item, is_checked: !item.is_checked } : item
      )
    }
  )
  const [, startTransition] = useTransition()

  const unchecked = optimisticItems.filter(i => !i.is_checked)
  const checked = optimisticItems.filter(i => i.is_checked)

  const handleToggle = (item: ShoppingItem) => {
    startTransition(async () => {
      setOptimisticItems({ id: item.id, action: 'toggle' })
      await toggleShoppingItem(groupId, item.id, !item.is_checked)
    })
  }

  const handleDelete = (itemId: string) => {
    startTransition(async () => {
      setOptimisticItems({ id: itemId, action: 'delete' })
      await deleteShoppingItem(groupId, itemId)
    })
  }

  if (optimisticItems.length === 0) {
    return (
      <div className="text-center py-12 animate-fade-up">
        <p className="text-muted/60 font-light">まだメモがありません</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {unchecked.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {unchecked.map((item, i) => (
            <div key={item.id} className={`flex items-center gap-3 p-3.5 bg-card rounded-xl border border-border/60 animate-fade-up stagger-${Math.min(i + 1, 5)}`}>
              <input
                type="checkbox"
                checked={false}
                onChange={() => handleToggle(item)}
                className="w-4 h-4 accent-primary shrink-0 cursor-pointer rounded"
              />
              <span className="text-sm flex-1 tracking-tight">{item.text}</span>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-muted/40 hover:text-danger transition-colors cursor-pointer p-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {checked.length > 0 && (
        <div>
          <p className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted/50 mb-2">
            完了 ({checked.length})
          </p>
          <div className="flex flex-col gap-1">
            {checked.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-surface/50 rounded-xl opacity-50">
                <input
                  type="checkbox"
                  checked={true}
                  onChange={() => handleToggle(item)}
                  className="w-4 h-4 accent-primary shrink-0 cursor-pointer rounded"
                />
                <span className={cn('text-sm flex-1 line-through text-muted')}>{item.text}</span>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-muted/30 hover:text-danger transition-colors cursor-pointer p-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
