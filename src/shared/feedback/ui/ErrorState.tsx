import { TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, LucideIcon } from '@/shared/ui'

type ErrorStateProps = {
  actionLabel?: string
  description?: string
  href?: string
  label?: string
  title?: string
}

function ErrorState({
  title = '화면을 불러오지 못했습니다',
  description = '예상하지 못한 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  label = '오류',
  actionLabel = '홈으로 돌아가기',
  href = '/',
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[calc(100vh-112px)] items-center">
      <section className="border-line bg-surface-strong shadow-card rounded-panel relative w-full overflow-hidden border px-6 py-8 sm:px-10 sm:py-12">
        <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-white/90 to-transparent" />
        <div className="bg-accent-soft absolute top-4 -right-16 h-44 w-44 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="bg-accent-soft text-accent-strong rounded-pill mb-5 inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold">
              <LucideIcon icon={TriangleAlert} size={16} strokeWidth={2.2} />
              {label}
            </div>
            <div className="bg-surface inline-flex rounded-[24px] p-3 shadow-[inset_0_0_0_1px_rgba(2,32,71,0.05)]">
              <div className="bg-accent-soft text-accent-strong inline-flex h-14 w-14 items-center justify-center rounded-[18px]">
                <LucideIcon icon={TriangleAlert} size={26} strokeWidth={2.2} />
              </div>
            </div>
            <h1 className="text-text mt-6 mb-4 max-w-2xl text-[clamp(2rem,3.8vw,3.5rem)] leading-[1.06] font-semibold tracking-[-0.05em]">
              {title}
            </h1>
            <p className="mb-8 max-w-xl text-base leading-7">{description}</p>
          </div>

          <div className="flex min-w-55 flex-col gap-3">
            <Button asChild className="w-full justify-center">
              <Link to={href}>{actionLabel}</Link>
            </Button>
            <p className="text-text-muted text-sm leading-6">
              일시적인 문제일 수 있습니다. 홈으로 이동한 뒤 다시 시도해 주세요.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export { ErrorState }
export type { ErrorStateProps }
