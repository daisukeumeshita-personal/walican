import { Avatar } from '@/components/ui/avatar'
import { RemoveMemberButton } from './remove-member-button'
import { CancelInvitationButton } from '@/components/groups/cancel-invitation-button'
import type { Profile } from '@/lib/types/database'
import type { GroupInvitation } from '@/lib/data/groups'

interface MemberWithProfile {
  id: string
  group_id: string
  user_id: string
  role: 'owner' | 'member'
  joined_at: string
  profile: Profile
}

interface MemberListProps {
  members?: MemberWithProfile[]
  invitations?: GroupInvitation[]
  groupId: string
  currentUserId: string
  isOwner: boolean
}

export function MemberList({ members, invitations, groupId, currentUserId, isOwner }: MemberListProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {members?.map((member, i) => (
        <div key={member.id} className={`flex items-center justify-between p-4 bg-card rounded-2xl border border-border/60 animate-fade-up stagger-${Math.min(i + 1, 5)}`}>
          <div className="flex items-center gap-3">
            <Avatar name={member.profile.display_name} />
            <div>
              <p className="text-sm font-500 tracking-tight text-foreground">
                {member.profile.display_name}
                {member.user_id === currentUserId && (
                  <span className="text-xs text-muted ml-1 font-normal">you</span>
                )}
              </p>
              <p className="text-xs text-muted/60 font-light">{member.profile.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {member.role === 'owner' && (
              <span className="text-[11px] bg-primary/10 text-primary font-medium px-2.5 py-1 rounded-full">
                Owner
              </span>
            )}
            {isOwner && member.user_id !== currentUserId && (
              <RemoveMemberButton groupId={groupId} userId={member.user_id} />
            )}
          </div>
        </div>
      ))}

      {invitations?.map((invitation, i) => (
        <div key={invitation.id} className={`flex items-center justify-between p-4 bg-card rounded-2xl border border-border/60 border-dashed animate-fade-up stagger-${Math.min(i + 1, 5)}`}>
          <div className="flex items-center gap-3">
            <Avatar name={invitation.email} />
            <div>
              <p className="text-sm font-500 tracking-tight text-foreground">
                {invitation.email}
              </p>
              <p className="text-xs text-muted/60 font-light">未登録 — サインアップ時に自動参加</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-accent/10 text-accent font-medium px-2.5 py-1 rounded-full">
              招待中
            </span>
            {isOwner && (
              <CancelInvitationButton groupId={groupId} invitationId={invitation.id} />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
