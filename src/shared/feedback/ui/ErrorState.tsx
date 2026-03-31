import { Link } from 'react-router-dom'

type ErrorStateProps = {
  description?: string
  title?: string
}

function ErrorState({
  title = '화면을 불러오지 못했습니다',
  description = '예상하지 못한 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[calc(100vh-112px)] items-center">
      <section className="border-line bg-surface-strong shadow-card rounded-panel w-full border px-6 py-8 sm:px-10 sm:py-12">
        <div className="bg-accent-soft text-accent-strong rounded-pill mb-4 inline-flex px-3 py-2 text-sm font-medium">
          오류
        </div>
        <h1 className="mb-4 max-w-2xl">{title}</h1>
        <p className="mb-8 max-w-xl text-base leading-7">{description}</p>
        <Link
          className="bg-accent rounded-pill hover:bg-accent-strong inline-flex items-center px-5 py-3 text-sm font-semibold text-white transition-colors"
          to="/"
        >
          홈으로 돌아가기
        </Link>
      </section>
    </div>
  )
}

export { ErrorState }
