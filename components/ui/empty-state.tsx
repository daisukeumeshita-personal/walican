interface EmptyStateProps {
  message: string
  description?: string
}

export function EmptyState({ message, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-up">
      <p className="font-display text-lg font-500 text-muted/80 tracking-tight">{message}</p>
      {description && (
        <p className="text-sm text-muted/50 mt-1.5 font-light">{description}</p>
      )}
    </div>
  )
}
