'use client'

import { useActionState } from 'react'
import { login, type AuthState } from '@/app/actions/auth'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/ui/submit-button'

export function LoginForm({ invitation }: { invitation?: string }) {
  const [state, action] = useActionState<AuthState, FormData>(login, null)

  return (
    <form action={action} className="flex flex-col gap-4">
      {invitation && <input type="hidden" name="invitation" value={invitation} />}
      {state?.error && (
        <div className="bg-danger-light text-danger text-sm p-3 rounded-lg">
          {state.error}
        </div>
      )}
      <Input
        label="メールアドレス"
        name="email"
        type="email"
        placeholder="email@example.com"
        required
        error={state?.fieldErrors?.email?.[0]}
      />
      <Input
        label="パスワード"
        name="password"
        type="password"
        placeholder="6文字以上"
        required
        error={state?.fieldErrors?.password?.[0]}
      />
      <SubmitButton pendingText="ログイン中..." className="w-full mt-2">
        ログイン
      </SubmitButton>
    </form>
  )
}
