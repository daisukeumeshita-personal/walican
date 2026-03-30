'use client'

import { useActionState } from 'react'
import { signup, type AuthState } from '@/app/actions/auth'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/ui/submit-button'

export function SignupForm({ invitation }: { invitation?: string }) {
  const [state, action] = useActionState<AuthState, FormData>(signup, null)

  return (
    <form action={action} className="flex flex-col gap-4">
      {invitation && <input type="hidden" name="invitation" value={invitation} />}
      {state?.error && (
        <div className="bg-danger-light text-danger text-sm p-3 rounded-lg">
          {state.error}
        </div>
      )}
      <Input
        label="表示名"
        name="displayName"
        type="text"
        placeholder="田中太郎"
        required
        error={state?.fieldErrors?.displayName?.[0]}
      />
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
      <Input
        label="パスワード（確認）"
        name="confirmPassword"
        type="password"
        placeholder="もう一度入力"
        required
        error={state?.fieldErrors?.confirmPassword?.[0]}
      />
      <SubmitButton pendingText="登録中..." className="w-full mt-2">
        新規登録
      </SubmitButton>
    </form>
  )
}
