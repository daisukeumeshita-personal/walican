'use client'

import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  return (
    <form action={logout}>
      <Button variant="ghost" type="submit" className="text-xs">
        ログアウト
      </Button>
    </form>
  )
}
