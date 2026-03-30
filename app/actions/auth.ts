'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { loginSchema, signupSchema } from '@/lib/validations/auth'

export type AuthState = {
  error?: string
  fieldErrors?: Record<string, string[]>
} | null

export async function login(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const result = loginSchema.safeParse(raw)
  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  })

  if (error) {
    return { error: 'メールアドレスまたはパスワードが正しくありません' }
  }

  // Handle invitation token
  const invitation = formData.get('invitation') as string | null
  if (invitation) {
    const { data: invite } = await supabase
      .from('group_invitations')
      .select('id, group_id')
      .eq('id', invitation)
      .single()

    if (invite) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Check if already a member
        const { data: existing } = await supabase
          .from('group_members')
          .select('id')
          .eq('group_id', invite.group_id)
          .eq('user_id', user.id)
          .single()

        if (!existing) {
          await supabase
            .from('group_members')
            .insert({
              group_id: invite.group_id,
              user_id: user.id,
              role: 'member',
            })
        }

        await supabase
          .from('group_invitations')
          .delete()
          .eq('id', invite.id)

        redirect(`/groups/${invite.group_id}`)
      }
    }
  }

  redirect('/groups')
}

export async function signup(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const raw = {
    displayName: formData.get('displayName') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  }

  const result = signupSchema.safeParse(raw)
  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      data: { display_name: result.data.displayName },
    },
  })

  if (error) {
    return { error: 'アカウントの作成に失敗しました。別のメールアドレスをお試しください。' }
  }

  // Handle invitation token — on signup, the handle_new_user trigger
  // already processes invitations by email, so we just redirect to the group
  const invitation = formData.get('invitation') as string | null
  if (invitation) {
    const { data: invite } = await supabase
      .from('group_invitations')
      .select('group_id')
      .eq('id', invitation)
      .single()

    if (invite) {
      redirect(`/groups/${invite.group_id}`)
    }
  }

  redirect('/groups')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
