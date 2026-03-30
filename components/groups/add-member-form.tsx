'use client'

import { useActionState } from 'react'
import { addMember, type GroupActionState } from '@/app/actions/groups'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/ui/submit-button'
import { useRef } from 'react'

interface AddMemberFormProps {
  groupId: string
}

export function AddMemberForm({ groupId }: AddMemberFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const boundAddMember = addMember.bind(null, groupId)
  const [state, action] = useActionState<GroupActionState, FormData>(boundAddMember, null)

  return (
    <form
      ref={formRef}
      action={async (formData: FormData) => {
        await action(formData)
        formRef.current?.reset()
      }}
      className="flex flex-col gap-3"
    >
      {state?.error && (
        <div className="bg-danger-light text-danger text-sm p-3 rounded-lg">
          {state.error}
        </div>
      )}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            name="email"
            type="email"
            placeholder="メールアドレスで招待"
            required
            error={state?.fieldErrors?.email?.[0]}
          />
        </div>
        <SubmitButton pendingText="追加中..." className="shrink-0">
          追加
        </SubmitButton>
      </div>
    </form>
  )
}
