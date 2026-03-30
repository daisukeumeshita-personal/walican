import { getGroupById, getGroupMembers, getGroupInvitations } from '@/lib/data/groups'
import { getCurrentUser } from '@/lib/data/profiles'
import { MemberList } from '@/components/groups/member-list'
import { AddMemberForm } from '@/components/groups/add-member-form'
import { GroupSettings } from '@/components/groups/group-settings'
import { Card } from '@/components/ui/card'

export default async function MembersPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const [group, members, invitations, { user }] = await Promise.all([
    getGroupById(groupId),
    getGroupMembers(groupId),
    getGroupInvitations(groupId),
    getCurrentUser(),
  ])

  const currentMember = members.find(m => m.user_id === user.id)
  const isOwner = currentMember?.role === 'owner'
  const canAddMember = members.length < 2

  return (
    <div className="flex flex-col gap-6">
      {canAddMember && (
        <Card>
          <h2 className="text-sm font-semibold text-muted mb-3">メンバーを招待</h2>
          <AddMemberForm groupId={groupId} />
        </Card>
      )}

      <div>
        <h2 className="text-sm font-semibold text-muted mb-3">
          メンバー（{members.length}/2人）
        </h2>
        <MemberList
          members={members as any}
          groupId={groupId}
          currentUserId={user.id}
          isOwner={isOwner}
        />
      </div>

      {invitations.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted mb-3">
            招待中（{invitations.length}人）
          </h2>
          <MemberList
            invitations={invitations}
            groupId={groupId}
            currentUserId={user.id}
            isOwner={isOwner}
          />
        </div>
      )}

      {isOwner && group && (
        <Card>
          <h2 className="text-sm font-semibold text-muted mb-4">グループ設定</h2>
          <GroupSettings
            groupId={groupId}
            groupName={group.name}
            isOwner={isOwner}
          />
        </Card>
      )}
    </div>
  )
}
