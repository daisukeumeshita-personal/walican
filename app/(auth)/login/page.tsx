import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { invitation } = await searchParams
  const invitationToken = typeof invitation === 'string' ? invitation : undefined

  return (
    <div>
      <h2 className="font-display text-2xl font-600 tracking-tight mb-6">ログイン</h2>
      <LoginForm invitation={invitationToken} />
      <p className="text-sm text-muted mt-6">
        アカウントをお持ちでない方は{' '}
        <Link
          href={invitationToken ? `/signup?invitation=${invitationToken}` : '/signup'}
          className="text-foreground font-medium underline underline-offset-4 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
        >
          新規登録
        </Link>
      </p>
    </div>
  )
}
