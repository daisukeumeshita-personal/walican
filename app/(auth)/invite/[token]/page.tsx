import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getInvitationDetails } from '@/lib/data/groups'
import { AcceptInvitationForm } from './accept-form'

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const invitation = await getInvitationDetails(token)

  if (!invitation) {
    return (
      <div>
        <h2 className="font-display text-2xl font-600 tracking-tight mb-4">招待が見つかりません</h2>
        <p className="text-muted text-sm mb-6">
          この招待リンクは無効です。既に使用されたか、取り消された可能性があります。
        </p>
        <Link
          href="/login"
          className="inline-block px-5 py-2.5 rounded-full font-medium text-sm tracking-tight bg-foreground text-background hover:bg-foreground/85 shadow-sm transition-colors duration-200"
        >
          ログインページへ
        </Link>
      </div>
    )
  }

  // Check auth state
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div>
      <h2 className="font-display text-2xl font-600 tracking-tight mb-6">グループへの招待</h2>

      <div className="bg-card border border-border rounded-xl p-5 mb-6">
        <p className="text-muted text-sm mb-1">
          <span className="text-foreground font-medium">{invitation.inviter_name}</span> さんからの招待
        </p>
        <p className="text-foreground text-lg font-600">
          {invitation.group_name}
        </p>
      </div>

      {user ? (
        <AcceptInvitationForm token={token} />
      ) : (
        <div className="flex flex-col gap-3">
          <Link
            href={`/signup?invitation=${token}`}
            className="inline-flex justify-center px-5 py-2.5 rounded-full font-medium text-sm tracking-tight bg-foreground text-background hover:bg-foreground/85 shadow-sm transition-colors duration-200"
          >
            新規登録して参加
          </Link>
          <Link
            href={`/login?invitation=${token}`}
            className="inline-flex justify-center px-5 py-2.5 rounded-full font-medium text-sm tracking-tight bg-transparent text-foreground border border-foreground/15 hover:bg-foreground/5 transition-colors duration-200"
          >
            ログインして参加
          </Link>
        </div>
      )}
    </div>
  )
}
