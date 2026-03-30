'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function addShoppingItem(groupId: string, text: string) {
  if (!text.trim()) return { error: '内容を入力してください' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('shopping_items')
    .insert({
      group_id: groupId,
      text: text.trim(),
      created_by: user.id,
    })

  if (error) {
    return { error: '追加に失敗しました' }
  }

  revalidatePath(`/groups/${groupId}/shopping`)
  return null
}

export async function toggleShoppingItem(groupId: string, itemId: string, isChecked: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('shopping_items')
    .update({ is_checked: isChecked })
    .eq('id', itemId)

  if (error) {
    return { error: '更新に失敗しました' }
  }

  revalidatePath(`/groups/${groupId}/shopping`)
  return null
}

export async function deleteShoppingItem(groupId: string, itemId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('shopping_items')
    .delete()
    .eq('id', itemId)

  if (error) {
    return { error: '削除に失敗しました' }
  }

  revalidatePath(`/groups/${groupId}/shopping`)
  return null
}
