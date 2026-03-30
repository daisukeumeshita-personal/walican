'use client'

import { useState } from 'react'
import { Drawer } from 'vaul'
import { updateGroup, deleteGroup, addMember, type GroupActionState } from '@/app/actions/groups'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { useActionState } from 'react'
import { useRef } from 'react'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/ui/submit-button'

interface Member {
  user_id: string
  display_name: string
  email: string
  role: 'owner' | 'member'
}

interface GroupSettingsDrawerProps {
  groupId: string
  groupName: string
  members: Member[]
  currentUserId: string
  isOwner: boolean
}

function InviteForm({ groupId }: { groupId: string }) {
  const formRef = useRef<HTMLFormElement>(null)
  const boundAddMember = addMember.bind(null, groupId)
  const [state, action] = useActionState<GroupActionState, FormData>(boundAddMember, null)

  return (
    <form
      ref={formRef}
      action={async (formData: FormData) => {
        await action(formData)
        formRef.current?.reset()
      }}
      className="flex gap-2"
    >
      {state?.error && (
        <p className="text-xs text-danger col-span-2">{state.error}</p>
      )}
      <input
        name="email"
        type="email"
        placeholder="メールアドレスで招待"
        required
        className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/20 transition-colors"
      />
      <SubmitButton pendingText="送信中..." className="shrink-0">
        招待
      </SubmitButton>
    </form>
  )
}

export function GroupSettingsDrawer({
  groupId,
  groupName,
  members,
  currentUserId,
  isOwner,
}: GroupSettingsDrawerProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(groupName)
  const [saving, setSaving] = useState(false)
  const [nameError, setNameError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleSaveName = async () => {
    if (name.trim() === groupName || !name.trim()) return
    setSaving(true)
    setNameError('')
    const result = await updateGroup(groupId, name)
    setSaving(false)
    if (result?.error) setNameError(result.error)
  }

  const handleDelete = async () => {
    setDeleting(true)
    await deleteGroup(groupId)
  }

  const canInvite = members.length < 2

  return (
    <Drawer.Root open={open} onOpenChange={setOpen} direction="right">
      <Drawer.Trigger asChild>
        <button
          className="text-muted hover:text-foreground transition-colors shrink-0 cursor-pointer"
          title="グループ設定"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)} />
        <Drawer.Content className="fixed right-0 top-0 bottom-0 z-50 flex flex-col w-full max-w-sm bg-card border-l border-border/60 shadow-xl focus:outline-none">
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 shrink-0">
            <Drawer.Title className="font-semibold">グループ設定</Drawer.Title>
            <button
              onClick={() => setOpen(false)}
              className="text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto flex-1 px-5 py-5 flex flex-col gap-7">

            {/* メンバー */}
            <section className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold tracking-[0.08em] uppercase text-muted">
                メンバー（{members.length}/2人）
              </h3>
              <div className="flex flex-col gap-1.5">
                {members.map(m => (
                  <div key={m.user_id} className="flex items-center gap-3 py-2">
                    <Avatar name={m.display_name} className="w-8 h-8 !rounded-full shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {m.display_name}
                        {m.user_id === currentUserId && <span className="text-xs text-muted font-normal ml-1">（あなた）</span>}
                      </p>
                      <p className="text-xs text-muted truncate">{m.email}</p>
                    </div>
                    {m.role === 'owner' && (
                      <span className="text-[11px] bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full shrink-0">Owner</span>
                    )}
                  </div>
                ))}
              </div>
              {canInvite && (
                <InviteForm groupId={groupId} />
              )}
            </section>

            {/* グループ名編集 */}
            {isOwner && (
              <section className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold tracking-[0.08em] uppercase text-muted">グループ名</h3>
                {nameError && <p className="text-xs text-danger">{nameError}</p>}
                <div className="flex gap-2">
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    maxLength={50}
                    className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/20 transition-colors"
                  />
                  <Button
                    onClick={handleSaveName}
                    disabled={saving || name.trim() === groupName || !name.trim()}
                  >
                    {saving ? '保存中...' : '保存'}
                  </Button>
                </div>
              </section>
            )}

            {/* グループ削除 */}
            {isOwner && (
              <section className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold tracking-[0.08em] uppercase text-muted">危険な操作</h3>
                {confirmDelete ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-foreground">本当に削除しますか？この操作は取り消せません。</p>
                    <div className="flex gap-2">
                      <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                        {deleting ? '削除中...' : '削除する'}
                      </Button>
                      <Button variant="ghost" onClick={() => setConfirmDelete(false)}>やめる</Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="text-sm text-danger hover:underline text-left cursor-pointer"
                  >
                    このグループを削除する
                  </button>
                )}
              </section>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
