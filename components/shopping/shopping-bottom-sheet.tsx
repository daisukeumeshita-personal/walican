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
  const [snap, setSnap] = useState<string | number | null>('120px')
  const unchecked = items.filter(i => !i.is_checked)

  return (
    <Drawer.Root
      open
      snapPoints={['120px', 1]}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      fadeFromIndex={1}
      modal={false}
    >
      <Drawer.Portal>
        <Drawer.Content
          className="
            fixed bottom-0 left-0 right-0 z-40 flex flex-col
            bg-card rounded-t-2xl border-t border-border/60 shadow-xl
            md:hidden focus:outline-none
          "
        >
          <div className="mx-auto w-10 h-1 rounded-full bg-border mt-3 mb-1 shrink-0" />
          <div className="overflow-y-auto px-4 pb-8 pt-2 flex-1">
            <div className="flex items-center justify-between mb-4">
              <Drawer.Title className="text-base font-semibold">買い物メモ</Drawer.Title>
              <span className="text-xs text-muted bg-surface px-2 py-0.5 rounded-full">
                {unchecked.length} 件
              </span>
            </div>
            <AddItemForm groupId={groupId} />
            <div className="mt-4">
              <ShoppingList items={items} groupId={groupId} />
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
