'use client'

import { removeMember } from '@/app/actions/groups'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface RemoveMemberButtonProps {
  groupId: string
  userId: string
}

export function RemoveMemberButton({ groupId, userId }: RemoveMemberButtonProps) {
  const [confirming, setConfirming] = useState(false)

  if (confirming) {
    return (
      <div className="flex gap-1">
        <Button
          variant="danger"
          className="text-xs px-2 py-1"
          onClick={async () => {
            await removeMember(groupId, userId)
            setConfirming(false)
          }}
        >
          削除
        </Button>
        <Button
          variant="ghost"
          className="text-xs px-2 py-1"
          onClick={() => setConfirming(false)}
        >
          取消
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
      削除
    </Button>
  )
}
