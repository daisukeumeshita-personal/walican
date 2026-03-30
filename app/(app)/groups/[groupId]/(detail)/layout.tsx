import { notFound } from 'next/navigation'
import { getGroupById, getGroupMembers, getGroupInvitations, getGroups } from '@/lib/data/groups'
import { getCurrentUser } from '@/lib/data/profiles'
import { Avatar } from '@/components/ui/avatar'
import { GroupSettingsDrawer } from '@/components/groups/group-settings-drawer'
import { GroupSwitcher } from '@/components/groups/group-switcher'

export default async function GroupLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params

  const [group, members, invitations, allGroups, { user }] = await Promise.all([
    getGroupById(groupId),
    getGroupMembers(groupId),
    getGroupInvitations(groupId),
    getGroups(),
    getCurrentUser(),
  ])
  if (!group) notFound()

  const currentMember = members.find(m => m.user_id === user.id)
  const isOwner = currentMember?.role === 'owner'

  const membersForDrawer = members.map(m => ({
    user_id: m.user_id,
    display_name: m.profile.display_name,
    email: m.profile.email,
    role: m.role,
  }))

  const groupsForSwitcher = allGroups.map(g => ({ id: g.id, name: g.name }))

  return (
    <div className="pb-24 md:pb-0">
      <div className="flex items-center gap-3 mb-6">
        <GroupSwitcher
          groups={groupsForSwitcher}
          currentGroupId={groupId}
          currentGroupName={group.name}
        />
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center -space-x-2">
            {members.slice(0, 2).map(m => (
              <Avatar
                key={m.user_id}
                name={m.profile.display_name}
                className="w-7 h-7 !rounded-full ring-2 ring-background"
              />
            ))}
          </div>
          <GroupSettingsDrawer
            groupId={groupId}
            groupName={group.name}
            members={membersForDrawer}
            invitations={invitations}
            currentUserId={user.id}
            isOwner={isOwner}
          />
        </div>
      </div>
      {children}
    </div>
  )
}
