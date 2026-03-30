import Link from 'next/link'
import { getGroups, getGroupMemberCount } from '@/lib/data/groups'
import { Button } from '@/components/ui/button'
import { GroupCard } from '@/components/groups/group-card'
import { EmptyState } from '@/components/ui/empty-state'

export default async function GroupsPage() {
  const groups = await getGroups()

  return (
    <div>
      <div className="flex items-end justify-between mb-8 animate-fade-up">
        <div>
          <p className="text-xs font-medium tracking-[0.15em] uppercase text-muted mb-1">Dashboard</p>
          <h1 className="font-display text-2xl font-700 tracking-tight">グループ</h1>
        </div>
        <Link href="/groups/new">
          <Button>新規作成</Button>
        </Link>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          message="グループがありません"
          description="新しいグループを作成して始めましょう"
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {await Promise.all(
            groups.map(async (group, i) => {
              const memberCount = await getGroupMemberCount(group.id)
              return (
                <div key={group.id} className={`animate-fade-up stagger-${Math.min(i + 1, 5)}`}>
                  <GroupCard
                    group={group}
                    memberCount={memberCount}
                  />
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
