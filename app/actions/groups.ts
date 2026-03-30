'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createGroupSchema, addMemberSchema } from '@/lib/validations/group'
import { sendInvitationEmail } from '@/lib/email'

export type GroupActionState = {
  error?: string
  fieldErrors?: Record<string, string[]>
} | null

export async function createGroup(_prevState: GroupActionState, formData: FormData): Promise<GroupActionState> {
  const raw = {
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || undefined,
  }

  const result = createGroupSchema.safeParse(raw)
  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const groupId = crypto.randomUUID()

  // Insert group and owner membership together
  // group_members INSERT must happen right after group INSERT
  // because groups SELECT RLS requires membership
  const { error } = await supabase
    .from('groups')
    .insert({
      id: groupId,
      name: result.data.name,
      description: result.data.description || null,
      created_by: user.id,
    })

  if (error) {
    console.error('Group INSERT failed:', error.message, error.code)
    return { error: 'グループの作成に失敗しました' }
  }

  const { error: memberError } = await supabase
    .from('group_members')
    .insert({
      group_id: groupId,
      user_id: user.id,
      role: 'owner',
    })

  if (memberError) {
    console.error('Member INSERT failed:', memberError.message, memberError.code)
    // Rollback: delete the group if member insert fails
    await supabase.from('groups').delete().eq('id', groupId)
    return { error: 'グループの作成に失敗しました' }
  }

  redirect(`/groups/${groupId}`)
}

export async function addMember(groupId: string, _prevState: GroupActionState, formData: FormData): Promise<GroupActionState> {
  const raw = { email: formData.get('email') as string }

  const result = addMemberSchema.safeParse(raw)
  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // オーナー確認
  const { data: currentMember } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single()

  if (!currentMember || currentMember.role !== 'owner') {
    return { error: 'グループのオーナーのみメンバーを追加できます' }
  }

  // 2人制限チェック
  const { count: memberCount } = await supabase
    .from('group_members')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', groupId)

  if ((memberCount ?? 0) >= 2) {
    return { error: 'このグループはすでに2人のメンバーがいます。3人以上は追加できません。' }
  }

  const email = result.data.email.toLowerCase()

  // Find user by email (case-insensitive)
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('id')
    .ilike('email', email)
    .single()

  if (targetProfile) {
    // User exists — add directly to group
    const { data: existing } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', targetProfile.id)
      .single()

    if (existing) {
      return { error: 'このユーザーは既にメンバーです' }
    }

    const { error } = await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: targetProfile.id,
        role: 'member',
      })

    if (error) {
      return { error: 'メンバーの追加に失敗しました' }
    }
  } else {
    // User not registered — create pending invitation
    const { data: existingInvite } = await supabase
      .from('group_invitations')
      .select('id')
      .eq('group_id', groupId)
      .ilike('email', email)
      .single()

    if (existingInvite) {
      return { error: 'このメールアドレスは既に招待済みです' }
    }

    const { data: invitation, error } = await supabase
      .from('group_invitations')
      .insert({
        group_id: groupId,
        email,
        invited_by: user.id,
      })
      .select('id')
      .single()

    if (error || !invitation) {
      console.error('Invitation INSERT failed:', error?.message, error?.code)
      return { error: '招待の送信に失敗しました' }
    }

    // Send invitation email (non-blocking — don't fail if email fails)
    try {
      const { data: group } = await supabase
        .from('groups')
        .select('name')
        .eq('id', groupId)
        .single()

      const { data: inviterProfile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single()

      const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/invite/${invitation.id}`
      await sendInvitationEmail(
        email,
        group?.name || 'グループ',
        inviterProfile?.display_name || '招待者',
        inviteUrl
      )
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError)
    }
  }

  revalidatePath(`/groups/${groupId}/members`)
  return null
}

export async function removeMember(groupId: string, userId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentMember } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single()

  if (!currentMember || currentMember.role !== 'owner') {
    return { error: '権限がありません' }
  }

  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId)

  if (error) {
    return { error: 'メンバーの削除に失敗しました' }
  }

  revalidatePath(`/groups/${groupId}/members`)
  return null
}

export async function cancelInvitation(groupId: string, invitationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentMember } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single()

  if (!currentMember || currentMember.role !== 'owner') {
    return { error: '権限がありません' }
  }

  const { error } = await supabase
    .from('group_invitations')
    .delete()
    .eq('id', invitationId)
    .eq('group_id', groupId)

  if (error) {
    return { error: '招待の取り消しに失敗しました' }
  }

  revalidatePath(`/groups/${groupId}/members`)
  return null
}

export async function updateGroup(groupId: string, name: string): Promise<GroupActionState> {
  const trimmed = name.trim()
  if (!trimmed) return { error: 'グループ名を入力してください' }
  if (trimmed.length > 50) return { error: 'グループ名は50文字以内で入力してください' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('groups')
    .update({ name: trimmed })
    .eq('id', groupId)

  if (error) return { error: 'グループ名の更新に失敗しました' }

  revalidatePath(`/groups/${groupId}`)
  return null
}

export async function deleteGroup(groupId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentMember } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single()

  if (!currentMember || currentMember.role !== 'owner') {
    return { error: '権限がありません' }
  }

  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId)

  if (error) {
    return { error: 'グループの削除に失敗しました' }
  }

  redirect('/groups')
}
