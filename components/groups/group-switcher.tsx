'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Drawer } from 'vaul'
import Link from 'next/link'

interface GroupItem {
  id: string
  name: string
}

interface GroupSwitcherProps {
  groups: GroupItem[]
  currentGroupId: string
  currentGroupName: string
}

function GroupList({
  groups,
  currentGroupId,
  onSelect,
}: {
  groups: GroupItem[]
  currentGroupId: string
  onSelect: () => void
}) {
  const router = useRouter()

  return (
    <div className="flex flex-col">
      {groups.map(g => (
        <button
          key={g.id}
          onClick={() => {
            router.push(`/groups/${g.id}`)
            onSelect()
          }}
          className="flex items-center justify-between px-4 py-3 text-sm hover:bg-surface transition-colors text-left cursor-pointer"
        >
          <span className={g.id === currentGroupId ? 'font-semibold text-foreground' : 'text-foreground'}>
            {g.name}
          </span>
          {g.id === currentGroupId && (
            <svg className="w-4 h-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      ))}
      <div className="border-t border-border/60 mt-1 pt-1">
        <Link
          href="/groups/new"
          onClick={onSelect}
          className="flex items-center gap-2 px-4 py-3 text-sm text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新しいグループを作成
        </Link>
      </div>
    </div>
  )
}

export function GroupSwitcher({ groups, currentGroupId, currentGroupName }: GroupSwitcherProps) {
  const [desktopOpen, setDesktopOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // クリックアウトで閉じる
  useEffect(() => {
    if (!desktopOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDesktopOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [desktopOpen])

  const trigger = (onClick: () => void) => (
    <button
      onClick={onClick}
      className="flex items-center gap-1 min-w-0 cursor-pointer group"
    >
      <span className="text-xl font-bold truncate group-hover:text-foreground/80 transition-colors">
        {currentGroupName}
      </span>
      <svg className="w-4 h-4 text-muted shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )

  return (
    <>
      {/* PC: dropdown */}
      <div ref={dropdownRef} className="relative hidden md:block min-w-0 flex-1">
        {trigger(() => setDesktopOpen(v => !v))}
        {desktopOpen && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-card border border-border/60 rounded-2xl shadow-lg z-50 overflow-hidden py-1">
            <GroupList
              groups={groups}
              currentGroupId={currentGroupId}
              onSelect={() => setDesktopOpen(false)}
            />
          </div>
        )}
      </div>

      {/* モバイル: vaul bottom sheet */}
      <div className="md:hidden min-w-0 flex-1">
        <Drawer.Root open={mobileOpen} onOpenChange={setMobileOpen}>
          <Drawer.Trigger asChild>
            {trigger(() => setMobileOpen(true))}
          </Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
            <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl border-t border-border/60 shadow-xl focus:outline-none">
              <div className="mx-auto w-10 h-1 rounded-full bg-border mt-3 mb-2" />
              <div className="px-1 pb-8">
                <Drawer.Title className="text-xs font-semibold tracking-[0.08em] uppercase text-muted px-4 pb-2">
                  グループを切り替え
                </Drawer.Title>
                <GroupList
                  groups={groups}
                  currentGroupId={currentGroupId}
                  onSelect={() => setMobileOpen(false)}
                />
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    </>
  )
}
