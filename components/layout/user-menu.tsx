'use client'

import { useState, useRef, useEffect } from 'react'
import { logout, updateProfile } from '@/app/actions/auth'

interface UserMenuProps {
  displayName: string
}

export function UserMenu({ displayName }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(displayName)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) { setEditing(false); setError('') }
  }, [open])

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

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
      setOpen(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') { setValue(displayName); setEditing(false) }
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors cursor-pointer"
      >
        <span className="tracking-wide">{displayName}</span>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border/60 rounded-2xl shadow-lg z-50 overflow-hidden py-1">
          {/* 名前の変更 */}
          {editing ? (
            <div className="px-4 py-3 flex flex-col gap-2">
              {error && <p className="text-xs text-danger">{error}</p>}
              <input
                ref={inputRef}
                value={value}
                onChange={e => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={30}
                disabled={saving}
                placeholder="名前を入力"
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-foreground/10"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving || !value.trim()}
                  className="text-xs text-primary font-medium disabled:opacity-40 cursor-pointer hover:text-primary/80"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
                <button
                  onClick={() => { setValue(displayName); setEditing(false) }}
                  className="text-xs text-muted hover:text-foreground cursor-pointer"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-surface transition-colors cursor-pointer text-left"
            >
              <svg className="w-4 h-4 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              名前を変更
            </button>
          )}

          <div className="border-t border-border/60 mt-1">
            <form action={logout}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-surface transition-colors cursor-pointer text-left"
              >
                <svg className="w-4 h-4 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                ログアウト
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
