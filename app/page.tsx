import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: memberships } = await supabase
      .from('group_members')
      .select('group_id, joined_at')
      .eq('user_id', user.id)
      .order('joined_at', { ascending: false })
      .limit(1)

    if (memberships && memberships.length > 0) {
      redirect(`/groups/${memberships[0].group_id}`)
    } else {
      redirect('/groups')
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 grain">
      {/* Decorative background shape */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md w-full">
        <div className="animate-fade-up">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted mb-4">
            ふたりのための精算アプリ
          </p>
          <h1 className="font-display text-6xl font-800 tracking-tight text-foreground leading-[1.05]">
            Hanbun
          </h1>
          <p className="text-lg text-muted mt-3 leading-relaxed font-light">
            日々の買い物やデート、家賃の支払いまで。<br />
            ふたりの貸し借りをシンプルに。
          </p>
        </div>

        <div className="flex flex-col gap-3 mt-10 animate-fade-up stagger-2">
          <Link href="/login">
            <Button className="w-full h-12 text-base">ログイン</Button>
          </Link>
          <Link href="/signup">
            <Button variant="secondary" className="w-full h-12 text-base">
              新規登録
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
