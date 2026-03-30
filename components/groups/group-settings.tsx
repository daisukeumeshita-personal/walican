'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateGroup, deleteGroup } from '@/app/actions/groups'
import { Button } from '@/components/ui/button'

interface GroupSettingsProps {
  groupId: string
  groupName: string
  isOwner: boolean
}

export function GroupSettings({ groupId, groupName, isOwner }: GroupSettingsProps) {
  const router = useRouter()
  const [name, setName] = useState(groupName)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (name.trim() === groupName) return
    setSaving(true)
    setError('')
    const result = await updateGroup(groupId, name)
    setSaving(false)
    if (result?.error) setError(result.error)
  }

  const handleDelete = async () => {
    setDeleting(true)
    await deleteGroup(groupId)
  }

  if (!isOwner) return null

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p className="text-sm text-danger">{error}</p>
      )}

      {/* グループ名編集 */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium tracking-wide uppercase text-muted">グループ名</label>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={50}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/20 transition-colors"
          />
          <Button
            onClick={handleSave}
            disabled={saving || name.trim() === groupName || !name.trim()}
          >
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>

      {/* グループ削除 */}
      <div className="pt-4 border-t border-border/60">
        <p className="text-xs font-medium tracking-wide uppercase text-muted mb-3">危険な操作</p>
        {confirmDelete ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-foreground">本当に削除しますか？この操作は取り消せません。</p>
            <div className="flex gap-2">
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? '削除中...' : '削除する'}
              </Button>
              <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                やめる
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-sm text-danger hover:underline cursor-pointer"
          >
            このグループを削除する
          </button>
        )}
      </div>
    </div>
  )
}
