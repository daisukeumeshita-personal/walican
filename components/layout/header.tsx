import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { UserMenu } from './user-menu'

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/40">
      <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link href="/groups" className="font-display text-lg font-700 tracking-tight text-foreground">
          Hanbun
        </Link>
        <UserMenu displayName={profile?.display_name || user.email || ''} />
      </div>
    </header>
  )
}
