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
    <section className="border-line bg-surface shadow-soft rounded-panel relative w-full overflow-hidden border px-6 py-8 text-left sm:px-8 sm:py-10">
      <div className="bg-accent-soft absolute top-0 -right-12 h-40 w-40 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <div className="bg-accent-soft text-accent-strong mb-5 inline-flex h-14 w-14 items-center justify-center rounded-[20px]">
            <LucideIcon icon={SearchX} size={24} strokeWidth={2.1} />
          </div>
          <div className="bg-surface-muted text-text-muted rounded-pill mb-4 inline-flex px-3 py-2 text-sm font-medium">
            {label}
          </div>
          <strong className="text-text mb-3 block text-[clamp(1.7rem,3vw,2.6rem)] leading-[1.12] font-semibold tracking-[-0.05em]">
            {title}
          </strong>
          <p className="max-w-xl text-sm leading-7 sm:text-base">
            {description}
          </p>
        </div>

        <div className="grid min-w-[220px] gap-3 sm:max-w-[280px]">
          <div className="bg-surface-strong rounded-[24px] p-4 shadow-[inset_0_0_0_1px_rgba(2,32,71,0.05)]">
            <strong className="text-text mb-1 block text-sm font-semibold">
              도서 검색
            </strong>
            <p className="text-sm leading-6">
              제목을 입력하면 검색 흐름이 여기서 이어집니다.
            </p>
          </div>
          <div className="bg-surface-muted rounded-[24px] p-4">
            <div className="bg-line mb-3 h-px w-full" />
            <p className="text-sm leading-6">
              검색 전에는 결과 대신 다음 단계 안내만 보여줍니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export { EmptyState }
export type { EmptyStateProps }
