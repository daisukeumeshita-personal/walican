'use client'

import { useActionState } from 'react'
import { createGroup, type GroupActionState } from '@/app/actions/groups'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/ui/submit-button'

export function CreateGroupForm() {
  const [state, action] = useActionState<GroupActionState, FormData>(createGroup, null)

  return (
    <form action={action} className="flex flex-col gap-4">
      {state?.error && (
        <div className="bg-danger-light text-danger text-sm p-3 rounded-lg">
          {state.error}
        </div>
      )}
      <Input
        label="グループ名"
        name="name"
        type="text"
        placeholder="例: 旅行グループ"
        required
        error={state?.fieldErrors?.name?.[0]}
      />
      <Input
        label="説明（任意）"
        name="description"
        type="text"
        placeholder="例: 2024年夏の沖縄旅行"
        error={state?.fieldErrors?.description?.[0]}
      />
      <SubmitButton pendingText="作成中..." className="w-full mt-2">
        グループを作成
      </SubmitButton>
    </form>
  )
}
