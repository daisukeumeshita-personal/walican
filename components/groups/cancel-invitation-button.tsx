'use client'

import { cancelInvitation } from '@/app/actions/groups'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface CancelInvitationButtonProps {
  groupId: string
  invitationId: string
}

export function CancelInvitationButton({ groupId, invitationId }: CancelInvitationButtonProps) {
  const [confirming, setConfirming] = useState(false)

  if (confirming) {
    return (
      <div className="flex gap-1">
        <Button
          variant="danger"
          className="text-xs px-2 py-1"
          onClick={async () => {
            await cancelInvitation(groupId, invitationId)
            setConfirming(false)
          }}
        >
          取消
        </Button>
        <Button
          variant="ghost"
          className="text-xs px-2 py-1"
          onClick={() => setConfirming(false)}
        >
          戻る
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      className="text-xs text-danger"
      onClick={() => setConfirming(true)}
    >
      取消
    </Button>
  )
}
