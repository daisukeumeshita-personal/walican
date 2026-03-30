import { getShoppingItems } from '@/lib/data/shopping'
import { ShoppingList } from '@/components/shopping/shopping-list'
import { AddItemForm } from '@/components/shopping/add-item-form'

export default async function ShoppingPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const items = await getShoppingItems(groupId)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">買い物メモ</h2>
      </div>
      <AddItemForm groupId={groupId} />
      <ShoppingList items={items as any} groupId={groupId} />
    </div>
  )
}
