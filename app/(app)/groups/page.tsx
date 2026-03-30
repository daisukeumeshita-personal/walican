import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CreateGroupForm } from '@/components/groups/create-group-form'

export default async function GroupsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // グループがあれば最新グループへ
  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id, joined_at')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })
    .limit(1)

  if (memberships && memberships.length > 0) {
    redirect(`/groups/${memberships[0].group_id}`)
  }

  // グループなし → ウェルカム画面
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">グループを作成する</h1>
          <p className="text-sm text-muted leading-relaxed">
            2人のグループを作って、<br />支出の記録をはじめましょう。
          </p>
        </div>

        <CreateGroupForm />
      </div>
    </div>
  )
}
