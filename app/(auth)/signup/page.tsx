import Link from 'next/link'
import { SignupForm } from '@/components/auth/signup-form'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { invitation } = await searchParams
  const invitationToken = typeof invitation === 'string' ? invitation : undefined

  return (
    <div>
      <h2 className="font-display text-2xl font-600 tracking-tight mb-6">新規登録</h2>
      <SignupForm invitation={invitationToken} />
      <p className="text-sm text-muted mt-6">
        既にアカウントをお持ちの方は{' '}
        <Link
          href={invitationToken ? `/login?invitation=${invitationToken}` : '/login'}
          className="text-foreground font-medium underline underline-offset-4 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
        >
          ログイン
        </Link>
      </p>
    </div>
  )
}
