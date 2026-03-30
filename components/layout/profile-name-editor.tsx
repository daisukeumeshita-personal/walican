'use client'

import { useState, useRef, useEffect } from 'react'
import { updateProfile } from '@/app/actions/auth'

interface ProfileNameEditorProps {
  displayName: string
}

export function ProfileNameEditor({ displayName }: ProfileNameEditorProps) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(displayName)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  const handleSave = async () => {
    if (value.trim() === displayName) { setEditing(false); return }
    setSaving(true)
    setError('')
    const result = await updateProfile(value)
    setSaving(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setEditing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') { setValue(displayName); setEditing(false) }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        {error && <span className="text-xs text-danger">{error}</span>}
        <input
          ref={inputRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={30}
          disabled={saving}
          className="w-28 px-2 py-0.5 text-xs rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-foreground/10"
        />
        <button
          onClick={handleSave}
          disabled={saving || !value.trim()}
          className="text-xs text-primary hover:text-primary/80 font-medium disabled:opacity-40 cursor-pointer"
        >
          {saving ? '...' : '保存'}
        </button>
        <button
          onClick={() => { setValue(displayName); setEditing(false) }}
          className="text-xs text-muted hover:text-foreground cursor-pointer"
        >
          取消
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="text-xs text-muted tracking-wide hover:text-foreground transition-colors cursor-pointer group flex items-center gap-1"
      title="名前を変更"
    >
      {displayName}
      <svg className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    </button>
  )
}
