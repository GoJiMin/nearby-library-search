import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-96px)] items-center">
      <section className="rounded-panel border-line bg-surface-strong shadow-card w-full border px-6 py-8 sm:px-10 sm:py-12">
        <div className="rounded-pill bg-accent-soft text-accent-strong mb-4 inline-flex px-3 py-2 text-sm font-medium">
          404
        </div>
        <h1 className="mb-4">페이지를 찾을 수 없습니다</h1>
        <p className="mb-8 max-w-xl">
          요청한 경로가 존재하지 않거나 아직 준비되지 않았습니다. 홈으로
          돌아가서 다시 탐색해 주세요.
        </p>
        <Link
          className="rounded-pill bg-accent inline-flex items-center px-5 py-3 text-sm font-semibold text-white"
          to="/"
        >
          홈으로 돌아가기
        </Link>
      </section>
    </div>
  )
}

export { NotFoundPage }
