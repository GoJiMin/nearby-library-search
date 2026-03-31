import { LoaderCircle } from 'lucide-react'
import { LucideIcon } from '@/shared/ui'

type LoadingStateProps = {
  description?: string
  label?: string
  title?: string
}

function LoadingState({
  title = '화면을 준비하고 있습니다',
  description = '다음 화면에 필요한 정보를 불러오는 중입니다. 잠시만 기다려 주세요.',
  label = '로딩 중',
}: LoadingStateProps) {
  return (
    <div className="flex min-h-[calc(100vh-112px)] items-center">
      <section className="border-line bg-surface-strong shadow-card rounded-panel relative w-full overflow-hidden border px-6 py-8 sm:px-10 sm:py-12">
        <div className="bg-accent-soft absolute -top-20 -right-16 h-48 w-48 rounded-full blur-3xl" />
        <div className="bg-surface-muted absolute inset-x-6 top-auto bottom-6 h-px" />

        <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-end">
          <div className="max-w-2xl">
            <div className="bg-accent-soft text-accent-strong rounded-pill mb-6 inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold">
              <LucideIcon
                className="animate-spin"
                icon={LoaderCircle}
                size={16}
                strokeWidth={2.25}
              />
              {label}
            </div>

            <div className="space-y-3">
              <h2 className="text-text text-[clamp(2rem,3.8vw,3.5rem)] leading-[1.06] font-semibold tracking-[-0.05em]">
                {title}
              </h2>
              <p className="max-w-xl text-base leading-7">{description}</p>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="border-line bg-surface rounded-3xl border p-5">
              <div className="mb-4 space-y-3">
                <div className="bg-surface-muted h-4 w-20 animate-pulse rounded-full" />
                <div className="bg-surface-muted h-7 w-3/4 animate-pulse rounded-full" />
                <div className="bg-surface-muted h-4 w-full animate-pulse rounded-full" />
                <div className="bg-surface-muted h-4 w-5/6 animate-pulse rounded-full" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="bg-surface-muted min-h-24 animate-pulse rounded-3xl" />
                <div className="bg-surface-muted min-h-24 animate-pulse rounded-3xl" />
              </div>
            </div>

            <div className="bg-surface-muted grid grid-cols-3 gap-3 rounded-3xl p-4">
              <div className="h-2 animate-pulse rounded-full bg-white/90" />
              <div className="h-2 animate-pulse rounded-full bg-white/70" />
              <div className="h-2 animate-pulse rounded-full bg-white/60" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export { LoadingState }
export type { LoadingStateProps }
