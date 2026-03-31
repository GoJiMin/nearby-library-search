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
      <section className="border-line bg-surface-strong shadow-card rounded-panel w-full border px-6 py-8 sm:px-10 sm:py-12">
        <div className="bg-accent-soft text-accent-strong rounded-pill mb-4 inline-flex items-center gap-2 px-3 py-2 text-sm font-medium">
          <LucideIcon icon={TriangleAlert} size={16} strokeWidth={2.2} />
          {label}
        </div>
        <h1 className="mb-4 max-w-2xl">{title}</h1>
        <p className="mb-8 max-w-xl text-base leading-7">{description}</p>
        <Button asChild>
          <Link to={href}>{actionLabel}</Link>
        </Button>
      </section>
    </div>
  )
}

export { ErrorState }
export type { ErrorStateProps }
