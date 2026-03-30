'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function acceptInvitation(token: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get invitation details
  const { data: invitation } = await supabase
    .from('group_invitations')
    .select('id, group_id')
    .eq('id', token)
    .single()

  if (!invitation) {
    return { error: '招待が見つかりません。既に使用されたか、取り消された可能性があります。' }
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', invitation.group_id)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    // Already a member — just clean up invitation and redirect
    await supabase
      .from('group_invitations')
      .delete()
      .eq('id', invitation.id)

    redirect(`/groups/${invitation.group_id}`)
  }

  // Add user to group
  const { error: memberError } = await supabase
    .from('group_members')
    .insert({
      group_id: invitation.group_id,
      user_id: user.id,
      role: 'member',
    })

  if (memberError) {
    return { error: 'グループへの参加に失敗しました' }
  }

  // Delete the invitation
  await supabase
    .from('group_invitations')
    .delete()
    .eq('id', invitation.id)

  redirect(`/groups/${invitation.group_id}`)
}
