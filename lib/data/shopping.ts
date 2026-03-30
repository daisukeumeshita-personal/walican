import { createClient } from '@/lib/supabase/server'
import type { ShoppingItem } from '@/lib/types/database'

export async function getShoppingItems(groupId: string): Promise<ShoppingItem[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('shopping_items')
    .select('*')
    .eq('group_id', groupId)
    .order('is_checked', { ascending: true })
    .order('created_at', { ascending: false })

  return (data as unknown as ShoppingItem[]) || []
}
