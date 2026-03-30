'use client'

import { useActionState } from 'react'
import { acceptInvitation } from '@/app/actions/invitations'
import { SubmitButton } from '@/components/ui/submit-button'

export function AcceptInvitationForm({ token }: { token: string }) {
  const [state, action] = useActionState(
    async () => {
      return await acceptInvitation(token)
    },
    null
  )

  return (
    <form action={action}>
      {state?.error && (
        <div className="bg-danger-light text-danger text-sm p-3 rounded-lg mb-4">
          {state.error}
        </div>
      )}
      <SubmitButton pendingText="参加中..." className="w-full">
        グループに参加する
      </SubmitButton>
    </form>
  )
}
