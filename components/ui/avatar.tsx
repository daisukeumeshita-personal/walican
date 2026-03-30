import { cn } from '@/lib/utils'

interface AvatarProps {
  name: string
  className?: string
}

const palettes = [
  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { bg: 'bg-sky-100', text: 'text-sky-700' },
  { bg: 'bg-violet-100', text: 'text-violet-700' },
  { bg: 'bg-amber-100', text: 'text-amber-700' },
  { bg: 'bg-rose-100', text: 'text-rose-700' },
  { bg: 'bg-teal-100', text: 'text-teal-700' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  { bg: 'bg-orange-100', text: 'text-orange-700' },
]

function getColorIndex(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % palettes.length
}

export function Avatar({ name, className }: AvatarProps) {
  const initial = name.charAt(0).toUpperCase()
  const palette = palettes[getColorIndex(name)]

  return (
    <div
      className={cn(
        'w-9 h-9 rounded-xl flex items-center justify-center text-sm font-600',
        palette.bg,
        palette.text,
        className
      )}
    >
      {initial}
    </div>
  )
}
