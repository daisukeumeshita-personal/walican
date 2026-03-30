'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface GroupTabsProps {
  groupId: string
}

const tabs = [
  { label: '概要', path: '' },
  { label: '支出', path: '/expenses' },
  { label: 'メンバー', path: '/members' },
  { label: '買い物メモ', path: '/shopping' },
]

export function GroupTabs({ groupId }: GroupTabsProps) {
  const pathname = usePathname()
  const basePath = `/groups/${groupId}`

  return (
    <nav className="flex gap-1 mb-6 -mx-1 overflow-x-auto pb-px">
      {tabs.map((tab) => {
        const href = `${basePath}${tab.path}`
        const isActive = tab.path === ''
          ? pathname === basePath
          : pathname.startsWith(href)

        return (
          <Link
            key={tab.path}
            href={href}
            className={cn(
              'px-3.5 py-1.5 text-sm font-medium whitespace-nowrap rounded-full transition-colors duration-200',
              isActive
                ? 'bg-foreground text-background'
                : 'text-muted hover:text-foreground hover:bg-surface'
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
