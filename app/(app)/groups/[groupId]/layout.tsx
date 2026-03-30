import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getGroupById, getGroupMembers } from '@/lib/data/groups'
import { Avatar } from '@/components/ui/avatar'

export default async function GroupLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params

  const [group, members] = await Promise.all([
    getGroupById(groupId),
    getGroupMembers(groupId),
  ])
  if (!group) notFound()

  return (
    <div className="pb-24 md:pb-0">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/groups" className="text-muted hover:text-foreground shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold flex-1 truncate">{group.name}</h1>
        <Link
          href={`/groups/${groupId}/members`}
          className="flex items-center -space-x-2 shrink-0"
          title="メンバー管理"
        >
          {members.slice(0, 2).map((m) => (
            <Avatar
              key={m.user_id}
              name={m.profile.display_name}
              className="w-8 h-8 !rounded-full ring-2 ring-background"
            />
          ))}
        </Link>
      </div>
      {children}
    </div>
  )
}
