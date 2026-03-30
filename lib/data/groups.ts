import { createClient } from '@/lib/supabase/server'
import type { Group, Profile } from '@/lib/types/database'

export async function getGroups(): Promise<Group[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id)

  if (!memberships || memberships.length === 0) return []

  const groupIds = memberships.map(m => m.group_id)

  const { data: groups } = await supabase
    .from('groups')
    .select('*')
    .in('id', groupIds)
    .order('created_at', { ascending: false })

  return (groups as Group[]) || []
}

export async function getGroupById(groupId: string): Promise<Group | null> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single()

  return data as Group | null
}

export interface GroupMemberWithProfile {
  id: string
  group_id: string
  user_id: string
  role: 'owner' | 'member'
  joined_at: string
  profile: Profile
}

export async function getGroupMembers(groupId: string): Promise<GroupMemberWithProfile[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('group_members')
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq('group_id', groupId)
    .order('joined_at', { ascending: true })

  return (data as unknown as GroupMemberWithProfile[]) || []
}

export interface GroupInvitation {
  id: string
  group_id: string
  email: string
  invited_by: string
  created_at: string
}

export async function getGroupInvitations(groupId: string): Promise<GroupInvitation[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('group_invitations')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true })

  return (data as unknown as GroupInvitation[]) || []
}

export interface InvitationDetails {
  id: string
  email: string
  group_id: string
  group_name: string
  inviter_name: string
}

export async function getInvitationDetails(invitationId: string): Promise<InvitationDetails | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_invitation_details', {
    p_invitation_id: invitationId,
  })

  if (error || !data) return null
  return data as InvitationDetails
}

export async function getGroupMemberCount(groupId: string): Promise<number> {
  const supabase = await createClient()

  const { count } = await supabase
    .from('group_members')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', groupId)

  return count || 0
}
