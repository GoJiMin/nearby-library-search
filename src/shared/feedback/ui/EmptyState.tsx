import { SearchX } from 'lucide-react'
import { LucideIcon } from '@/shared/ui'

type EmptyStateProps = {
  description: string
  label?: string
  title: string
}

function EmptyState({
  title,
  description,
  label = '빈 상태',
}: EmptyStateProps) {
  return (
    <section className="border-line bg-surface shadow-soft rounded-panel w-full border border-dashed px-6 py-8 text-center sm:px-8 sm:py-10">
      <div className="bg-surface-muted text-text-muted mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full">
        <LucideIcon icon={SearchX} size={24} strokeWidth={2.1} />
      </div>
      <div className="bg-surface-muted text-text-muted rounded-pill mb-4 inline-flex px-3 py-2 text-sm font-medium">
        {label}
      </div>
      <strong className="text-text mb-3 block text-2xl font-semibold tracking-[-0.03em]">
        {title}
      </strong>
      <p className="mx-auto max-w-xl text-sm leading-7 sm:text-base">
        {description}
      </p>
    </section>
  )
}

export { EmptyState }
export type { EmptyStateProps }
