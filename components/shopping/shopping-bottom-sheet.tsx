'use client'

import { useState } from 'react'
import { Drawer } from 'vaul'
import { ShoppingList } from './shopping-list'
import { AddItemForm } from './add-item-form'
import type { ShoppingItem } from '@/lib/types/database'

interface ShoppingBottomSheetProps {
  items: ShoppingItem[]
  groupId: string
}

export function ShoppingBottomSheet({ items, groupId }: ShoppingBottomSheetProps) {
  const [open, setOpen] = useState(false)
  const unchecked = items.filter(i => !i.is_checked)

  return (
    <>
      {/* 固定バー */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border/60 px-5 py-3.5 flex items-center justify-between active:bg-surface transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-sm font-semibold">買い物メモ</span>
        </div>
        <div className="flex items-center gap-2">
          {unchecked.length > 0 && (
            <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-medium">
              {unchecked.length}
            </span>
          )}
          <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </div>
      </button>

      {/* ドロワー */}
      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-card rounded-t-2xl border-t border-border/60 shadow-xl focus:outline-none" style={{ maxHeight: '90dvh' }}>
            <div className="mx-auto w-10 h-1 rounded-full bg-border mt-3 mb-1 shrink-0" />
            <div className="overflow-y-auto px-4 pb-10 pt-2 flex-1">
              <div className="flex items-center justify-between mb-4">
                <Drawer.Title className="text-base font-semibold">買い物メモ</Drawer.Title>
                <button
                  onClick={() => setOpen(false)}
                  className="text-muted hover:text-foreground transition-colors p-1"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <AddItemForm groupId={groupId} />
              <div className="mt-4">
                <ShoppingList items={items} groupId={groupId} />
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  )
}
