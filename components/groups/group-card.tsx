import Link from 'next/link'
import type { Group } from '@/lib/types/database'

interface GroupCardProps {
  group: Group
  memberCount: number
}

export function GroupCard({ group, memberCount }: GroupCardProps) {
  return (
    <Link href={`/groups/${group.id}`} className="group block">
      <div className="p-5 rounded-2xl border border-border/60 bg-card hover:border-foreground/15 transition-colors duration-200 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-600 text-foreground tracking-tight">{group.name}</h3>
            {group.description && (
              <p className="text-sm text-muted mt-0.5 line-clamp-1 font-light">{group.description}</p>
            )}
          </div>
          <span className="text-xs text-muted bg-surface rounded-full px-2.5 py-1 ml-3 shrink-0">
            {memberCount}人
          </span>
        </div>
      </div>
    </Link>
  )
}
